# Fabrizia Shopify Frontend

This folder is the versioned frontend for the Fabrizia Shopify store.

It contains the Shopify theme source pulled from the unpublished `Fabrizia Dev`
theme. Treat Shopify Admin as the preview/control panel and this folder as the
source of truth for design changes.

## Theme Targets

- Store: `m58cp0-jy.myshopify.com`
- Live theme: do not edit directly.
- Development theme: `Fabrizia Dev` (`190490706305`)
- Preview: `https://m58cp0-jy.myshopify.com?preview_theme_id=190490706305`

## Seasonal / Campaign Workflow

Use a separate Git branch per campaign or season:

- `campaign/spring-2027`
- `campaign/black-friday-2027`
- `season/autumn-winter-2027`

Make all theme changes inside this folder, then push them to the unpublished
theme first:

```powershell
shopify theme push --store m58cp0-jy.myshopify.com --theme 190490706305 --path .\shopify-theme --force
shopify theme check --path .\shopify-theme
```

Only publish from Shopify Admin after preview approval.

## Safe Editing Rules

- Keep reusable brand styling in `assets/fabrizia.css`.
- Keep campaign-specific styling grouped with a clear comment block.
- Do not edit the live theme directly.
- Do not rely on one-off Admin changes without pulling them back into this
  folder.
- Commit every approved visual change so the store can roll back cleanly.

## Suggested Structure

- `assets/fabrizia.css` - base Fabrizia visual system.
- `assets/campaign-*.css` - optional seasonal overrides when a campaign needs
  stronger visual changes.
- `templates/index.json` - homepage sections and campaign hero content.
- `config/settings_data.json` - theme settings such as typography, colors,
  spacing, and button/card radius.
