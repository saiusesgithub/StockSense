import { Prisma, type MovementType, type ReferenceType } from "@prisma/client";
import { db } from "@/lib/db";

type Transaction = Prisma.TransactionClient;

export type DomainErrorCode = "INVALID_QUANTITY" | "INSUFFICIENT_STOCK" | "ENTITY_NOT_FOUND" | "DOCUMENT_ALREADY_VALIDATED" | "INVALID_DOCUMENT_STATUS" | "INVALID_LOCATION" | "DUPLICATE_SKU";

export class InventoryDomainError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string, public readonly details?: Record<string, string>) {
    super(message);
    this.name = "InventoryDomainError";
  }
}

export type ReceiveStockInput = { receiptId: string; userId?: string };
export type DeliverStockInput = { deliveryId: string; userId?: string };
export type TransferStockInput = { transferId: string; userId?: string };
export type AdjustStockInput = { adjustmentId: string; userId?: string };

function assertPositiveQuantity(quantity: number, context: string) {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new InventoryDomainError("INVALID_QUANTITY", `Quantity must be greater than zero for ${context}.`);
}

function assertNonNegativeQuantity(quantity: number, context: string) {
  if (!Number.isFinite(quantity) || quantity < 0) throw new InventoryDomainError("INVALID_QUANTITY", `Counted quantity cannot be negative for ${context}.`);
}

function ensureDocumentCanBeValidated(status: string, documentType: string, documentId: string) {
  if (status === "DONE") throw new InventoryDomainError("DOCUMENT_ALREADY_VALIDATED", `${documentType} ${documentId} has already been validated.`);
  if (status === "CANCELED") throw new InventoryDomainError("INVALID_DOCUMENT_STATUS", `${documentType} ${documentId} is canceled and cannot be validated.`);
}

async function getBalance(tx: Transaction, productId: string, locationId: string) {
  return tx.inventoryBalance.findUnique({ where: { productId_locationId: { productId, locationId } } });
}

async function changeBalance(tx: Transaction, productId: string, locationId: string, delta: number) {
  const balance = await tx.inventoryBalance.upsert({ where: { productId_locationId: { productId, locationId } }, create: { productId, locationId, quantity: 0 }, update: {} });
  const nextQuantity = Number(balance.quantity) + delta;
  if (nextQuantity < 0) throw new InventoryDomainError("INSUFFICIENT_STOCK", `Insufficient stock for product ${productId} at location ${locationId}.`, { productId, locationId });
  return tx.inventoryBalance.update({ where: { id: balance.id }, data: { quantity: nextQuantity } });
}

async function ensureProductAndLocation(tx: Transaction, productId: string, locationId: string) {
  const [product, location] = await Promise.all([tx.product.findUnique({ where: { id: productId }, select: { id: true } }), tx.location.findUnique({ where: { id: locationId }, select: { id: true } })]);
  if (!product) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Product ${productId} was not found.`, { productId });
  if (!location) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Location ${locationId} was not found.`, { locationId });
}

async function recordMovement(tx: Transaction, input: { productId: string; movementType: MovementType; quantity: number; fromLocationId?: string; toLocationId?: string; referenceType: ReferenceType; referenceId: string; reason?: string; userId?: string }) {
  return tx.stockMovement.create({ data: input });
}

