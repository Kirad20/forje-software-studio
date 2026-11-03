import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { freshDatabase } from "../helpers/pg.mjs";

it("a real configuration startup failure exits without leaving PostgreSQL alive", async () => {
  const database = await freshDatabase();
  const directory = mkdtempSync(path.join(os.tmpdir(), "forja-bootstrap-failure-"));
  const seed = path.join(directory, "invalid.json");
  writeFileSync(seed, "{invalid-json");
  const child = spawn(process.execPath, ["--import", "tsx", "server/bootstrap/server.ts"], {
    env: {
      ...process.env, DATABASE_URL: database.url, DATA_DIR: directory,
      SECRETS_KEY: "ab".repeat(32), FORJA_SEED_FILE: seed,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });
  let timer: NodeJS.Timeout | undefined;
  try {
    const exit = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code) => resolve(code));
      timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Startup failed to release resources: ${output}`));
      }, 8000);
    });
    expect(output).toContain("no es JSON válido");
    expect(exit).toBe(1);
  } finally {
    if (timer) clearTimeout(timer);
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await database.drop();
    rmSync(directory, { recursive: true, force: true });
  }
}, 15000);
