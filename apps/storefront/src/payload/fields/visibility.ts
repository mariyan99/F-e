import type { Field } from "payload";

/**
 * Every content block carries its own schedule and device targeting, so a
 * campaign can be built a week early and publish itself (docs/plan §5, EP-08).
 */
export const visibilityField: Field = {
  name: "visibility",
  type: "group",
  label: "Видимост",
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "from",
          type: "date",
          label: "Показвай от",
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "to",
          type: "date",
          label: "Показвай до",
          admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
        },
      ],
    },
    {
      name: "devices",
      type: "select",
      label: "Устройства",
      hasMany: true,
      defaultValue: ["desktop", "mobile"],
      options: [
        { label: "Десктоп", value: "desktop" },
        { label: "Мобилно", value: "mobile" },
      ],
    },
  ],
};
