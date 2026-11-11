import type { ChildProcess } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createConnection, createServer, type AddressInfo } from "node:net";
import path from "node:path";
import type { BuildProblem, FileMap } from "../domain/publication.js";
import {
  APP_DIR, buildCommand, CACHE_DIR, detectSpringProject, jarDirectory, jvmCommand, parseSpringOutput, pickJar,
  springSources, WORK_DIR, type SpringBuildTool, type SpringProject,
} from "../domain/spring.js";
import type { LanguageSandboxMode, SandboxSpec } from "./languageSandbox.js";

type Env = "preview" | "published";
type Mode = Exclude<LanguageSandboxMode, "off">;
export interface SpringUser { id: string; email: string; name?: string | null; role?: string | null }
export interface SpringRequest {
  projectId: string;
  env: Env;
  base: string;
  /** Path after /_api/, without a leading slash. */
  routePath: string;
  files: FileMap;
  user: SpringUser | null;
}
export interface SpringRuntimeOptions {
  /** Per-project workspaces, dependency caches and built jars live under here. */
  root: string;
  mode(): LanguageSandboxMode;
  maxHeapMb: number;
  maxProcesses: number;
  idleMs: number;
  buildTimeoutMs: number;
  startTimeoutMs: number;
  requestTimeoutMs: number;
  maxBodyBytes: number;
  spawn(spec: SandboxSpec, mode: Mode): ChildProcess;
  /** Null when the sandbox and the build tool are usable; otherwise why not. */
  unavailable(tool: SpringBuildTool, mode: LanguageSandboxMode): Promise<string | null>;
  secrets(projectId: string, env: Env): Promise<Record<string, string>>;
  bridge: { url(): Promise<string>; grant(projectId: string, env: Env): string; revoke(token: string): void };
  log(projectId: string, entry: { env: Env; level: "info" | "error"; source: "endpoint" | "build"; message: string }): void;
}

/** `transient` failures (timeout, tool crash) are retried on the next call instead of cached. */
interface Build { ok: boolean; problems: BuildProblem[]; dir: string; transient?: boolean }
interface Proc {
  key: string;
  child: ChildProcess;
  port: number;
  dataToken: string;
  proxyToken: string;
  lastUsed: number;
  inFlight: number;
  exited: boolean;
}

const KEPT_BUILDS = 3;
const MAX_OUTPUT = 256 * 1024;
const HOP_BY_HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection", "te", "trailer", "host", "content-length", "cookie"]);

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export function springBuildKey(files: FileMap, project: SpringProject) {
  const sources = springSources(files);
  return hash(project.tool + "\0" + Object.keys(sources).map((f) => `${f}\0${sources[f]}`).join("\0")).slice(0, 32);
}

/**
 * Runs a project's Spring Boot backend: builds it with Maven/Gradle inside the language sandbox
 * (one dependency cache per project, so one build can never plant code another project picks up),
 * keeps one JVM per project and environment, and proxies /_api/* to it. A changed build starts a
 * new JVM and retires the old one once the new one answers; idle JVMs stop, and at most
 * `maxProcesses` run at once.
 */
export class SpringRuntime {
  private readonly builds = new Map<string, Promise<Build>>();
  private readonly procs = new Map<string, Proc>();
  private readonly starting = new Map<string, Promise<Proc>>();
  private buildQueue: Promise<unknown> = Promise.resolve();
  private sweeper: NodeJS.Timeout | null = null;

  constructor(private readonly o: SpringRuntimeOptions) {}

  /** Build problems of the project's JVM backend; [] when it has none. */
  async problems(files: FileMap, projectId?: string): Promise<BuildProblem[]> {
    const project = detectSpringProject(files);
    if (!project || !projectId) return [];
    const reason = await this.o.unavailable(project.tool, this.o.mode());
    if (reason) return [{ file: project.tool === "maven" ? "pom.xml" : "build.gradle", text: reason }];
    return (await this.build(projectId, files, project)).problems;
  }

