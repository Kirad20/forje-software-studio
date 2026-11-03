import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
const scopes = ["integrations", "usage", "memory", "project-observability"];
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith(".ts") ? [join(dir, entry.name)] : []);
}
it("owned platform contexts have pure usecases and no cross-context driver imports", () => {
  for (const scope of scopes) for (const path of files(join(process.cwd(), "server", "modules", scope))) {
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)) {
      const specifier = match[1]!;
      expect(specifier, path).not.toMatch(/(?:\.\.\/\.\.\/(?:integrations|usage|memory|project-observability|app-runtime|app-services|projects|builder)|modules\/(?:app-runtime|app-services|projects|builder))/);
      if (path.includes(`${join("application", "")}`)) {
        expect(specifier, path).toMatch(/^\.\//);
        expect(specifier, path).not.toMatch(/infrastructure|shared|node:/);
      }
    }
  }
});
