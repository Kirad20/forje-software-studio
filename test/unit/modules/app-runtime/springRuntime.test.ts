import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { detectSpringProject, jvmCommand, parseSpringOutput, springSources } from "../../../../server/modules/app-runtime/domain/spring.js";
import { sandboxInvocation, type SandboxSpec } from "../../../../server/modules/app-runtime/infrastructure/languageSandbox.js";
import { RuntimeDataBridge } from "../../../../server/modules/app-runtime/infrastructure/runtimeDataBridge.js";
import { SpringRuntime } from "../../../../server/modules/app-runtime/infrastructure/springRuntime.js";

const POM = "<project><parent><artifactId>spring-boot-starter-parent</artifactId></parent></project>";
const CONTROLLER = "src/main/java/app/TodoController.java";

describe("Spring domain", () => {
  it("builds only the JVM sources and keeps the frontend out", () => {
    const files = { "pom.xml": POM, [CONTROLLER]: "class A {}", "pages/_index.tsx": "x", "src/main/resources/application.yml": "a: 1" };
    expect(detectSpringProject(files)).toEqual({ tool: "maven" });
    expect(detectSpringProject({ "pom.xml": "<project/>" })).toBeNull();
    expect(Object.keys(springSources(files))).toEqual(["pom.xml", "src/main/java/app/TodoController.java", "src/main/resources/application.yml"]);
  });

  it("maps compiler errors printed with a host workspace path back to project files", () => {
    const out = "[ERROR] C:\\data\\work-1\\src\\main\\java\\app\\TodoController.java:[3,9] cannot find symbol\n[ERROR]   symbol:   class Foo";
    expect(parseSpringOutput("maven", out, new Set([CONTROLLER]), true, ["/work", "C:\\data\\work-1"])).toEqual([
      { file: CONTROLLER, line: 3, column: 9, text: "Java: cannot find symbol symbol:   class Foo" },
    ]);
  });

  it("starts previews with C1 only and bounds the heap", () => {
    expect(jvmCommand("/app/app.jar", { maxHeapMb: 200, preview: true })).toEqual(expect.arrayContaining(["-Xmx200m", "-XX:TieredStopAtLevel=1", "-jar", "/app/app.jar"]));
    expect(jvmCommand("/app/app.jar", { maxHeapMb: 200, preview: false })).not.toContain("-XX:TieredStopAtLevel=1");
  });
});

describe("language sandbox", () => {
  const spec: SandboxSpec = {
    command: ["mvn", "-Dmaven.repo.local=/cache/m2", "package"],
    cwd: "/work",
    env: { SECRET_FROM_PROJECT: "1" },
    mounts: [{ host: "/srv/forja/runtimes/java/abc/work-1", target: "/work", writable: true }, { host: "/srv/forja/runtimes/java/abc/cache", target: "/cache", writable: true }],
  };

  it("bubblewrap sees only system dirs and the listed mounts, with an empty environment", () => {
    const inv = sandboxInvocation(spec, "bwrap", { SECRETS_KEY: "platform", DATABASE_URL: "postgres://x" });
    const args = inv.args.join(" ");
    expect(inv.command).toBe("bwrap");
    expect(inv.env).toEqual({});
    expect(args).toContain("--clearenv");
    expect(args).toContain("--unshare-pid");
    expect(args).toContain("--bind /srv/forja/runtimes/java/abc/cache /cache");
    expect(args).toContain("--setenv SECRET_FROM_PROJECT 1");
    expect(args).not.toMatch(/SECRETS_KEY|DATABASE_URL|\/srv\/forja\/projects/);
    expect(inv.args.slice(-4)).toEqual(["--", "mvn", "-Dmaven.repo.local=/cache/m2", "package"]);
  });

  it("unsafe mode rewrites mount paths and passes no platform secrets", () => {
    const inv = sandboxInvocation(spec, "unsafe", { PATH: "/usr/bin", SECRETS_KEY: "platform" });
    expect(inv.args).toEqual(["-Dmaven.repo.local=/srv/forja/runtimes/java/abc/cache/m2", "package"]);
    expect(inv.cwd).toBe("/srv/forja/runtimes/java/abc/work-1");
    expect(inv.env).toEqual({ PATH: "/usr/bin", SECRET_FROM_PROJECT: "1" });
  });
});

// Stands in for Maven (writes the jar or fails like javac) and for the JVM (an HTTP server on SERVER_PORT).
const FAKE_MAVEN = `
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(process.cwd(), ${JSON.stringify(CONTROLLER)}), "utf8");
if (src.includes("broken")) { console.log("[ERROR] " + path.join(process.cwd(), ${JSON.stringify(CONTROLLER)}) + ":[2,5] cannot find symbol"); process.exit(1); }
fs.mkdirSync("target", { recursive: true });
fs.writeFileSync("target/app-0.0.1.jar", src);
fs.writeFileSync("target/app-0.0.1-plain.jar", "");
`;
const FAKE_JVM = `
const http = require("http");
http.createServer(async (req, res) => {
  if (req.url === "/rows") {
    const r = await fetch(process.env.FORJA_DATA_URL + "/query", { method: "POST", headers: { authorization: "Bearer " + process.env.FORJA_DATA_TOKEN }, body: JSON.stringify({ sql: "select 1", params: [7] }) });
    res.writeHead(r.status, { "content-type": "application/json" });
    return res.end(await r.text());
  }
  let body = ""; for await (const c of req) body += c;
  res.writeHead(201, { "content-type": "application/json", "set-cookie": ["forja_session=evil", "theme=dark"] });
  res.end(JSON.stringify({
    method: req.method, url: req.url, body,
    proxyOk: req.headers["x-forja-proxy-token"] === process.env.FORJA_PROXY_TOKEN,
    user: req.headers["x-forja-user"] ? JSON.parse(Buffer.from(req.headers["x-forja-user"], "base64url").toString()) : null,
    cookie: req.headers.cookie ?? null, secret: process.env.API_KEY, jar: require("fs").readFileSync("app.jar", "utf8").length > 0,
  }));
}).listen(Number(process.env.SERVER_PORT), process.env.SERVER_ADDRESS);
`;

