import { readFileSync, readdirSync } from "node:fs";
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

  it("keeps accounts a delegating compatibility facade", () => {
    const source = readFileSync(join(process.cwd(), "server", "platform", "accounts.ts"), "utf8");
    expect(source).not.toMatch(/(?:select |insert into |update accounts |delete from |\.transaction\(|config\.|lib\/crypto)/i);
  });

  it("never calls back into the accounts facade from identity", () => {
    for (const file of sources(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(/platform\/accounts/);
  });
});
