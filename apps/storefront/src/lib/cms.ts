import config from "@payload-config";
import { getPayload } from "payload";

import type { Menu, Page, Theme } from "@/payload-types";

/**
 * Payload runs in-process, so content reads are a function call rather than an
 * HTTP round trip. Cached at the page level via `revalidateTag` when an editor
 * publishes (task CMS-08).
 */
async function client() {
  return getPayload({ config });
}

export async function getPage(slug: string): Promise<Page | null> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: false,
  });
  return docs[0] ?? null;
}

export async function getMenu(location: "header" | "footer"): Promise<Menu | null> {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "menus",
    where: { location: { equals: location } },
    limit: 1,
    depth: 2,
  });
  return docs[0] ?? null;
}

/**
 * The active theme is the one whose window contains "now" — so a season change
 * scheduled for 00:01 on 1 September happens on its own, with no deploy
 * (docs/plan §5, layer 1).
 */
export async function getActiveTheme(): Promise<Theme | null> {
  const payload = await client();
  const now = new Date().toISOString();
  const { docs } = await payload.find({
    collection: "themes",
    where: {
      and: [
        { activeFrom: { less_than_equal: now } },
        { or: [{ activeTo: { greater_than: now } }, { activeTo: { exists: false } }] },
      ],
    },
    sort: "-activeFrom",
    limit: 1,
  });
  return docs[0] ?? null;
}

/** A block is visible when its window contains "now". Device targeting is CSS. */
export function isBlockVisible(block: {
  visibility?: { from?: string | null; to?: string | null } | null;
}): boolean {
  const from = block.visibility?.from;
  const to = block.visibility?.to;
  const now = Date.now();
  if (from && new Date(from).getTime() > now) return false;
  if (to && new Date(to).getTime() <= now) return false;
  return true;
}
