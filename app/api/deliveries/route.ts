import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { createDelivery, listDeliveries } from "@/lib/deliveries/service";
import { deliveryCreateSchema } from "@/lib/validation/delivery";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return NextResponse.json(await listDeliveries(search));
}

export async function POST(request: Request) {
  try {
    const input = deliveryCreateSchema.parse(await request.json());
    const delivery = await createDelivery(input);
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 400 });
    return NextResponse.json({ error: "Unable to create delivery." }, { status: 500 });
  }
}
