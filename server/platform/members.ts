import { claimInvites as claim } from "../modules/collaboration/index.js";

/** Compatibility facade; collaboration owns access and membership workflows. */
export {
  accessOf,
  sharedProjectIds,
  listMembers,
  inviteMember,
  removeMember,
} from "../modules/collaboration/index.js";
export type { Access } from "../modules/collaboration/index.js";

/** Sign-in callers historically receive no result even when multiple invites are claimed. */
export async function claimInvites(accountId: string, email: string): Promise<void> {
  await claim(accountId, email);
}
