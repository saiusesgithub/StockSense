import { NextResponse } from "next/server";
import { InventoryDomainError } from "@/lib/inventory/domain";
import { createReceipt, listReceipts } from "@/lib/receipts/service";
import { receiptCreateSchema } from "@/lib/validation/receipt";
import { friendlyDomainMessage } from "@/lib/operations/messages";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return NextResponse.json(await listReceipts(search));
}

export async function POST(request: Request) {
  try {
    const input = receiptCreateSchema.parse(await request.json());
    const receipt = await createReceipt(input);
    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    if (error instanceof InventoryDomainError) return NextResponse.json({ error: friendlyDomainMessage(error.code, error.message), code: error.code }, { status: 400 });
    return NextResponse.json({ error: "Unable to create receipt." }, { status: 500 });
  }
}
