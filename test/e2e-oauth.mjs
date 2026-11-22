// End-to-end test of social and OAuth sign-in with Better Auth, without real providers: a
// fake OAuth 2.0 / OpenID Connect server plays Google, a company SSO and any other service.
// Covers the users of a generated app (forja.auth.json, redirect and preview popup) and the
// studio's own sign-in.
//   npm run test:e2e:oauth
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { freshDatabase } from "./helpers/pg.mjs";
import { cookieJar, startFakeOAuth } from "./fakeOAuth.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5300 + Math.floor(Math.random() * 500);
const DATA = mkdtempSync(path.join(tmpdir(), "forja-e2e-oauth-"));
const BOOTSTRAP = "e2e-oauth-token-0123456789abcdef";
const idp = await startFakeOAuth();
const pgdb = await freshDatabase();
let serverLog = "";
const studioProviders = JSON.stringify({
  providers: {
    sso: { type: "oidc", name: "SSO de la empresa", discoveryUrl: idp.discoveryUrl, clientId: idp.clientId, clientSecret: idp.clientSecret },
  },
});
const server = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
  cwd: ROOT,
  env: {
    ...process.env, PORT: String(PORT), PUBLIC_URL: `http://localhost:${PORT}`, DATA_DIR: DATA, DATABASE_URL: pgdb.url, FORJA_SEED_FILE: "",
    SECRETS_KEY: "ef".repeat(32), FORJA_BOOTSTRAP_TOKEN: BOOTSTRAP, FORJA_OAUTH_PROVIDERS: studioProviders,
  },
});
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const finish = async () => {
  if (server.exitCode === null && server.signalCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
  await pgdb.drop();
  await idp.close();
  rmSync(DATA, { recursive: true, force: true });
};

/** HTTP like a browser tab: its own cookie jar; *.localhost hosts reach the Forja server. */
function call(jar, method, target, { body, headers = {} } = {}) {
  const url = new URL(target);
  const toForja = url.hostname === "localhost" || url.hostname.endsWith(".localhost");
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request({
      host: "127.0.0.1",
      port: toForja ? PORT : Number(url.port),
      method,
      path: url.pathname + url.search,
      headers: {
        host: url.host,
        ...(jar?.header() ? { cookie: jar.header() } : {}),
        ...(data ? { "content-type": "application/json" } : {}),
        ...headers,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const setCookies = res.headers["set-cookie"] ?? [];
        jar?.take({ headers: { getSetCookie: () => setCookies } });
        const text = Buffer.concat(chunks).toString();
        let json;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, location: res.headers.location, setCookies, text, json });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}
const ok = (cond, msg, extra) => {
  if (!cond) { console.error("FAIL:", msg, extra ?? ""); process.exitCode = 1; } else console.log("ok  ", msg);
};

/** Follows redirects across the app and the provider, like the browser does. */
async function follow(jar, start, origin, max = 8) {
  let res = await call(jar, "GET", start);
  const hops = [start];
  while (res.status >= 300 && res.status < 400 && res.location && hops.length < max) {
    const next = new URL(res.location, hops.at(-1)).toString();
    hops.push(next);
    res = await call(jar, "GET", next);
  }
  return { res, hops, final: hops.at(-1) };
}

try {
  const studio = `http://localhost:${PORT}`;
  const owner = cookieJar();
  for (let i = 0; i < 60; i++) {
    try { if ((await call(null, "GET", `${studio}/healthz`)).status === 200) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const setup = await call(owner, "POST", `${studio}/api/auth/setup`, { body: { token: BOOTSTRAP, email: "owner@example.com", password: "una contraseña larga", name: "Dueña" } });
  ok(setup.status === 200, "owner account", setup.text);
  const project = (await call(owner, "POST", `${studio}/api/projects`, { body: { prompt: "App con acceso social", template: "monolith" } })).json?.project;
  ok(!!project?.id, "project created");
  const pv = `http://pv-${project.id}.localhost:${PORT}`;
  const share = new URL(project.previewUrl).searchParams.get("share");
  const put = (p, content) => call(owner, "PUT", `${studio}/api/projects/${project.id}/file`, { body: { path: p, content } });
  const secret = (name, value) => call(owner, "PUT", `${studio}/api/projects/${project.id}/secrets`, { body: { name, value } });

  // --- forja.auth.json ------------------------------------------------------------------
  const bad = await put("forja.auth.json", JSON.stringify({ providers: { google: { clientId: "visible" } } }));
  ok(bad.status === 400 && /credenciales no van en el archivo/.test(bad.text), "forja.auth.json refuses inline credentials", bad.text);
  const manifest = {
    version: 1,
    providers: {
      google: {},
      empresa: { type: "oidc", name: "Empresa", discoveryUrl: idp.discoveryUrl },
      strava: {
        type: "oauth2", name: "Strava", authorizationUrl: idp.authorizationUrl, tokenUrl: idp.tokenUrl, userInfoUrl: idp.userInfoUrl,
        profile: { id: "id", email: "contact.email", name: "firstname", image: "photo" },
      },
    },
  };
  const saved = await put("forja.auth.json", JSON.stringify(manifest, null, 2));
  ok(saved.status === 200, "forja.auth.json saved", saved.text);
  for (const id of ["EMPRESA", "STRAVA"]) {
    await secret(`${id}_CLIENT_ID`, idp.clientId);
    await secret(`${id}_CLIENT_SECRET`, idp.clientSecret);
  }
  await put("pages/_index.tsx", `export default function Home() { return <h1>Hola</h1>; }\n`);

  // A visitor of the preview (it needs the share link).
  const tab = cookieJar();
  const entered = await call(tab, "GET", `${pv}/?share=${share}`);
  ok(entered.status === 302, "preview share link traded for a cookie", entered.status);
  const providers = await call(tab, "GET", `${pv}/_baas/auth/providers`);
  ok(JSON.stringify(providers.json?.providers) === JSON.stringify([{ id: "empresa", name: "Empresa" }, { id: "strava", name: "Strava" }]), "auth/providers lists the configured providers", providers.text);
  ok(providers.json?.missing?.[0]?.id === "google" && providers.json.missing[0].secrets.join() === "GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET", "preview reports providers whose secrets are missing", providers.text);

  // --- Redirect flow with OpenID Connect -------------------------------------------------
  idp.state.profile = { sub: "emp-1", email: "Ana@Example.com", email_verified: true, name: "Ana" };
  const flow = await follow(tab, `${pv}/_baas/auth/oauth/empresa/start?redirect=/panel?tab=1`);
  ok(flow.hops[1]?.startsWith(`${idp.origin}/authorize`), "start sends the browser to the provider", flow.hops.join(" → "));
  const authorize = new URL(flow.hops[1]);
  ok(authorize.searchParams.get("redirect_uri") === `${pv}/_baas/auth/oauth/callback/empresa`, "the callback URL is the app's own", authorize.searchParams.get("redirect_uri"));
  ok(authorize.searchParams.get("code_challenge_method") === "S256", "PKCE is used");
  ok(flow.final === `${pv}/panel?tab=1`, "after the callback the visitor is back on the page asked for", flow.hops.join(" → "));
  ok(!tab.names().some((n) => n.includes("forja_oa_")), "Better Auth's cookies are cleared", tab.names().join());
  const me = await call(tab, "GET", `${pv}/_baas/auth/me`);
  ok(me.json?.user?.email === "ana@example.com" && me.json.user.name === "Ana", "signed in as the provider's user", me.text);
  const anaId = me.json?.user?.id;

  // Same provider account again: the same user.
  const again = cookieJar();
  await call(again, "GET", `${pv}/?share=${share}`);
  await follow(again, `${pv}/_baas/auth/oauth/empresa/start`);
  ok((await call(again, "GET", `${pv}/_baas/auth/me`)).json?.user?.id === anaId, "the same provider account reaches the same user");

  // --- Account takeover protection ------------------------------------------------------
  const luis = cookieJar();
  await call(luis, "GET", `${pv}/?share=${share}`);
  const signup = await call(luis, "POST", `${pv}/_baas/auth/signup`, { body: { email: "luis@example.com", password: "contraseña-larga-1" } });
  ok(signup.status === 200, "a user with a password exists", signup.text);
  const attacker = cookieJar();
  await call(attacker, "GET", `${pv}/?share=${share}`);
  idp.state.profile = { id: 77, contact: { email: "luis@example.com" }, firstname: "Impostor" };
  const takeover = await follow(attacker, `${pv}/_baas/auth/oauth/strava/start?redirect=/login`);
  const takeoverUrl = new URL(takeover.final);
  ok(takeoverUrl.pathname === "/login" && /Ya existe una cuenta/.test(takeoverUrl.searchParams.get("auth_error") ?? ""), "an unverified address does not join an existing account", takeover.final);
  ok((await call(attacker, "GET", `${pv}/_baas/auth/me`)).json?.user === null, "and nobody is signed in");

  // A verified address from a provider does join it.
  idp.state.profile = { sub: "emp-2", email: "luis@example.com", email_verified: true, name: "Luis" };
  const linked = cookieJar();
  await call(linked, "GET", `${pv}/?share=${share}`);
  const linkedFlow = await follow(linked, `${pv}/_baas/auth/oauth/empresa/start`);
  const linkedMe = (await call(linked, "GET", `${pv}/_baas/auth/me`)).json?.user;
  ok(linkedMe?.id && linkedMe.id === signup.json?.user?.id, "a verified address joins the existing account", JSON.stringify({ linkedMe, signup: signup.json, final: linkedFlow.final }));

  // Any OAuth 2.0 profile shape, new account.
  idp.state.profile = { id: 501, contact: { email: "eva@example.com" }, firstname: "Eva" };
  const eva = cookieJar();
  await call(eva, "GET", `${pv}/?share=${share}`);
  await follow(eva, `${pv}/_baas/auth/oauth/strava/start`);
  const evaMe = (await call(eva, "GET", `${pv}/_baas/auth/me`)).json?.user;
  ok(evaMe?.email === "eva@example.com" && evaMe.name === "Eva", "an OAuth 2.0 provider creates the account from its mapped profile", JSON.stringify(evaMe));

  // A provider that shares no address.
  idp.state.profile = { id: 9, firstname: "Sin correo" };
  const noEmail = cookieJar();
  await call(noEmail, "GET", `${pv}/?share=${share}`);
  const noEmailFlow = await follow(noEmail, `${pv}/_baas/auth/oauth/strava/start?redirect=/login`);
  ok(/correo/.test(new URL(noEmailFlow.final).searchParams.get("auth_error") ?? ""), "a profile without an address comes back with the reason", noEmailFlow.final);

  // Unknown provider and open redirects.
  const unknown = await call(tab, "GET", `${pv}/_baas/auth/oauth/google/start?redirect=//evil.example`);
  ok(unknown.status === 302 && unknown.location.startsWith("/?auth_error="), "a provider without secrets is refused and the return stays on the app", unknown.location);

  // --- Preview popup inside the studio's iframe -----------------------------------------
  idp.state.profile = { sub: "emp-3", email: "popup@example.com", email_verified: true, name: "Popup" };
  const frame = cookieJar();
  await call(frame, "GET", `${pv}/?share=${share}`);
  const begin = await call(frame, "POST", `${pv}/_baas/auth/oauth/empresa/begin`, { body: { redirect: "/" } });
  ok(begin.status === 200 && begin.json?.url && begin.json?.poll, "begin returns a popup URL and a key to poll", begin.text);
  const pending = await call(frame, "POST", `${pv}/_baas/auth/oauth/poll`, { body: { poll: begin.json.poll } });
  ok(pending.json?.pending === true, "before the popup finishes the poll waits");
  const popup = cookieJar(); // a separate window: none of the iframe's cookies
  const popupFlow = await follow(popup, begin.json.url);
  ok(popupFlow.res.status === 200 && /Ya puedes volver/.test(popupFlow.res.text), "the popup reaches the private preview with its share token and finishes", popupFlow.hops.join(" → "));
  ok(!popup.names().some((n) => n.startsWith("forja_s_")), "the popup does not keep a session");
  const polled = await call(frame, "POST", `${pv}/_baas/auth/oauth/poll`, { body: { poll: begin.json.poll } });
  ok(polled.json?.user?.email === "popup@example.com", "the iframe trades the ticket for its session", polled.text);
  ok((await call(frame, "GET", `${pv}/_baas/auth/me`)).json?.user?.email === "popup@example.com", "the iframe is signed in");
  const reused = await call(frame, "POST", `${pv}/_baas/auth/oauth/poll`, { body: { poll: begin.json.poll } });
  ok(reused.json?.pending === true, "a ticket works once");

  // --- Published app: plain redirect, its own users ---------------------------------------
  const published = await call(owner, "POST", `${studio}/api/projects/${project.id}/publish`, { body: { slug: "acceso-social" } });
  ok(published.status === 200, "the app publishes with forja.auth.json", published.text);
  const site = `http://acceso-social.localhost:${PORT}`;
  idp.state.profile = { sub: "emp-9", email: "cliente@example.com", email_verified: true, name: "Cliente" };
  const visitorJar = cookieJar();
  const pubFlow = await follow(visitorJar, `${site}/_baas/auth/oauth/empresa/start?redirect=/cuenta`);
  ok(new URL(pubFlow.hops[1]).searchParams.get("redirect_uri") === `${site}/_baas/auth/oauth/callback/empresa`, "the published app has its own callback URL");
  ok(pubFlow.final === `${site}/cuenta`, "published sign-in returns to the page", pubFlow.hops.join(" → "));
  ok((await call(visitorJar, "GET", `${site}/_baas/auth/me`)).json?.user?.email === "cliente@example.com", "signed in to the published app");
  ok((await call(visitorJar, "POST", `${site}/_baas/auth/oauth/empresa/begin`, { body: {} })).status === 400, "the popup flow is preview-only");
  ok(!(await call(visitorJar, "GET", `${site}/_baas/auth/providers`)).json?.missing, "visitors of the published app do not see missing secrets");

  // --- The agent: setup_oauth over MCP ---------------------------------------------------
  const token = (await call(owner, "POST", `${studio}/api/tokens`, { body: { name: "e2e-oauth" } })).json?.token;
  const mcpHeaders = { authorization: `Bearer ${token}`, accept: "application/json, text/event-stream" };
  await call(null, "POST", `${studio}/mcp`, { headers: mcpHeaders, body: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "e2e", version: "1" } } } });
  let mcpId = 10;
  const second = (await call(owner, "POST", `${studio}/api/projects`, { body: { prompt: "Otra app", template: "monolith" } })).json?.project;
  const tool = async (name, args) => (await call(null, "POST", `${studio}/mcp`, { headers: mcpHeaders, body: { jsonrpc: "2.0", id: mcpId++, method: "tools/call", params: { name, arguments: { projectId: second.id, ...args } } } })).json?.result;
  const text = (r) => (r?.content ?? []).map((c) => c.text).join("\n");
  const configured = await tool("setup_oauth", {
    providers: ["google", "facebook"],
    providers_json: JSON.stringify({ keycloak: { type: "oidc", name: "Keycloak", discoveryUrl: "https://sso.example.com/realms/app/.well-known/openid-configuration" } }),
  });
  const out = text(configured);
  ok(!configured?.isError && /forja\.auth\.json guardado con: Google \(google\), Facebook \(facebook\), Keycloak \(keycloak\)/.test(out), "setup_oauth writes forja.auth.json", out);
  ok(out.includes(`http://pv-${second.id}.localhost:${PORT}/_baas/auth/oauth/callback/google`), "setup_oauth returns the redirect URL to register", out);
  const secrets = (await call(owner, "GET", `${studio}/api/projects/${second.id}/secrets`)).json?.secrets?.map((x) => x.name).sort().join();
  ok(secrets === "FACEBOOK_CLIENT_ID,FACEBOOK_CLIENT_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,KEYCLOAK_CLIENT_ID,KEYCLOAK_CLIENT_SECRET", "setup_oauth requests each provider's secrets", secrets);
  const refused = await tool("setup_oauth", { providers: ["myspace"] });
  ok(refused?.isError && /no es un proveedor integrado/.test(text(refused)), "unknown built-in names are refused", text(refused));
  const guide = text(await tool("get_guides", { topic: "social-auth" }));
  ok(/setup_oauth/.test(guide) && /signInWith/.test(guide), "the MCP guide explains social sign-in", guide.slice(0, 200));

  // --- The studio's own sign-in ---------------------------------------------------------
  const visitor = cookieJar();
  const status = await call(visitor, "GET", `${studio}/api/auth/oauth/providers`);
  ok(JSON.stringify(status.json?.providers) === JSON.stringify([{ id: "sso", name: "SSO de la empresa" }]), "the studio lists its providers", status.text);
  // The owner (password account) signs in with the company SSO: verified address, same account.
  idp.state.profile = { sub: "owner-sso", email: "owner@example.com", email_verified: true, name: "Dueña" };
  const studioFlow = await follow(visitor, `${studio}/api/auth/oauth/sso/start?redirect=/projects`);
  ok(studioFlow.hops.some((h) => h.startsWith(`${studio}/api/auth/oauth/callback/sso`)), "the studio's callback is under /api/auth/oauth", studioFlow.hops.join(" → "));
  ok(studioFlow.final === `${studio}/projects`, "back in the studio", studioFlow.final);
  const meStudio = await call(visitor, "GET", `${studio}/api/me`);
  ok(meStudio.json?.account?.email === "owner@example.com", "signed in to the studio as the existing account", meStudio.text);
  // A new address follows the signup policy, like the emailed code: open creates the account…
  idp.state.profile = { sub: "newcomer", email: "newcomer@example.com", email_verified: true, name: "Nueva" };
  const newcomer = cookieJar();
  await follow(newcomer, `${studio}/api/auth/oauth/sso/start`);
  ok((await call(newcomer, "GET", `${studio}/api/me`)).json?.account?.email === "newcomer@example.com", "with open signup a new address gets an account");
  // …closed does not.
  const closed = await call(owner, "PATCH", `${studio}/api/admin/settings`, { body: { signup: "closed" } });
  ok(closed.status === 200, "signup closed by the admin", closed.text);
  idp.state.profile = { sub: "stranger", email: "stranger@example.com", email_verified: true, name: "X" };
  const stranger = cookieJar();
  const strangerFlow = await follow(stranger, `${studio}/api/auth/oauth/sso/start`);
  ok(/auth_error=/.test(strangerFlow.final) && (await call(stranger, "GET", `${studio}/api/me`)).status === 401, "with closed signup a new address is refused", strangerFlow.final);
  // Google and Facebook from their own settings; the redirect URL is the studio's.
  const keys = await call(owner, "PATCH", `${studio}/api/admin/settings`, { body: { "auth.google.clientId": "g-id", "auth.google.clientSecret": "g-secret", "auth.facebook.clientId": "f-id", "auth.facebook.clientSecret": "f-secret" } });
  ok(keys.status === 200, "Google and Facebook keys saved in the settings", keys.text);
  const listed = (await call(visitor, "GET", `${studio}/api/auth/oauth/providers`)).json?.providers?.map((p) => p.id).join();
  ok(listed === "google,facebook,sso", "the studio offers Google, Facebook and the others", listed);
  const toGoogle = await call(cookieJar(), "GET", `${studio}/api/auth/oauth/google/start`);
  const googleUrl = new URL(toGoogle.location ?? "http://x");
  ok(googleUrl.origin === "https://accounts.google.com" && googleUrl.searchParams.get("redirect_uri") === `${studio}/api/auth/oauth/callback/google`, "Google receives the studio's callback", toGoogle.location);
  const toFacebook = await call(cookieJar(), "GET", `${studio}/api/auth/oauth/facebook/start`);
  ok(/facebook\.com/.test(toFacebook.location ?? "") && new URL(toFacebook.location).searchParams.get("client_id") === "f-id", "Facebook too", toFacebook.location);
  const badSetting = await call(owner, "PATCH", `${studio}/api/admin/settings`, { body: { "auth.providers": "{\"providers\":{\"nope\":{}}}" } });
  ok(badSetting.status === 400 && /no es un proveedor integrado/.test(badSetting.text), "a broken providers setting is refused", badSetting.text);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (process.exitCode) console.error(serverLog.slice(-4000));
  await finish();
}
