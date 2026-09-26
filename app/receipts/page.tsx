import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/operations/status-badge";
import { listReceipts } from "@/lib/receipts/service";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const search = (await searchParams).search ?? "";
  const receipts = await listReceipts(search || undefined);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Receipts</h1>
          <p className="mt-2 text-sm text-slate-500">Create and validate incoming vendor stock receipts.</p>
        </div>
        <Button asChild>
          <Link href="/receipts/new"><Plus className="mr-2 h-4 w-4" />New receipt</Link>
        </Button>
      </div>
      <form className="flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input name="search" defaultValue={search} placeholder="Search by reference or supplier" className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Items</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-slate-50">
                <td className="px-5 py-4"><Link href={`/receipts/${receipt.id}`} className="font-medium text-slate-900 hover:underline">{receipt.number}</Link></td>
                <td className="px-5 py-4 text-slate-600">{receipt.supplier}</td>
                <td className="px-5 py-4 text-slate-600">{receipt.location.warehouse.name} · {receipt.location.name}</td>
                <td className="px-5 py-4 text-slate-600">{receipt.createdAt.toLocaleDateString()}</td>
                <td className="px-5 py-4 text-right font-medium text-slate-900">{receipt.items.length}</td>
                <td className="px-5 py-4"><StatusBadge status={receipt.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {receipts.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No receipts found.</p> : null}
      </div>
    </div>
  );
}
