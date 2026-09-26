import { z } from "zod";

const positiveQuantity = z.number().finite().positive();
const id = z.string().min(1);

export const inventoryLineSchema = z.object({ productId: id, locationId: id, quantity: positiveQuantity });
export const receiveStockSchema = z.object({ referenceId: id, userId: id.optional(), lines: z.array(inventoryLineSchema).min(1) });
export const deliverStockSchema = receiveStockSchema;
export const transferStockSchema = z.object({
  referenceId: id,
  userId: id.optional(),
  lines: z.array(inventoryLineSchema.extend({ toLocationId: id })).min(1),
});
export const adjustStockSchema = z.object({
  referenceId: id,
  userId: id.optional(),
  reason: z.string().trim().min(1),
  lines: z.array(z.object({ productId: id, locationId: id, countedQuantity: z.number().finite().nonnegative() })).min(1),
});
