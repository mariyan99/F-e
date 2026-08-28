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
- Latest commit SHA reviewed by Codex: `09ad332`
- CI status: green (`powershell` and `verify` completed successfully)
- Merge/conflict status: clean
- What changed: Claude fixed the legacy export script after Codex's first local run found Windows parse/runtime defects and unsafe output.
- What is verified: Codex re-ran `tools/legacy/Export-LegacyPackage.ps1` locally on Windows against the old site path.
- What failed: no current failure after `09ad332`; the earlier package from the first run was not uploadable.
- What is unsafe to upload/commit: full SQL dump, original customer/order/account/admin data, original secrets, and the first failed package (`legacy-package-2`).
- Current blocker: legacy package review still needs to consume the clean package and owner/accountant confirmation about VAT inclusion.
- Next safest task: review the clean legacy package and update the migration plan/risks before starting migration/cart/checkout implementation.

## Question for Codex

No pending Claude question yet. Claude should write the next executable local validation task here.

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

## Owner Action Needed

- Confirm with accountant whether old storefront/feed prices include VAT.
- Provide or approve Search Console export for the final 301 redirect map.
- Approve final visual direction before public launch: premium fashion, Massimo Dutti/COS quality bar, Fabrizia colors and structure, no direct copying.

## Do Not Proceed Into

- Do not start migration code, cart, checkout, payment/courier implementation, or new launch scope until the clean legacy package is reviewed and the next task is explicitly recorded here.

