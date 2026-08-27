"use client";

import { useEffect, useState } from "react";

type Variant = { id: string; title: string; sku: string | null };

type Availability = Record<string, number>;

/**
 * Stock is fetched in the browser, never baked into the cached HTML.
 *
 * A statically rendered page that claims a sold-out size is in stock costs an
 * order, a refund and a customer — so the page ships a skeleton and the real
 * numbers arrive a moment later (task PDP-08).
 */
export function SizeSelector({ productId, variants }: { productId: string; variants: Variant[] }) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/inventory?productId=${encodeURIComponent(productId)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`inventory ${response.status}`);
        const data = (await response.json()) as { availability: Availability };
        if (!cancelled) setAvailability(data.availability);
      } catch {
        // Unknown availability is not "out of stock": leave the sizes
        // selectable and let the cart re-validate rather than block a sale.
        if (!cancelled) setAvailability({});
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const stockFor = (variantId: string): number | undefined => availability?.[variantId];

  return (
    <div className="mt-7">
      <div className="flex items-baseline justify-between">
        <h2 className="label-caps text-muted">Размер</h2>
        <button type="button" className="label-caps underline underline-offset-4">
          Таблица с размери
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const stock = stockFor(variant.id);
          const soldOut = stock === 0;
          const low = stock !== undefined && stock > 0 && stock <= 2;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={soldOut}
              aria-pressed={selected === variant.id}
              onClick={() => setSelected(variant.id)}
              className={`min-w-14 border px-4 py-3 text-sm transition-colors ${
                soldOut
                  ? "cursor-not-allowed border-rule text-muted line-through"
                  : selected === variant.id
                    ? "border-ink bg-ink text-paper"
                    : "border-rule hover:border-ink"
              }`}
            >
              {variant.title}
              {low ? <span className="ml-1 text-[10px] align-super">последни</span> : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        className="mt-5 w-full border border-ink bg-ink px-6 py-4 text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {selected ? "Добави в кошницата" : "Избери размер"}
      </button>
    </div>
  );
}
