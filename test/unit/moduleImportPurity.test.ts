import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  platformDb: vi.fn(async () => { throw new Error("Database must not start on import"); }),
  q: vi.fn(async () => []),
  one: vi.fn(async () => undefined),
}));

vi.mock("../../server/shared/database/index.js", async (original) => ({
  ...await original<typeof import("../../server/shared/database/index.js")>(),
  ...database,
}));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("public module imports acquire neither databases nor background timers", async () => {
  vi.useFakeTimers();
  const interval = vi.spyOn(globalThis, "setInterval");
  const modules = path.resolve("server", "modules");
  const entries = readdirSync(modules, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => readdirSync(path.join(modules, entry.name))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => path.join(modules, entry.name, file)));
  expect(entries.length).toBeGreaterThan(12);
  for (const entry of entries) await import(pathToFileURL(entry).href);
  expect(database.platformDb).not.toHaveBeenCalled();
  expect(database.q).not.toHaveBeenCalled();
  expect(database.one).not.toHaveBeenCalled();
  expect(interval).not.toHaveBeenCalled();
});
