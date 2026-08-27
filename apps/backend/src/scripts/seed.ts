import { buildSku, slugify, styleGroupCode, type ColourCode } from "@fabrizia/shared";
import type { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

import { STYLE_GROUP_MODULE } from "../modules/style-group";
import type StyleGroupModuleService from "../modules/style-group/service";

/**
 * Seeds the minimum a developer needs to see a real storefront:
 * Bulgaria/EUR region, 20% VAT, a warehouse, three categories and three
 * designs — each in two colours, sizes as variants, grouped by StyleGroup.
 *
 * Idempotent: re-running skips anything that already exists.
 *
 *   pnpm seed
 */

const COUNTRY = "bg";
const CURRENCY = "eur";

type SeedDesign = {
  model: string;
  title: string;
  description: string;
  category: string;
  sizeSystem: "ALPHA" | "NUMERIC";
  sizes: string[];
  priceEur: number;
  colours: Array<{ code: ColourCode; label: string }>;
};

const DESIGNS: SeedDesign[] = [
  {
    model: "2601",
    title: "Рокля Elena",
    description:
      "Дълга рокля от вискоза с обвита талия и странични джобове. Моделът носи размер S при височина 176 см.",
    category: "Рокли",
    sizeSystem: "ALPHA",
    sizes: ["XS", "S", "M", "L", "XL"],
    priceEur: 129,
    colours: [
      { code: "BLK", label: "черна" },
      { code: "CRM", label: "кремава" },
    ],
  },
  {
    model: "2602",
    title: "Панталон Nora",
    description:
      "Панталон с висока талия и прав крачол от плътен туил. Моделът носи размер 38 при височина 178 см.",
    category: "Панталони",
    sizeSystem: "NUMERIC",
    sizes: ["34", "36", "38", "40", "42"],
    priceEur: 99,
    colours: [
      { code: "NVY", label: "тъмносин" },
      { code: "BEG", label: "бежов" },
    ],
  },
  {
    model: "2603",
    title: "Сако Vera",
    description:
      "Двуредно сако с подплата и структурирано рамо. Моделът носи размер M при височина 175 см.",
    category: "Горнища",
    sizeSystem: "ALPHA",
    sizes: ["XS", "S", "M", "L"],
    priceEur: 189,
    colours: [
      { code: "BLK", label: "черно" },
      { code: "GRY", label: "сиво" },
    ],
  },
];

export default async function seed({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const storeModule = container.resolve(Modules.STORE);
  // The container is untyped by design; the module we wrote is not.
  const styleGroupService = container.resolve<StyleGroupModuleService>(STYLE_GROUP_MODULE);

  logger.info("Seeding Fabrizia development data…");

  // --- sales channel ------------------------------------------------------
  let [webChannel] = await salesChannelModule.listSalesChannels({ name: "Web" });
  if (!webChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Web", description: "Онлайн магазин" }] },
    });
    webChannel = result[0]!;
    logger.info("  created sales channel: Web");
  }

  // --- store currency -----------------------------------------------------
  const [store] = await storeModule.listStores();
  if (store) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            { currency_code: CURRENCY, is_default: true },
            // BGN stays listed while dual display is required (decision O-8).
            { currency_code: "bgn" },
          ],
          default_sales_channel_id: webChannel.id,
        },
      },
    });
    logger.info("  store currency set to EUR (BGN kept for dual display)");
  }

  // --- region + tax -------------------------------------------------------
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: "България" },
  });

  if (existingRegions.length === 0) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "България",
            currency_code: CURRENCY,
            countries: [COUNTRY],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    logger.info("  created region: България (EUR)");

    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: COUNTRY,
          default_tax_rate: { code: "vat-bg", name: "ДДС 20%", rate: 20 },
        },
      ],
    });
    logger.info("  created tax region: ДДС 20%");
  }

  // --- stock location + shipping profile ---------------------------------
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: "Склад София" },
  });

  if (existingLocations.length === 0) {
    const { result: locations } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Склад София",
            address: { city: "София", country_code: COUNTRY, address_1: "" },
          },
        ],
      },
    });
    const location = locations[0]!;

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [webChannel.id] },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
    logger.info("  created stock location: Склад София");
  }

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
    filters: { type: "default" },
  });
  let shippingProfileId = profiles[0]?.id;
  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Стандартна", type: "default" }] },
    });
    shippingProfileId = result[0]!.id;
    logger.info("  created shipping profile: Стандартна");
  }

  // --- publishable key ----------------------------------------------------
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token"],
    filters: { title: "Storefront" },
  });
  let publishableKey = keys[0]?.token;
  if (!publishableKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: "Storefront", type: "publishable", created_by: "seed" }] },
    });
    const created = result[0]!;
    publishableKey = created.token;
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: created.id, add: [webChannel.id] },
    });
    logger.info("  created publishable API key");
  }

  // --- categories ---------------------------------------------------------
  const categoryNames = [...new Set(DESIGNS.map((d) => d.category))];
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const categoryByName = new Map<string, string>(
    existingCategories.map((c: { name: string; id: string }) => [c.name, c.id]),
  );

  const missingCategories = categoryNames.filter((name) => !categoryByName.has(name));
  if (missingCategories.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((name) => ({ name, is_active: true })),
      },
    });
    for (const category of result) {
      categoryByName.set(category.name, category.id);
    }
    logger.info(`  created categories: ${missingCategories.join(", ")}`);
  }

  // --- designs: one product per colour, sizes as variants ------------------
  for (const design of DESIGNS) {
    const code = styleGroupCode(design.model);

    const [existingGroup] = await styleGroupService.listStyleGroups({ code });
    if (existingGroup) {
      logger.info(`  style group ${code} already exists, skipping`);
      continue;
    }

    const styleGroup = await styleGroupService.createStyleGroups({
      code,
      title: design.title,
      size_system: design.sizeSystem,
      season: "SS26",
    });

    const { result: products } = await createProductsWorkflow(container).run({
      input: {
        products: design.colours.map((colour) => ({
          title: `${design.title} — ${colour.label}`,
          // Medusa would derive a Cyrillic handle from the title. URLs are
          // transliterated Latin (task CAT-12), so set it explicitly.
          handle: slugify(`${design.title} ${colour.label}`),
          description: design.description,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfileId,
          category_ids: [categoryByName.get(design.category)!],
          sales_channels: [{ id: webChannel.id }],
          options: [{ title: "Размер", values: design.sizes }],
          variants: design.sizes.map((size) => ({
            title: size,
            sku: buildSku({ model: design.model, colour: colour.code, size }),
            manage_inventory: true,
            options: { "Размер": size },
            prices: [{ amount: design.priceEur, currency_code: CURRENCY }],
          })),
        })),
      },
    });

    await link.create(
      products.map((product) => ({
        [STYLE_GROUP_MODULE]: { style_group_id: styleGroup.id },
        [Modules.PRODUCT]: { product_id: product.id },
      })),
    );

    logger.info(`  created ${code} "${design.title}" in ${products.length} colours`);
  }

  logger.info("");
  logger.info("Seed complete.");
  logger.info(`  Publishable key for the storefront .env:`);
  logger.info(`  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}`);
  logger.info("");
}
