import { z } from "zod";

export const deliveryItemInputSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().finite().positive("Quantity must be greater than zero."),
});

export const deliveryCreateSchema = z.object({
  customer: z.string().trim().min(1, "Customer is required."),
  locationId: z.string().min(1, "Source location is required."),
  items: z.array(deliveryItemInputSchema).min(1, "Add at least one product line."),
});

export type DeliveryCreateInput = z.infer<typeof deliveryCreateSchema>;
