import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type ProductStockSummary = {
  id: string;
  sku: string;
  name: string;
  unitOfMeasure: string;
  reorderLevel: number;
  category: { id: string; name: string };
  totalStock: number;
  isLowStock: boolean;
};

function toNumber(value: Prisma.Decimal | number) { return Number(value); }

export async function getInventoryBalance(productId: string, locationId: string) {
  const balance = await db.inventoryBalance.findUnique({ where: { productId_locationId: { productId, locationId } }, include: { product: true, location: { include: { warehouse: true } } } });
  return balance ? { ...balance, quantity: toNumber(balance.quantity) } : null;
}

export async function getTotalStockForProduct(productId: string) {
  const result = await db.inventoryBalance.aggregate({ where: { productId }, _sum: { quantity: true } });
  return Number(result._sum.quantity ?? 0);
}

export async function getProductStockByLocation(productId: string) {
  const balances = await db.inventoryBalance.findMany({ where: { productId }, include: { location: { include: { warehouse: true } } }, orderBy: [{ location: { warehouse: { name: "asc" } } }, { location: { name: "asc" } }] });
  return balances.map((balance) => ({ ...balance, quantity: toNumber(balance.quantity) }));
}

export async function getRecentStockMovements(input: { productId?: string; limit?: number; movementType?: Prisma.StockMovementWhereInput["movementType"] }) {
  const movements = await db.stockMovement.findMany({ where: { productId: input.productId, movementType: input.movementType }, include: { product: true, fromLocation: true, toLocation: true, user: true }, orderBy: { createdAt: "desc" }, take: input.limit ?? 20 });
  return movements.map((movement) => ({ ...movement, quantity: toNumber(movement.quantity) }));
}

export async function getLowStockProducts(search?: string): Promise<ProductStockSummary[]> {
  const products = await db.product.findMany({ where: search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] } : undefined, include: { category: true, balances: true }, orderBy: { name: "asc" } });
  return products.map((product) => {
    const totalStock = product.balances.reduce((sum, balance) => sum + toNumber(balance.quantity), 0);
    const reorderLevel = toNumber(product.reorderLevel);
    return { id: product.id, sku: product.sku, name: product.name, unitOfMeasure: product.unitOfMeasure, reorderLevel, category: product.category, totalStock, isLowStock: totalStock <= reorderLevel };
  }).filter((product) => product.isLowStock);
}

export async function getWarehouseInventory(warehouseId: string) {
  const locations = await db.location.findMany({ where: { warehouseId }, include: { balances: { include: { product: { include: { category: true } } } } }, orderBy: { name: "asc" } });
  return locations.map((location) => ({ ...location, balances: location.balances.map((balance) => ({ ...balance, quantity: toNumber(balance.quantity), product: { ...balance.product, reorderLevel: toNumber(balance.product.reorderLevel) } })) }));
}

export async function getWarehouses() { return db.warehouse.findMany({ include: { locations: true }, orderBy: { name: "asc" } }); }
export async function getLocations(warehouseId?: string) { return db.location.findMany({ where: warehouseId ? { warehouseId } : undefined, include: { warehouse: true }, orderBy: { name: "asc" } }); }

export async function getProducts(input: { search?: string } = {}): Promise<ProductStockSummary[]> {
  const products = await db.product.findMany({ where: input.search ? { OR: [{ name: { contains: input.search, mode: "insensitive" } }, { sku: { contains: input.search, mode: "insensitive" } }, { category: { name: { contains: input.search, mode: "insensitive" } } }] } : undefined, include: { category: true, balances: true }, orderBy: { name: "asc" } });
  return products.map((product) => { const totalStock = product.balances.reduce((sum, balance) => sum + toNumber(balance.quantity), 0); const reorderLevel = toNumber(product.reorderLevel); return { id: product.id, sku: product.sku, name: product.name, unitOfMeasure: product.unitOfMeasure, reorderLevel, category: product.category, totalStock, isLowStock: totalStock <= reorderLevel }; });
}
