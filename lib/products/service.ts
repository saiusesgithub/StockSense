import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { InventoryDomainError } from "@/lib/inventory/domain";
import type { ProductInput } from "@/lib/validation/product";

function rethrowProductError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new InventoryDomainError("DUPLICATE_SKU", "A product with this SKU already exists.");
  throw error;
}

export async function createProduct(input: ProductInput) {
  try {
    const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Category ${input.categoryId} was not found.`, { categoryId: input.categoryId });
    return await db.product.create({ data: input, include: { category: true } });
  } catch (error) { rethrowProductError(error); }
}

export async function updateProduct(productId: string, input: ProductInput) {
  try {
    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Product ${productId} was not found.`, { productId });
    const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw new InventoryDomainError("ENTITY_NOT_FOUND", `Category ${input.categoryId} was not found.`, { categoryId: input.categoryId });
    return await db.product.update({ where: { id: productId }, data: input, include: { category: true } });
  } catch (error) { rethrowProductError(error); }
}
