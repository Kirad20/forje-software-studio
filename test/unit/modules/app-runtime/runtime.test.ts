import { fork } from "node:child_process";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createPublication } from "../../../../server/modules/app-runtime/application/publication.js";
import { createBuildVerification } from "../../../../server/modules/app-runtime/application/build.js";
import { createShareAccess } from "../../../../server/modules/app-runtime/application/share.js";
import { createDependencyResolution } from "../../../../server/modules/app-runtime/application/dependencies.js";
import { buildClient, buildExamples, checkProject, compileServerModule } from "../../../../server/modules/app-runtime/index.js";
import { readDeps, writeDeps } from "../../../../server/modules/app-runtime/domain/dependencies.js";
import { KIT_CATALOG } from "../../../../server/modules/app-runtime/domain/catalog.js";

describe("runtime ports and policies", () => {
  it("keeps the real publication snapshot unchanged on an actual compiler error", async () => {
    let live = { "pages/_index.tsx": "old published app" };
    const recordPublish = vi.fn(async (_id: string, _slug: string, files: typeof live) => { live = files; });
    const scheduleProject = vi.fn(async () => {});
    const scan = vi.fn(async () => []);
    const publication = createPublication({
      getProject: async () => ({ id: "p", name: "Working app" }),
      isSlugTaken: async () => false,
      readAllFiles: async () => ({ "pages/_index.tsx": "export default function Broken() { return <main> }" }),
      checkProject, scan, recordPublish, scheduleProject,
      unpublish: async () => {}, appUrl: (slug) => `http://${slug}.localhost`,
    });
    await expect(publication.publishProject("p", "new-app")).rejects.toThrow("No se publicó: la app tiene errores");
    expect(live).toEqual({ "pages/_index.tsx": "old published app" });
    expect(recordPublish).not.toHaveBeenCalled();
    expect(scheduleProject).not.toHaveBeenCalled();
    expect(scan).not.toHaveBeenCalled();
  });

  it("runs typechecking only after successful compilation", async () => {
    const typecheck = vi.fn(async () => [{ file: "pages/a.tsx", text: "wrong type" }]);
    const compile = vi.fn(async () => [{ file: "pages/a.tsx", text: "syntax" }]);
    const verify = createBuildVerification({ compile, typecheck });
    expect((await verify({})).ok).toBe(false);
    expect(typecheck).not.toHaveBeenCalled();
    compile.mockResolvedValue([]);
    expect(await verify({})).toEqual({ ok: false, problems: [{ file: "pages/a.tsx", text: "wrong type" }] });
    expect(typecheck).toHaveBeenCalledOnce();
  });

  it("enforces share scope, expiration, complete token syntax and origin isolation", () => {
    let now = 1_000_000;
    const access = createShareAccess({
      now: () => now, publicUrl: () => "https://studio.example.test",
      sign: (id, epoch, exp) => `${id}-${epoch}-${exp}`, equal: (a, b) => a === b,
    });
    const scope = { id: "one", shareEpoch: 3 };
    const token = access.shareToken(scope, 1);
    expect(access.checkShareToken(scope, token)).toBe(true);
    expect(access.checkShareToken({ ...scope, id: "two" }, token)).toBe(false);
    expect(access.checkShareToken({ ...scope, shareEpoch: 4 }, token)).toBe(false);
    expect(access.checkShareToken(scope, `${token}.extra`)).toBe(false);
    expect(access.checkShareToken(scope, "3.not-an-expiry.x")).toBe(false);
    now += 86_400_001;
    expect(access.checkShareToken(scope, token)).toBe(false);
    expect(access.parseAppHost("pv-one.studio.example.test:443")).toEqual({ kind: "preview", projectId: "one" });
    expect(access.parseAppHost("app.studio.example.test.evil")).toBeNull();
    expect(access.parseAppHost("nested.app.studio.example.test")).toBeNull();
  });

  it("resolves only catalog versions through the registry port, leaving manifest policy pure", async () => {
    const lookup = vi.fn(async () => ({ version: "4.1.0", deprecated: "old", scripts: { install: "native" } }));
    const resolve = createDependencyResolution({ isNodeBuiltin: (name) => name.startsWith("node:"), lookup });
    await expect(resolve("unknown-package")).rejects.toThrow("catálogo");
    await expect(resolve("node:fs")).rejects.toThrow("módulo de Node");
    expect(lookup).not.toHaveBeenCalled();
    const result = await resolve("date-fns", "^1.0.0");
    expect(lookup).toHaveBeenCalledWith("date-fns", KIT_CATALOG["date-fns"]!.version);
    expect(result.warnings).toHaveLength(3);
    expect(() => readDeps({ "package.json": "null" })).toThrow();
    const manifest = writeDeps({ "package.json": '{"name":"app"}' }, { zeta: "1.0.0", alfa: "2.0.0" });
    expect(Object.keys(JSON.parse(manifest).dependencies)).toEqual(["alfa", "zeta"]);
  });
});

