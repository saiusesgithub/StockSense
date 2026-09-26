import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/operations/status-badge";
import { ValidateButton } from "@/components/operations/validate-button";
import { getReceipt } from "@/lib/receipts/service";

export const dynamic = "force-dynamic";

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);
  if (!receipt) notFound();
  const isDone = receipt.status === "DONE";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/receipts" className="text-sm text-slate-500 hover:text-slate-900">← Receipts</Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{receipt.number}</h1>
            <StatusBadge status={receipt.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{receipt.supplier} · {receipt.createdAt.toLocaleDateString()}</p>
        </div>
        {!isDone ? <ValidateButton validateUrl={`/api/receipts/${id}/validate`} label="Validate receipt" /> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Supplier</p>
          <p className="mt-2 text-lg font-semibold">{receipt.supplier}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Destination</p>
          <p className="mt-2 text-lg font-semibold">{receipt.location.name}</p>
          <p className="mt-1 text-xs text-slate-400">{receipt.location.warehouse.name}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Created</p>
          <p className="mt-2 text-lg font-semibold">{receipt.createdAt.toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-400">{receipt.validatedAt ? `Validated ${receipt.validatedAt.toLocaleDateString()}` : "Not yet validated"}</p>
        </div>
      </div>
      <section className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Line items</h2></div>
        <div className="divide-y">
          {receipt.items.map((item) => (
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