  async handle(req: Request, input: SpringRequest): Promise<Response> {
    const project = detectSpringProject(input.files);
    if (!project) return json({ error: `No existe el endpoint ${req.method} /_api/${input.routePath}` }, 404);
    const reason = await this.o.unavailable(project.tool, this.o.mode());
    if (reason) return json({ error: `El backend Java no puede ejecutarse: ${reason}` }, 503);
    if (Number(req.headers.get("content-length") ?? 0) > this.o.maxBodyBytes) return json({ error: "Petición demasiado grande" }, 413);
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : new Uint8Array(await req.arrayBuffer());
    if (body && body.byteLength > this.o.maxBodyBytes) return json({ error: "Petición demasiado grande" }, 413);

    let proc: Proc;
    try {
      proc = await this.ensure(input, project);
    } catch (error) {
      if (error instanceof SpringBuildFailed) {
        this.o.log(input.projectId, { env: input.env, level: "error", source: "build", message: error.message });
        return json({ error: `No compila: ${error.message}` }, 500);
      }
      this.o.log(input.projectId, { env: input.env, level: "error", source: "endpoint", message: (error as Error).message });
      return json({ error: input.env === "preview" ? (error as Error).message : "Error interno" }, 502);
    }

    const headers = new Headers();
    for (const [k, v] of req.headers) if (!HOP_BY_HOP.has(k) && !k.startsWith("x-forja-")) headers.set(k, v);
    headers.set("x-forja-proxy-token", proc.proxyToken);
    headers.set("x-forja-env", input.env);
    headers.set("x-forja-base", input.base);
    if (input.user) headers.set("x-forja-user", Buffer.from(JSON.stringify(input.user)).toString("base64url"));
    const search = new URL(req.url).search;
    proc.inFlight++;
    proc.lastUsed = Date.now();
    try {
      const res = await fetch(`http://127.0.0.1:${proc.port}/${input.routePath}${search}`, {
        method: req.method,
        headers,
        body,
        redirect: "manual",
        signal: AbortSignal.timeout(this.o.requestTimeoutMs),
      });
      const out = new Headers();
      for (const [k, v] of res.headers) {
        // fetch already decoded the body; the length and encoding no longer describe it.
        if (HOP_BY_HOP.has(k) || k === "content-encoding" || k === "set-cookie") continue;
        out.set(k, v);
      }
      // Apps cannot overwrite the platform's own session cookies.
      for (const c of res.headers.getSetCookie()) if (!/^\s*forja_/i.test(c)) out.append("set-cookie", c);
      const payload = await res.arrayBuffer();
      return new Response(payload.byteLength ? payload : null, { status: res.status, headers: out });
    } catch (error) {
      const message = `${req.method} /_api/${input.routePath}: ${(error as Error).message}`;
      this.o.log(input.projectId, { env: input.env, level: "error", source: "endpoint", message });
      return json({ error: input.env === "preview" ? message : "Error interno" }, 502);
    } finally {
      proc.inFlight--;
      proc.lastUsed = Date.now();
    }
  }

  stopProject(projectId: string) {
    for (const [key, proc] of this.procs) if (key.startsWith(`${projectId}:`)) this.stopProc(key, proc);
  }

  /** Stops the project's JVMs and deletes its workspaces, dependency cache and builds. */
  async removeProject(projectId: string) {
    this.stopProject(projectId);
    for (const key of this.builds.keys()) if (key.startsWith(`${projectId}:`)) this.builds.delete(key);
    await rm(this.projectDir(projectId), { recursive: true, force: true }).catch(() => {});
  }

  stopAll() {
    for (const [key, proc] of this.procs) this.stopProc(key, proc);
    if (this.sweeper) clearInterval(this.sweeper);
    this.sweeper = null;
  }

  snapshot() {
    return [...this.procs].map(([key, p]) => ({ key, pid: p.child.pid ?? null, port: p.port, inFlight: p.inFlight, build: p.key }));
  }

  // --- Build ---------------------------------------------------------------------------

  private projectDir(projectId: string) {
    return path.join(this.o.root, "java", hash(projectId).slice(0, 24));
  }

  private build(projectId: string, files: FileMap, project: SpringProject): Promise<Build> {
    const key = springBuildKey(files, project);
    const id = `${projectId}:${key}`;
    let pending = this.builds.get(id);
    if (!pending) {
      pending = this.runBuild(projectId, key, files, project);
      this.builds.set(id, pending);
      pending.then((b) => { if (b.transient) this.builds.delete(id); }, () => this.builds.delete(id));
      if (this.builds.size > 64) this.builds.delete(this.builds.keys().next().value!);
    }
    return pending;
  }

  private async runBuild(projectId: string, key: string, files: FileMap, project: SpringProject): Promise<Build> {
    const base = this.projectDir(projectId);
    const dir = path.join(base, "builds", key);
    const jar = path.join(dir, "app.jar");
    if (await exists(jar)) return { ok: true, problems: [], dir };
    // Maven and Gradle are heavy: one build at a time on this host.
    const turn = this.buildQueue.then(() => this.compile(projectId, base, dir, files, project));
    this.buildQueue = turn.catch(() => {});
    return turn;
  }

