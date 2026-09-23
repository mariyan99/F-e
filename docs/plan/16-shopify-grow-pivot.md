# ADR-002 - Shopify Grow D2C pivot

> Status: ACCEPTED IN PRINCIPLE - 2026-09-23
> Supersedes the custom Medusa/Next/Payload plan for the first commercial release, unless a Shopify feasibility check finds a hard blocker.

## Decision

Fabrizia should move toward a Shopify Grow D2C store for the first real selling release.

The project goal is now sales first: a polished fashion storefront, about 130 products, direct-to-consumer orders, card payments plus cash on delivery, and a practical Econt workflow. B2B, wholesale, Orak-first accounting sync, and custom commerce infrastructure are not MVP requirements.

## Why This Changed

The original custom stack made sense while the project assumed:

- Orak integration as a core system dependency.
- Custom inventory safety-buffer logic as a hard requirement.
- Custom backend ownership for commerce, CMS, search, media, accounting export and courier workflows.
- A broader migration of the legacy operating model.

The owner clarified a lighter operating model:

- D2C only, no B2B.
- Products can be entered and managed directly in Shopify.
- Orak can be absent from the first release.
- Expected catalogue size is around 130 products.
- Initial target can be about 100 EUR/day, with a strong upside scenario around 5,000 EUR/day.
- The visual target is close to a modern Shopify fashion store such as SWT Active, not a fully bespoke commerce backend.

Under those constraints, Shopify Grow is the more pragmatic first platform.

## Plan Choice

Start on Shopify Grow.

Do not start on Shopify Plus. Plus is reserved for a later stage only if a specific Plus-only requirement or very large operating scale justifies it.

Do not start on Shopify Advanced unless Grow hits a concrete operational or financial reason to upgrade, such as reporting, shipping-rate needs, staff/location needs, or payment-fee savings that outweigh the plan price.

Changing Shopify plans later is not a site rebuild. Products, customers, orders, theme and configuration remain in the store.

## MVP Scope

The Shopify MVP should include:

- Premium fashion theme direction inspired by SWT Active quality and flow, but branded as Fabrizia.
- Homepage with strong campaign image, product rails and clear category entry points.
- Collections for the key shopping paths.
- Product pages with 3:4 imagery, colour/size options, size guide, delivery/return accordions and sticky add-to-cart on mobile.
- Cart drawer with free-shipping progress.
- Shopify checkout with guest checkout.
- Shopify Payments for cards if available/approved.
- Manual payment method for cash on delivery.
- Econt process for shipping and cash-on-delivery fulfilment.
- COD fee policy, initially planned as a small fixed fee such as 1.50 EUR.
- Free shipping threshold, currently 89 EUR unless the owner changes it.
- Return policy: 14 days, customer pays reverse shipping when returning by choice.
- Bulgarian storefront as the first language.
- EUR as the primary currency, with Bulgaria EUR/BGN compliance handled in theme/store settings as required.
- Basic analytics: GA4, Meta Pixel, Google Search Console, Merchant Center readiness.

## Out Of Scope For MVP

- Shopify Plus.
- B2B or wholesale.
- Orak live integration.
- Custom Medusa backend.
- Payload CMS.
- Meilisearch.
- Custom VPS hosting.
- Full custom accounting pipeline.
- Full legacy order/customer migration.
- Loyalty, reviews, wishlist and advanced returns portal unless selected as separate Shopify apps later.

## Open Checks Before Build

1. Confirm Shopify Payments availability and approval for the business entity.
2. Choose store plan: Shopify Grow monthly or annual.
3. Decide whether to use an existing Shopify store or create a new one.
4. Choose theme approach: premium theme customization or custom theme.
5. Confirm Econt workflow: app, manual fulfilment, or lightweight custom/export process.
6. Confirm COD fee and whether COD orders require SMS/phone confirmation before shipping.
7. Confirm product data source: manual entry, CSV import from old site, or cleaned spreadsheet.
8. Confirm image source and first campaign/product-photo workflow.
9. Confirm legal pages and business details.
10. Confirm domain cutover plan from the old site.

## Migration Notes

Legacy analysis is still useful for:

- Product/category reference.
- Old URLs and 301 redirects.
- Product images as temporary reference/fallback only.
- Old price and SKU reference.

But the first Shopify build should not depend on importing every old table into a custom data model.

## Success Criteria

The first release is successful when:

- The owner can create/edit products in Shopify without developer help.
- A customer can place a card or COD order end-to-end.
- Econt fulfilment can be handled reliably.
- Product pages feel premium and trustworthy.
- Mobile shopping is fast and clean.
- The site is ready for Meta/TikTok/Google traffic.
- Operational work for a small catalogue is simpler than the custom build path.
