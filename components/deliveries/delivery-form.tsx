"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { LineItemsEditor, type LineItem, type ProductOption } from "@/components/operations/line-items-editor";

type Location = { id: string; name: string; warehouse: { name: string } };

export function DeliveryForm({ locations, products }: { locations: Location[]; products: ProductOption[] }) {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [locationId, setLocationId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", quantity: "1" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      customer,
      locationId,
      items: lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })),
    };
    const response = await fetch("/api/deliveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Unable to create delivery."); setSaving(false); return; }
    router.push(`/deliveries/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6 rounded-lg border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Customer
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} required className="h-10 w-full rounded-md border px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Source location
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required className="h-10 w-full rounded-md border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300">
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.warehouse.name} · {location.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Products</p>
        <LineItemsEditor products={products} lines={lines} onChange={setLines} locationId={locationId || undefined} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save delivery"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
