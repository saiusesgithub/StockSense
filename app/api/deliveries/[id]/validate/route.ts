import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { validateDelivery } from "@/lib/deliveries/service";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const delivery = await validateDelivery(id);
    return NextResponse.json(delivery);
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 409 });
    return NextResponse.json({ error: "Unable to validate delivery." }, { status: 500 });
  }
}
