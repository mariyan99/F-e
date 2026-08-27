import Link from "next/link";

import { MediaImage } from "@/components/MediaImage";
import { resolveHref } from "@/lib/href";

import { deviceClasses, type BlockOfType } from "./types";

const POSITIONS: Record<string, string> = {
  "top-left": "items-start justify-start text-left",
  "top-center": "items-start justify-center text-center",
  "top-right": "items-start justify-end text-right",
  "middle-left": "items-center justify-start text-left",
  "middle-center": "items-center justify-center text-center",
  "middle-right": "items-center justify-end text-right",
  "bottom-left": "items-end justify-start text-left",
  "bottom-center": "items-end justify-center text-center",
  "bottom-right": "items-end justify-end text-right",
};

export function HeroFullBlock({
  block,
  priority,
}: {
  block: BlockOfType<"heroFull">;
  priority: boolean;
}) {
  const position = POSITIONS[block.textPosition ?? "bottom-left"] ?? POSITIONS["bottom-left"];
  const light = (block.textColor ?? "light") === "light";

  return (
    <section className={`relative ${deviceClasses(block.visibility?.devices)}`}>
      <div className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[86vh]">
        <div className="absolute inset-0 hidden md:block">
          <MediaImage
            media={block.imageDesktop}
            sizes="100vw"
            priority={priority}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 md:hidden">
          <MediaImage
            media={block.imageMobile ?? block.imageDesktop}
            sizes="100vw"
            priority={priority}
            className="h-full w-full object-cover"
          />
        </div>

        {block.overlay ? (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (block.overlay ?? 0) / 100 }}
            aria-hidden="true"
          />
        ) : null}

        <div className={`relative flex h-full min-h-[70vh] p-8 md:min-h-[86vh] md:p-16 ${position}`}>
          <div className={light ? "text-white" : "text-ink"}>
            {block.heading ? (
              <h1 className="font-display text-4xl md:text-6xl">{block.heading}</h1>
            ) : null}
            {block.subheading ? (
              <p className="mt-3 max-w-lg text-base md:text-lg">{block.subheading}</p>
            ) : null}
            {block.ctas?.length ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {block.ctas.map((cta, index) => (
                  <Link
                    key={index}
                    href={resolveHref(cta.link)}
                    className={`label-caps border px-7 py-3 transition-colors ${
                      light
                        ? "border-white text-white hover:bg-white hover:text-ink"
                        : "border-ink text-ink hover:bg-ink hover:text-paper"
                    }`}
                  >
                    {cta.link?.label ?? "Разгледай"}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
