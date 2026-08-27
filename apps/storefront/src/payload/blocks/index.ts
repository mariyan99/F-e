import type { Block, Field } from "payload";

import { linkField } from "../fields/link";
import { visibilityField } from "../fields/visibility";

/**
 * The page builder's vocabulary (task CMS-02).
 *
 * Each block is a layout the design system already knows how to render, so
 * marketing composes pages without a developer and without a deploy. Adding a
 * new *kind* of layout is a code change; using the existing ones is not.
 */

const textPosition: Field = {
  name: "textPosition",
  type: "select",
  label: "Позиция на текста",
  defaultValue: "bottom-left",
  options: [
    { label: "Горе ляво", value: "top-left" },
    { label: "Горе център", value: "top-center" },
    { label: "Горе дясно", value: "top-right" },
    { label: "Център ляво", value: "middle-left" },
    { label: "Център", value: "middle-center" },
    { label: "Център дясно", value: "middle-right" },
    { label: "Долу ляво", value: "bottom-left" },
    { label: "Долу център", value: "bottom-center" },
    { label: "Долу дясно", value: "bottom-right" },
  ],
};

export const HeroFull: Block = {
  slug: "heroFull",
  labels: { singular: "Голям банер", plural: "Големи банери" },
  imageAltText: "Цял екран изображение със заглавие и бутони",
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "imageDesktop",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Изображение — десктоп",
          admin: { width: "50%", description: "Препоръчително 2400×1350." },
        },
        {
          name: "imageMobile",
          type: "upload",
          relationTo: "media",
          label: "Изображение — мобилно",
          admin: { width: "50%", description: "Препоръчително 1080×1440." },
        },
      ],
    },
    { name: "heading", type: "text", label: "Заглавие" },
    { name: "subheading", type: "text", label: "Подзаглавие" },
    textPosition,
    {
      name: "textColor",
      type: "select",
      label: "Цвят на текста",
      defaultValue: "light",
      options: [
        { label: "Светъл", value: "light" },
        { label: "Тъмен", value: "dark" },
      ],
    },
    {
      name: "overlay",
      type: "number",
      label: "Затъмняване (%)",
      defaultValue: 0,
      min: 0,
      max: 60,
      admin: { description: "Използвай само колкото трябва, за да се чете текстът." },
    },
    {
      name: "ctas",
      type: "array",
      label: "Бутони",
      maxRows: 2,
      fields: [linkField()],
    },
    visibilityField,
  ],
};

export const HeroSplit: Block = {
  slug: "heroSplit",
  labels: { singular: "Двоен банер", plural: "Двойни банери" },
  fields: [
    {
      name: "panels",
      type: "array",
      label: "Панели",
      minRows: 2,
      maxRows: 2,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true, label: "Изображение" },
        { name: "heading", type: "text", label: "Заглавие" },
        linkField(),
      ],
    },
    visibilityField,
  ],
};

export const ProductRail: Block = {
  slug: "productRail",
  labels: { singular: "Продуктов ред", plural: "Продуктови редове" },
  fields: [
    { name: "heading", type: "text", label: "Заглавие" },
    {
      name: "source",
      type: "select",
      label: "Източник",
      required: true,
      defaultValue: "collection",
      options: [
        { label: "Колекция", value: "collection" },
        { label: "Категория", value: "category" },
        { label: "Ръчен списък", value: "manual" },
        { label: "Нови постъпления", value: "new" },
        { label: "Намалени", value: "sale" },
      ],
    },
    {
      name: "handle",
      type: "text",
      label: "Handle на колекция или категория",
      admin: {
        condition: (_data, sibling: { source?: string }) =>
          ["collection", "category"].includes(sibling?.source ?? ""),
      },
    },
    {
      name: "productHandles",
      type: "array",
      label: "Продукти",
      admin: {
        description: "Handle-ите от Medusa, в реда, в който да се показват.",
        condition: (_data, sibling: { source?: string }) => sibling?.source === "manual",
      },
      fields: [{ name: "handle", type: "text", required: true, label: "Handle" }],
    },
    {
      name: "limit",
      type: "number",
      label: "Брой продукти",
      defaultValue: 8,
      min: 2,
      max: 24,
    },
    visibilityField,
  ],
};

export const EditorialTwoUp: Block = {
  slug: "editorialTwoUp",
  labels: { singular: "Редакционна секция", plural: "Редакционни секции" },
  fields: [
    {
      type: "row",
      fields: [
        { name: "imageLeft", type: "upload", relationTo: "media", required: true, label: "Ляво изображение", admin: { width: "50%" } },
        { name: "imageRight", type: "upload", relationTo: "media", required: true, label: "Дясно изображение", admin: { width: "50%" } },
      ],
    },
    { name: "heading", type: "text", label: "Заглавие" },
    { name: "body", type: "textarea", label: "Текст" },
    linkField(),
    visibilityField,
  ],
};

export const CategoryTiles: Block = {
  slug: "categoryTiles",
  labels: { singular: "Плочки категории", plural: "Плочки категории" },
  fields: [
    {
      name: "tiles",
      type: "array",
      label: "Плочки",
      minRows: 2,
      maxRows: 6,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true, label: "Изображение" },
        { name: "caption", type: "text", required: true, label: "Надпис" },
        linkField(),
      ],
    },
    visibilityField,
  ],
};

export const TextBanner: Block = {
  slug: "textBanner",
  labels: { singular: "Текстова лента", plural: "Текстови ленти" },
  fields: [
    { name: "text", type: "text", required: true, label: "Текст" },
    {
      name: "tone",
      type: "select",
      label: "Стил",
      defaultValue: "ink",
      options: [
        { label: "Тъмна", value: "ink" },
        { label: "Светла", value: "paper" },
        { label: "Акцент", value: "accent" },
      ],
    },
    linkField(),
    visibilityField,
  ],
};

export const USPStrip: Block = {
  slug: "uspStrip",
  labels: { singular: "Лента с предимства", plural: "Ленти с предимства" },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Предимства",
      minRows: 2,
      maxRows: 4,
      fields: [
        { name: "title", type: "text", required: true, label: "Заглавие" },
        { name: "body", type: "text", label: "Описание" },
      ],
    },
    visibilityField,
  ],
};

export const pageBlocks: Block[] = [
  HeroFull,
  HeroSplit,
  ProductRail,
  EditorialTwoUp,
  CategoryTiles,
  TextBanner,
  USPStrip,
];