export async function receiveStock({ receiptId, userId }: ReceiveStockInput) {
  return db.$transaction(async (tx) => {
    const receipt = await tx.receipt.findUnique({ where: { id: receiptId }, include: { items: true } });
    if (!receipt) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Receipt ${receiptId} was not found.`, { receiptId });
    ensureDocumentCanBeValidated(receipt.status, "Receipt", receiptId);
    for (const item of receipt.items) {
      const quantity = Number(item.quantity);
      assertPositiveQuantity(quantity, `receipt item ${item.id}`);
      await ensureProductAndLocation(tx, item.productId, item.locationId);
      await changeBalance(tx, item.productId, item.locationId, quantity);
      await recordMovement(tx, { productId: item.productId, movementType: "RECEIPT", quantity, toLocationId: item.locationId, referenceType: "RECEIPT", referenceId: receiptId, userId });
    }
    return tx.receipt.update({ where: { id: receiptId }, data: { status: "DONE", validatedAt: new Date() } });
  });
}

export async function deliverStock({ deliveryId, userId }: DeliverStockInput) {
  return db.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({ where: { id: deliveryId }, include: { items: true } });
    if (!delivery) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Delivery ${deliveryId} was not found.`, { deliveryId });
    ensureDocumentCanBeValidated(delivery.status, "Delivery", deliveryId);
    for (const item of delivery.items) {
      const quantity = Number(item.quantity);
      assertPositiveQuantity(quantity, `delivery item ${item.id}`);
      await ensureProductAndLocation(tx, item.productId, item.locationId);
      await changeBalance(tx, item.productId, item.locationId, -quantity);
      await recordMovement(tx, { productId: item.productId, movementType: "DELIVERY", quantity, fromLocationId: item.locationId, referenceType: "DELIVERY", referenceId: deliveryId, userId });
    }
    return tx.delivery.update({ where: { id: deliveryId }, data: { status: "DONE", validatedAt: new Date() } });
  });
}

export async function transferStock({ transferId, userId }: TransferStockInput) {
  return db.$transaction(async (tx) => {
    const transfer = await tx.transfer.findUnique({ where: { id: transferId }, include: { items: true } });
    if (!transfer) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Transfer ${transferId} was not found.`, { transferId });
    ensureDocumentCanBeValidated(transfer.status, "Transfer", transferId);
    for (const item of transfer.items) {
      const quantity = Number(item.quantity);
      assertPositiveQuantity(quantity, `transfer item ${item.id}`);
      if (item.fromLocationId === item.toLocationId) throw new InventoryDomainError("INVALID_LOCATION", "Transfer source and destination must differ.");
      await ensureProductAndLocation(tx, item.productId, item.fromLocationId);
      await ensureProductAndLocation(tx, item.productId, item.toLocationId);
      await changeBalance(tx, item.productId, item.fromLocationId, -quantity);
      await changeBalance(tx, item.productId, item.toLocationId, quantity);
      await recordMovement(tx, { productId: item.productId, movementType: "TRANSFER", quantity, fromLocationId: item.fromLocationId, toLocationId: item.toLocationId, referenceType: "TRANSFER", referenceId: transferId, userId });
    }
    return tx.transfer.update({ where: { id: transferId }, data: { status: "DONE", validatedAt: new Date() } });
  });
}

export async function adjustStock({ adjustmentId, userId }: AdjustStockInput) {
  return db.$transaction(async (tx) => {
    const adjustment = await tx.adjustment.findUnique({ where: { id: adjustmentId }, include: { items: true } });
    if (!adjustment) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Adjustment ${adjustmentId} was not found.`, { adjustmentId });
    ensureDocumentCanBeValidated(adjustment.status, "Adjustment", adjustmentId);
    for (const item of adjustment.items) {
      const countedQuantity = Number(item.countedQty);
      assertNonNegativeQuantity(countedQuantity, `adjustment item ${item.id}`);
      await ensureProductAndLocation(tx, item.productId, item.locationId);
      const current = await getBalance(tx, item.productId, item.locationId);
      const difference = countedQuantity - Number(current?.quantity ?? 0);
      await changeBalance(tx, item.productId, item.locationId, difference);
      await tx.adjustmentItem.update({ where: { id: item.id }, data: { difference } });
      if (difference !== 0) await recordMovement(tx, { productId: item.productId, movementType: "ADJUSTMENT", quantity: Math.abs(difference), fromLocationId: difference < 0 ? item.locationId : undefined, toLocationId: difference > 0 ? item.locationId : undefined, referenceType: "ADJUSTMENT", referenceId: adjustmentId, reason: adjustment.reason, userId });
    }
    return tx.adjustment.update({ where: { id: adjustmentId }, data: { status: "DONE", validatedAt: new Date() } });
  });
}
