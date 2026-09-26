import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { createTransfer, listTransfers } from "@/lib/transfers/service";
import { transferCreateSchema } from "@/lib/validation/transfer";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return NextResponse.json(await listTransfers(search));
}

export async function POST(request: Request) {
  try {
    const input = transferCreateSchema.parse(await request.json());
    const transfer = await createTransfer(input);
    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 400 });
    return NextResponse.json({ error: "Unable to create transfer." }, { status: 500 });
  }
}
