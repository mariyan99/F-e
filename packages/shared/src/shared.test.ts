import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSku, isValidSku, parseSku, styleGroupCode } from "./sku.js";
import { searchKeys, slugify, transliterate, uniqueSlug } from "./slug.js";
import {
  amountToFreeShippingEur,
  computeSellable,
  shippingCostEur,
  STOCK_SAFETY_BUFFER,
} from "./commerce.js";
import { computeAvailable } from "./types.js";

test("transliterates Bulgarian Cyrillic using the Streamlined System", () => {
  assert.equal(transliterate("рокля"), "roklya");
  assert.equal(transliterate("Щастие"), "Shtastie");
  assert.equal(transliterate("Жълт"), "Zhalt");
  assert.equal(transliterate("Fabrizia"), "Fabrizia");
});

test("slugify produces URL-safe Latin slugs", () => {
  assert.equal(slugify("Рокля Elena — черна"), "roklya-elena-cherna");
  assert.equal(slugify("  Нови   постъпления  "), "novi-postapleniya");
});

test("searchKeys lets a Latin query match Cyrillic content", () => {
  assert.deepEqual(searchKeys("Рокля"), ["рокля", "roklya"]);
  assert.deepEqual(searchKeys("Elena"), ["elena"]);
});

test("uniqueSlug suffixes collisions", () => {
  const taken = new Set(["roklya-elena", "roklya-elena-2"]);
  assert.equal(uniqueSlug("Рокля Elena", taken), "roklya-elena-3");
});

test("buildSku and parseSku round-trip", () => {
  const sku = buildSku({ model: "2601", colour: "BLK", size: "s" });
  assert.equal(sku, "FB-2601-BLK-S");
  assert.deepEqual(parseSku(sku), { model: "2601", colour: "BLK", size: "S" });
});

test("buildSku rejects malformed input", () => {
  assert.throws(() => buildSku({ model: "26", colour: "BLK", size: "S" }));
  assert.throws(() => buildSku({ model: "2601", colour: "XXX" as never, size: "S" }));
  assert.throws(() => buildSku({ model: "2601", colour: "BLK", size: "TOOLONG" }));
});

test("isValidSku rejects unknown colour codes", () => {
  assert.equal(isValidSku("FB-2601-BLK-S"), true);
  assert.equal(isValidSku("FB-2601-ZZZ-S"), false);
  assert.equal(isValidSku("2601-BLK-S"), false);
});

test("styleGroupCode drops the colour and size", () => {
  assert.equal(styleGroupCode("2601"), "FB-2601");
});

test("available stock never goes negative", () => {
  assert.equal(computeAvailable(5, 2), 3);
  assert.equal(computeAvailable(2, 5), 0);
});

test("the safety buffer keeps the last units off the storefront", () => {
  // Wholesale movements are written up by hand, so the recorded quantity runs
  // ahead of the shelf. The buffer absorbs that drift.
  assert.equal(computeSellable(5), 3);
  assert.equal(computeSellable(2), 0);
  assert.equal(computeSellable(0), 0);
  assert.equal(STOCK_SAFETY_BUFFER, 2);
});

test("the safety buffer is overridable per variant and never negative", () => {
  assert.equal(computeSellable(10, 0), 10);
  assert.equal(computeSellable(10, 4), 6);
  assert.equal(computeSellable(3, 99), 0);
  assert.equal(computeSellable(3, -5), 3);
});

test("shipping is free at the threshold, not merely above it", () => {
  assert.equal(shippingCostEur(88.99, 4.9), 4.9);
  assert.equal(shippingCostEur(89, 4.9), 0);
  assert.equal(shippingCostEur(120, 4.9), 0);
});

test("the free-shipping nudge reaches zero and stops there", () => {
  assert.equal(amountToFreeShippingEur(70), 19);
  assert.equal(amountToFreeShippingEur(89), 0);
  assert.equal(amountToFreeShippingEur(200), 0);
});
