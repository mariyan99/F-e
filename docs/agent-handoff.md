# Agent Handoff

This file is the shared working channel between Claude and Codex.

Rules:

- Keep this file current after every meaningful change.
- Put executable requests for Codex under `Question for Codex`.
- Put Codex validation results under `Codex Response`.
- Put only true owner/business/legal/fiscal/design decisions under `Owner Action Needed`.
- Do not paste secrets, full SQL dumps, customer/order/user/address/session/password/admin/log rows, tokens, SMTP credentials, DB credentials, or sensitive logs.
- Do not start new launch scope while a blocker is active.

## Current State

- PR: https://github.com/mariyan99/F-e/pull/1
- Branch: `claude/fabrizia-ecommerce-rebuild-b9vo46`
- Latest commit SHA: the branch tip moves with every handoff update, so it cannot be written here
  truthfully. After `git pull`, read it with `git rev-parse --short HEAD`. The two SHAs below are
  stable and are the ones worth quoting.
- Latest commit SHA with verified CI: `78dc1a8`
- Latest commit SHA reviewed by Codex: `9fb6567`
- CI status: green on `78dc1a8` (`verify` and `powershell` both success, run 33155946094).
  Verified from the Windows job log, not from the tick: the log shows `1 table(s) failed the PII
  scan after partial export and were purged`, `4 tables held back by the deny list` and
  `catalog_data.sql - 3 tables` - the new code paths ran under PowerShell 5.1.
- Merge/conflict status: clean, draft, no open review threads
- What changed: Claude fixed the multi-line INSERT defect Codex found in the export script,
  added three CI regressions for it, and wrote the ETL mapping proposal in
  `docs/plan/15-etl-mapping.md` for review.
- What is verified:
  - Codex re-ran the export on Windows and the final sweep passed. The package is clean.
  - The deny list held all ten personal tables, including the two Codex reported (`favourite_products`, `last_viewed_products`).
  - `categories` was NOT denied, which was the regression risk when the matching rules were tightened.
  - The auto-remediation works: 10 copied files matched after the fact and were replaced with summaries rather than shipped.
  - CI smoke test verified from the job log, not from the green tick.
  - The multi-line INSERT fix was simulated against the CI fixture before pushing: rows are
    counted as rows (product_quantities 5, not 1), a denied multi-line INSERT does not leak its
    continuation lines, and a table that passes the PII scan on its first statement and fails on
    a later one is purged whole.
- What failed: the export script wrote INSERT headers with no row values, and counted statements
  instead of rows (products 64 against 376 real product IDs). Codex found it. Cause: only the
  header line matched the INSERT pattern; continuation lines were dropped. Nothing leaked - the
  dropped lines were written nowhere - but the extract was empty and the counts in
  `docs/legacy-analysis/table_counts.txt` are wrong until the export is re-run. Fixed in `78dc1a8`. The first package (`legacy-package-2`, 102 flagged files) remains unusable and is superseded.
- What is unsafe to upload/commit: full SQL dump; any row from address, admin_users, cart, cart_items, favourite_products, last_viewed_products, messages, order_items, orders, users; original secrets; the failed first package; `catalog_data.sql` (business data, large - keep local until the ETL consumes it).
- Current blocker: no technical ETL-shape blocker remains after Codex answered Q1-Q5. Owner/accountant
  confirmation about VAT and the EUR rounding policy still block final price migration.
- Next safest task: Claude updates `docs/plan/15-etl-mapping.md` to mark the split model confirmed, then writes a dry-run ETL validator that emits counts/mapping IDs only.

## Question for Codex

No pending Claude question. Codex answered Q1-Q9 after the `78dc1a8` export fix and reviewed the ETL shape. Claude should update `docs/plan/15-etl-mapping.md` to mark the split model confirmed, then the next safe task is a dry-run ETL validator that emits counts/mapping IDs only.
## Codex Response

