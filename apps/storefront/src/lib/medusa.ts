import Medusa from "@medusajs/js-sdk";

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

if (!publishableKey && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing. Run `pnpm seed` and copy the printed key.",
  );
}

export const medusa = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
});

export type StoreProduct = Awaited<
  ReturnType<typeof medusa.store.product.list>
>["products"][number];

const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "bg";

let regionPromise: Promise<string | null> | null = null;

/**
 * Medusa refuses to calculate a price without a pricing context, so every
 * catalogue query has to carry a region. Resolved once per process and reused;
 * a failure yields null rather than throwing, so the page still renders (with
 * no prices) instead of 500-ing.
 */
export async function getRegionId(): Promise<string | null> {
  regionPromise ??= medusa.store.region
    .list({}, { next: { tags: ["regions"] } })
    .then(({ regions }) => {
      const match = regions.find((region) =>
        region.countries?.some((country) => country.iso_2 === DEFAULT_COUNTRY),
      );
      return match?.id ?? regions[0]?.id ?? null;
    })
    .catch((error: unknown) => {
      console.error("[medusa] region lookup failed", error);
      regionPromise = null;
      return null;
    });

  return regionPromise;
}

/**
 * Product listings are cached; stock is not. The availability of a size is
 * fetched client-side on the product page, because a cached page that says
 * "in stock" for a sold-out size costs an order and a refund (task PDP-08).
 */
export async function listProducts(params: {
  limit?: number;
  categoryHandle?: string;
  collectionHandle?: string;
  handles?: string[];
} = {}): Promise<StoreProduct[]> {
  const { limit = 8, handles } = params;

  try {
    const regionId = await getRegionId();
    const { products } = await medusa.store.product.list(
      {
        limit: handles?.length ?? limit,
        ...(regionId ? { region_id: regionId } : {}),
        ...(handles?.length ? { handle: handles } : {}),
        fields: "id,title,handle,thumbnail,*images,*variants,*variants.calculated_price",
      },
      { next: { tags: ["products"] } },
    );

    if (!handles?.length) return products;

    // Preserve the order the editor chose in the CMS.
    const byHandle = new Map(products.map((p) => [p.handle, p]));
    return handles.flatMap((handle) => {
      const product = byHandle.get(handle);
      return product ? [product] : [];
    });
  } catch (error) {
    // A dead backend must not take the whole page down with it.
    console.error("[medusa] product list failed", error);
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<StoreProduct | null> {
  try {
    const regionId = await getRegionId();
    const { products } = await medusa.store.product.list(
      {
        handle,
        limit: 1,
        ...(regionId ? { region_id: regionId } : {}),
        fields: "id,title,handle,description,thumbnail,*images,*options,*variants,*variants.options,*variants.calculated_price",
      },
      { next: { tags: [`product:${handle}`] } },
    );
    return products[0] ?? null;
  } catch (error) {
    console.error(`[medusa] product "${handle}" failed`, error);
    return null;
  }
}

/** Colour siblings of one design, for the colour switcher (task PDP-03). */
export async function getStyleGroup(code: string): Promise<{
  code: string;
  title: string;
  products: Array<{ id: string; handle: string; title: string; thumbnail: string | null }>;
} | null> {
  try {
    const response = await fetch(
      `${backendUrl}/store/style-groups/${encodeURIComponent(code)}`,
      {
        headers: publishableKey ? { "x-publishable-api-key": publishableKey } : {},
        next: { revalidate: 300, tags: [`style-group:${code}`] },
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { style_group: NonNullable<Awaited<ReturnType<typeof getStyleGroup>>> };
    return data.style_group;
  } catch (error) {
    console.error(`[medusa] style group "${code}" failed`, error);
    return null;
  }
}

/** Prices are stored and displayed in EUR; BGN is informational only. */
export function formatPrice(amount: number | null | undefined, currency = "EUR"): string {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
