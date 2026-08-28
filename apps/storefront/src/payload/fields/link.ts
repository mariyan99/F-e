import type { Field } from "payload";

/**
 * A link can point at a Medusa category or collection, a CMS page, or an
 * external URL. Commerce records are referenced by handle, not by a foreign
 * key — the two databases are deliberately separate (ADR-001 §2.1), so a
 * deleted product degrades to a skipped link rather than a 500.
 */
export const linkField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: "link",
    type: "group",
    label: "Линк",
    fields: [
      {
        name: "type",
        type: "select",
        label: "Тип",
        defaultValue: "category",
        options: [
          { label: "Категория", value: "category" },
          { label: "Колекция", value: "collection" },
          { label: "Продукт", value: "product" },
          { label: "Страница", value: "page" },
          { label: "Външен адрес", value: "external" },
        ],
      },
      {
        name: "handle",
        type: "text",
        label: "Handle в Medusa",
        admin: {
          description: 'Например "rokli". Виж Medusa admin → Категории.',
          condition: (_data, siblingData: { type?: string }) =>
            ["category", "collection", "product"].includes(siblingData?.type ?? ""),
        },
      },
      {
        name: "page",
        type: "relationship",
        relationTo: "pages",
        label: "Страница",
        admin: {
          condition: (_data, siblingData: { type?: string }) => siblingData?.type === "page",
        },
      },
      {
        name: "url",
        type: "text",
        label: "Адрес",
        admin: {
          condition: (_data, siblingData: { type?: string }) => siblingData?.type === "external",
        },
      },
      {
        name: "label",
        type: "text",
        label: "Текст на бутона",
      },
    ],
    ...overrides,
  }) as Field;
