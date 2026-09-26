import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/operations/status-badge";
import { ValidateButton } from "@/components/operations/validate-button";
import { getTransfer } from "@/lib/transfers/service";

export const dynamic = "force-dynamic";

export default async function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transfer = await getTransfer(id);
  if (!transfer) notFound();
  const isDone = transfer.status === "DONE";
  const first = transfer.items[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/transfers" className="text-sm text-slate-500 hover:text-slate-900">← Transfers</Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{transfer.number}</h1>
            <StatusBadge status={transfer.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{transfer.createdAt.toLocaleDateString()}</p>
        </div>
        {!isDone ? <ValidateButton validateUrl={`/api/transfers/${id}/validate`} label="Validate transfer" /> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">From</p>
          <p className="mt-2 text-lg font-semibold">{first?.fromLocation.name ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-400">{first?.fromLocation.warehouse.name}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">To</p>
          <p className="mt-2 text-lg font-semibold">{first?.toLocation.name ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-400">{first?.toLocation.warehouse.name}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-slate-500">Created</p>
          <p className="mt-2 text-lg font-semibold">{transfer.createdAt.toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-slate-400">{transfer.validatedAt ? `Validated ${transfer.validatedAt.toLocaleDateString()}` : "Not yet validated"}</p>
        </div>
      </div>
      <section className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4"><h2 className="font-semibold">Line items</h2></div>
        <div className="divide-y">
          {transfer.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.product.name}</p>
                <p className="text-xs text-slate-500">{item.fromLocation.name} → {item.toLocation.name}</p>
              </div>
              <p className="font-semibold">{Number(item.quantity)} {item.product.unitOfMeasure}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
