import type { AppEnv } from "../domain/contracts.js";
import type { CacheRepository } from "../ports/cache.js";

export const CACHE_LIMITS = {
  keyLength: 200,
  valueBytes: 64 * 1024,
  ttlSeconds: 7 * 24 * 60 * 60,
  entriesPerEnvironment: 1000,
} as const;

export interface ProjectCache {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

function validateKey(key: string) {
  if (typeof key !== "string" || !key.length || key.length > CACHE_LIMITS.keyLength) {
    throw new Error(`La clave de caché debe tener entre 1 y ${CACHE_LIMITS.keyLength} caracteres`);
  }
}

function serialize(value: unknown) {
  let encoded: string | undefined;
  try {
    encoded = JSON.stringify(value);
  } catch {
    throw new Error("El valor de caché debe ser serializable como JSON");
  }
  if (encoded === undefined) throw new Error("El valor de caché debe ser serializable como JSON");
  if (new TextEncoder().encode(encoded).byteLength > CACHE_LIMITS.valueBytes) {
    throw new Error(`El valor de caché supera ${CACHE_LIMITS.valueBytes} bytes`);
  }
  return encoded;
}

export function createProjectCache(repository: CacheRepository, env: AppEnv): ProjectCache {
  return {
    async get<T>(key: string) {
      validateKey(key);
      return repository.get<T>(env, key);
    },
    async set(key, value, ttlSeconds) {
      validateKey(key);
      if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > CACHE_LIMITS.ttlSeconds) {
        throw new Error(`El TTL debe ser un entero entre 1 y ${CACHE_LIMITS.ttlSeconds} segundos`);
      }
      await repository.set(env, key, serialize(value), ttlSeconds);
    },
    async delete(key) {
      validateKey(key);
      await repository.delete(env, key);
    },
  };
}
