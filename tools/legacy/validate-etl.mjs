#!/usr/bin/env node
/**
 * Dry-run ETL validator.
 *
 * Reads the local `catalog_data.sql` produced by Export-LegacyPackage.ps1 and
 * reports what the migration WOULD do. It writes nothing to Medusa, opens no
 * network connection and creates no records. Its whole purpose is to find the
 * problems before they are half-loaded into a database.
 *
 * Output safety: the report contains counts and numeric legacy IDs only. No
 * product title, description, colour name or file name is ever printed. That is
 * enforced mechanically at the end of the run, not by discipline: the report is
 * scanned for Cyrillic before it is emitted, and the run fails if any is found.
 *
 *   node tools/legacy/validate-etl.mjs <path-to-catalog_data.sql> [--out report.txt]
 *
 * Requires the shared package to be built, because the point of a dry run is to
 * exercise the real slug and SKU functions rather than a copy of them:
 *
 *   pnpm --filter @fabrizia/shared build
 */

import { readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sharedEntry = resolve(here, "../../packages/shared/dist/index.js");

let shared;
try {
  shared = await import(pathToFileURL(sharedEntry).href);
} catch {
  console.error(
    "Could not load @fabrizia/shared from packages/shared/dist.\n" +
      "Build it first so this validator exercises the real slug and SKU code:\n" +
      "  pnpm --filter @fabrizia/shared build",
  );
  process.exit(2);
}
const { slugify, buildSku, COLOUR_CODES, computeSellable, STOCK_SAFETY_BUFFER } = shared;

// ------------------------------------------------------------------ arguments

const args = process.argv.slice(2);
const dumpPath = args.find((a) => !a.startsWith("--"));
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;

if (!dumpPath) {
  console.error("usage: node tools/legacy/validate-etl.mjs <catalog_data.sql> [--out report.txt]");
  process.exit(2);
}

// -------------------------------------------------------------------- parsing

/**
 * Column order for a mysqldump written without an explicit column list. Taken
 * from docs/legacy-analysis/schema.sql. If the dump does name its columns, the
 * names win — this map is only the fallback.
 */
const COLUMNS = {
  products: ["id", "sku", "title", "description", "price", "discount_price", "status", "weight", "model_description", "code", "xxl"],
  product_quantities: ["id", "product_id", "color", "size", "quantity", "price", "discount_price"],
  product_photos: ["id", "product_id", "photo_name", "main_photo", "order", "color", "title"],
  categories: ["id", "name", "safe_name", "parent", "type", "order", "photo", "hidden"],
  product_cat_rel: ["id", "product_id", "cat_id"],
  attr_values: ["id", "attr_id", "value", "text", "image", "order", "visible"],
};

const WANTED = new Set(Object.keys(COLUMNS));

/**
 * Split one MySQL VALUES body into tuples of raw field values.
 *
 * Written as a character scanner rather than a regex on purpose: a product
 * description containing "),(" would tear a regex-split row in half, and the
 * failure would look like corrupt data rather than a parser bug.
 */
function parseTuples(body) {
  const rows = [];
  let field = "";
  let row = [];
  let inString = false;
  let depth = 0;
  let isNull = true; // a bare NULL, as opposed to an empty quoted string

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];

    if (inString) {
      if (ch === "\\") {
        const next = body[i + 1];
        field += next === "n" ? "\n" : next === "t" ? "\t" : next ?? "";
        i++;
      } else if (ch === "'") {
        if (body[i + 1] === "'") { field += "'"; i++; }
        else inString = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === "'") { inString = true; isNull = false; continue; }
    if (ch === "(" && depth === 0) { depth = 1; row = []; field = ""; isNull = true; continue; }
    if (depth === 0) continue;

    if (ch === ",") { row.push(isNull && field.trim().toUpperCase() === "NULL" ? null : field.trim()); field = ""; isNull = true; continue; }
    if (ch === ")") {
      row.push(isNull && field.trim().toUpperCase() === "NULL" ? null : field.trim());
      rows.push(row);
      depth = 0; field = ""; isNull = true;
      continue;
    }
    field += ch;
  }
  return rows;
}

const tables = Object.fromEntries(Object.keys(COLUMNS).map((t) => [t, []]));
let statementsSeen = 0;
let tablesSkipped = new Set();

