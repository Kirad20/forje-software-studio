import type { AppEnv } from "../domain/contracts.js";
import type { ProjectDb } from "../ports/database.js";
import type { CacheRepository } from "../ports/cache.js";
import { CACHE_LIMITS } from "../application/cache.js";

export const PROJECT_CACHE_SCHEMA = `
create table if not exists _forja_cache (
  env text not null check (env in ('preview', 'published')),
  cache_key text not null check (length(cache_key) between 1 and ${CACHE_LIMITS.keyLength}),
  value jsonb not null,
  expires_at timestamptz not null,
  primary key (env, cache_key)
);
create index if not exists _forja_cache_expiration_idx on _forja_cache(env, expires_at);
create table if not exists _forja_cache_locks (
  env text primary key check (env in ('preview', 'published'))
);
insert into _forja_cache_locks (env) values ('preview'), ('published') on conflict do nothing;
`;

export function createProjectCacheRepository(db: ProjectDb): CacheRepository {
  return {
    async get<T>(env: AppEnv, key: string): Promise<T | undefined> {
      const cached = await db.one<{ value: T }>(
        "select value from _forja_cache where env = $1 and cache_key = $2 and expires_at > now()",
        [env, key],
      );
      if (cached) return cached.value;
      await db.query("delete from _forja_cache where env = $1 and cache_key = $2 and expires_at <= now()", [env, key]);
      return undefined;
    },
    async set(env: AppEnv, key: string, value: string, ttlSeconds: number) {
      await db.transaction(async (tx) => {
        const lock = await tx.one<{ env: AppEnv }>("select env from _forja_cache_locks where env = $1 for update", [env]);
        if (!lock) throw new Error("El bloqueo de caché del proyecto no está inicializado");
        await tx.query("delete from _forja_cache where env = $1 and expires_at <= now()", [env]);
        const existing = await tx.one<{ cache_key: string }>(
          "select cache_key from _forja_cache where env = $1 and cache_key = $2",
          [env, key],
        );
        if (!existing) {
          const count = await tx.one<{ count: number }>(
            "select count(*)::int as count from _forja_cache where env = $1",
            [env],
          );
          if (!count) throw new Error("No se pudo determinar la capacidad de caché del proyecto");
          if (count.count >= CACHE_LIMITS.entriesPerEnvironment) {
            throw new Error(`La caché alcanzó ${CACHE_LIMITS.entriesPerEnvironment} claves activas para este entorno`);
          }
        }
        await tx.query(
          `insert into _forja_cache (env, cache_key, value, expires_at)
           values ($1, $2, $3::jsonb, now() + ($4::int * interval '1 second'))
           on conflict (env, cache_key) do update set value = excluded.value, expires_at = excluded.expires_at`,
          [env, key, value, ttlSeconds],
        );
      });
    },
    async delete(env: AppEnv, key: string) {
      await db.query("delete from _forja_cache where env = $1 and cache_key = $2", [env, key]);
    },
  };
}
