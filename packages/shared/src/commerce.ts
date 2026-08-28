/**
 * Business rules decided by the owner, in one place.
 *
 * These are values the shop operates on every day, so they live in code with a
 * named constant and a reason — not scattered as magic numbers. Anything the
 * owner should be able to change without a developer belongs in the admin
 * instead; these are the launch defaults and the fallbacks when nothing is set.
 */

/** Free shipping at or above this amount, in EUR (decision: 89 EUR). */
export const FREE_SHIPPING_THRESHOLD_EUR = 89;

/**
 * Flat fee added for cash on delivery, in EUR.
 * Deliberately flat rather than a percentage: a fixed number is legible in the
 * checkout summary, a percentage invites arithmetic and disputes.
 */
export const COD_FEE_EUR = 1.5;

/** Statutory withdrawal period in Bulgaria. */
export const RETURN_WINDOW_DAYS = 14;

/** The customer pays return shipping. Surfaced in the terms and at checkout. */
export const RETURN_SHIPPING_PAID_BY = "customer" as const;

/** Econt supports inspect-before-payment, and for clothing it lifts conversion. */
export const INSPECTION_ALLOWED = true;

/**
 * Units held back from the sellable count.
 *
 * The single largest operational risk in this shop: wholesale orders are
 * written up by hand and do not decrement stock automatically, so the recorded
 * quantity drifts above the real one. A buffer means the drift eats the buffer
 * instead of producing an order for goods that are not on the shelf.
 *
 * Two units is the launch value, confirmed by the owner on 27.08.2026. Lower it
 * only once daily reconciliation shows the recorded and counted quantities
 * agreeing — and treat that as a decision, not a tweak.
 */
export const STOCK_SAFETY_BUFFER = 2;

/** Below this sellable count the storefront says "last few". */
export const LOW_STOCK_THRESHOLD = 3;

/**
 * What the customer may actually buy.
 *
 * `available` is what the system believes exists; `sellable` is what we are
 * willing to promise. Everything customer-facing — the size picker, the feed,
 * the cart re-validation — reads this, never `available`.
 */
export function computeSellable(
  available: number,
  safetyBuffer: number = STOCK_SAFETY_BUFFER,
): number {
  return Math.max(0, available - Math.max(0, safetyBuffer));
}

/** Shipping cost in EUR for an order subtotal, before the COD fee. */
export function shippingCostEur(
  subtotalEur: number,
  baseShippingEur: number,
  threshold: number = FREE_SHIPPING_THRESHOLD_EUR,
): number {
  return subtotalEur >= threshold ? 0 : baseShippingEur;
}

/** How much more the customer must add to reach free shipping; 0 once reached. */
export function amountToFreeShippingEur(
  subtotalEur: number,
  threshold: number = FREE_SHIPPING_THRESHOLD_EUR,
): number {
  return Math.max(0, threshold - subtotalEur);
}
