import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/receipts/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);
  return receipt ? NextResponse.json(receipt) : NextResponse.json({ error: "Receipt not found." }, { status: 404 });
}
