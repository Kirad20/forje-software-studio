import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The skills copied from open-source projects (server/builder/skills) bring their own tests: not ours to run.
    exclude: [...configDefaults.exclude, "server/builder/skills/**"],
    // Every test file that needs Postgres creates and migrates its own database, and all files start together:
    // the first beforeAll sometimes took more than the default 10 s on a busy server (seen on catalog, metrics, settings).
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
