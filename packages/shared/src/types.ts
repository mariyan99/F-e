/**
 * Types shared between the commerce backend and the storefront.
 * Domain vocabulary lives here so both sides spell it the same way.
 */

/** Size systems differ by category — a dress is S/M/L, trousers are 34–46. */
export const SIZE_SYSTEMS = {
  ALPHA: ["XS", "S", "M", "L", "XL", "XXL"],
  NUMERIC: ["34", "36", "38", "40", "42", "44", "46"],
  ONE_SIZE: ["ONE"],
} as const;

export type SizeSystem = keyof typeof SIZE_SYSTEMS;

/**
 * Order lifecycle. `UNCLAIMED` and `REFUSED` are first-class states, not edge
 * cases: with cash on delivery they are 8–20% of Bulgarian fashion orders and
 * the single largest hidden cost. Task ORD-01.
 */
export const ORDER_STATUS = [
  "draft",
  "pending_payment",
  "confirmed",
  "picking",
  "packed",
  "label_created",
  "shipped",
  "in_transit",
  "delivered",
  "completed",
  "unclaimed",
  "refused",
  "return_requested",
  "returned",
  "refunded",
  "failed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

/** Statuses after which stock must be returned to `on_hand`. */
export const STOCK_RETURNING_STATUSES: readonly OrderStatus[] = [
  "unclaimed",
  "refused",
  "returned",
  "cancelled",
];

export type ShippingCarrier = "econt" | "speedy";

export type ShippingDestination = "office" | "automat" | "address";

export type PaymentMethod = "cod" | "card" | "bank_transfer";

/**
 * Inventory is three numbers, never one. `available` is what the customer sees;
 * it is derived, never stored independently. Task INV-01.
 */
export interface InventoryLevel {
  onHand: number;
  reserved: number;
  /** onHand − reserved. Never negative. */
  available: number;
  lowStockThreshold: number;
}

export function computeAvailable(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}

/**
 * A StyleGroup ties together the per-colour products of one design.
 * One product ID = one design in one colour; sizes are variants. ADR-001, decision 5.
 */
export interface StyleGroupSummary {
  /** FB-2601 */
  code: string;
  title: string;
  productIds: string[];
}

/** Financial journal event names. Append-only — never rename a published one. */
export const FINANCE_EVENTS = [
  "order.paid",
  "order.refunded",
  "shipping.charged",
  "cod.collected",
  "discount.applied",
] as const;

export type FinanceEvent = (typeof FINANCE_EVENTS)[number];

/** Base currency is EUR. BGN appears alongside it only while dual display is required. */
export const BASE_CURRENCY = "eur" as const;
export const DUAL_DISPLAY_CURRENCY = "bgn" as const;

/** Fixed conversion rate used for informational BGN display. */
export const BGN_PER_EUR = 1.95583;
