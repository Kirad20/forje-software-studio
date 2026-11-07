// A small in-memory GitHub REST API: users, repos, the Git Data API (blobs, trees,
// commits, refs) and the contents API, with real git blob ids. Enough for Forja's sync.
import http from "node:http";
import { createHash, generateKeyPairSync } from "node:crypto";

const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const blobId = (buf) => createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");

export function startFakeGithub({ token = "ghp_testtoken_0123456789abcdef", login = "octo" } = {}) {
  const blobs = new Map(); // sha -> Buffer
  const trees = new Map(); // sha -> Map(path -> blobSha)
  const commits = new Map(); // sha -> { tree, parents, message, author }
  const repos = new Map(); // "owner/name" -> { name, owner, default_branch, refs: Map }
  const calls = [];
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const app = { id: 1234, slug: "forja-fake", name: "Forja fake", owner: { login }, client_id: "fake-client", client_secret: "fake-client-secret", pem: privateKey.export({ type: "pkcs1", format: "pem" }), webhook_secret: "fake-app-webhook" };
  const installations = new Map([[42, { id: 42, app_id: app.id, account: { login: "example-org" }, permissions: { contents: "write", metadata: "read" }, suspended_at: null }]]);
  const selectedRepos = new Map([[42, new Set()]]);
  const appTokens = new Map();
  const repoView = (repo) => ({ id: [...repos.values()].indexOf(repo) + 1, name: repo.name, full_name: `${repo.owner}/${repo.name}`, owner: { login: repo.owner }, default_branch: repo.default_branch, private: repo.private ?? true, description: repo.description ?? null, archived: repo.archived ?? false, permissions: { push: repo.writable !== false } });

  const putBlob = (buf) => {
    const id = blobId(buf);
    blobs.set(id, buf);
    return id;
  };
  const putTree = (map) => {
    const id = sha1("tree" + JSON.stringify([...map.entries()].sort()));
    trees.set(id, new Map(map));
    return id;
  };
  const putCommit = (c) => {
    const id = sha1("commit" + JSON.stringify(c) + Math.random());
    commits.set(id, c);
    return id;
  };

  /** Simulates someone pushing to the branch from outside Forja. */
  function pushExternal(full, branch, files, message = "Cambio desde GitHub", deletions = []) {
    const repo = repos.get(full);
    const head = repo.refs.get(branch);
    const base = head ? new Map(trees.get(commits.get(head).tree)) : new Map();
    for (const [p, content] of Object.entries(files)) base.set(p, putBlob(Buffer.from(content)));
    for (const p of deletions) base.delete(p);
    const sha = putCommit({ tree: putTree(base), parents: head ? [head] : [], message, author: { name: "Dev Externo" } });
    repo.refs.set(branch, sha);
    return sha;
  }

  /** The files on a branch, as text. */
  function filesAt(full, branch) {
    const repo = repos.get(full);
    const head = repo?.refs.get(branch);
    if (!head) return {};
    return Object.fromEntries([...trees.get(commits.get(head).tree)].map(([p, b]) => [p, blobs.get(b).toString("utf8")]));
  }

  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const send = (status, body) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(body === undefined ? "" : JSON.stringify(body));
      };
      const url = new URL(req.url, "http://x");
      calls.push(`${req.method} ${url.pathname}`);
      const body = raw ? JSON.parse(raw) : {};
      const p = url.pathname;
      let m;
      const credential = (req.headers.authorization ?? "").replace(/^Bearer /, "");
      let jwt;
      try { jwt = JSON.parse(Buffer.from(credential.split(".")[1], "base64url").toString("utf8")); } catch {}
      const isApp = jwt?.iss === String(app.id);
      const installationId = appTokens.get(credential);
      if (req.method === "POST" && p === "/app-manifests/fake-manifest-code/conversions") return send(201, app);
      if (credential !== token && !isApp && installationId == null) return send(401, { message: "Bad credentials" });
      if (req.method === "GET" && p === "/user/repos") {
        const page = Number(url.searchParams.get("page") ?? 1);
        return send(200, [...repos.values()].map(repoView).slice((page - 1) * 100, page * 100));
      }
      if (isApp && (m = /^\/app\/installations\/(\d+)(\/access_tokens)?$/.exec(p))) {
        const id = Number(m[1]), i = installations.get(id);
        if (!i || i.suspended_at) return send(404, { message: "Not Found" });
        if (req.method === "GET" && !m[2]) return send(200, i);
        if (req.method === "POST" && m[2]) {
          const minted = `installation-${id}-${appTokens.size}`;
          appTokens.set(minted, id);
          return send(201, { token: minted, expires_at: new Date(Date.now() + 3600000).toISOString() });
        }
      }
      if (req.method === "GET" && p === "/installation/repositories" && installationId != null) {
        const rows = [...(selectedRepos.get(installationId) ?? [])].map((full) => repos.get(full)).filter(Boolean).map(repoView);
        const page = Number(url.searchParams.get("page") ?? 1);
        return send(200, { total_count: rows.length, repositories: rows.slice((page - 1) * 100, page * 100) });
      }
      if (req.method === "GET" && p === "/user") return send(200, { login });
      if (req.method === "POST" && p === "/user/repos") {
        const full = `${login}/${body.name}`;
        if (repos.has(full)) return send(422, { message: "name already exists on this account" });
        const repo = { name: body.name, owner: login, default_branch: "main", private: !!body.private, refs: new Map() };
        repos.set(full, repo);
        if (body.auto_init) pushExternal(full, "main", { "README.md": `# ${body.name}\n` }, "Initial commit");
        return send(201, { name: repo.name, owner: { login }, default_branch: "main" });
      }
      if ((m = /^\/repos\/([^/]+)\/([^/]+)(\/.*)?$/.exec(p))) {
        const full = `${m[1]}/${m[2]}`;
        const repo = repos.get(full);
        if (!repo) return send(404, { message: "Not Found" });
        const rest = m[3] ?? "";
        if (req.method === "GET" && rest === "/installation" && isApp) {
          const selected = [...selectedRepos].find(([, selected]) => selected.has(full));
          return selected ? send(200, installations.get(selected[0])) : send(404, { message: "Not Found" });
        }
        if (installationId != null && !selectedRepos.get(installationId)?.has(full)) return send(403, { message: "Repository not selected" });
        let r;
        if (req.method === "GET" && rest === "") return send(200, repoView(repo));
        if (req.method === "GET" && rest === "/branches") {
          const page = Number(url.searchParams.get("page") ?? 1);
          return send(200, [...repo.refs.keys()].slice((page - 1) * 100, page * 100).map((name) => ({ name })));
        }
        if (req.method === "GET" && (r = /^\/branches\/(.+)$/.exec(rest))) {
          const name = decodeURIComponent(r[1]);
          return repo.refs.has(name) ? send(200, { name }) : send(404, { message: "Branch not found" });
        }
        if (req.method === "GET" && (r = /^\/git\/ref\/heads\/(.+)$/.exec(rest))) {
          if (!repo.refs.size) return send(409, { message: "Git Repository is empty." });
          const sha = repo.refs.get(decodeURIComponent(r[1]));
          return sha ? send(200, { object: { sha } }) : send(404, { message: "Not Found" });
        }
        if (req.method === "PATCH" && (r = /^\/git\/refs\/heads\/(.+)$/.exec(rest))) {
          const branch = decodeURIComponent(r[1]);
          const cur = repo.refs.get(branch);
          const next = commits.get(body.sha);
          if (!next) return send(422, { message: "Object does not exist" });
          if (cur && !body.force && !next.parents.includes(cur)) return send(422, { message: "Update is not a fast forward" });
          repo.refs.set(branch, body.sha);
          return send(200, { object: { sha: body.sha } });
        }
        if (req.method === "GET" && (r = /^\/git\/commits\/(\w+)$/.exec(rest))) {
          const c = commits.get(r[1]);
          return c ? send(200, { sha: r[1], tree: { sha: c.tree }, parents: c.parents.map((sha) => ({ sha })), message: c.message, author: c.author }) : send(404, { message: "Not Found" });
        }
        if (req.method === "POST" && rest === "/git/commits") {
          if (!trees.has(body.tree)) return send(422, { message: "Tree does not exist" });
          return send(201, { sha: putCommit({ tree: body.tree, parents: body.parents ?? [], message: body.message, author: body.author }) });
        }
        if (req.method === "POST" && rest === "/git/blobs") {
          return send(201, { sha: putBlob(Buffer.from(body.content, body.encoding === "base64" ? "base64" : "utf8")) });
        }
        if (req.method === "GET" && (r = /^\/git\/blobs\/(\w+)$/.exec(rest))) {
          const b = blobs.get(r[1]);
          return b ? send(200, { content: b.toString("base64"), encoding: "base64", size: b.length }) : send(404, { message: "Not Found" });
        }
        if (req.method === "POST" && rest === "/git/trees") {
          const map = body.base_tree ? new Map(trees.get(body.base_tree) ?? []) : new Map();
          for (const e of body.tree) {
            if (e.sha === null) map.delete(e.path);
            else if (typeof e.content === "string") map.set(e.path, putBlob(Buffer.from(e.content)));
            else map.set(e.path, e.sha);
          }
          return send(201, { sha: putTree(map) });
        }
        if (req.method === "GET" && (r = /^\/git\/trees\/(\w+)$/.exec(rest))) {
          const t = trees.get(r[1]);
          if (!t) return send(404, { message: "Not Found" });
          return send(200, { sha: r[1], tree: [...t].map(([path, sha]) => ({ path, type: "blob", sha, size: blobs.get(sha).length, mode: "100644" })), truncated: false });
        }
        if (req.method === "PUT" && (r = /^\/contents\/(.+)$/.exec(rest))) {
          pushExternal(full, body.branch || repo.default_branch, { [r[1]]: Buffer.from(body.content, "base64").toString("utf8") }, body.message);
          return send(201, { content: { path: r[1] } });
        }
      }
      send(404, { message: `No route ${req.method} ${p}` });
    });
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, token, login, repos, pushExternal, filesAt, calls, app, installations, selectedRepos, createEmptyRepo: (name, owner = login) => repos.set(`${owner}/${name}`, { name, owner, default_branch: "main", refs: new Map() }) })),
  );
}
