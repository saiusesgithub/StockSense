import { Prisma, MovementType, ReferenceType } from "@prisma/client";
import { db } from "@/lib/db";
import type { AdjustmentLine, InventoryLine, TransferLine } from "@/lib/types/inventory";

type Transaction = Prisma.TransactionClient;

async function changeBalance(tx: Transaction, productId: string, locationId: string, delta: number) {
  const balance = await tx.inventoryBalance.upsert({
    where: { productId_locationId: { productId, locationId } },
    create: { productId, locationId, quantity: 0 },
    update: {},
  });
  const nextQuantity = Number(balance.quantity) + delta;
  if (nextQuantity < 0) throw new Error(`Insufficient stock for product ${productId} at location ${locationId}`);
  return tx.inventoryBalance.update({ where: { id: balance.id }, data: { quantity: nextQuantity } });
}

async function recordMovement(tx: Transaction, input: {
  productId: string; movementType: MovementType; quantity: number; fromLocationId?: string;
  toLocationId?: string; referenceType: ReferenceType; referenceId: string; reason?: string; userId?: string;
}) {
  return tx.stockMovement.create({ data: { ...input, quantity: input.quantity } });
}

export async function receiveStock(lines: InventoryLine[], referenceId: string, userId?: string) {
  return db.$transaction(async (tx) => {
    for (const line of lines) {
      await changeBalance(tx, line.productId, line.locationId, line.quantity);
      await recordMovement(tx, { ...line, movementType: "RECEIPT", toLocationId: line.locationId, referenceType: "RECEIPT", referenceId, userId });
    }
  });
}

export async function deliverStock(lines: InventoryLine[], referenceId: string, userId?: string) {
  return db.$transaction(async (tx) => {
    for (const line of lines) {
      await changeBalance(tx, line.productId, line.locationId, -line.quantity);
      await recordMovement(tx, { ...line, movementType: "DELIVERY", fromLocationId: line.locationId, referenceType: "DELIVERY", referenceId, userId });
    }
  });
}

export async function transferStock(lines: TransferLine[], referenceId: string, userId?: string) {
  return db.$transaction(async (tx) => {
    for (const line of lines) {
      if (line.locationId === line.toLocationId) throw new Error("Transfer source and destination must differ");
      await changeBalance(tx, line.productId, line.locationId, -line.quantity);
      await changeBalance(tx, line.productId, line.toLocationId, line.quantity);
      await recordMovement(tx, { ...line, movementType: "TRANSFER", fromLocationId: line.locationId, toLocationId: line.toLocationId, referenceType: "TRANSFER", referenceId, userId });
    }
  });
}

export async function adjustStock(lines: AdjustmentLine[], referenceId: string, reason: string, userId?: string) {
  return db.$transaction(async (tx) => {
    for (const line of lines) {
      const current = await tx.inventoryBalance.findUnique({ where: { productId_locationId: { productId: line.productId, locationId: line.locationId } } });
      const difference = line.countedQuantity - Number(current?.quantity ?? 0);
      if (difference === 0) continue;
      await changeBalance(tx, line.productId, line.locationId, difference);
      await recordMovement(tx, { ...line, quantity: Math.abs(difference), movementType: "ADJUSTMENT", fromLocationId: difference < 0 ? line.locationId : undefined, toLocationId: difference > 0 ? line.locationId : undefined, referenceType: "ADJUSTMENT", referenceId, reason, userId });
    }
  });
}
