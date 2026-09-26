import type { DomainErrorCode } from "@/lib/inventory/domain";

const messages: Record<DomainErrorCode, string> = {
  INVALID_QUANTITY: "Quantities must be greater than zero.",
  INSUFFICIENT_STOCK: "Not enough stock is available at the source location to complete this operation.",
  ENTITY_NOT_FOUND: "One of the selected products or locations could not be found.",
  DOCUMENT_ALREADY_VALIDATED: "This document has already been validated.",
  INVALID_DOCUMENT_STATUS: "This document can no longer be validated.",
  INVALID_LOCATION: "Source and destination locations must be different.",
  DUPLICATE_SKU: "A duplicate entry was found.",
};

export function friendlyDomainMessage(code: DomainErrorCode, fallback: string) {
  return messages[code] ?? fallback;
}
