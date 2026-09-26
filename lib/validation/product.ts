import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  sku: z.string().trim().min(1, "SKU is required.").max(64),
  categoryId: z.string().min(1, "Category is required."),
  unitOfMeasure: z.string().trim().min(1, "Unit of measure is required."),
  reorderLevel: z.coerce.number().finite().nonnegative(),
});

export const productUpdateSchema = productCreateSchema;
export type ProductInput = z.infer<typeof productCreateSchema>;
