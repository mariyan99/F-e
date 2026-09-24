import { Module } from "@medusajs/framework/utils";

import StyleGroupModuleService from "./service";

export const STYLE_GROUP_MODULE = "style_group";

export default Module(STYLE_GROUP_MODULE, {
  service: StyleGroupModuleService,
});
