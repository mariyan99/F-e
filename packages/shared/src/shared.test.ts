import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSku, isValidSku, parseSku, styleGroupCode } from "./sku.js";
import { searchKeys, slugify, transliterate, uniqueSlug } from "./slug.js";
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
