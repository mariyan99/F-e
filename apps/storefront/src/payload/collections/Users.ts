import type { CollectionConfig } from "payload";

/**
 * Content-side accounts. Commerce staff live in Medusa's own user table —
 * two panels, two identity stores, deliberately (ADR-001 decision 9).
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  labels: { singular: "Потребител", plural: "Потребители" },
  admin: { useAsTitle: "email", defaultColumns: ["email", "name", "role"] },
  access: {
    // Only signed-in editors read or change accounts; never public.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "owner",
    update: ({ req }) => req.user?.role === "owner",
    delete: ({ req }) => req.user?.role === "owner",
  },
  fields: [
    { name: "name", type: "text", label: "Име" },
    {
      name: "role",
      type: "select",
      label: "Роля",
      required: true,
      defaultValue: "content",
      options: [
        { label: "Собственик", value: "owner" },
        { label: "Съдържание", value: "content" },
      ],
    },
  ],
};