  private async compile(projectId: string, base: string, dir: string, files: FileMap, project: SpringProject): Promise<Build> {
    const work = path.join(base, `work-${randomBytes(6).toString("hex")}`);
    const cache = path.join(base, "cache");
    const sources = springSources(files);
    try {
      await mkdir(cache, { recursive: true });
      for (const [file, content] of Object.entries(sources)) {
        const target = path.resolve(work, ...file.split("/"));
        if (!target.startsWith(work + path.sep)) continue;
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, content.startsWith("base64:") ? Buffer.from(content.slice(7), "base64") : content);
      }
      const { code, output, timedOut } = await this.exec({
        command: buildCommand(project, true),
        cwd: WORK_DIR,
        env: { MAVEN_OPTS: "-Xmx512m -XX:+UseSerialGC -XX:TieredStopAtLevel=1", GRADLE_OPTS: "-Xmx512m -XX:+UseSerialGC" },
        mounts: [{ host: work, target: WORK_DIR, writable: true }, { host: cache, target: CACHE_DIR, writable: true }],
      }, this.o.buildTimeoutMs);
      if (timedOut) return { ok: false, transient: true, problems: [{ file: "pom.xml", text: `La compilación tardó más de ${Math.round(this.o.buildTimeoutMs / 60_000)} min y se detuvo.` }], dir };
      if (code === null) return { ok: false, transient: true, problems: [{ file: "pom.xml", text: `No se pudo ejecutar la compilación: ${output.trim().slice(-500)}` }], dir };
      const problems = parseSpringOutput(project.tool, output, new Set(Object.keys(sources)), code !== 0, [WORK_DIR, work]);
      if (code !== 0) return { ok: false, problems, dir };
      const outDir = path.join(work, ...jarDirectory(project.tool).split("/"));
      const picked = pickJar(await readdir(outDir).catch(() => []));
      if (!picked) return { ok: false, problems: [{ file: "pom.xml", text: "La compilación no produjo un jar ejecutable: añade el plugin spring-boot-maven-plugin." }], dir };
      await mkdir(dir, { recursive: true });
      // The builder and app-runtime processes share this directory: publish the jar atomically.
      const tmp = path.join(dir, `app.jar.${randomBytes(6).toString("hex")}`);
      await copyFile(path.join(outDir, picked), tmp);
      await rename(tmp, path.join(dir, "app.jar"));
      await this.prune(base);
      this.o.log(projectId, { env: "preview", level: "info", source: "build", message: "Backend Java compilado." });
      return { ok: true, problems: [], dir };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  /** Keeps the newest builds and the ones a running JVM uses. */
  private async prune(base: string) {
    const root = path.join(base, "builds");
    const inUse = new Set([...this.procs.values()].map((p) => p.key));
    const entries = await Promise.all((await readdir(root).catch(() => [])).map(async (name) => ({ name, at: (await stat(path.join(root, name))).mtimeMs })));
    for (const old of entries.sort((a, b) => b.at - a.at).slice(KEPT_BUILDS)) {
      if (!inUse.has(old.name)) await rm(path.join(root, old.name), { recursive: true, force: true }).catch(() => {});
    }
  }

  private exec(spec: SandboxSpec, timeoutMs: number): Promise<{ code: number | null; output: string; timedOut: boolean }> {
    const mode = this.o.mode();
    if (mode === "off") return Promise.resolve({ code: null, output: "", timedOut: false });
    return new Promise((resolve) => {
      const child = this.o.spawn(spec, mode);
      let output = "";
      let timedOut = false;
      const append = (d: Buffer) => { output = (output + d.toString()).slice(-MAX_OUTPUT); };
      child.stdout?.on("data", append);
      child.stderr?.on("data", append);
      const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, timeoutMs);
      child.once("error", (error) => { clearTimeout(timer); resolve({ code: null, output: output + error.message, timedOut }); });
      child.once("close", (code) => { clearTimeout(timer); resolve({ code, output, timedOut }); });
    });
  }

  // --- Processes -----------------------------------------------------------------------

  private async ensure(input: SpringRequest, project: SpringProject): Promise<Proc> {
    const slot = `${input.projectId}:${input.env}`;
    const key = springBuildKey(input.files, project);
    const current = this.procs.get(slot);
    if (current && !current.exited && current.key === key) return current;
    const pendingKey = `${slot}:${key}`;
    let pending = this.starting.get(pendingKey);
    if (!pending) {
      pending = this.start(input, project, key, slot).finally(() => this.starting.delete(pendingKey));
      this.starting.set(pendingKey, pending);
    }
    return pending;
  }

