"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string };
type ProductFormProps = { categories: Category[]; initial?: { id: string; name: string; sku: string; categoryId: string; unitOfMeasure: string; reorderLevel: number } };

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initial);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = { name: form.get("name"), sku: form.get("sku"), categoryId: form.get("categoryId"), unitOfMeasure: form.get("unitOfMeasure"), reorderLevel: form.get("reorderLevel") };
    const response = await fetch(isEditing ? `/api/products/${initial?.id}` : "/api/products", { method: isEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Unable to save product."); setSaving(false); return; }
    router.push(`/products/${result.id}`);
    router.refresh();
  }

  return <form onSubmit={submit} className="max-w-2xl space-y-6 rounded-lg border bg-white p-6">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-slate-700">Product name<input name="name" required defaultValue={initial?.name} className="h-10 w-full rounded-md border px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300" /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">SKU / Code<input name="sku" required defaultValue={initial?.sku} className="h-10 w-full rounded-md border px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300" /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Category<select name="categoryId" required defaultValue={initial?.categoryId} className="h-10 w-full rounded-md border bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Unit of measure<input name="unitOfMeasure" required defaultValue={initial?.unitOfMeasure ?? "units"} className="h-10 w-full rounded-md border px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300" /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Reorder threshold<input name="reorderLevel" type="number" min="0" step="0.01" required defaultValue={initial?.reorderLevel ?? 0} className="h-10 w-full rounded-md border px-3 font-normal outline-none focus:ring-2 focus:ring-slate-300" /></label>
    </div>
    {error ? <p className="text-sm text-red-600">{error}</p> : null}
    <div className="flex gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving..." : isEditing ? "Save changes" : "Create product"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
  </form>;
}
