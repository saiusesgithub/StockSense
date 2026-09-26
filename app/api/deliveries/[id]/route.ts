import { NextResponse } from "next/server";
import { getDelivery } from "@/lib/deliveries/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = await getDelivery(id);
  return delivery ? NextResponse.json(delivery) : NextResponse.json({ error: "Delivery not found." }, { status: 404 });
}
