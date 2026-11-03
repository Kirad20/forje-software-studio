import { expect, it } from "vitest";
import { ROOT_DIR } from "../../server/shared/config.js";
import { MIGRATIONS_DIR } from "../../server/shared/database/migrate.js";
import path from "node:path";
import { existsSync } from "node:fs";

it("relocated infrastructure resolves the repository and unchanged migration versions", () => {
  expect(ROOT_DIR).toBe(path.resolve("."));
  expect(MIGRATIONS_DIR).toBe(path.resolve("server", "shared", "database", "migrations"));
  expect(existsSync(path.join(MIGRATIONS_DIR, "001_init.sql"))).toBe(true);
  expect(existsSync(path.join(MIGRATIONS_DIR, "002_admin.sql"))).toBe(true);
  expect(existsSync(path.join(MIGRATIONS_DIR, "003_task_criteria.sql"))).toBe(true);
  expect(existsSync(path.join(MIGRATIONS_DIR, "004_org_skills.sql"))).toBe(true);
});
