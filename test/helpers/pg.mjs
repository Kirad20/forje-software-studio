// A throwaway Postgres database per test run, on the server of TEST_DATABASE_URL.
//   const db = await freshDatabase(); … process.env.DATABASE_URL = db.url; … await db.drop();
import { randomBytes } from "node:crypto";
import pg from "pg";

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "postgres://forja:forja@127.0.0.1:5433/postgres";

export async function freshDatabase() {
  const name = `forja_t_${randomBytes(6).toString("hex")}`;
  const admin = new pg.Client({ connectionString: TEST_DATABASE_URL });
  try {
    await admin.connect();
  } catch (e) {
    throw new Error(`No hay Postgres para los tests en ${TEST_DATABASE_URL} (${e.message}). Arranca uno con: docker run -d -p 5433:5432 -e POSTGRES_USER=forja -e POSTGRES_PASSWORD=forja postgres:17-alpine`);
  }
  await admin.query(`create database ${name}`);
  await admin.end();
  const url = new URL(TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  return {
    url: url.toString(),
    async drop() {
      const c = new pg.Client({ connectionString: TEST_DATABASE_URL });
      await c.connect();
      await c.query(`drop database if exists ${name} with (force)`);
      await c.end();
    },
  };
}
