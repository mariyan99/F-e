import Image from "next/image";

import type { Media } from "@/payload-types";

type Props = {
  media: Media | number | null | undefined;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Wraps next/image so every image in the storefront gets the same treatment:
 * real alt text from the CMS, explicit `sizes`, and AVIF/WebP negotiation.
 * `priority` belongs on the one above-the-fold image and nowhere else — every
 * extra one pushes LCP the wrong way.
 */
export function MediaImage({ media, sizes, className, priority = false }: Props) {
  if (!media || typeof media === "number" || !media.url) return null;

  return (
    <Image
      src={media.url}
      alt={media.alt ?? ""}
      width={media.width ?? 1200}
      height={media.height ?? 1600}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
    />
  );
}
