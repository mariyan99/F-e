import Link from "next/link";

import { MediaImage } from "@/components/MediaImage";
import { resolveHref } from "@/lib/href";

import { deviceClasses, type BlockOfType } from "./types";

export function CategoryTilesBlock({
  block,
  priority,
}: {
  block: BlockOfType<"categoryTiles">;
  priority: boolean;
}) {
  const tiles = block.tiles ?? [];

  return (
    <section className={`mx-auto max-w-[1400px] px-6 py-16 ${deviceClasses(block.visibility?.devices)}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((tile, index) => (
          <Link key={index} href={resolveHref(tile.link)} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden">
              <MediaImage
                media={tile.image}
                sizes="(min-width: 1024px) 33vw, 50vw"
                priority={priority && index === 0}
                className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
            </div>
            <h3 className="label-caps mt-3">{tile.caption}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
