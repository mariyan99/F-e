import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * GET /store/style-groups/:code
 *
 * Powers the colour switcher on the product page (task PDP-03): given any
 * product's style code, return every colour of that design with the handle the
 * storefront needs to link to. Each colour is its own URL, so this returns
 * links, not state to toggle.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const code = req.params.code;
  if (!code) {
    res.status(400).json({ message: "A style group code is required." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "style_group",
    fields: [
      "id",
      "code",
      "title",
      "size_system",
      "season",
      "products.id",
      "products.handle",
      "products.title",
      "products.status",
      "products.thumbnail",
    ],
    filters: { code },
  });

  const styleGroup = data[0];
  if (!styleGroup) {
    res.status(404).json({ message: `No style group with code "${code}".` });
    return;
  }

  res.json({
    style_group: {
      ...styleGroup,
      // Never leak drafts to the storefront.
      products: (styleGroup.products ?? []).filter(
        (product: { status?: string } | null) => product?.status === "published",
      ),
    },
  });
};
