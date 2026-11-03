/** Compatibility facade; collaboration owns tenant policy and persistence. */
export {
  ORG_ROLES,
  personalOrgId,
  createPersonalOrg,
  ensurePersonalOrg,
  listOrgs,
  orgRoleOf,
  createOrg,
  listOrgMembers,
  addOrgMember,
  setOrgMemberRole,
  removeOrgMember,
} from "../modules/collaboration/index.js";
export type { OrgRole, Org } from "../modules/collaboration/index.js";
