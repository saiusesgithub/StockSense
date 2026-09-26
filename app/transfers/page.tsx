import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/operations/status-badge";
import { listTransfers } from "@/lib/transfers/service";

export const dynamic = "force-dynamic";

export default async function TransfersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const search = (await searchParams).search ?? "";
  const transfers = await listTransfers(search || undefined);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Internal Transfers</h1>
          <p className="mt-2 text-sm text-slate-500">Move stock between warehouses and locations with a complete movement trail.</p>
        </div>
        <Button asChild>
          <Link href="/transfers/new"><Plus className="mr-2 h-4 w-4" />New transfer</Link>
        </Button>
      </div>
      <form className="flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input name="search" defaultValue={search} placeholder="Search by reference" className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">To</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Items</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfers.map((transfer) => {
              const first = transfer.items[0];
              return (
                <tr key={transfer.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><Link href={`/transfers/${transfer.id}`} className="font-medium text-slate-900 hover:underline">{transfer.number}</Link></td>
                  <td className="px-5 py-4 text-slate-600">{first ? `${first.fromLocation.warehouse.name} · ${first.fromLocation.name}` : "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{first ? `${first.toLocation.warehouse.name} · ${first.toLocation.name}` : "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{transfer.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">{transfer.items.length}</td>
                  <td className="px-5 py-4"><StatusBadge status={transfer.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transfers.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No transfers found.</p> : null}
      </div>
    </div>
  );
}
