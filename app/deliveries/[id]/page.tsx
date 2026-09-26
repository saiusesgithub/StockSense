import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/operations/status-badge";
import { ValidateButton } from "@/components/operations/validate-button";
import { getDelivery } from "@/lib/deliveries/service";

export const dynamic = "force-dynamic";

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = await getDelivery(id);
  if (!delivery) notFound();
  const isDone = delivery.status === "DONE";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/deliveries" className="text-sm text-slate-500 hover:text-slate-900">← Deliveries</Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{delivery.number}</h1>
            <StatusBadge status={delivery.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{delivery.customer} · {delivery.createdAt.toLocaleDateString()}</p>
        </div>
        {!isDone ? <ValidateButton validateUrl={`/api/deliveries/${id}/validate`} label="Validate delivery" /> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Customer</p>
          <p className="mt-2 text-lg font-semibold">{delivery.customer}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Source</p>
          <p className="mt-2 text-lg font-semibold">{delivery.location.name}</p>
          <p className="mt-1 text-xs text-slate-400">{delivery.location.warehouse.name}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Created</p>
          <p className="mt-2 text-lg font-semibold">{delivery.createdAt.toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-400">{delivery.validatedAt ? `Validated ${delivery.validatedAt.toLocaleDateString()}` : "Not yet validated"}</p>
        </div>
      </div>
      <section className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Line items</h2></div>
        <div className="divide-y">
          {delivery.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.product.name}</p>
                <p className="text-xs text-slate-500">{item.product.sku}</p>
              </div>
              <p className="font-semibold">{Number(item.quantity)} {item.product.unitOfMeasure}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
