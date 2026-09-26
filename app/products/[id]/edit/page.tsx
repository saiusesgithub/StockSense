import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([db.product.findUnique({ where: { id } }), db.category.findMany({ orderBy: { name: "asc" } })]);
  if (!product) notFound();
  return <div className="space-y-6"><div><Link href={`/products/${id}`} className="text-sm text-slate-500 hover:text-slate-900">← Product details</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">Edit product</h1><p className="mt-2 text-sm text-slate-500">Update catalog information without changing inventory balances.</p></div><ProductForm categories={categories} initial={{ id: product.id, name: product.name, sku: product.sku, categoryId: product.categoryId, unitOfMeasure: product.unitOfMeasure, reorderLevel: Number(product.reorderLevel) }} /></div>;
}
