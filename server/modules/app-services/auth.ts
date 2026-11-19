export { createAuth, AuthError, sessionCookie } from "./application/auth.js";
export type { AppUser, OAuthIdentity } from "./application/auth.js";
import { createAuth } from "./application/auth.js";
import { authPorts } from "./infrastructure/auth.js";
export const { signUp, createTestUser, signIn, signInWithOAuth, createOAuthTicket, takeOAuthTicket, userFromSession, signOut, requestPasswordReset, confirmPasswordReset, ensureOwnerAdmin, ensureProjectOwner, createAppUser, updateAppUserPassword, testSession, endSession, setTemporaryPassword } = createAuth(authPorts);
