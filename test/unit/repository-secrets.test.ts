import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => {
    const child = Object.assign(new EventEmitter(), { stdout: new PassThrough(), stderr: new PassThrough(), kill: vi.fn() });
    queueMicrotask(() => {
      child.stderr.write("failed with test-password-value child-secret-value postgres://forja:test-password-value@postgres/db");
      child.emit("close", 1);
    });
    return child;
  }),
}));
import { dockerCommand, DockerRepositoryRunner } from "../../server/modules/repository-runtime/index.js";

describe("repository deployment secret safety (TDD)", () => {
  it("redacts failed Docker command output and logs while passing only variable names in argv", async () => {
    const logs: string[] = [];
    await expect(dockerCommand(["run", "-e", "DATABASE_URL", "-e", "SECRETS_KEY"], {
      env: { POSTGRES_PASSWORD: "test-password-value", SECRETS_KEY: "child-secret-value", DATABASE_URL: "postgres://forja:test-password-value@postgres/db" },
      log: (line) => logs.push(line),
    })).rejects.toThrow("[redacted]");
    expect(logs.join("")).not.toContain("test-password-value");
    expect(logs.join("")).not.toContain("child-secret-value");
    const { spawn } = await import("node:child_process");
    expect(spawn).toHaveBeenCalledWith("docker", ["run", "-e", "DATABASE_URL", "-e", "SECRETS_KEY"], expect.objectContaining({ shell: false }));
  });
  it("reloads persisted environment secrets before redacting logs after a process restart", async () => {
    const runner = new DockerRepositoryRunner({
      enabled: true, contextRoot: ".",
      environmentSecret: async () => ({ password: "saved-db-password", key: "saved-child-key" }),
      command: async () => "Database saved-db-password and encryption saved-child-key",
    });
    const text = await runner.logs({ container: "owned", origin: "", revisionId: "r" }, "project", "published");
    expect(text).not.toContain("saved-db-password");
    expect(text).not.toContain("saved-child-key");
  });
});
