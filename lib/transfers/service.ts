import { db } from "@/lib/db";
import { generateDocumentNumber } from "@/lib/documents/number";
import { InventoryDomainError, transferStock } from "@/lib/inventory/domain";
import type { TransferCreateInput } from "@/lib/validation/transfer";

export async function listTransfers(search?: string) {
  const transfers = await db.transfer.findMany({
    where: search ? { number: { contains: search, mode: "insensitive" } } : undefined,
    include: { items: { include: { fromLocation: { include: { warehouse: true } }, toLocation: { include: { warehouse: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return transfers;
}

export async function getTransfer(id: string) {
  return db.transfer.findUnique({
    where: { id },
    include: { items: { include: { product: true, fromLocation: { include: { warehouse: true } }, toLocation: { include: { warehouse: true } } } } },
  });
}

export async function createTransfer(input: TransferCreateInput) {
  const [fromLocation, toLocation] = await Promise.all([
    db.location.findUnique({ where: { id: input.fromLocationId }, select: { id: true } }),
    db.location.findUnique({ where: { id: input.toLocationId }, select: { id: true } }),
  ]);
  if (!fromLocation) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Location ${input.fromLocationId} was not found.`, { locationId: input.fromLocationId });
  if (!toLocation) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Location ${input.toLocationId} was not found.`, { locationId: input.toLocationId });
  return db.transfer.create({
    data: {
      number: generateDocumentNumber("TRF"),
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          fromLocationId: input.fromLocationId,
          toLocationId: input.toLocationId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: { include: { product: true, fromLocation: { include: { warehouse: true } }, toLocation: { include: { warehouse: true } } } } },
  });
}

export async function validateTransfer(id: string) {
  return transferStock({ transferId: id });
}