Codex validation after Claude commit `9fb6567`:

- GitHub PR status before Codex commit: `clean`, draft, no conflicts.
- CI status on Claude's fixed export commit `78dc1a8`: green (`verify` and `powershell` success).
- Local export source: `C:\Users\mariyan\OneDrive\Desktop\fabrizia\fabriziafashion-main`.
- Local regenerated output: `C:\Users\mariyan\Documents\Codex\2026-08-27\claude-gork-codex-multi-file-refactors\work\legacy-package-78dc1a8`.
- Safe analysis artefacts updated in `docs/legacy-analysis/`: `EXPORT-REPORT.txt`, `table_counts.txt`.
- Detailed ETL review is in `docs/legacy-analysis/codex-etl-review-2026-08-28.md`.
- `catalog_data.sql` now contains real row tuples locally (`6752853` bytes) and was not committed.
- Deny list held all ten personal tables: `address`, `admin_users`, `cart`, `cart_items`, `favourite_products`, `last_viewed_products`, `messages`, `order_items`, `orders`, `users`.
- Final sweep passed: no secret or PII pattern in output.

Answers to Q1-Q9:

- Q1: `product_quantities` has `15678` rows and `3101` distinct products. `2090` products have more than one colour; maximum colours on one product is `24`. This confirms legacy `products.id` is usually a design with colours inside it.
- Q2: `linked_colors` has `14` groups, `640` total memberships, `376` distinct IDs, `264` overlap memberships and `247` IDs appearing in more than one group. This is not a StyleGroup shape.
- Q3: `linked_colors.linked_colors` values match `attr_values.value` for all `376` distinct IDs; names are `14` empty / `0` non-empty. Code usage proves it expands colour filters, not product model groups.
- Q4: largest three groups have different product codes: group `14` = `103` distinct codes over `104` members, group `4` = `70` distinct codes over `70`, group `19` = `63` distinct codes over `63`.
- Q5: only `1` of `47` currently sellable products appears in any `linked_colors` group; `46` appear in none.
- Q6: map colours/sizes through `attr_values.value`. `product_quantities.color` matches `attr_values.value` for all `354` distinct values; sizes match for all `43`; `product_photos.color` has `11` zero rows and should treat `0` as unassigned/shared fallback.
- Q7: `categories.type` distribution is `1 => 4`, `2 => 20`, `3 => 28`. Counts alone do not prove semantics; use code review before flattening all three as public product categories.
- Q8: sellable product weights are kg-scale: min `0.08`, max `1.5`, average `0.382`.
- Q9: `products.code` is non-empty and unique for `3106` products, but not numeric-only; length range `8-22`. `products.sku` is non-empty, unique, numeric-only for `3106` products, mostly length `5`; use `sku` as the safer `{model}` candidate.

ETL decision from Codex review:

- I agree with Claude's proposed split model.
- One legacy `products.id` becomes one StyleGroup/design.
- Each distinct legacy colour under that product becomes one Medusa product.
- Sizes remain variants under that colour product.
- `linked_colors` should not define StyleGroup; keep it only as optional colour-filter expansion/synonym data.

Earlier Codex validation after Claude commit `09ad332`:

- GitHub PR status: `clean`
- CI status: `powershell: success`, `verify: success`
- Windows PowerShell parser check for `tools/legacy/Export-LegacyPackage.ps1`: passed
- Local export source:
  `C:\Users\mariyan\OneDrive\Desktop\fabrizia\fabriziafashion-main`
- Local clean output:
  `C:\Users\mariyan\Documents\Codex\2026-08-27\claude-gork-codex-multi-file-refactors\work\legacy-package-09ad332`
- Uploadable zip prepared:
  `C:\Users\mariyan\Documents\Codex\2026-08-27\claude-gork-codex-multi-file-refactors\outputs\fabrizia-legacy-package-09ad332-clean.zip`

Export report:

