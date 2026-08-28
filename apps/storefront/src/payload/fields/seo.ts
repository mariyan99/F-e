import type { Field } from "payload";

/**
 * SEO fields attached to every addressable record (task SEO-01).
 * Left empty, the storefront falls back to sensible templates — an empty field
 * is a deliberate "use the default", not a missing value.
 */
export const seoField: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Празно поле означава автоматичен текст по подразбиране." },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Meta title",
      maxLength: 70,
      admin: { description: "До 70 знака. Празно = заглавието на страницата." },
    },
    {
      name: "description",
      type: "textarea",
      label: "Meta description",
      maxLength: 170,
      admin: { description: "До 170 знака." },
    },
    {
      name: "canonical",
      type: "text",
      label: "Canonical URL",
      admin: { description: "Само ако тази страница дублира друга." },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "Изображение за споделяне",
    },
    {
      name: "noindex",
      type: "checkbox",
      label: "Не индексирай тази страница",
      defaultValue: false,
    },
  ],
};
