/**
 * Bulgarian Cyrillic → Latin transliteration and slug generation.
 *
 * Uses the Streamlined System (Обтекаема система) — the transliteration
 * standard fixed by the Bulgarian Transliteration Act, so slugs match what
 * customers already see on ID documents, street signs and every other
 * Bulgarian site. Task CAT-12.
 */

const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya",
};

/** Transliterate Bulgarian Cyrillic to Latin. Non-Cyrillic characters pass through. */
export function transliterate(input: string): string {
  let out = "";
  for (const char of input) {
    const lower = char.toLowerCase();
    const mapped = CYRILLIC_TO_LATIN[lower];
    if (mapped === undefined) {
      out += char;
      continue;
    }
    // Preserve capitalisation: "Ж" → "Zh", not "ZH".
    out += char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }
  return out;
}

/**
 * Build a URL slug from arbitrary text.
 *
 * Slugs are immutable in practice: changing one must create a 301 from the old
 * value (task SEO-02), so treat a returned slug as permanent once published.
 */
export function slugify(input: string): string {
  return transliterate(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

/**
 * Values to index for a searchable string so that a query typed on either
 * keyboard layout matches. "рокля" and "rokla" must return the same results
 * (acceptance criterion, EP-01).
 */
export function searchKeys(input: string): string[] {
  const latin = transliterate(input).toLowerCase();
  const original = input.toLowerCase();
  return original === latin ? [original] : [original, latin];
}

/** Append a numeric suffix until the slug is unique within `taken`. */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  const slug = slugify(base);
  if (!taken.has(slug)) return slug;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${slug}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Could not derive a unique slug from "${base}"`);
}
