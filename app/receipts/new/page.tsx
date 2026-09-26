import Link from "next/link";
import { getLocations, getProducts } from "@/lib/inventory/queries";
import { ReceiptForm } from "@/components/receipts/receipt-form";

export const dynamic = "force-dynamic";

export default async function NewReceiptPage() {
  const [locations, products] = await Promise.all([getLocations(), getProducts()]);
  return (
    <div className="space-y-6">
      <div>
        <Link href="/receipts" className="text-sm text-slate-500 hover:text-slate-900">← Receipts</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">New receipt</h1>
        <p className="mt-2 text-sm text-slate-500">Record incoming stock from a supplier before validating it.</p>
      </div>
      <ReceiptForm locations={locations} products={products} />
    </div>
  );
}
