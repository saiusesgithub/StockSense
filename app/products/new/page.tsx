import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return <div className="space-y-6"><div><Link href="/products" className="text-sm text-slate-500 hover:text-slate-900">← Products</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">New product</h1><p className="mt-2 text-sm text-slate-500">Add a product to the shared inventory catalog.</p></div><ProductForm categories={categories} /></div>;
}
