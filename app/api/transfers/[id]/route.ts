import { NextResponse } from "next/server";
import { getTransfer } from "@/lib/transfers/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transfer = await getTransfer(id);
  return transfer ? NextResponse.json(transfer) : NextResponse.json({ error: "Transfer not found." }, { status: 404 });
}
