import { z } from "zod";

export const receiptItemInputSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().finite().positive("Quantity must be greater than zero."),
});

export const receiptCreateSchema = z.object({
  supplier: z.string().trim().min(1, "Supplier is required."),
  locationId: z.string().min(1, "Destination location is required."),
  items: z.array(receiptItemInputSchema).min(1, "Add at least one product line."),
});

export type ReceiptCreateInput = z.infer<typeof receiptCreateSchema>;
