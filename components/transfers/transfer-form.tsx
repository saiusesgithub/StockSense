"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { LineItemsEditor, type LineItem, type ProductOption } from "@/components/operations/line-items-editor";

type Location = { id: string; name: string; warehouse: { name: string } };

export function TransferForm({ locations, products }: { locations: Location[]; products: ProductOption[] }) {
  const router = useRouter();
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", quantity: "1" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fromLocationId && fromLocationId === toLocationId) { setError("Source and destination locations must be different."); return; }
    setSaving(true);
    setError("");
    const payload = {
      fromLocationId,
      toLocationId,
      items: lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })),
    };
    const response = await fetch("/api/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Unable to create transfer."); setSaving(false); return; }
    router.push(`/transfers/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6 rounded-lg border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          From location
          <select value={fromLocationId} onChange={(e) => setFromLocationId(e.target.value)} required className="h-10 w-full rounded-md border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300">
            <option value="">Select source</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.warehouse.name} · {location.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          To location
          <select value={toLocationId} onChange={(e) => setToLocationId(e.target.value)} required className="h-10 w-full rounded-md border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300">
            <option value="">Select destination</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.warehouse.name} · {location.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Products</p>
        <LineItemsEditor products={products} lines={lines} onChange={setLines} locationId={fromLocationId || undefined} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save transfer"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
