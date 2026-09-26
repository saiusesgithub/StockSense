import { db } from "@/lib/db";
import { generateDocumentNumber } from "@/lib/documents/number";
import { InventoryDomainError, receiveStock } from "@/lib/inventory/domain";
import type { ReceiptCreateInput } from "@/lib/validation/receipt";

async function withLocations<T extends { locationId: string }>(records: T[]) {
  const locationIds = [...new Set(records.map((record) => record.locationId))];
  const locations = await db.location.findMany({ where: { id: { in: locationIds } }, include: { warehouse: true } });
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  return records.map((record) => ({ ...record, location: locationMap.get(record.locationId)! }));
}

export async function listReceipts(search?: string) {
  const receipts = await db.receipt.findMany({
    where: search ? { OR: [{ number: { contains: search, mode: "insensitive" } }, { supplier: { contains: search, mode: "insensitive" } }] } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return withLocations(receipts);
}

export async function getReceipt(id: string) {
  const receipt = await db.receipt.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!receipt) return null;
  const [withLocation] = await withLocations([receipt]);
  return withLocation;
}

export async function createReceipt(input: ReceiptCreateInput) {
  const location = await db.location.findUnique({ where: { id: input.locationId }, include: { warehouse: true } });
  if (!location) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Location ${input.locationId} was not found.`, { locationId: input.locationId });
  const receipt = await db.receipt.create({
    data: {
      number: generateDocumentNumber("REC"),
      supplier: input.supplier,
      locationId: input.locationId,
      items: { create: input.items.map((item) => ({ productId: item.productId, locationId: input.locationId, quantity: item.quantity })) },
    },
    include: { items: { include: { product: true } } },
  });
  return { ...receipt, location };
}

export async function validateReceipt(id: string) {
  return receiveStock({ receiptId: id });
}