describe("SpringRuntime", () => {
  let root: string;
  let runtime: SpringRuntime;
  let bridge: RuntimeDataBridge;
  const spawned: string[] = [];
  const queries: unknown[] = [];
  let unavailable: string | null = null;

  beforeAll(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "forja-spring-"));
    bridge = new RuntimeDataBridge({
      query: async (projectId, env, sql, params) => { queries.push({ projectId, env, sql, params }); return [{ projectId, env }]; },
      exec: async () => {},
    });
    runtime = new SpringRuntime({
      root, mode: () => "unsafe", maxHeapMb: 64, maxProcesses: 4, idleMs: 60_000, buildTimeoutMs: 30_000,
      startTimeoutMs: 15_000, requestTimeoutMs: 15_000, maxBodyBytes: 1024,
      spawn: (spec, mode) => {
        const inv = sandboxInvocation(spec, mode);
        spawned.push(spec.command[0]!);
        return spawn(process.execPath, ["-e", spec.command[0] === "mvn" ? FAKE_MAVEN : FAKE_JVM], { cwd: inv.cwd, env: inv.env, stdio: ["ignore", "pipe", "pipe"] });
      },
      unavailable: async () => unavailable,
      secrets: async () => ({ API_KEY: "k-123" }),
      bridge,
      log: () => {},
    });
  });

  afterAll(async () => {
    runtime.stopAll();
    bridge.close();
    await rm(root, { recursive: true, force: true });
  });

  const files = (source = "class TodoController {}") => ({ "pom.xml": POM, [CONTROLLER]: source, "pages/_index.tsx": "export default () => null" });
  const call = (f: Record<string, string>, route: string, init: RequestInit = {}, env: "preview" | "published" = "preview") =>
    runtime.handle(new Request(`http://app.test/_api/${route}`, init), {
      projectId: "p1", env, base: "", routePath: route.split("?")[0]!, files: f, user: { id: "u1", email: "ana@example.com", name: "Ána" },
    });

  it("reports javac errors against the project file", async () => {
    expect(await runtime.problems(files("broken"), "p1")).toEqual([{ file: CONTROLLER, line: 2, column: 5, text: "Java: cannot find symbol" }]);
    expect(await runtime.problems(files("broken"))).toEqual([]);
  });

  it("proxies /_api to the JVM with the user, the proxy token and the project's secrets, never the platform cookie", async () => {
    const res = await call(files(), "todos?page=2", { method: "POST", body: "{\"t\":1}", headers: { cookie: "forja_s_p1=abc", "content-type": "application/json" } });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      method: "POST", url: "/todos?page=2", body: "{\"t\":1}", proxyOk: true, cookie: null, secret: "k-123", jar: true,
      user: { id: "u1", email: "ana@example.com", name: "Ána" },
    });
    expect(res.headers.getSetCookie()).toEqual(["theme=dark"]);
  });

  it("gives the JVM data access scoped to its own project and environment", async () => {
    const res = await call(files(), "rows");
    expect(await res.json()).toEqual({ rows: [{ projectId: "p1", env: "preview" }] });
    expect(queries).toEqual([{ projectId: "p1", env: "preview", sql: "select 1", params: [7] }]);
    const forged = await fetch(`${await bridge.url()}/query`, { method: "POST", headers: { authorization: `Bearer ${"0".repeat(64)}` }, body: "{\"sql\":\"select 1\"}" });
    expect(forged.status).toBe(401);
  });

  it("reuses the running JVM and swaps it when the Java sources change", async () => {
    const before = spawned.filter((c) => c === "java").length;
    await call(files(), "todos");
    expect(spawned.filter((c) => c === "java").length).toBe(before);
    const [{ pid: oldPid }] = runtime.snapshot();
    const res = await call(files("class TodoController { int v2; }"), "todos");
    expect(res.status).toBe(201);
    expect(spawned.filter((c) => c === "mvn").length).toBe(3);
    const [{ pid: newPid }] = runtime.snapshot();
    expect(newPid).not.toBe(oldPid);
  });

  it("rejects oversized bodies and explains when the toolchain is missing", async () => {
    expect((await call(files(), "todos", { method: "POST", body: "x".repeat(2048) })).status).toBe(413);
    unavailable = "Java no está instalado en este servidor.";
    const res = await call(files(), "todos");
    expect(res.status).toBe(503);
    expect(await runtime.problems(files(), "p1")).toEqual([{ file: "pom.xml", text: "Java no está instalado en este servidor." }]);
    unavailable = null;
  });

  it("stops every JVM on shutdown", async () => {
    runtime.stopAll();
    expect(runtime.snapshot()).toEqual([]);
  });
});
