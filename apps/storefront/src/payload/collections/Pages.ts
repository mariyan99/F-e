import type { CollectionConfig } from "payload";
import { slugify } from "@fabrizia/shared";

import { pageBlocks } from "../blocks";
import { seoField } from "../fields/seo";
import { revalidatePage, revalidatePageAfterDelete } from "../hooks/revalidate";

/**
 * Any addressable page assembled from blocks: the home page, seasonal landing
 * pages, lookbooks, legal texts.
 *
 * Drafts and versions are on, so an editor can preview and roll back without
 * asking anyone (tasks CMS-06, CMS-07).
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Страница", plural: "Страници" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    livePreview: {
      url: ({ data }) => {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8000";
        const slug = (data as { slug?: string })?.slug ?? "";
        return slug === "home" ? base : `${base}/${slug}`;
      },
    },
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 50,
  },
  access: {
    // Published pages are public; drafts need a session.
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "owner",
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageAfterDelete],
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Заглавие" },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "URL",
      admin: {
        position: "sidebar",
        description: 'Началната страница е "home". Смяната на URL изисква 301 (задача SEO-02).',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const source = (value as string) || (data as { title?: string })?.title || "";
            return slugify(source);
          },
        ],
      },
    },
    {
      name: "layout",
      type: "blocks",
      label: "Съдържание",
      minRows: 1,
      blocks: pageBlocks,
      admin: { initCollapsed: true },
    },
    seoField,
  ],
};
