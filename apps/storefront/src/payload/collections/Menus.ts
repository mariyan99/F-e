import type { CollectionConfig } from "payload";

import { revalidateEverything } from "../hooks/revalidate";

import { linkField } from "../fields/link";

/**
 * Header and footer navigation, editable without a deploy (task CMS-04).
 * Two levels are enough for a fashion catalogue; deeper menus are a symptom of
 * a category tree that needs fixing, not of a missing feature.
 */
export const Menus: CollectionConfig = {
  slug: "menus",
  labels: { singular: "Меню", plural: "Менюта" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "location"] },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "owner",
  },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    { name: "name", type: "text", required: true, label: "Име" },
    {
      name: "location",
      type: "select",
      required: true,
      label: "Място",
      options: [
        { label: "Хедър", value: "header" },
        { label: "Футър", value: "footer" },
      ],
    },
    {
      name: "items",
      type: "array",
      label: "Елементи",
      labels: { singular: "Елемент", plural: "Елементи" },
      fields: [
        { name: "label", type: "text", required: true, label: "Текст" },
        linkField(),
        {
          name: "featuredImage",
          type: "upload",
          relationTo: "media",
          label: "Промо изображение в мега-менюто",
        },
        {
          name: "children",
          type: "array",
          label: "Подниво",
          fields: [
            { name: "label", type: "text", required: true, label: "Текст" },
            linkField(),
          ],
        },
      ],
    },
  ],
};
