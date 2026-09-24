import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

/**
 * Publishing must be visible in seconds, without a deploy (task CMS-08).
 *
 * Payload runs inside the Next server, so the cache can be invalidated by a
 * direct call rather than a webhook round trip. The same hooks also execute
 * under the Payload CLI (migrations, type generation), where `next/cache` has
 * no request context — hence the guarded dynamic import: a CLI run simply
 * skips revalidation instead of crashing.
 */
async function revalidate(paths: string[], tags: string[] = []): Promise<void> {
  try {
    const { revalidatePath, revalidateTag } = await import("next/cache");
    for (const path of paths) revalidatePath(path);
    for (const tag of tags) revalidateTag(tag);
  } catch {
    // Running outside a Next server (CLI). Nothing to invalidate.
  }
}

function pathForSlug(slug: unknown): string {
  return slug === "home" || !slug ? "/" : `/${String(slug)}`;
}

export const revalidatePage: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const paths = new Set([pathForSlug((doc as { slug?: string }).slug)]);
  // A renamed page has to drop its old cache entry too.
  const previousSlug = (previousDoc as { slug?: string } | undefined)?.slug;
  if (previousSlug) paths.add(pathForSlug(previousSlug));
  await revalidate([...paths]);
  return doc;
};

export const revalidatePageAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidate([pathForSlug((doc as { slug?: string }).slug)]);
  return doc;
};

/** Menus, footer and theme are in the layout, so every page is affected. */
export const revalidateEverything: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidate(["/", "/produkt"], ["layout"]);
  return doc;
};
