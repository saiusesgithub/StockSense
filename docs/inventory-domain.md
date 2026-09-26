# Inventory domain guide

## State and audit model

`InventoryBalance` is the fast current-state table. It has one row per product and location and is the source for current availability, totals, and low-stock checks. `StockMovement` is the immutable audit trail for validated inventory changes; it is not summed on every request.

## Allowed stock mutations

Feature routes must validate their input, load or create a document, and call one of these functions. They must not update `InventoryBalance` or `StockMovement` directly.

```ts
receiveStock(input: { receiptId: string; userId?: string }): Promise<Receipt>
deliverStock(input: { deliveryId: string; userId?: string }): Promise<Delivery>
transferStock(input: { transferId: string; userId?: string }): Promise<Transfer>
adjustStock(input: { adjustmentId: string; userId?: string }): Promise<Adjustment>
```

Each function loads the document, rejects completed/canceled documents, validates quantities and references, updates balances, creates movements, and marks the document `DONE` in one Prisma transaction. A failed line rolls the whole transaction back.

Domain failures use `InventoryDomainError` with a stable code such as `INSUFFICIENT_STOCK`, `DOCUMENT_ALREADY_VALIDATED`, `ENTITY_NOT_FOUND`, `INVALID_QUANTITY`, `INVALID_LOCATION`, or `DUPLICATE_SKU`.

## Query APIs

Use the helpers in `lib/inventory/queries.ts` for shared reads:

```ts
getInventoryBalance(productId, locationId)
getTotalStockForProduct(productId)
getProductStockByLocation(productId)
getRecentStockMovements({ productId?, limit?, movementType? })
getLowStockProducts(search?)
getWarehouseInventory(warehouseId)
getWarehouses()
getLocations(warehouseId?)
getProducts({ search? })
```

## Team boundaries

Do not modify `InventoryBalance` or `StockMovement` from page components or route handlers. Do not duplicate balance arithmetic in feature folders. Shared domain behavior belongs in `lib/inventory/domain.ts`; shared reads belong in `lib/inventory/queries.ts`; validation belongs in `lib/validation/`.
