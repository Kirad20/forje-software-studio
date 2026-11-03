import { configDefaults, defineConfig } from "vitest/config";

// The skills copied from open-source projects (server/builder/skills) bring their own tests: not ours to run.
export default defineConfig({ test: { exclude: [...configDefaults.exclude, "server/builder/skills/**"] } });
