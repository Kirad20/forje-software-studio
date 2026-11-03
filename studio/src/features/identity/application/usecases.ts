import type { Me } from "../../../shared/contracts/index.js";
import type { HttpPort } from "../../../shared/application/http-port.js";

export function createIdentityUseCases(http: HttpPort) {
  return {
    currentAccount: () => http.request<{ account: Me }>("/me"),
    logout: () => http.request("/auth/logout", { body: {} }),
    authStatus: () => http.request<{ needsSetup: boolean }>("/auth/status"),
    setup: (body: { token: string; email: string; password: string; name: string }) =>
      http.request("/auth/setup", { body }),
    login: (body: { email: string; password: string }) => http.request("/auth/login", { body }),
    requestCode: (email: string) => http.request<{ hint: string }>("/auth/request", { body: { email } }),
    verifyCode: (email: string, code: string) => http.request("/auth/verify", { body: { email, code } }),
    requestPasswordReset: (email: string) =>
      http.request<{ hint: string }>("/auth/password/forgot", { body: { email } }),
    resetPassword: (body: { email: string; code: string; password: string }) =>
      http.request("/auth/password/reset", { body }),
    security: () => http.request<{ hasPassword: boolean }>("/me/security"),
    changePassword: (body: { current?: string; password: string }) =>
      http.request("/me/password", { method: "PUT", body }),
    updateProfile: (name: string) => http.request("/me", { method: "PATCH", body: { name } }),
    listTokens: () =>
      http.request<{ tokens: { id: string; name: string; createdAt: string; lastUsedAt: string | null }[] }>("/tokens"),
    deleteToken: (id: string) => http.request(`/tokens/${id}`, { method: "DELETE" }),
    createToken: (name: string) => http.request<{ token: string }>("/tokens", { body: { name } }),
    signOutOtherSessions: () => http.request<{ ended: number }>("/me/sign-out-others", { body: {} }),
    deleteAccount: (confirmEmail: string) => http.request("/me", { method: "DELETE", body: { confirmEmail } }),
  };
}
