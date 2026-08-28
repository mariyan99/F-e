# Codex Legacy Analysis - 2026-08-28

Source: clean local package generated from commit `09ad332`.

Safety note: this document contains only derived schema, aggregates, URL patterns and ID-only samples. It does not include the full SQL dump, `catalog_data.sql`, customer/order/account rows, secrets, or raw product descriptions.

## Task A - Safe Artefacts Added

Added to `docs/legacy-analysis/`:

- `schema.sql`
- `table_counts.txt`
- `colors_used.txt`
- `fonts_used.txt`
- `aspect_ratios.txt`
- `code-summaries-index.txt`
- `EXPORT-REPORT.txt`
- `sitemap.xml`

Pre-commit safety scan:

- File size check: passed, no file over 2 MB.
- PII/secret regex scan: passed.

Intentionally not committed:

- `catalog_data.sql`
- anything under `code/`
- full `code-summaries/*.summary.txt`
- `images/samples/`
- `images_inventory.tsv`

## Task B - Key Tables

The requested `CREATE TABLE` definitions are in `docs/legacy-analysis/schema.sql`.

Relevant schema findings:

- `linked_colors`: `id int(6)`, `name varchar(32)`, `linked_colors varchar(500)`.
- `products`: no slug/url/handle column. Product URLs appear to be generated from `/product/{id}/{title}`.
- `product_quantities`: variant-level `product_id`, `color`, `size`, `quantity`, `price`, `discount_price`.
- `product_photos`: variant-aware media via `product_id` and `color`.
- `product_cat_rel`: many-to-many product/category join.
- `sizes_template` and `sizes_template_product`: size-chart/template metadata.
- `translations`: `type`, `relation_id`, `lang`, `text`.

### linked_colors

`linked_colors` looks useful for the new StyleGroup model.

- Row count from local SQL: `14`
- Distinct product IDs appearing inside linked color groups: `376`
- Sample rows are ID-only in the linking column; `name` was empty in the first three sampled rows.

Safe ID-only samples:

| row id | name empty | first 10 linked product IDs | total IDs in row |
|---:|---|---|---:|
| 4 | yes | `231,174,194,61,24,392,296,351,408,80` | 70 |
| 9 | yes | `224,288,212,213,166,22,63,317,413,123` | 56 |
| 10 | yes | `184,31,363,224,279,197,37,237,239,374` | 52 |

Interpretation: do not infer style grouping from product titles first. Start from `linked_colors`; only fall back to title/SKU heuristics for products not covered by these groups.

### Product URL/Slug

`products` has no slug/url/handle column. It has `id`, `sku`, `title`, and `code`.

Implication: the final 301 map cannot rely on a stored slug column from the product table. Generate candidate redirects from:

- old sitemap URLs where present
- product `id`
- product title only as a fallback for reconstructed old paths
- Search Console export for the complete production URL list

### Translations

Local aggregate:

- Translation rows: `47`
- Languages found: `bg`

Interpretation: `translations` is structurally multi-language because it has `lang`, but the current dump only shows Bulgarian content. First launch can be Bulgarian-only from legacy content unless owner requests another language.

## Task C - Brand Colours

Top 20 by frequency from `colors_used.txt`:

| Count | Colour |
|---:|---|
| 1392 | `#fff` |
| 405 | `rgba(255,255,255,.15)` |
| 354 | `#a8007a` |
| 340 | `#000` |
| 313 | `#ddd` |
| 290 | `#333` |
| 235 | `#337ab7` |
| 209 | `#777` |
| 206 | `#ccc` |
| 177 | `#f5f5f5` |
| 169 | `rgba(0,0,0,.075)` |
| 159 | `#eee` |
| 126 | `#3c763d` |
| 126 | `#8a6d3b` |
| 126 | `#a94442` |
| 108 | `rgba(0,0,0,.5)` |
| 99 | `#999` |
| 98 | `#555` |
| 97 | `#2b2a29` |
| 91 | `#e5e5e5` |

Context from CSS search:

- `#a8007a` is the Fabrizia accent: links hover, navigation hover, cart badge, price text, selected size/color states, slider handles.
- `#2b2a29` is used as dark navigation/header background.
- `#fff`, `#000`, `#333`, `#555`, `#777`, `#999`, `#ccc`, `#ddd`, `#eee`, `#f5f5f5`, `#e5e5e5` are mostly neutral UI/text/border/background colors.
- `#337ab7`, `#3c763d`, `#8a6d3b`, `#a94442`, `#31708f` are Bootstrap/default system colors, not brand colors.

Recommendation for design tokens:

- `background`: white or warm off-white chosen by new design, not copied blindly from old CSS.
- `foreground`: near-black derived from `#2b2a29`.
- `muted`: one or two neutral greys, not the many Bootstrap greys.
- `border`: a restrained light neutral.
- `accent`: `#a8007a`, softened/darkened if needed for premium fashion contrast.
- `accent-foreground`: white.

This supports the requested Massimo Dutti/COS quality bar while retaining Fabrizia identity.

## Task D - URL Shapes

From `sitemap.xml`:

| Pattern | Count | Examples |
|---|---:|---|
| `/` | 1 | `/` |
| `/category/{id}/{name}` | 25 | `/category/1/{name}`, `/category/4/{name}` |
| `/product/{id}/{title}` | 5 | `/product/147/{title}`, `/product/1147/{title}` |

Implication: current local sitemap is tiny and incomplete for redirect planning. It is useful for route-shape discovery, not for full SEO migration. Search Console export remains required for the final 301 map.

## Additional Finding

The clean `catalog_data.sql` in the generated package contains `INSERT INTO ... VALUES` headers but not row values. That is safe, but insufficient for ETL mapping. For mapping design, use `schema.sql` plus local safe aggregates; do not commit raw `catalog_data.sql`.

