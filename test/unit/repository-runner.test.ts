import { afterAll, describe, expect, it, vi } from "vitest";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { DockerRepositoryRunner, selectBuildFiles, inferRepositoryConfig, type DockerCommand } from "../../server/modules/repository-runtime/index.js";
afterAll(async () => { await rm(path.resolve("test", ".repository-context-unit"), { recursive: true, force: true }); });

describe("Docker repository runner safety (TDD)", () => {
  it("keeps the real Forja layout and lockfile but excludes graph and secrets", () => {
    expect(Object.keys(selectBuildFiles({
      "Dockerfile": "FROM node", "package.json": "{}", "package-lock.json": "{}",
      "server/bootstrap/server.ts": "server", "studio/src/main.tsx": "ui", ".env.example": "example",
      ".env": "secret", ".env.production": "secret", "graphify-out/graph.json": "graph",
      "node_modules/pkg/index.js": "dependency", ".git/config": "git", "data/private": "data",
    }, "."))).toEqual(["Dockerfile", "package.json", "package-lock.json", "server/bootstrap/server.ts", "studio/src/main.tsx", ".env.example"]);
  });
  it("rejects traversal rather than writing outside the immutable context", () => {
    expect(() => selectBuildFiles({ "../escape": "bad" }, ".")).toThrow();
  });
  it("requires explicit Docker opt-in", async () => {
    const command = vi.fn();
    const runner = new DockerRepositoryRunner({ enabled: false, contextRoot: ".", command });
    expect(await runner.available()).toBe(false);
    expect(command).not.toHaveBeenCalled();
  });
  it("deploys non-root with limits, isolated resources and no host mounts or Docker socket", async () => {
    const commands: string[][] = [];
    const command: DockerCommand = async (args) => {
      commands.push(args);
      if (args[0] === "image") return '{"Id":"sha256:immutable","Config":{"User":"node"}}';
      if (args[0] === "inspect") return JSON.stringify({ State: { Running: true }, NetworkSettings: { Ports: { "3000/tcp": [{ HostPort: "30001" }] } } });
      return "ok";
    };
    const runner = new DockerRepositoryRunner({ enabled: true, contextRoot: ".", command, environmentSecret: async () => ({ password: "dbsecret", key: "keysecret" }) });
    await runner.deploy("project", "preview", { id: "revision", image: "sha256:immutable", status: "ready", createdAt: "", error: null }, { ...inferRepositoryConfig({}), postgres: true, storagePath: "/app/data" }, "https://preview.test");
    const app = commands.find((c) => c[0] === "run" && c.includes("sha256:immutable"))!;
    expect(app).toContain("--cap-drop=ALL");
    expect(app).toContain("--security-opt=no-new-privileges");
    expect(app).toContain("--memory=1g");
    expect(app).toContain("--pids-limit=256");
    expect(app).toContain("--cpus=1");
    expect(app.join(" ")).not.toContain("docker.sock");
    expect(app.join(" ")).not.toContain("dbsecret");
    expect(app).toContain("SECRETS_KEY");
    expect(app).toContain("DATABASE_URL");
    expect(app.filter((a) => a.includes("storage"))[0]).toContain("preview");
  });
  it("refuses a root image before creating resources", async () => {
    const command = vi.fn(async () => '{"Id":"sha256:root","Config":{"User":"root"}}');
    const runner = new DockerRepositoryRunner({ enabled: true, contextRoot: ".", command });
    await expect(runner.deploy("p", "preview", { id: "r", image: "sha256:root", status: "ready", error: null, createdAt: "" }, inferRepositoryConfig({}), "https://test")).rejects.toMatchObject({ status: 422 });
    expect(command).toHaveBeenCalledTimes(1);
  });
  it("preserves binary asset bytes in immutable Docker context", async () => {
    let actual: Buffer | undefined;
    const command: DockerCommand = async (args) => {
      if (args[0] === "build") actual = await readFile(path.join(args.at(-1)!, "public", "icon.png"));
      return '{"Id":"sha256:image","Config":{"User":"node"}}';
    };
    const runner = new DockerRepositoryRunner({ enabled: true, contextRoot: path.resolve("test", ".repository-context-unit"), command });
    const bytes = Buffer.from([0, 255, 128, 42]);
    await runner.build("binary", "r", { "package.json": "{}", "public/icon.png": `base64:${bytes.toString("base64")}` }, inferRepositoryConfig({}), () => {});
    expect(actual).toEqual(bytes);
  });
  it("reports missing Docker as unavailable and direct build as an explicit runner error", async () => {
    const command: DockerCommand = async () => { throw new Error("spawn docker ENOENT"); };
    const runner = new DockerRepositoryRunner({ enabled: true, contextRoot: path.resolve("test", ".repository-context-unit"), command });
    expect(await runner.available()).toBe(false);
    await expect(runner.build("missing", "r", { "package.json": "{}" }, inferRepositoryConfig({}), () => {})).rejects.toThrow("ENOENT");
  });
});
