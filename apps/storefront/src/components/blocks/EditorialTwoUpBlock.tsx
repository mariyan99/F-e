import Link from "next/link";

import { MediaImage } from "@/components/MediaImage";
import { resolveHref } from "@/lib/href";

import { deviceClasses, type BlockOfType } from "./types";

export function EditorialTwoUpBlock({ block }: { block: BlockOfType<"editorialTwoUp"> }) {
  return (
    <section className={`mx-auto max-w-[1400px] px-6 py-16 ${deviceClasses(block.visibility?.devices)}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MediaImage media={block.imageLeft} sizes="(min-width: 768px) 50vw, 100vw" className="w-full" />
        <MediaImage media={block.imageRight} sizes="(min-width: 768px) 50vw, 100vw" className="w-full" />
      </div>
      {block.heading || block.body ? (
        <div className="mt-10 max-w-2xl">
          {block.heading ? <h2 className="font-display text-2xl">{block.heading}</h2> : null}
          {block.body ? <p className="mt-3 text-muted">{block.body}</p> : null}
          {block.link?.label ? (
            <Link href={resolveHref(block.link)} className="label-caps mt-5 inline-block border-b border-ink pb-1">
              {block.link.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
