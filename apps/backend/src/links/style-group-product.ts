import ProductModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/framework/utils";

import StyleGroupModule from "../modules/style-group";

/**
 * One StyleGroup ↔ many products (one per colour).
 *
 * A module link rather than a foreign key: the product module stays untouched,
 * so a Medusa upgrade cannot collide with our schema.
 */
export default defineLink(StyleGroupModule.linkable.styleGroup, {
  linkable: ProductModule.linkable.product,
  isList: true,
});
