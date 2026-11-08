import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import type { PublicAccount } from "../../../server/modules/identity/index.js";

const state = vi.hoisted(() => ({
  clients: new Map<string, { client_id: string; client_name: string; redirect_uris: string[] }>(),
  codes: new Map<string, { account_id: string; client_id: string; redirect_uri: string; code_challenge: string; scope: string; consumed: boolean }>(),
  tokens: new Map<string, { access: string; refresh: string; client_id: string; account_id: string; scope: string; revoked: boolean }>(),
}));

vi.mock("../../../server/shared/database/index.js", () => ({
  q: vi.fn(async (sql: string, values: unknown[] = []) => {
    if (sql.includes("insert into mcp_oauth_clients")) {
      state.clients.set(String(values[0]), {
        client_id: String(values[0]), client_name: String(values[1]), redirect_uris: JSON.parse(String(values[2])),
      });
      return [];
    }
    if (sql.includes("select client_id, client_name, redirect_uris from mcp_oauth_clients")) {
      const client = state.clients.get(String(values[0]));
      return client ? [client] : [];
    }
    if (sql.includes("insert into mcp_oauth_codes")) {
      state.codes.set(String(values[0]), {
        client_id: String(values[1]), account_id: String(values[2]), redirect_uri: String(values[3]),
        code_challenge: String(values[4]), scope: String(values[5]), consumed: false,
      });
      return [];
    }
    if (sql.includes("delete from mcp_oauth_codes")) return [];
    if (sql.includes("insert into mcp_oauth_tokens")) {
      state.tokens.set(String(values[0]), {
        access: String(values[0]), refresh: String(values[1]), client_id: String(values[2]),
        account_id: String(values[3]), scope: String(values[4]), revoked: false,
      });
      return [];
    }
    if (sql.includes("update mcp_oauth_tokens t set last_used_at")) {
      const token = state.tokens.get(String(values[0]));
      return token && !token.revoked ? [{ ...account, tokenOrgId: null, tokenProjectId: null }] : [];
    }
    if (sql.includes("update mcp_oauth_tokens set revoked_at")) {
      const token = [...state.tokens.values()].find((item) => item.client_id === values[0]
        && (item.access === values[1] || item.refresh === values[1]));
      if (token) token.revoked = true;
      return [];
    }
    throw new Error(`Unexpected SQL in OAuth test: ${sql}`);
  }),
  platformDb: vi.fn(async () => ({
    transaction: async <T,>(fn: (tx: { query: (sql: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }) => Promise<T>) =>
      fn({
        query: async (sql, values = []) => {
          if (sql.includes("select account_id, redirect_uri, code_challenge, scope from mcp_oauth_codes")) {
            const code = state.codes.get(String(values[0]));
            return { rows: code && code.client_id === values[1] && code.redirect_uri === values[2]
              && code.code_challenge === values[3] && !code.consumed
              ? [{ account_id: code.account_id, redirect_uri: code.redirect_uri, code_challenge: code.code_challenge, scope: code.scope }]
              : [] };
          }
          if (sql.includes("update mcp_oauth_codes set consumed_at")) {
            const code = state.codes.get(String(values[0]));
            if (!code || code.client_id !== values[1] || code.consumed) return { rows: [] };
            code.consumed = true;
            return { rows: [{ code_hash: values[0] }] };
          }
          if (sql.includes("update mcp_oauth_tokens set revoked_at")) {
            const token = [...state.tokens.values()].find((item) => item.refresh === values[0]
              && item.client_id === values[1] && !item.revoked);
            if (!token) return { rows: [] };
            token.revoked = true;
            return { rows: [{ account_id: token.account_id, scope: token.scope }] };
          }
          if (sql.includes("update mcp_oauth_tokens t set revoked_at")) {
            const token = [...state.tokens.values()].find((item) => item.refresh === values[0]
              && item.client_id === values[1] && !item.revoked);
            if (!token) return { rows: [] };
            token.revoked = true;
            return { rows: [{ account_id: token.account_id, scope: token.scope }] };
          }
          throw new Error(`Unexpected transaction SQL in OAuth test: ${sql}`);
        },
      }),
  })),
}));
vi.mock("../../../server/shared/security.js", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../server/shared/security.js")>(),
  rateLimit: vi.fn(async () => {}),
  clientIp: vi.fn(() => "127.0.0.1"),
}));

