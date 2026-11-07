import { decrypt, encrypt } from "../../../shared/crypto.js";
import { platformDb, type PlatformDb } from "../../../shared/database/index.js";
import type { RepositoryState } from "../domain/repository.js";
import { RepositoryRuntimeError } from "../domain/repository.js";
import type { RepositoryStore } from "../ports/runtime.js";

export class PostgresRepositoryStore implements RepositoryStore {
  constructor(private readonly database: () => Promise<PlatformDb> = platformDb) {}
  async load(id: string): Promise<RepositoryState | undefined> {
    const db = await this.database();
    const row = (await db.query<{ state: RepositoryState }>("select state from repository_runtime_configs where project_id=$1", [id])).rows[0];
    if (!row) return undefined;
    const revisions = (await db.query<{ revision: RepositoryState["revisions"][number] }>("select revision from repository_runtime_revisions where project_id=$1 order by created_at,id", [id])).rows.map((r) => r.revision);
    const deployments = (await db.query<{ env: "preview" | "published"; deployment: NonNullable<RepositoryState["deployments"]["preview"]> }>("select env,deployment from repository_runtime_deployments where project_id=$1", [id])).rows;
    return { ...row.state, revisions, deployments: Object.fromEntries(deployments.map((d) => [d.env, d.deployment])) };
  }
  async save(id: string, state: RepositoryState): Promise<void> {
    const db = await this.database();
    await db.transaction(async (tx) => {
      const { revisions, deployments, ...metadata } = state;
      await tx.query("insert into repository_runtime_configs(project_id,state) values($1,$2::jsonb) on conflict(project_id) do update set state=excluded.state", [id, JSON.stringify(metadata)]);
      for (const revision of revisions) {
        await tx.query("insert into repository_runtime_revisions(project_id,id,created_at,revision) values($1,$2,$3,$4::jsonb) on conflict(project_id,id) do update set revision=excluded.revision", [id, revision.id, revision.createdAt, JSON.stringify(revision)]);
      }
      for (const env of ["preview", "published"] as const) {
        if (deployments[env]) {
          await tx.query("insert into repository_runtime_deployments(project_id,env,deployment) values($1,$2,$3::jsonb) on conflict(project_id,env) do update set deployment=excluded.deployment", [id, env, JSON.stringify(deployments[env])]);
        } else await tx.query("delete from repository_runtime_deployments where project_id=$1 and env=$2", [id, env]);
      }
    });
  }
  async list() { return (await (await this.database()).query<{ project_id: string }>("select project_id from repository_runtime_configs")).rows.map((r) => r.project_id); }
  async delete(id: string) {
    await (await this.database()).transaction(async (tx) => {
      await tx.query("delete from repository_runtime_configs where project_id=$1", [id]);
      await tx.query("delete from repository_runtime_secrets where project_id=$1", [id]);
    });
  }
  async exclusive<T>(id: string, work: () => Promise<T>) {
    return (await this.database()).transaction(async (tx) => {
      const row = (await tx.query<{ locked: boolean }>("select pg_try_advisory_xact_lock(hashtextextended($1, 715)) as locked", [id])).rows[0];
      if (!row?.locked) throw new RepositoryRuntimeError("Repository operation already in progress", 409);
      return work();
    });
  }
  async buildSlot<T>(work: () => Promise<T>) {
    return (await this.database()).transaction(async (tx) => {
      for (let slot = 0; slot < 2; slot++) {
        const row = (await tx.query<{ locked: boolean }>("select pg_try_advisory_xact_lock(715, $1) as locked", [slot])).rows[0];
        if (row?.locked) return work();
      }
      throw new RepositoryRuntimeError("Repository build capacity reached; try again later", 409);
    });
  }
  async environmentSecret(id: string, env: "preview" | "published"): Promise<{ password: string; key: string }> {
    const db = await this.database();
    const existing = (await db.query<{ encrypted_secrets: string }>("select encrypted_secrets from repository_runtime_secrets where project_id=$1 and env=$2", [id, env])).rows[0];
    if (existing) return JSON.parse(decrypt(existing.encrypted_secrets));
    const { randomBytes } = await import("node:crypto");
    const value = { password: randomBytes(32).toString("hex"), key: randomBytes(32).toString("hex") };
    await db.query("insert into repository_runtime_secrets(project_id,env,encrypted_secrets) values($1,$2,$3) on conflict(project_id,env) do nothing", [id, env, encrypt(JSON.stringify(value))]);
    const stored = (await db.query<{ encrypted_secrets: string }>("select encrypted_secrets from repository_runtime_secrets where project_id=$1 and env=$2", [id, env])).rows[0]!;
    return JSON.parse(decrypt(stored.encrypted_secrets));
  }
}