describe("real technical adapters after relocation", () => {
  it("compiles virtual relative imports, both aliases, SDK internal files, layout, 404 and CSS", async () => {
    const files = {
      "base.css": "body { color: red; }",
      "pages/_index.tsx": 'import { Button } from "@forja/ui"; import { value } from "~/helpers/value"; export default () => <Button>{value}</Button>;',
      "pages/_layout.tsx": "export default ({ children }) => <section>{children}</section>;",
      "pages/_404.tsx": "export default () => <h1>Missing page</h1>;",
      "helpers/value.ts": 'export { value } from "@/helpers/number";',
      "helpers/number.ts": "export const value = 42;",
      "components/Card.example.tsx": "export function Basic() { return <p>Example rendered</p> }",
    };
    const built = await buildClient(files);
    expect(built.js).toContain("Missing page");
    expect(built.css).toContain("red");
    expect((await buildExamples(files, "components/Card.example.tsx")).js).toContain("Example rendered");
    expect(await checkProject(files)).toEqual([]);
  }, 120_000);

  it("executes a compiled endpoint in the relocated worker with filesystem permission restrictions", async () => {
    const module = await compileServerModule({
      "helpers/message.ts": 'export const message = "sandbox relocated";',
      "endpoints/run_GET.ts": [
        'import { readFileSync } from "node:fs";',
        'import { message } from "~/helpers/message";',
        'export default async () => { let blocked = false; try { readFileSync("package.json"); } catch { blocked = true; }',
        'return { message, blocked, secret: process.env.FORJA_TEST_PLATFORM_SECRET ?? null }; };',
      ].join("\n"),
    }, "endpoints/run_GET.ts");
    const worker = path.join(process.cwd(), "server", "modules", "app-runtime", "infrastructure", "sandboxWorker.mjs");
    const child = fork(worker, [], {
      execArgv: ["--permission", `--allow-fs-read=${path.join(process.cwd(), "node_modules")}`, `--allow-fs-read=${worker}`],
      env: { NODE_ENV: "production", SYSTEMROOT: process.env.SYSTEMROOT ?? "" },
      serialization: "advanced", stdio: ["ignore", "ignore", "ignore", "ipc"],
    });
    try {
      const result = await new Promise<{ ok: boolean; value: { data: unknown } }>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Sandbox worker startup timeout")), 15_000);
        child.once("error", reject);
        child.once("exit", (code) => { clearTimeout(timeout); reject(new Error(`Sandbox exited ${code}`)); });
        child.on("message", (message: any) => {
          if (message.t === "ready") child.send({ t: "run", run: 1, kind: "endpoint", input: { file: module.file, env_name: "preview", env: {}, base: "", method: "GET", url: "http://pv-one.localhost/_api/run", headers: [], query: {} } });
          if (message.t === "done") { clearTimeout(timeout); resolve(message); }
        });
      });
      expect(result.ok).toBe(true);
      expect(result.value.data).toEqual({ message: "sandbox relocated", blocked: true, secret: null });
    } finally { child.kill(); }
  }, 30_000);
});
