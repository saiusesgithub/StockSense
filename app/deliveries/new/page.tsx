import Link from "next/link";
import { getLocations, getProducts } from "@/lib/inventory/queries";
import { DeliveryForm } from "@/components/deliveries/delivery-form";

export const dynamic = "force-dynamic";

export default async function NewDeliveryPage() {
  const [locations, products] = await Promise.all([getLocations(), getProducts()]);
  return (
    <div className="space-y-6">
      <div>
        <Link href="/deliveries" className="text-sm text-slate-500 hover:text-slate-900">← Deliveries</Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">New delivery</h1>
        <p className="mt-2 text-sm text-slate-500">Ship stock to a customer from a source location.</p>
      </div>
      <DeliveryForm locations={locations} products={products} />
    </div>
  );
}
