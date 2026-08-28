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
- Latest commit SHA: `bf848da`
- Latest commit SHA reviewed by Codex: `09ad332`
- CI status: green on `ca073f0` (`verify` and `powershell` both success, run 33153548870). Commits after that are documentation only.
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
- Current blocker: Claude cannot see the package. The clean output exists only on the owner's machine, so the migration mapping cannot be designed from it yet. See `Question for Codex`.
- Next safest task: move the small, safe analysis artefacts into the repo so Claude can read them directly, then design the ETL mapping. No implementation until that mapping is reviewed.

## Question for Codex

### Context: why this is the blocker

The package is clean, but it exists only on the owner's machine. Everything downstream - the
field-by-field mapping, the StyleGroup grouping rule, the 301 map, the six brand colour tokens -
needs the actual schema, not a prose summary of it. So the next step is to get the *small, safe*
derived files into the repo.

### Task A (blocking): put the safe analysis artefacts in the repo

Copy these from the clean package into `docs/legacy-analysis/` in the local clone, commit, and ask
the owner for a single `git push`. Codex has no token, so the push is the one manual step; that is
one command, not copy/paste.

```powershell
cd $HOME\Desktop\fabrizia-repo          # or wherever the clone lives
git checkout claude/fabrizia-ecommerce-rebuild-b9vo46
git pull
New-Item -ItemType Directory -Force -Path docs\legacy-analysis | Out-Null

$pkg = "C:\Users\mariyan\Documents\Codex\2026-08-27\claude-gork-codex-multi-file-refactors\work\legacy-package-09ad332"

Copy-Item "$pkg\db\schema.sql"                    docs\legacy-analysis\schema.sql
Copy-Item "$pkg\db\table_counts.txt"              docs\legacy-analysis\table_counts.txt
Copy-Item "$pkg\branding\colors_used.txt"         docs\legacy-analysis\colors_used.txt
Copy-Item "$pkg\branding\fonts_used.txt"          docs\legacy-analysis\fonts_used.txt
Copy-Item "$pkg\images\aspect_ratios.txt"         docs\legacy-analysis\aspect_ratios.txt
Copy-Item "$pkg\code-summaries\_index.txt"        docs\legacy-analysis\code-summaries-index.txt
Copy-Item "$pkg\EXPORT-REPORT.txt"                 docs\legacy-analysis\EXPORT-REPORT.txt

# Sitemap only if it is small enough to read as text
$sm = Get-Item "$pkg\urls\sitemap.xml" -ErrorAction SilentlyContinue
if ($sm -and $sm.Length -lt 2MB) { Copy-Item $sm.FullName docs\legacy-analysis\sitemap.xml }

# Refuse anything oversized rather than committing a blob
Get-ChildItem docs\legacy-analysis -File | Where-Object { $_.Length -gt 2MB } | ForEach-Object {
  Write-Host "TOO LARGE, removing: $($_.Name) ($([math]::Round($_.Length/1MB,1)) MB)"
  Remove-Item $_.FullName
}

# Last line of defence before it enters git history
$bad = @(Get-ChildItem docs\legacy-analysis -File | Where-Object {
  (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|(\+359|\b0)8[789][0-9]{7}\b|sk_live_|AKIA[0-9A-Z]{16}|-----BEGIN'
})
if ($bad.Count -gt 0) {
  Write-Host "DO NOT COMMIT:"; $bad | ForEach-Object { Write-Host "  $($_.Name)" }
} else {
  git add docs/legacy-analysis
  git commit -m "docs: safe legacy analysis artefacts from the clean package"
  Write-Host "Committed. Owner: run  git push  once."
}
```

**Do NOT copy:** `catalog_data.sql`, anything under `code/`, `code-summaries/*.summary.txt`,
`images/samples/`, `images_inventory.tsv`. Those are either business data, bulky, or both.
If the scan flags a file, report **only its name**, never its contents.

### Task B: `linked_colors` is the most important table in the dump

The old schema has a table called `linked_colors`. If it does what the name suggests - linking the
colour variants of one design - then the old site already carries the grouping that the new
StyleGroup model needs, and the migration does not have to infer it from product titles. That is the
difference between a reliable mapping and a guess.

Report, from schema and safe aggregates only:

1. The `CREATE TABLE` for `linked_colors`, `products`, `product_quantities`, `product_photos`,
   `product_cat_rel`, `sizes_template`, `sizes_template_product`.
2. Three sample rows of `linked_colors` - these should be integer IDs only. If any column holds
   free text or anything resembling personal data, report the column names and skip the rows.
3. `SELECT COUNT(*)` for `linked_colors`, and how many distinct products appear in it.
4. Does `products` have a slug/url/handle column? If yes, its name and three example values.
   This decides whether the 301 map can be generated from the database or must come from the sitemap.
5. Is `translations` a multi-language table? Which languages?

### Task C: brand colours

From `colors_used.txt`, report the top 20 by frequency. The old site has 629 distinct colours, so
the job is reduction, not transfer: six tokens must come out of it. Frequency alone will not decide
it - a colour used 400 times may be a border grey - so also note which are used in headers, buttons
or links if the summaries make that visible.

### Task D: URL shapes for the 301 map

From `sitemap.xml`, report the distinct URL *patterns*, not the full list. For example:
`/product/{slug}`, `/category/{slug}`, `/page/{slug}`. Include a count per pattern and two examples
of each. This is what the redirect map is built from.

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

- Migration code, cart, checkout, payment or courier implementation, or any new launch scope, until
  the analysis artefacts are in the repo and the ETL mapping is written and reviewed.
- Image generation. The pipeline is designed; it is not being run.
- Committing `catalog_data.sql` or any part of the package not on the Task A allowlist.
- Storefront UI work against the visual direction. It is recorded in
  `docs/plan/14-design-direction.md` as the standard, and deliberately not started: the six brand
  tokens depend on `colors_used.txt`, which is Task C.
- Upgrading Medusa, Next, Payload or Node. Dependencies are frozen until launch.
- Merging PR #1. Owner only.

