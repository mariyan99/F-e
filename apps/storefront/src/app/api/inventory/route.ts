import { NextResponse } from "next/server";

import { medusa } from "@/lib/medusa";

export const dynamic = "force-dynamic";

/**
 * Live stock per variant, deliberately uncached — this is the one thing the
 * static product page must never remember (task PDP-08).
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
      availability[variant.id] = variant.manage_inventory
        ? Math.max(0, variant.inventory_quantity ?? 0)
        : Number.MAX_SAFE_INTEGER;
    }

    return NextResponse.json(
      { availability },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[inventory] lookup failed", error);
    return NextResponse.json({ availability: {} }, { status: 200 });
  }
}
