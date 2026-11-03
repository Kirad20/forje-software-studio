import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "server", "modules", "identity");
function sources(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sources(join(path, entry.name)) : entry.name.endsWith(".ts") ? [join(path, entry.name)] : [],
  );
}

describe("identity hexagonal boundaries", () => {
  it("keeps the core independent of runtime and infrastructure", () => {
    for (const layer of ["domain", "application", "ports"]) {
      for (const file of sources(join(root, layer))) {
        expect(readFileSync(file, "utf8"), file).not.toMatch(/(?:from\s+|import\s*\()["'][^"']*(?:platform|config|lib\/crypto|node:|infrastructure)/);
      }
    }
  });

  it("exposes identity policies through an injected module factory and public account contract", () => {
    const entry = readFileSync(join(root, "index.ts"), "utf8");
    const contracts = readFileSync(join(root, "contracts.ts"), "utf8");
    expect(entry).toContain("createIdentityModule");
    expect(entry).not.toMatch(/new Postgres|shared\/config|import\(["'][^"']*collaboration/);
    expect(contracts).toContain("export type Account = PublicAccount");
    expect(existsSync(join(root, "accounts.ts"))).toBe(false);
    expect(existsSync(join(root, "bootstrap.ts"))).toBe(false);
  });

  it("never calls back into the accounts facade from identity", () => {
    for (const file of sources(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(/platform\/accounts/);
  });
});
