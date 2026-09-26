import { z } from "zod";

export const transferItemInputSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().finite().positive("Quantity must be greater than zero."),
});

export const transferCreateSchema = z
  .object({
    fromLocationId: z.string().min(1, "Source location is required."),
    toLocationId: z.string().min(1, "Destination location is required."),
    items: z.array(transferItemInputSchema).min(1, "Add at least one product line."),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "Source and destination locations must be different.",
    path: ["toLocationId"],
  });

export type TransferCreateInput = z.infer<typeof transferCreateSchema>;
