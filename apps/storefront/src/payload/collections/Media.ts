import type { CollectionConfig } from "payload";

/**
 * Every image the storefront shows.
 *
 * Two guardrails are deliberate (task CMS-05): `alt` is required, so a publish
 * cannot ship an unlabelled image; and a hook warns when a product image is
 * not 3:4, because one inconsistent crop does more damage to the premium
 * feeling than a bad typeface.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Изображение", plural: "Медия" },
  admin: { useAsTitle: "alt", defaultColumns: ["filename", "alt", "usage"] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ["image/*"],
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 300, height: 400, position: "centre" },
      { name: "card", width: 600, height: 800, position: "centre" },
      { name: "product", width: 1200, height: 1600, position: "centre" },
      { name: "hero", width: 2400, height: 1350, position: "centre" },
      { name: "heroMobile", width: 1080, height: 1440, position: "centre" },
    ],
    formatOptions: { format: "webp", options: { quality: 82 } },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Алтернативен текст",
      admin: {
        description:
          "Опиши какво се вижда. Задължително — четците за незрящи и Google разчитат на него.",
      },
    },
    {
      name: "usage",
      type: "select",
      label: "Предназначение",
      defaultValue: "product",
      options: [
        { label: "Продукт (3:4)", value: "product" },
        { label: "Банер", value: "hero" },
        { label: "Редакционно", value: "editorial" },
      ],
    },
    {
      name: "credit",
      type: "text",
      label: "Кредит на фотографа",
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const { width, height, usage } = data as {
          width?: number;
          height?: number;
          usage?: string;
        };
        if (usage === "product" && width && height) {
          const ratio = width / height;
          const target = 3 / 4;
          if (Math.abs(ratio - target) > 0.02) {
            throw new Error(
              `Продуктовите снимки трябва да са 3:4. Тази е ${width}×${height} (${ratio.toFixed(2)}:1). ` +
                'Ако е банер или редакционна снимка, смени "Предназначение".',
            );
          }
        }
        return data;
      },
    ],
  },
};
