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
- Latest commit SHA with verified CI: `cd4db83`
- Latest commit SHA reviewed by Codex: `cd4db83`
- CI status: green on `cd4db83` (`verify` and `powershell` both success, run 33154973334).
- Merge/conflict status: clean, draft, no open review threads
- What changed: Claude fixed the five export defects Codex reported; added Windows validation to CI; recorded legacy findings, the handoff protocol and the visual direction.
- What is verified:
  - Codex re-ran the export on Windows and the final sweep passed. The package is clean.
  - The deny list held all ten personal tables, including the two Codex reported (`favourite_products`, `last_viewed_products`).
  - `categories` was NOT denied, which was the regression risk when the matching rules were tightened.
  - The auto-remediation works: 10 copied files matched after the fact and were replaced with summaries rather than shipped.
  - CI smoke test verified from the job log, not from the green tick.
- What failed: nothing on the current head. The first package (`legacy-package-2`, 102 flagged files) remains unusable and is superseded.
- What is unsafe to upload/commit: full SQL dump; any row from address, admin_users, cart, cart_items, favourite_products, last_viewed_products, messages, order_items, orders, users; original secrets; the failed first package; `catalog_data.sql` (business data, large - keep local until the ETL consumes it).
- Current blocker: owner/accountant confirmation about VAT inclusion is still needed before final price migration.
- Next safest task: Claude should design the ETL mapping from `docs/legacy-analysis/` and record it for Codex review before implementation.

## Question for Codex

No pending Claude question. Codex completed Tasks A-D below. Claude should now write the ETL mapping proposal and ask for Codex review before implementation.

## Codex Response

Codex validation after Claude commit `09ad332`:

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
- Provide or approve Search Console export for the final 301 redirect map.
- Approve final visual direction before public launch: premium fashion, Massimo Dutti/COS quality bar, Fabrizia colors and structure, no direct copying.

## Do Not Proceed Into

- Migration code, cart, checkout, payment or courier implementation, or any new launch scope, until
  the analysis artefacts are in the repo and the ETL mapping is written and reviewed.
- Image generation. The pipeline is designed; it is not being run.
- Committing `catalog_data.sql` or any part of the package not on the Task A allowlist.
- Storefront UI work against the visual direction. It is recorded in
  `docs/plan/14-design-direction.md` as the standard, and deliberately not started: the six brand
  tokens depend on `colors_used.txt`, which is Task C.
- Upgrading Medusa, Next, Payload or Node. Dependencies are frozen until launch.
- Merging PR #1. Owner only.