- SQL dump scanned: `890305` lines
- Rows never emitted by deny list: `address`, `admin_users`, `cart`, `cart_items`, `favourite_products`, `last_viewed_products`, `messages`, `order_items`, `orders`, `users`
- Catalog tables exported: `attributes`, `banners`, `categories`, `general_pages`, `home_page_blocks`, `linked_colors`, `product_cat_rel`, `product_photos`, `product_quantities`, `products`, `settings`, `sizes_template`, `sizes_template_product`, `translations`
- Code export: `206` copied, `131` summarised, `193` skipped as third-party
- Re-scan replaced `10` copied files with summaries
- Images catalogued: `380`
- Sample images copied: `12`
- Final sweep: passed, no secret or PII pattern in output

Migration facts found locally:

- Old prices are in `BGN`; evidence includes `catalog.xml`, `catalog.csv`, `google_catalog.csv`, and `api/xml_catalog.php`.
- VAT inclusion is not proven from code; treat storefront/feed prices as likely VAT-inclusive but require owner/accountant confirmation before final migration.
- Sellable product rule: `products.status = 1` and `product_quantities.quantity > 0`.
- Public navigation should exclude `categories.hidden = 1`.
- Old images are usable only for staging/fallback/catalog audit. Final storefront should use the planned AI product-image pipeline with consistent 3:4 exports.

Codex response to Claude Tasks A-D:

- Safe analysis artefacts were copied into `docs/legacy-analysis/`.
- Pre-commit safety scan passed: no file over 2 MB, no PII/secret regex match.
- Detailed response is in `docs/legacy-analysis/codex-analysis-2026-08-28.md`.
- `linked_colors` has 14 rows and 376 distinct product IDs in linked groups; it should be the first source for StyleGroup mapping.
- `products` has no slug/url/handle column; product URLs are shaped as `/product/{id}/{title}`.
- `translations` is structurally multi-language but only `bg` was found in the dump.
- URL patterns from local sitemap: `/` count 1, `/category/{id}/{name}` count 25, `/product/{id}/{title}` count 5.
- Top brand signal is `#a8007a`; most other frequent colors are neutral or Bootstrap system colors.
- `catalog_data.sql` in the clean package has headers but no row values; do not commit it. Use schema plus safe local aggregates for mapping.


## Owner Action Needed

- Confirm with accountant whether old storefront/feed prices include VAT.
- Decide the rounding policy after BGN -> EUR at 1.95583. 49.90 BGN becomes 25.51 EUR and the
  psychological price is gone. Whether the catalogue lands on 25.50, 25.90 or 24.90 is a
  commercial decision, applied once at import. Prices cannot be loaded until this is set.
- New: the legacy system fed document numbers to ORAK (`Orak_Counters`). Invoice numbering must
  not restart at 1 when the new site goes live. This is an accounting question, not a technical
  one, and it was not in the plan before.
- Provide or approve Search Console export for the final 301 redirect map.
- Approve final visual direction before public launch: premium fashion, Massimo Dutti/COS quality bar, Fabrizia colors and structure, no direct copying.

## Do Not Proceed Into

- ETL implementation, until Q1-Q5 are answered. They decide whether the ETL splits one legacy
  product into N products, which is the whole shape of it. Writing code before that answer means
  writing it twice.
- Loading any price, until VAT and the rounding policy are settled. A provisional price in
  production is a wrong price.
- Cart, checkout, payment or courier implementation, or any new launch scope.
- Image generation. The pipeline is designed; it is not being run.
- Committing `catalog_data.sql` or any part of the package not on the Task A allowlist.
- Storefront UI work against the visual direction. It is recorded in
  `docs/plan/14-design-direction.md` as the standard, and deliberately not started: the six brand
  tokens depend on `colors_used.txt`, which is Task C.
- Upgrading Medusa, Next, Payload or Node. Dependencies are frozen until launch.
- Merging PR #1. Owner only.
