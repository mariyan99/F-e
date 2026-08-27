import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/medusa";

import { deviceClasses, type BlockOfType } from "./types";

export async function ProductRailBlock({ block }: { block: BlockOfType<"productRail"> }) {
  const handles = block.productHandles?.map((row) => row.handle).filter(Boolean) as string[] | undefined;

  const products = await listProducts({
    limit: block.limit ?? 8,
    ...(block.source === "manual" && handles?.length ? { handles } : {}),
    ...(block.source === "category" && block.handle ? { categoryHandle: block.handle } : {}),
    ...(block.source === "collection" && block.handle ? { collectionHandle: block.handle } : {}),
  });

  // An empty rail is worse than no rail: it reads as a broken page.
  if (products.length === 0) return null;

  return (
    <section className={`mx-auto max-w-[1400px] px-6 py-16 ${deviceClasses(block.visibility?.devices)}`}>
      {block.heading ? <h2 className="mb-8 font-display text-2xl">{block.heading}</h2> : null}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
