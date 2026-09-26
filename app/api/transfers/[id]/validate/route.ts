import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { validateTransfer } from "@/lib/transfers/service";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transfer = await validateTransfer(id);
    return NextResponse.json(transfer);
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 409 });
    return NextResponse.json({ error: "Unable to validate transfer." }, { status: 500 });
  }
}
