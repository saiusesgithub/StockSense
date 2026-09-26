import Link from "next/link";
import { getLocations, getProducts } from "@/lib/inventory/queries";
import { TransferForm } from "@/components/transfers/transfer-form";

export const dynamic = "force-dynamic";

export default async function NewTransferPage() {
  const [locations, products] = await Promise.all([getLocations(), getProducts()]);
  return (
    <div className="space-y-6">
      <div>
        <Link href="/transfers" className="text-sm text-slate-500 hover:text-slate-900">← Transfers</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">New internal transfer</h1>
        <p className="mt-2 text-sm text-slate-500">Move stock between two locations without changing total inventory.</p>
      </div>
      <TransferForm locations={locations} products={products} />
    </div>
  );
}
