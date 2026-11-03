import type { Http } from "./transport.js";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function createAuth(http: Http) {
  let currentUser: AppUser | null | undefined;
  const listeners = new Set<() => void>();
  const setUser = (user: AppUser | null) => {
    currentUser = user;
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => currentUser,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    async signUp(input: { email: string; password: string; name?: string }) {
      const result = await http.request<{ user: AppUser }>("POST", http.baas("auth/signup"), input);
      setUser(result.user);
      return result.user;
    },
    async signIn(input: { email: string; password: string }) {
      const result = await http.request<{ user: AppUser }>("POST", http.baas("auth/login"), input);
      setUser(result.user);
      return result.user;
    },
    async signOut() {
      await http.request("POST", http.baas("auth/logout"), {});
      setUser(null);
    },
    requestPasswordReset: (email: string) => http.request("POST", http.baas("auth/reset/request"), { email }),
    async resetPassword(input: { email: string; code: string; password: string }) {
      await http.request("POST", http.baas("auth/reset/confirm"), input);
    },
    async refresh() {
      try {
        setUser((await http.request<{ user: AppUser | null }>("GET", http.baas("auth/me"))).user);
      } catch {
        setUser(null);
      }
    },
  };
}
