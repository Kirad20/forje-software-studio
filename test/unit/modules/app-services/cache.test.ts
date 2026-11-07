import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";
import type { ProjectDb } from "../../../../server/modules/app-services/ports/database.js";
import { CACHE_LIMITS, createProjectCache, PROJECT_CACHE_SCHEMA } from "../../../../server/modules/app-services/application/cache.js";

describe("project cache", () => {
  let pg: PGlite | undefined;

  afterEach(async () => {
    await pg?.close();
    pg = undefined;
  });

  async function database(): Promise<ProjectDb> {
    pg = await PGlite.create();
    await pg.exec(PROJECT_CACHE_SCHEMA);
    return {
      query: async (sql, params = []) => (await pg!.query(sql, params)).rows as never,
      one: async (sql, params = []) => (await pg!.query(sql, params)).rows[0] as never,
      exec: async (sql) => { await pg!.exec(sql); },
      transaction: async (fn) => pg!.transaction((tx) => fn({
        query: async (sql, params = []) => (await tx.query(sql, params)).rows as never,
        one: async (sql, params = []) => (await tx.query(sql, params)).rows[0] as never,
      })),
    };
  }

  it("shares JSON entries between replicas while keeping preview and published environments separate", async () => {
    const db = await database();
    const previewReplicaA = createProjectCache(db, "preview");
    const previewReplicaB = createProjectCache(db, "preview");
    const published = createProjectCache(db, "published");

    await previewReplicaA.set("orders:42", { status: "pending" }, 60);
    expect(await previewReplicaB.get<{ status: string }>("orders:42")).toEqual({ status: "pending" });
    expect(await published.get("orders:42")).toBeUndefined();
    await published.set("orders:42", { status: "published" }, 60);
    expect(await previewReplicaB.get("orders:42")).toEqual({ status: "pending" });
    await previewReplicaB.delete("orders:42");
    expect(await previewReplicaA.get("orders:42")).toBeUndefined();
  });

  it("expires entries and validates keys, TTL, and JSON payload size", async () => {
    const db = await database();
    const cache = createProjectCache(db, "preview");
    await cache.set("expired", "value", 60);
    await db.query("update _forja_cache set expires_at = now() - interval '1 second' where cache_key = $1", ["expired"]);

    expect(await cache.get("expired")).toBeUndefined();
    expect(await db.one("select cache_key from _forja_cache where cache_key = $1", ["expired"])).toBeUndefined();
    await expect(cache.get("x".repeat(CACHE_LIMITS.keyLength + 1))).rejects.toThrow(/clave de caché/);
    await expect(cache.set("key", "value", 0)).rejects.toThrow(/TTL/);
    await expect(cache.set("key", undefined, 60)).rejects.toThrow(/JSON/);
    await expect(cache.set("large", "x".repeat(CACHE_LIMITS.valueBytes), 60)).rejects.toThrow(/bytes/);
  });

  it("caps active keys per environment but permits updating an existing key", async () => {
    const db = await database();
    const cache = createProjectCache(db, "preview");
    await db.query(
      `insert into _forja_cache (env, cache_key, value, expires_at)
       select 'preview', 'key-' || n, to_jsonb(n), now() + interval '1 hour'
       from generate_series(1, $1::int) as n`,
      [CACHE_LIMITS.entriesPerEnvironment],
    );

    await expect(cache.set("overflow", "value", 60)).rejects.toThrow(/alcanzó/);
    await expect(cache.set("key-1", "updated", 60)).resolves.toBeUndefined();
  });
});
