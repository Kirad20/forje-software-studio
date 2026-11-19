import http from "node:http";

/**
 * A minimal OAuth 2.0 / OpenID Connect provider for tests. /authorize approves at once and
 * sends the browser back with a code; /token checks the code, the client and the PKCE
 * verifier; /userinfo returns the profile set for the next sign-in.
 */
export async function startFakeOAuth({ clientId = "client-1", clientSecret = "secret-1" } = {}) {
  const codes = new Map();
  const tokens = new Map();
  const state = {
    profile: { sub: "user-1", email: "ana@example.com", email_verified: true, name: "Ana", picture: "https://img.example/ana.png" },
    requests: [],
  };
  const sha256url = async (v) => Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v))).toString("base64url");
  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { "content-type": "application/json", ...headers });
    res.end(JSON.stringify(body));
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://fake");
    state.requests.push(`${req.method} ${url.pathname}`);
    const origin = `http://127.0.0.1:${server.address().port}`;
    if (url.pathname === "/.well-known/openid-configuration") {
      return send(res, 200, {
        issuer: origin,
        authorization_endpoint: `${origin}/authorize`,
        token_endpoint: `${origin}/token`,
        userinfo_endpoint: `${origin}/userinfo`,
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      });
    }
    if (url.pathname === "/authorize") {
      if (url.searchParams.get("client_id") !== clientId) return send(res, 400, { error: "invalid_client" });
      const code = `code-${Math.random().toString(36).slice(2)}`;
      codes.set(code, {
        challenge: url.searchParams.get("code_challenge"),
        redirectUri: url.searchParams.get("redirect_uri"),
        profile: { ...state.profile },
        scope: url.searchParams.get("scope"),
      });
      const back = new URL(url.searchParams.get("redirect_uri"));
      back.searchParams.set("code", code);
      back.searchParams.set("state", url.searchParams.get("state") ?? "");
      res.writeHead(302, { location: back.toString() });
      return res.end();
    }
    if (url.pathname === "/token" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const form = new URLSearchParams(body);
      const basic = (req.headers.authorization ?? "").startsWith("Basic ")
        ? Buffer.from(req.headers.authorization.slice(6), "base64").toString().split(":")
        : [form.get("client_id"), form.get("client_secret")];
      if (basic[0] !== clientId || basic[1] !== clientSecret) return send(res, 401, { error: "invalid_client" });
      const entry = codes.get(form.get("code"));
      codes.delete(form.get("code"));
      if (!entry || entry.redirectUri !== form.get("redirect_uri")) return send(res, 400, { error: "invalid_grant" });
      if (entry.challenge && (await sha256url(form.get("code_verifier") ?? "")) !== entry.challenge) return send(res, 400, { error: "invalid_grant", error_description: "pkce" });
      const access = `at-${Math.random().toString(36).slice(2)}`;
      tokens.set(access, entry.profile);
      return send(res, 200, { access_token: access, token_type: "Bearer", expires_in: 3600, scope: entry.scope });
    }
    if (url.pathname === "/userinfo") {
      const profile = tokens.get((req.headers.authorization ?? "").replace(/^Bearer /, ""));
      return profile ? send(res, 200, profile) : send(res, 401, { error: "invalid_token" });
    }
    send(res, 404, { error: "not_found" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin,
    clientId,
    clientSecret,
    state,
    discoveryUrl: `${origin}/.well-known/openid-configuration`,
    authorizationUrl: `${origin}/authorize`,
    tokenUrl: `${origin}/token`,
    userInfoUrl: `${origin}/userinfo`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** Follows a sign-in like a browser would: start URL → provider → callback, carrying cookies. */
export function cookieJar() {
  const jar = new Map();
  return {
    header: () => [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
    take(response) {
      for (const c of response.headers.getSetCookie()) {
        const [pair, ...attrs] = c.split(";");
        const i = pair.indexOf("=");
        const name = pair.slice(0, i).trim();
        const value = pair.slice(i + 1).trim();
        if (!value || attrs.some((a) => /^\s*max-age=0\s*$/i.test(a))) jar.delete(name);
        else jar.set(name, value);
      }
    },
    get: (name) => jar.get(name),
    names: () => [...jar.keys()],
  };
}
