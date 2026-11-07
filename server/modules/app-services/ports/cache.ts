import type { AppEnv } from "../domain/contracts.js";

export interface CacheRepository {
  get<T>(env: AppEnv, key: string): Promise<T | undefined>;
  set(env: AppEnv, key: string, value: string, ttlSeconds: number): Promise<void>;
  delete(env: AppEnv, key: string): Promise<void>;
}