  private async start(input: SpringRequest, project: SpringProject, key: string, slot: string): Promise<Proc> {
    const build = await this.build(input.projectId, input.files, project);
    if (!build.ok) throw new SpringBuildFailed(build.problems.map((p) => `${p.file}${p.line ? `:${p.line}` : ""} ${p.text}`).join("\n"));
    this.evict(slot);
    const mode = this.o.mode();
    if (mode === "off") throw new Error("Los runtimes de otros lenguajes están desactivados.");
    const port = await freePort();
    const dataToken = this.o.bridge.grant(input.projectId, input.env);
    const proxyToken = randomBytes(24).toString("hex");
    const env: Record<string, string> = {
      ...await this.o.secrets(input.projectId, input.env),
      SERVER_PORT: String(port),
      SERVER_ADDRESS: "127.0.0.1",
      FORJA_ENV: input.env,
      FORJA_DATA_URL: await this.o.bridge.url(),
      FORJA_DATA_TOKEN: dataToken,
      FORJA_PROXY_TOKEN: proxyToken,
    };
    const child = this.o.spawn({
      command: jvmCommand(`${APP_DIR}/app.jar`, { maxHeapMb: this.o.maxHeapMb, preview: input.env === "preview" }),
      cwd: APP_DIR,
      env,
      mounts: [{ host: build.dir, target: APP_DIR }],
    }, mode);
    const proc: Proc = { key, child, port, dataToken, proxyToken, lastUsed: Date.now(), inFlight: 0, exited: false };
    let tail = "";
    const pipe = (level: "info" | "error") => (d: Buffer) => {
      const text = d.toString();
      tail = (tail + text).slice(-4000);
      for (const secret of [dataToken, proxyToken]) if (text.includes(secret)) return;
      this.o.log(input.projectId, { env: input.env, level, source: "endpoint", message: text.trim().slice(0, 4000) });
    };
    child.stdout?.on("data", pipe("info"));
    child.stderr?.on("data", pipe("error"));
    const exited = new Promise<void>((resolve) => {
      const done = () => {
        proc.exited = true;
        this.o.bridge.revoke(dataToken);
        if (this.procs.get(slot) === proc) this.procs.delete(slot);
        resolve();
      };
      child.once("exit", done);
      child.once("error", (error) => { tail += error.message; done(); });
    });
    try {
      await waitForPort(port, this.o.startTimeoutMs, exited);
    } catch (error) {
      child.kill("SIGKILL");
      this.o.bridge.revoke(dataToken);
      throw new Error(`El backend Java no arrancó: ${(error as Error).message}\n${tail.slice(-1500)}`);
    }
    const previous = this.procs.get(slot);
    this.procs.set(slot, proc);
    if (previous && previous !== proc) this.retire(slot, previous);
    this.sweep();
    return proc;
  }

  /** Lets in-flight requests on a replaced JVM finish before stopping it. */
  private retire(slot: string, proc: Proc) {
    const stop = () => (proc.inFlight > 0 && !proc.exited ? setTimeout(stop, 500).unref() : this.stopProc(slot, proc));
    stop();
  }

  private evict(slot: string) {
    const others = [...this.procs].filter(([key]) => key !== slot);
    if (others.length < this.o.maxProcesses) return;
    const idle = others.filter(([, p]) => p.inFlight === 0).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [key, proc] of idle.slice(0, others.length - this.o.maxProcesses + 1)) this.stopProc(key, proc);
  }

  private stopProc(slot: string, proc: Proc) {
    if (this.procs.get(slot) === proc) this.procs.delete(slot);
    this.o.bridge.revoke(proc.dataToken);
    if (!proc.exited) proc.child.kill("SIGTERM");
  }

  private sweep() {
    if (this.sweeper) return;
    this.sweeper = setInterval(() => {
      const now = Date.now();
      for (const [slot, proc] of this.procs) if (proc.inFlight === 0 && now - proc.lastUsed > this.o.idleMs) this.stopProc(slot, proc);
      if (!this.procs.size && this.sweeper) { clearInterval(this.sweeper); this.sweeper = null; }
    }, Math.min(30_000, this.o.idleMs));
    this.sweeper.unref();
  }
}

export class SpringBuildFailed extends Error {}

async function exists(file: string) {
  try { await stat(file); return true; } catch { return false; }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

async function waitForPort(port: number, timeoutMs: number, exited: Promise<void>) {
  let dead = false;
  void exited.then(() => { dead = true; });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (dead) throw new Error("el proceso terminó al arrancar");
    if (await new Promise<boolean>((resolve) => {
      const socket = createConnection({ port, host: "127.0.0.1" });
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => resolve(false));
    })) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no respondió en ${Math.round(timeoutMs / 1000)} s`);
}
