"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProductOption = { id: string; name: string; sku: string; unitOfMeasure: string };
export type LineItem = { productId: string; quantity: string };

type LineItemsEditorProps = {
  products: ProductOption[];
  lines: LineItem[];
  onChange: (lines: LineItem[]) => void;
  locationId?: string;
  stockLabel?: string;
};

function AvailableStock({ productId, locationId, unitOfMeasure }: { productId: string; locationId: string; unitOfMeasure: string }) {
  const [quantity, setQuantity] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!productId || !locationId) { setQuantity(null); return; }
    fetch(`/api/inventory/balance?productId=${productId}&locationId=${locationId}`)
      .then((response) => response.json())
      .then((data) => { if (!cancelled) setQuantity(Number(data.quantity ?? 0)); })
      .catch(() => { if (!cancelled) setQuantity(null); });
    return () => { cancelled = true; };
  }, [productId, locationId]);

  if (quantity === null) return null;
  return <p className="mt-1 text-xs text-slate-500">Available: {quantity} {unitOfMeasure}</p>;
}

export function LineItemsEditor({ products, lines, onChange, locationId, stockLabel }: LineItemsEditorProps) {
  function updateLine(index: number, patch: Partial<LineItem>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    onChange([...lines, { productId: "", quantity: "1" }]);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {lines.map((line, index) => {
          const product = products.find((p) => p.id === line.productId);
          return (
            <div key={index} className="flex flex-wrap items-start gap-3 rounded-md border bg-slate-50 p-3">
              <div className="min-w-[200px] flex-1">
                <select
                  value={line.productId}
                  onChange={(event) => updateLine(index, { productId: event.target.value })}
                  className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="">Select product</option>
                  {products.map((option) => (
                    <option key={option.id} value={option.id}>{option.name} ({option.sku})</option>
                  ))}
                </select>
                {locationId && line.productId ? (
                  <AvailableStock productId={line.productId} locationId={locationId} unitOfMeasure={product?.unitOfMeasure ?? ""} />
                ) : null}
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.quantity}
                  onChange={(event) => updateLine(index, { quantity: event.target.value })}
                  placeholder="Quantity"
                  className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)} disabled={lines.length === 1}>
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          );
        })}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addLine}>
        <Plus className="mr-2 h-4 w-4" />
        {stockLabel ?? "Add product line"}
      </Button>
    </div>
  );
}