{
  const rl = createInterface({ input: createReadStream(dumpPath, { encoding: "utf8" }), crlfDelay: Infinity });
  let inInsert = false;
  let table = null;
  let cols = null;
  let buffer = "";

  for await (const line of rl) {
    if (!inInsert) {
      const m = /^\s*INSERT\s+INTO\s+[`"[]?([A-Za-z0-9_$]+)[`"\]]?\s*(\(([^)]*)\))?\s*VALUES/i.exec(line);
      if (!m) continue;
      table = m[1];
      cols = m[3] ? m[3].split(",").map((c) => c.trim().replace(/[`"\[\]]/g, "")) : COLUMNS[table] ?? null;
      inInsert = true;
      statementsSeen++;
      if (!WANTED.has(table)) tablesSkipped.add(table);
      buffer = line.slice(m[0].length);
    } else {
      buffer += "\n" + line;
    }

    if (/;\s*$/.test(line)) {
      if (WANTED.has(table) && cols) {
        for (const row of parseTuples(buffer)) {
          if (row.length !== cols.length) continue;
          const obj = {};
          cols.forEach((c, i) => { obj[c] = row[i]; });
          tables[table].push(obj);
        }
      }
      inInsert = false; buffer = ""; table = null; cols = null;
    }
  }
}

// --------------------------------------------------------------------- report

const out = [];
const say = (s = "") => out.push(s);
const num = (n) => String(n).padStart(7);

say("Fabrizia ETL dry run");
say("====================");
say("");
say("Nothing was written. This report projects what the migration would produce.");
say(`Source statements parsed: ${statementsSeen}`);
if (tablesSkipped.size) say(`Tables present but not needed: ${[...tablesSkipped].sort().join(", ")}`);
say("");

const products = tables.products;
const quantities = tables.product_quantities;
const photos = tables.product_photos;
const categories = tables.categories;
const catRel = tables.product_cat_rel;
const attrValues = tables.attr_values;

const int = (v) => { const n = Number.parseInt(v ?? "", 10); return Number.isFinite(n) ? n : null; };

// --- dictionaries: attr_id 3 = colour, attr_id 2 = size (proven in Q6) -------
const COLOUR_ATTR = 3;
const SIZE_ATTR = 2;
const colourValues = new Set(attrValues.filter((a) => int(a.attr_id) === COLOUR_ATTR).map((a) => int(a.value)));
const sizeByValue = new Map(attrValues.filter((a) => int(a.attr_id) === SIZE_ATTR).map((a) => [int(a.value), a.text]));

say("1. Source volume");
say(`   products            ${num(products.length)}`);
say(`   product_quantities  ${num(quantities.length)}`);
say(`   product_photos      ${num(photos.length)}`);
say(`   categories          ${num(categories.length)}`);
say(`   product_cat_rel     ${num(catRel.length)}`);
say(`   attr_values         ${num(attrValues.length)}  (colours ${colourValues.size}, sizes ${sizeByValue.size})`);
say("");

// --- sellable rule -----------------------------------------------------------
const qtyByProduct = new Map();
for (const q of quantities) {
  const pid = int(q.product_id);
  if (pid === null) continue;
  if (!qtyByProduct.has(pid)) qtyByProduct.set(pid, []);
  qtyByProduct.get(pid).push(q);
}

const active = products.filter((p) => int(p.status) === 1);
const sellable = active.filter((p) => (qtyByProduct.get(int(p.id)) ?? []).some((q) => (int(q.quantity) ?? 0) > 0));

say("2. Sellable rule: products.status = 1 AND some product_quantities.quantity > 0");
say(`   status = 1                    ${num(active.length)}`);
say(`   of those, with stock          ${num(sellable.length)}`);
say(`   not sellable                  ${num(products.length - sellable.length)}`);
say("");

// --- the split ---------------------------------------------------------------
const coloursOf = (p) => {
  const set = new Set();
  for (const q of qtyByProduct.get(int(p.id)) ?? []) {
    const c = int(q.color);
    if (c !== null) set.add(c);
  }
  return set;
};

let projected = 0;
const histogram = new Map();
for (const p of sellable) {
  const n = coloursOf(p).size;
  projected += n;
  histogram.set(n, (histogram.get(n) ?? 0) + 1);
}

say("3. Split projection (one legacy product = one StyleGroup, one colour = one product)");
say(`   StyleGroups (sellable legacy products) ${num(sellable.length)}`);
say(`   Medusa products after the split        ${num(projected)}`);
say("   colours per design:");
for (const n of [...histogram.keys()].sort((a, b) => a - b)) {
  say(`     ${String(n).padStart(3)} colour(s)  ->  ${num(histogram.get(n))} design(s)`);
}
if (projected === sellable.length) say("   WARNING: projection equals the source count - the split did not happen");
say("");

// --- platform variant ceiling ------------------------------------------------
// ADR-002 moves the first release to Shopify, whose native model is one product
// with option combinations as variants - which is exactly the legacy model, so
// no split is needed there. The one thing that can break that 1:1 mapping is a
// per-product variant cap: colours x sizes on a single legacy design. Confirm
// the real cap for the chosen plan; this reports the distribution either way.
const VARIANT_CAP = Number.parseInt(process.env.VARIANT_CAP ?? "100", 10);
let worstVariants = 0;
const overCap = [];
for (const p of sellable) {
  const rows = qtyByProduct.get(int(p.id)) ?? [];
  const colours = new Set(rows.map((q) => int(q.color)));
  const sizes = new Set(rows.map((q) => int(q.size)));
  const combos = colours.size * sizes.size;
  worstVariants = Math.max(worstVariants, combos);
  if (combos > VARIANT_CAP) overCap.push({ id: int(p.id), combos, c: colours.size, s: sizes.size });
}
say(`4. Variant ceiling (colours x sizes on one design), cap ${VARIANT_CAP}`);
say(`   worst case on one design        ${num(worstVariants)}`);
say(`   designs over the cap            ${num(overCap.length)}`);
for (const o of overCap.slice(0, 10)) {
  say(`     legacy id ${o.id}: ${o.c} colours x ${o.s} sizes = ${o.combos}`);
}
if (overCap.length) {
  say("   These designs cannot be one product under that cap and must be split by");
  say("   colour after all - the one case where the legacy model does not map 1:1.");
}
say("");

// --- variants and stock ------------------------------------------------------
let variants = 0, zeroStock = 0, stockUnits = 0, sellableUnits = 0;
for (const p of sellable) {
  for (const q of qtyByProduct.get(int(p.id)) ?? []) {
    variants++;
    const qty = int(q.quantity) ?? 0;
    if (qty === 0) zeroStock++;
    stockUnits += qty;
    sellableUnits += computeSellable(qty);
  }
}
say("5. Variants and stock");
say(`   variants (rows under sellable products) ${num(variants)}`);
say(`   of those out of stock                   ${num(zeroStock)}`);
say(`   units on hand                           ${num(stockUnits)}`);
say(`   units offered after buffer ${String(STOCK_SAFETY_BUFFER).padStart(2)}           ${num(sellableUnits)}`);
say(`   units withheld by the buffer            ${num(stockUnits - sellableUnits)}`);
say("");

// --- SKU ---------------------------------------------------------------------
// The colour code map does not exist yet: shared defines 12 codes and the legacy
// catalogue carries hundreds of colour values. So this section deliberately does
// NOT invent codes. It answers the two questions that can be answered without
// them: does the legacy model number survive our own SKU rule, and is
// (model, colour, size) unique enough to generate SKUs from at all.
const colourCodes = Object.keys(COLOUR_CODES);
const skuModelRejected = [];
const legacyColours = new Set();
const sizeValuesMissing = new Set();
const sizeLabelsRejected = new Set();
const tripleSeen = new Map();
let triples = 0;
const tripleCollisions = [];

const normaliseSize = (text) => slugify(String(text)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

for (const p of sellable) {
  const model = (p.sku ?? "").trim();
  const legacyId = int(p.id);

  // A placeholder colour is fine here: buildSku validates model and size
  // independently of which colour code is passed.
  try { buildSku({ model, colour: colourCodes[0], size: "S" }); }
  catch { skuModelRejected.push({ id: legacyId, len: model.length }); }

  for (const q of qtyByProduct.get(legacyId) ?? []) {
    const colour = int(q.color);
    if (colour !== null) legacyColours.add(colour);

    const sizeValue = int(q.size);
    const sizeText = sizeByValue.get(sizeValue);
    if (sizeText === undefined) { sizeValuesMissing.add(sizeValue); continue; }
    const size = normaliseSize(sizeText);
    if (!size) { sizeLabelsRejected.add(sizeValue); continue; }

    const key = `${model}|${colour}|${size}`;
    triples++;
    if (tripleSeen.has(key)) tripleCollisions.push(tripleSeen.get(key));
    else tripleSeen.set(key, legacyId);
  }
}

say("6. SKU scheme FB-{model}-{colour}-{size}");
say(`   models accepted by buildSku()   ${num(sellable.length - skuModelRejected.length)}`);
say(`   models REJECTED                 ${num(skuModelRejected.length)}`);
if (skuModelRejected.length) {
  const lens = new Map();
  for (const r of skuModelRejected) lens.set(r.len, (lens.get(r.len) ?? 0) + 1);
  say(`     by length: ${[...lens.entries()].sort().map(([l, c]) => `${l} chars x${c}`).join(", ")}`);
  say(`     legacy ids: ${skuModelRejected.slice(0, 20).map((r) => r.id).join(", ")}${skuModelRejected.length > 20 ? " ..." : ""}`);
  say("     buildSku() demands exactly 4 digits. Widen the rule or renumber - decide before loading.");
}
say(`   (model, colour, size) triples   ${num(triples)}`);
say(`   duplicate triples               ${num(tripleCollisions.length)}`);
if (tripleCollisions.length) say(`     legacy ids: ${[...new Set(tripleCollisions)].slice(0, 20).join(", ")}`);
say(`   size values with no dictionary entry ${num(sizeValuesMissing.size)}`);
say(`   size labels that do not fit a SKU    ${num(sizeLabelsRejected.size)}`);
say(`   distinct legacy colours to map  ${num(legacyColours.size)}`);
say(`   colour codes defined in shared  ${num(colourCodes.length)}`);
if (legacyColours.size > colourCodes.length) {
  say("   BLOCKER: the legacy colour -> colour code table does not exist. No SKU can be");
  say("   generated until it does, and it is a naming decision, not a derivation.");
}
say("");

// --- handles -----------------------------------------------------------------
const handleSeen = new Map();
let handleCollisions = 0, emptyHandles = 0;
for (const p of sellable) {
  const base = slugify(p.title ?? "");
  if (!base) { emptyHandles++; continue; }
  for (const colour of coloursOf(p)) {
    const handle = `${base}-c${colour}`;
    if (handleSeen.has(handle)) handleCollisions++; else handleSeen.set(handle, int(p.id));
  }
}
say("7. Handles (transliterated title + colour)");
say(`   distinct handles      ${num(handleSeen.size)}`);
say(`   collisions            ${num(handleCollisions)}`);
say(`   products with no title${num(emptyHandles)}`);
say("");

// --- prices ------------------------------------------------------------------
const BGN_PER_EUR = 1.95583;
const parsePrice = (raw) => {
  if (raw === null || raw === undefined) return null;
  const cleaned = String(raw).replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
};

let priceOk = 0, priceBad = 0, priceZero = 0, roundEffect = 0;
let minEur = Infinity, maxEur = 0;
const badPriceIds = [];
for (const p of sellable) {
  const bgn = parsePrice(p.price);
  if (bgn === null) { if (String(p.price ?? "").trim() === "0") priceZero++; else priceBad++; badPriceIds.push(int(p.id)); continue; }
  priceOk++;
  const eur = bgn / BGN_PER_EUR;
  minEur = Math.min(minEur, eur); maxEur = Math.max(maxEur, eur);
  const cents = Math.round(eur * 100) % 100;
  if (cents !== 0 && cents !== 50 && cents !== 90 && cents !== 99) roundEffect++;
}
say("8. Prices (BGN -> EUR at 1.95583)");
say(`   parseable      ${num(priceOk)}`);
say(`   zero           ${num(priceZero)}`);
say(`   unparseable    ${num(priceBad)}`);
if (badPriceIds.length) say(`     legacy ids: ${badPriceIds.slice(0, 20).join(", ")}${badPriceIds.length > 20 ? " ..." : ""}`);
if (priceOk) {
  say(`   EUR range      ${minEur.toFixed(2)} - ${maxEur.toFixed(2)}`);
  say(`   prices landing on an unlovely cent value ${num(roundEffect)} of ${priceOk}`);
  say("   BLOCKED: rounding policy and VAT are not decided. Prices must not be loaded.");
}
say("");

// --- images ------------------------------------------------------------------
const photosByProduct = new Map();
let unassignedPhotos = 0;
for (const ph of photos) {
  const pid = int(ph.product_id);
  if (pid === null) continue;
  if (int(ph.color) === 0) unassignedPhotos++;
  if (!photosByProduct.has(pid)) photosByProduct.set(pid, []);
  photosByProduct.get(pid).push(ph);
}

let splitWithoutImage = 0, splitWithMain = 0, designsWithNoPhotoRow = 0;
const noImageIds = new Set();
for (const p of sellable) {
  const pid = int(p.id);
  const set = photosByProduct.get(pid) ?? [];
  if (set.length === 0) { designsWithNoPhotoRow++; noImageIds.add(pid); }
  for (const colour of coloursOf(p)) {
    const exact = set.filter((ph) => int(ph.color) === colour);
    const usable = exact.length ? exact : set.filter((ph) => int(ph.color) === 0);
    if (usable.length === 0) { splitWithoutImage++; noImageIds.add(pid); }
    else if (usable.some((ph) => int(ph.main_photo) === 1)) splitWithMain++;
  }
}
say("9. Images");
const sellableIds = new Set(sellable.map((p) => int(p.id)));
say(`   sellable designs that have photo rows ${num([...photosByProduct.keys()].filter((k) => sellableIds.has(k)).length)}`);
say(`   photos with color = 0 (shared)        ${num(unassignedPhotos)}`);
say(`   designs with no photo row at all      ${num(designsWithNoPhotoRow)}`);
say(`   split products that would have NO image ${num(splitWithoutImage)}`);
say(`   split products with a main photo      ${num(splitWithMain)}`);
if (noImageIds.size) say(`     legacy ids: ${[...noImageIds].slice(0, 20).join(", ")}${noImageIds.size > 20 ? " ..." : ""}`);
say("");

// --- categories --------------------------------------------------------------
const catById = new Map(categories.map((c) => [int(c.id), c]));
let orphanParents = 0, hidden = 0, maxDepth = 0;
const byType = new Map();
for (const c of categories) {
  const parent = int(c.parent);
  if (parent && !catById.has(parent)) orphanParents++;
  if (int(c.hidden) === 1) hidden++;
  byType.set(int(c.type), (byType.get(int(c.type)) ?? 0) + 1);
  let depth = 0, cur = c;
  while (cur && int(cur.parent) && catById.has(int(cur.parent)) && depth < 20) { cur = catById.get(int(cur.parent)); depth++; }
  maxDepth = Math.max(maxDepth, depth);
}

const productsPerType = new Map();
const catOfProduct = new Map();
for (const r of catRel) {
  const pid = int(r.product_id);
  if (!catOfProduct.has(pid)) catOfProduct.set(pid, []);
  catOfProduct.get(pid).push(int(r.cat_id));
}
for (const p of sellable) {
  for (const cid of catOfProduct.get(int(p.id)) ?? []) {
    const t = int(catById.get(cid)?.type);
    productsPerType.set(t, (productsPerType.get(t) ?? 0) + 1);
  }
}

say("10. Categories");
say(`   categories        ${num(categories.length)}`);
say(`   hidden = 1        ${num(hidden)}`);
say(`   orphan parents    ${num(orphanParents)}`);
say(`   max tree depth    ${num(maxDepth)}`);
say("   type distribution, and sellable products attached to each:");
for (const t of [...byType.keys()].sort()) {
  say(`     type ${String(t).padStart(2)}  ${num(byType.get(t))} categories  ${num(productsPerType.get(t) ?? 0)} product links`);
}
say("   (a type with categories but no product links is navigation, not a category)");
say("");

// --- gates -------------------------------------------------------------------
const gate = (id, ok, text) => say(`   ${ok ? "PASS" : "FAIL"}  ${id}  ${text}`);
say("11. Validation gates");
gate("V1", projected > sellable.length, `split produced ${projected} products from ${sellable.length} designs`);
gate("V3", splitWithoutImage === 0, `${splitWithoutImage} split products would have no image`);
gate("V4", priceBad === 0 && priceZero === 0, `${priceBad + priceZero} products have an unusable price`);
gate("V6", handleCollisions === 0, `${handleCollisions} handle collisions`);
gate("--", skuModelRejected.length === 0, `${skuModelRejected.length} legacy sku values the SKU scheme rejects`);
gate("--", tripleCollisions.length === 0, `${tripleCollisions.length} duplicate (model, colour, size) triples`);
gate("--", legacyColours.size <= colourCodes.length, `${legacyColours.size} legacy colours vs ${colourCodes.length} colour codes`);
gate("--", overCap.length === 0, `${overCap.length} designs exceed the ${VARIANT_CAP}-variant cap`);
say("");
say("V2, V5, V7 and V8 need a loaded database and are not checkable in a dry run.");

// --------------------------------------------------- output safety, then emit
const report = out.join("\n") + "\n";
const cyrillic = report.match(/[Ѐ-ӿ]/g);
if (cyrillic) {
  console.error(
    `REFUSING TO EMIT: the report contains ${cyrillic.length} Cyrillic character(s), which means ` +
      "product or colour text leaked into it. This is a bug in the validator, not in the data.",
  );
  process.exit(3);
}

if (outPath) {
  await writeFile(outPath, report, "utf8");
  console.log(`report written to ${outPath}`);
} else {
  process.stdout.write(report);
}
