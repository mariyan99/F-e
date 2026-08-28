type LinkValue = {
  type?: string | null;
  handle?: string | null;
  url?: string | null;
  page?: { slug?: string | null } | number | null;
} | null | undefined;

/**
 * Turns a CMS link into a storefront path.
 *
 * Commerce records are referenced by handle across a database boundary
 * (ADR-001 §2.1), so a link to something that no longer exists degrades to "/"
 * instead of rendering a broken href.
 */
export function resolveHref(link: LinkValue): string {
  if (!link) return "/";

  switch (link.type) {
    case "category":
      return link.handle ? `/kategoriya/${link.handle}` : "/";
    case "collection":
      return link.handle ? `/kolekciya/${link.handle}` : "/";
    case "product":
      return link.handle ? `/produkt/${link.handle}` : "/";
    case "page": {
      if (link.page && typeof link.page === "object" && link.page.slug) {
        return link.page.slug === "home" ? "/" : `/${link.page.slug}`;
      }
      return "/";
    }
    case "external":
      return link.url ?? "/";
    default:
      return "/";
  }
}
