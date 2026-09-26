import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { validateReceipt } from "@/lib/receipts/service";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const receipt = await validateReceipt(id);
    return NextResponse.json(receipt);
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 409 });
    return NextResponse.json({ error: "Unable to validate receipt." }, { status: 500 });
  }
}
