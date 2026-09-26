import { NextResponse } from "next/server";
import { createProduct } from "@/lib/products/service";
import { getProducts } from "@/lib/inventory/queries";
import { productCreateSchema } from "@/lib/validation/product";
import { InventoryDomainError } from "@/lib/inventory/domain";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return NextResponse.json(await getProducts({ search }));
}

export async function POST(request: Request) {
  try {
    const input = productCreateSchema.parse(await request.json());
    const product = await createProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === "DUPLICATE_SKU" ? 409 : 400 });
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
