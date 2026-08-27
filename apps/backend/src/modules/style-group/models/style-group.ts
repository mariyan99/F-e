import { model } from "@medusajs/framework/utils";

/**
 * A StyleGroup is one design; each colour of that design is a separate product.
 *
 * Zara and Mango work this way, and it is the only model that gives every
 * colour its own gallery, its own URL, its own SEO and its own row in the
 * Google Merchant feed. Treating colour as a variant breaks all four.
 *
 * ADR-001 decision 5, task CAT-01.
 */
export const StyleGroup = model
  .define("style_group", {
    id: model.id({ prefix: "sg" }).primaryKey(),
    /** FB-2601 — the style number shared by every colour. */
    code: model.text().searchable(),
    /** "Рокля Elena" — the design name, without the colour. */
    title: model.text().searchable(),
    /** Which size scale this design uses: ALPHA, NUMERIC or ONE_SIZE. */
    size_system: model.enum(["ALPHA", "NUMERIC", "ONE_SIZE"]).default("ALPHA"),
    /** Season code, e.g. SS26. Used to drive collection pages and reporting. */
    season: model.text().nullable(),
  })
  .indexes([{ on: ["code"], unique: true }]);
