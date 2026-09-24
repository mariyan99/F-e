import type { CollectionConfig } from "payload";

import { revalidateEverything } from "../hooks/revalidate";

/**
 * A season's visual identity as data (docs/plan §5, layer 1).
 *
 * These fields compile to CSS custom properties injected into the document, so
 * switching from SS26 to AW26 is a dropdown and a date — not a deploy. Nothing
 * downstream may hard-code a colour; if it does, the season switch silently
 * stops working for that component.
 */
export const Themes: CollectionConfig = {
  slug: "themes",
  labels: { singular: "Тема", plural: "Теми" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "activeFrom", "activeTo"],
    description: "Активната тема е тази с най-късно начало, което вече е настъпило.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "owner",
  },
  hooks: { afterChange: [revalidateEverything] },
  fields: [
    { name: "name", type: "text", required: true, label: "Име", admin: { description: 'Например "SS26".' } },
    {
      type: "row",
      fields: [
        {
          name: "activeFrom",
          type: "date",
          label: "Активна от",
          required: true,
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "activeTo",
          type: "date",
          label: "Активна до",
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
      ],
    },
    {
      name: "tokens",
      type: "group",
      label: "Цветове и типография",
      fields: [
        {
          type: "row",
          fields: [
            { name: "ink", type: "text", required: true, defaultValue: "#17141B", label: "Основен текст", admin: { width: "50%" } },
            { name: "paper", type: "text", required: true, defaultValue: "#FBFAFC", label: "Фон", admin: { width: "50%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "accent", type: "text", required: true, defaultValue: "#7C3E56", label: "Акцент", admin: { width: "50%" } },
            { name: "muted", type: "text", required: true, defaultValue: "#6B6474", label: "Второстепенен текст", admin: { width: "50%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "sale", type: "text", required: true, defaultValue: "#9B3B33", label: "Цвят на намалението", admin: { width: "50%" } },
            { name: "rule", type: "text", required: true, defaultValue: "#E2DDE7", label: "Линии", admin: { width: "50%" } },
          ],
        },
        {
          name: "radius",
          type: "select",
          label: "Заобляне",
          defaultValue: "0px",
          options: [
            { label: "0px — остри ръбове", value: "0px" },
            { label: "2px", value: "2px" },
          ],
        },
        {
          name: "fontDisplay",
          type: "select",
          label: "Заглавен шрифт",
          defaultValue: "grotesque",
          options: [
            { label: "Grotesque", value: "grotesque" },
            { label: "Serif", value: "serif" },
          ],
        },
        {
          name: "typeScale",
          type: "select",
          label: "Типографска скала",
          defaultValue: "regular",
          options: [
            { label: "Компактна", value: "compact" },
            { label: "Стандартна", value: "regular" },
            { label: "Редакционна", value: "editorial" },
          ],
        },
      ],
    },
  ],
};
