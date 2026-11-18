import type { Http } from "./transport.js";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/** A sign-in provider configured in forja.auth.json (Google, Facebook, GitHub, an OIDC or OAuth 2.0 service…). */
export interface AuthProvider {
  id: string;
  name: string;
}

export interface SignInWithOptions {
  /** Path to return to after signing in (default: the current page). */
  redirectTo?: string;
  /** Open the provider in a popup instead of leaving the page. Default: only inside an iframe (the studio's preview). */
  popup?: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    /** Providers the login page can offer, in the order of forja.auth.json. */
    async providers(): Promise<AuthProvider[]> {
      return (await http.request<{ providers: AuthProvider[] }>("GET", http.baas("auth/providers"))).providers;
    },
    /**
     * Signs in with a provider. Leaves the page and comes back to `redirectTo` signed in
     * (or with the reason in auth.oauthError()); inside an iframe it uses a popup and
     * resolves with the user.
     */
    async signInWith(provider: string, options: SignInWithOptions = {}): Promise<AppUser | null> {
      const here = `${location.pathname}${location.search}`;
      const redirectTo = options.redirectTo ?? here;
      const popup = options.popup ?? (typeof window !== "undefined" && window.top !== window);
      if (!popup) {
        location.assign(`${http.baas(`auth/oauth/${encodeURIComponent(provider)}/start`)}?redirect=${encodeURIComponent(redirectTo)}`);
        return null;
      }
      const { url, poll } = await http.request<{ url: string; poll: string }>("POST", http.baas(`auth/oauth/${encodeURIComponent(provider)}/begin`), { redirect: redirectTo });
      const win = window.open(url, "forja-oauth", "popup,width=520,height=680");
      if (!win) throw new Error("El navegador bloqueó la ventana de inicio de sesión; permite las ventanas emergentes.");
      const deadline = Date.now() + 5 * 60_000;
      let closedAt = 0;
      while (Date.now() < deadline) {
        await sleep(1000);
        const result = await http.request<{ user?: AppUser; pending?: boolean }>("POST", http.baas("auth/oauth/poll"), { poll });
        if (result.user) {
          setUser(result.user);
          try { win.close(); } catch { /* already closed */ }
          return result.user;
        }
        // The popup may close a moment before its ticket is written; give it a few more polls.
        if (win.closed) {
          closedAt ||= Date.now();
          if (Date.now() - closedAt > 4000) break;
        }
      }
      throw new Error("No se completó el inicio de sesión.");
    },
    /** The reason a provider sign-in failed, read once from ?auth_error= after coming back. */
    oauthError(): string | null {
      if (typeof location === "undefined") return null;
      const params = new URLSearchParams(location.search);
      const error = params.get("auth_error");
      if (!error) return null;
      params.delete("auth_error");
      const rest = params.toString();
      history.replaceState(history.state, "", `${location.pathname}${rest ? `?${rest}` : ""}${location.hash}`);
      return error;
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
