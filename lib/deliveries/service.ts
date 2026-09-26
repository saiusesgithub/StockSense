import { db } from "@/lib/db";
import { generateDocumentNumber } from "@/lib/documents/number";
import { InventoryDomainError, deliverStock } from "@/lib/inventory/domain";
import type { DeliveryCreateInput } from "@/lib/validation/delivery";

async function withLocations<T extends { locationId: string }>(records: T[]) {
  const locationIds = [...new Set(records.map((record) => record.locationId))];
  const locations = await db.location.findMany({ where: { id: { in: locationIds } }, include: { warehouse: true } });
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  return records.map((record) => ({ ...record, location: locationMap.get(record.locationId)! }));
}

export async function listDeliveries(search?: string) {
  const deliveries = await db.delivery.findMany({
    where: search ? { OR: [{ number: { contains: search, mode: "insensitive" } }, { customer: { contains: search, mode: "insensitive" } }] } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return withLocations(deliveries);
}

export async function getDelivery(id: string) {
  const delivery = await db.delivery.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!delivery) return null;
  const [withLocation] = await withLocations([delivery]);
  return withLocation;
}

export async function createDelivery(input: DeliveryCreateInput) {
  const location = await db.location.findUnique({ where: { id: input.locationId }, include: { warehouse: true } });
  if (!location) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Location ${input.locationId} was not found.`, { locationId: input.locationId });
  const delivery = await db.delivery.create({
    data: {
      number: generateDocumentNumber("DEL"),
      customer: input.customer,
      locationId: input.locationId,
      items: { create: input.items.map((item) => ({ productId: item.productId, locationId: input.locationId, quantity: item.quantity })) },
    },
    include: { items: { include: { product: true } } },
  });
  return { ...delivery, location };
}

export async function validateDelivery(id: string) {
  return deliverStock({ deliveryId: id });
}
