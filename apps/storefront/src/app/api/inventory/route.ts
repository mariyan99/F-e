import { computeSellable, STOCK_SAFETY_BUFFER } from "@fabrizia/shared";
import { NextResponse } from "next/server";

import { medusa } from "@/lib/medusa";

export const dynamic = "force-dynamic";

/**
 * Live sellable stock per variant, deliberately uncached — this is the one
 * thing the static product page must never remember (task PDP-08).
 *
 * What goes out is `sellable`, never the raw quantity: wholesale movements are
 * recorded by hand and do not decrement stock, so the recorded number runs
 * ahead of the shelf. Holding back a safety buffer means that drift produces a
 * missed sale instead of an order for goods that are not there (decision O-5).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  try {
    const { product } = await medusa.store.product.retrieve(productId, {
      fields: "id,*variants,+variants.inventory_quantity",
    });

    const availability: Record<string, number> = {};
    for (const variant of product.variants ?? []) {
      // A variant that does not manage inventory is always purchasable.
      if (!variant.manage_inventory) {
        availability[variant.id] = Number.MAX_SAFE_INTEGER;
        continue;
      }
      const onHand = Math.max(0, variant.inventory_quantity ?? 0);
      availability[variant.id] = computeSellable(onHand);
    }

    return NextResponse.json(
      { availability, safetyBuffer: STOCK_SAFETY_BUFFER },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[inventory] lookup failed", error);
    return NextResponse.json({ availability: {} }, { status: 200 });
  }
}
