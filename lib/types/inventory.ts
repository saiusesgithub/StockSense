export const movementTypes = ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"] as const;
export type MovementType = (typeof movementTypes)[number];

export const documentStatuses = ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

export type InventoryLine = {
  productId: string;
  locationId: string;
  quantity: number;
};

export type TransferLine = InventoryLine & { toLocationId: string };

export type AdjustmentLine = {
  productId: string;
  locationId: string;
  countedQuantity: number;
};
