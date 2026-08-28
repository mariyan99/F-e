import Link from "next/link";

import { MediaImage } from "@/components/MediaImage";
import { resolveHref } from "@/lib/href";

import { deviceClasses, type BlockOfType } from "./types";

export function HeroSplitBlock({
  block,
  priority,
}: {
  block: BlockOfType<"heroSplit">;
  priority: boolean;
}) {
  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 ${deviceClasses(block.visibility?.devices)}`}>
      {(block.panels ?? []).map((panel, index) => (
        <Link key={index} href={resolveHref(panel.link)} className="group relative block">
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
            <MediaImage
              media={panel.image}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={priority && index === 0}
              className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
          </div>
          <div className="absolute bottom-8 left-8 text-white">
            {panel.heading ? <h2 className="font-display text-3xl">{panel.heading}</h2> : null}
            {panel.link?.label ? (
              <span className="label-caps mt-2 inline-block border-b border-white pb-1">
                {panel.link.label}
              </span>
            ) : null}
          </div>
        </Link>
      ))}
    </section>
  );
}
