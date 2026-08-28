# Codex ETL Review - 2026-08-28

Source:

- Local legacy site: `C:\Users\mariyan\OneDrive\Desktop\fabrizia\fabriziafashion-main`
- SQL dump read locally only: `db\db\fabrizia_fashion.sql`
- Safe export regenerated with `tools/legacy/Export-LegacyPackage.ps1` from commit `78dc1a8`
- Local regenerated package: `C:\Users\mariyan\Documents\Codex\2026-08-27\claude-gork-codex-multi-file-refactors\work\legacy-package-78dc1a8`

No customer rows, order rows, admin rows, addresses, secrets, tokens or full SQL dump are committed here.

## Export Re-Run

- SQL dump scanned: `890305` lines.
- `table_counts.txt` now counts rows rather than INSERT statements.
- Deny list held all ten personal tables: `address`, `admin_users`, `cart`, `cart_items`, `favourite_products`, `last_viewed_products`, `messages`, `order_items`, `orders`, `users`.
- `catalog_data.sql` now contains real row tuples and is `6752853` bytes locally.
- `catalog_data.sql` was not committed.
- Final sweep passed: no secret or PII pattern in output.
- `general_pages` and `settings` were dropped by the PII scan; `general_pages` was purged after partial export.

## Q1 - Products Carry More Than One Colour

- `product_quantities` rows: `15678`.
- Distinct `product_id` in `product_quantities`: `3101`.
- Products with more than one distinct `product_quantities.color`: `2090`.
- Maximum distinct colours on one legacy product: `24`.
- Sellable products by current rule (`products.status = 1` and stock > 0): `47`.

Conclusion: legacy `products.id` is usually a design that carries colours inside it. The ETL should split one legacy product into one new product per colour.

## Q2 - `linked_colors` Group Overlap

- Rows in `linked_colors`: `14`.
- Sum of all IDs across the 14 groups: `640`.
- Distinct IDs across all groups: `376`.
- Extra memberships caused by overlap: `264`.
- Products/IDs appearing in more than one group: `247`.

Conclusion: this overlap is not compatible with `linked_colors` as the primary StyleGroup map. It behaves like linked colour filter expansion.

## Q3 - What `linked_colors.linked_colors` Points To

- Distinct linked IDs that exist in `products.id`: `373`.
- Distinct linked IDs that do not exist in `products.id`: `3`.
- Distinct linked IDs that exist in `attr_values.id`: `376`.
- Distinct linked IDs that exist in `attr_values.value`: `376`.
- `linked_colors.name`: `14` empty, `0` non-empty.

Additional code evidence: the old PHP uses `linked_colors` in colour-filter code. It does `FIND_IN_SET($col, linked_colors)` where `$col` is a selected colour value, then expands the selected colour to the whole linked colour list. The admin screen is also named "linked colours" and renders IDs through the colour dictionary.

Conclusion: despite partial overlap with product IDs, the code path proves these are colour IDs/values, not product IDs for model grouping.

## Q4 - `linked_colors` Group Consistency

Largest three groups:

| Group row | Members | Distinct product codes among matching products | Same code? | Missing product IDs |
|---:|---:|---:|---|---:|
| 14 | 104 | 103 | no | 1 |
| 4 | 70 | 70 | no | 0 |
| 19 | 63 | 63 | no | 0 |

Conclusion: groups do not share a model code and should not define StyleGroup.

## Q5 - Sellable Product Coverage

- Sellable products not present in any `linked_colors` group: `46`.
- Sellable products present in a `linked_colors` group: `1`.

Conclusion: `linked_colors` coverage is useless for current sellable product grouping.

## Q6 - Attribute Value Matching

`product_quantities.color`:

- Distinct values: `354`.
- Match `attr_values.id`: `353`.
- Match `attr_values.value`: `354`.
- Zero values: `0`.

`product_quantities.size`:

- Distinct values: `43`.
- Match `attr_values.id`: `43`.
- Match `attr_values.value`: `43`.
- Zero values: `0`.

`product_photos.color`:

- Distinct values: `215`.
- Match `attr_values.id`: `213`.
- Match `attr_values.value`: `214`.
- Zero rows: `11`.

Code evidence: `Colors::getColorById($id)` queries `attr_values` with `attr_id = 3` and `value = $id`; `Sizes::getSizeById($id)` does the same for `attr_id = 2`. Order, filters, carts and emails use `fetchPairs('value', 'text')`.

Conclusion: map colours and sizes through `attr_values.value`, not `attr_values.id`. For `product_photos.color = 0`, treat it as unassigned/shared fallback and attach only if no exact colour image exists for the split product.

## Q7 - `categories.type`

| `categories.type` | Count |
|---:|---:|
| 1 | 4 |
| 2 | 20 |
| 3 | 28 |

This needs a code-level interpretation before mapping all types equally. It is not PII, but the safe answer from counts alone is only the distribution.

## Q8 - `products.weight`

For sellable products with stock and parseable weight:

- Count: `47`.
- Minimum: `0.08`.
- Maximum: `1.5`.
- Average: `0.382`.

Conclusion: weights are kilograms. Econt payloads should convert to the exact unit expected by its API, but the legacy source value is kg-scale, not grams.

## Q9 - `products.code` and `products.sku`

`products.code`:

- Non-empty: `3106`.
- Unique values: `3106`.
- Duplicate values: `0`.
- Numeric-only: `0`.
- Length range observed: `8` to `22`.
- Format is not clean numeric; it appears to contain separators or non-digit characters.

`products.sku`:

- Non-empty: `3106`.
- Unique values: `3106`.
- Duplicate values: `0`.
- Numeric-only: `3106`.
- Lengths: mostly `5`, with a small count of `4`.

Conclusion: use `products.sku` as the stable `{model}` candidate for `FB-{model}-{colour}-{size}`. Keep `products.code` in metadata/search/display if useful, but do not assume it is a clean model number.

## ETL Review Decision

I agree with Claude's proposed split model:

- One legacy `products.id` should become a StyleGroup/design.
- Each distinct legacy colour under that product should become a separate Medusa product.
- Sizes remain variants under that colour product.
- `linked_colors` should not define StyleGroup. It can be used later for colour-filter expansion/synonyms if the new PLP needs that behavior.

Recommended next safe task: update `docs/plan/15-etl-mapping.md` to treat the split model as confirmed, then implement a dry-run ETL validator that emits only counts and mapping IDs, not writes to Medusa yet.
