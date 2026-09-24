import Image from "next/image";
import Link from "next/link";

import { formatPrice, type StoreProduct } from "@/lib/medusa";

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const image = product.thumbnail ?? product.images?.[0]?.url ?? null;
  const price = product.variants?.[0]?.calculated_price?.calculated_amount ?? null;

  return (
    <Link href={`/produkt/${product.handle}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-rule/40">
        {image ? (
          <Image
            src={image}
            alt={product.title ?? ""}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm">{product.title}</h3>
        <span className="text-sm tabular-nums text-muted">{formatPrice(price)}</span>
      </div>
    </Link>
  );
}
