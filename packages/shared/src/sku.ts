/**
 * SKU scheme: FB-{model}-{colour}-{size}, e.g. FB-2601-BLK-S.
 *
 * Decision 6 in ADR-001. Readable by a human, works on a warehouse shelf label
 * and in the accountant's import file. Immutable once the variant has been
 * ordered — changing it breaks the link between an order line and the item.
 */

export const SKU_PREFIX = "FB";

/** Three-letter colour codes. Extend deliberately: a code is permanent once used. */
export const COLOUR_CODES = {
  BLK: "Черно",
  WHT: "Бяло",
  CRM: "Кремаво",
  BEG: "Бежово",
  GRY: "Сиво",
  NVY: "Тъмносиньо",
  BLU: "Синьо",
  GRN: "Зелено",
  RED: "Червено",
  PNK: "Розово",
  BRN: "Кафяво",
  MLT: "Многоцветно",
} as const;

export type ColourCode = keyof typeof COLOUR_CODES;

export interface SkuParts {
  /** Style number, digits only, 4 characters. Shared by every colour of one design. */
  model: string;
  colour: ColourCode;
  /** Size label as shown to the customer: S, M, 38, ONE. */
  size: string;
}

const SKU_PATTERN = /^FB-(\d{4})-([A-Z]{3})-([A-Z0-9]{1,4})$/;

export function buildSku({ model, colour, size }: SkuParts): string {
  if (!/^\d{4}$/.test(model)) {
    throw new Error(`Model must be exactly 4 digits, received "${model}"`);
  }
  if (!(colour in COLOUR_CODES)) {
    throw new Error(`Unknown colour code "${colour}"`);
  }
  const normalisedSize = size.trim().toUpperCase();
  if (!/^[A-Z0-9]{1,4}$/.test(normalisedSize)) {
    throw new Error(`Size must be 1–4 alphanumeric characters, received "${size}"`);
  }
  return `${SKU_PREFIX}-${model}-${colour}-${normalisedSize}`;
}

export function parseSku(sku: string): SkuParts | null {
  const match = SKU_PATTERN.exec(sku.trim().toUpperCase());
  if (!match) return null;
  const [, model, colour, size] = match;
  if (model === undefined || colour === undefined || size === undefined) return null;
  if (!(colour in COLOUR_CODES)) return null;
  return { model, colour: colour as ColourCode, size };
}

export function isValidSku(sku: string): boolean {
  return parseSku(sku) !== null;
}

/** The style-group code shared by every colour of one design: FB-2601. */
export function styleGroupCode(model: string): string {
  if (!/^\d{4}$/.test(model)) {
    throw new Error(`Model must be exactly 4 digits, received "${model}"`);
  }
  return `${SKU_PREFIX}-${model}`;
}