const account: PublicAccount = {
  id: "account-1", email: "owner@example.test", name: "Owner", credits: 0, platformRole: "user",
};
const identity = { accountFromSession: vi.fn(async (token?: string) => token === "session" ? account : null) };

describe("MCP OAuth connector", () => {
  beforeEach(() => {
    state.clients.clear();
    state.codes.clear();
    state.tokens.clear();
  });

  it("advertises MCP authorization metadata and registers only valid public clients", async () => {
    const { createMcpOAuthRouter } = await import("../../../server/bootstrap/mcp/oauth.js");
    const app = new Hono();
    app.route("/", createMcpOAuthRouter(identity as never));
    const resource = await app.request("/.well-known/oauth-protected-resource/mcp");
    expect(await resource.json()).toMatchObject({
      resource: "http://localhost:4100/mcp",
      authorization_servers: ["http://localhost:4100"],
    });

    const invalid = await app.request("/oauth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ redirect_uris: ["http://attacker.example/callback"] }),
    });
    expect(invalid.status).toBe(400);

    const registered = await app.request("/oauth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_name: "Claude", redirect_uris: ["http://localhost:3456/callback"] }),
    });
    expect(registered.status).toBe(201);
    expect(await registered.json()).toMatchObject({
      client_name: "Claude",
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
    });
  });

  it("requires session consent and PKCE, rotates refresh tokens, and revokes access", async () => {
    const { accountFromOAuthAccessToken, createMcpOAuthRouter } = await import("../../../server/bootstrap/mcp/oauth.js");
    const app = new Hono();
    app.route("/", createMcpOAuthRouter(identity as never));
    const clientResponse = await app.request("/oauth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_name: "Claude", redirect_uris: ["http://localhost:3456/callback"] }),
    });
    const { client_id: clientId } = await clientResponse.json();
    const verifier = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const params = new URLSearchParams({
      response_type: "code", client_id: clientId, redirect_uri: "http://localhost:3456/callback",
      code_challenge: challenge, code_challenge_method: "S256", state: "roundtrip",
    });
    const authorization = await app.request(`/oauth/authorize?${params}`, {
      headers: { cookie: "forja_session=session" },
    });
    expect(authorization.status).toBe(200);
    expect((await authorization.text())).toContain("Autorizar");
    const csrf = /forja_mcp_oauth_csrf=([^;]+)/.exec(authorization.headers.get("set-cookie") ?? "")?.[1];
    expect(csrf).toBeTruthy();

    const form = new URLSearchParams([...params.entries(), ["csrf", decodeURIComponent(csrf!)], ["decision", "approve"]]);
    const approved = await app.request("/oauth/authorize", {
      method: "POST",
      headers: {
        host: "localhost:4100",
        origin: "http://localhost:4100",
        cookie: `forja_session=session; forja_mcp_oauth_csrf=${csrf}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    expect(approved.status, await approved.clone().text()).toBe(302);
    const code = new URL(approved.headers.get("location")!).searchParams.get("code")!;
    expect(new URL(approved.headers.get("location")!).searchParams.get("state")).toBe("roundtrip");

    const exchange = (grant: URLSearchParams) => app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: grant,
    });
    const invalidExchange = await exchange(new URLSearchParams({
      grant_type: "authorization_code", client_id: clientId, code,
      redirect_uri: "http://localhost:3456/callback", code_verifier: `${verifier}wrong`,
    }));
    expect(invalidExchange.status).toBe(400);
    const issued = await exchange(new URLSearchParams({
      grant_type: "authorization_code", client_id: clientId, code,
      redirect_uri: "http://localhost:3456/callback", code_verifier: verifier,
    }));
    expect(issued.status).toBe(200);
    const tokens = await issued.json();
    expect(tokens).toMatchObject({ token_type: "Bearer", scope: "mcp", expires_in: 3600 });
    expect(await accountFromOAuthAccessToken(tokens.access_token)).toMatchObject({ id: account.id });

    const refreshed = await exchange(new URLSearchParams({
      grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token,
    }));
    expect(refreshed.status).toBe(200);
    const rotated = await refreshed.json();
    expect(rotated.refresh_token).not.toBe(tokens.refresh_token);
    expect((await exchange(new URLSearchParams({
      grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token,
    }))).status).toBe(400);

    await app.request("/oauth/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, token: rotated.access_token }),
    });
    expect(await accountFromOAuthAccessToken(rotated.access_token)).toBeNull();
  });
});
