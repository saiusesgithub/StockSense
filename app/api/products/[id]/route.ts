import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateProduct } from "@/lib/products/service";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { productUpdateSchema } from "@/lib/validation/product";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { category: true } });
  return product ? NextResponse.json(product) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await updateProduct(id, productUpdateSchema.parse(await request.json()));
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === "DUPLICATE_SKU" ? 409 : 400 });
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}
