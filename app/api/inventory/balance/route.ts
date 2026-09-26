import { NextResponse } from "next/server";
import { getInventoryBalance } from "@/lib/inventory/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const locationId = searchParams.get("locationId");
  if (!productId || !locationId) return NextResponse.json({ error: "productId and locationId are required." }, { status: 400 });
  const balance = await getInventoryBalance(productId, locationId);
  return NextResponse.json({ quantity: balance?.quantity ?? 0 });
}
