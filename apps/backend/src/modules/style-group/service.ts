import { MedusaService } from "@medusajs/framework/utils";

import { StyleGroup } from "./models/style-group";

/**
 * MedusaService generates the CRUD surface (listStyleGroups, retrieveStyleGroup,
 * createStyleGroups, …). Only behaviour that is genuinely ours goes below.
 */
class StyleGroupModuleService extends MedusaService({ StyleGroup }) {}

export default StyleGroupModuleService;
