import { platformDb, q } from "../../../platform/db.js";
import type { AuditAction, SettingsDependencies, SettingWrite, StoredSetting } from "../ports/platform.js";

type SettingsRepository = SettingsDependencies["repository"];

export class PostgresSettingsRepository implements SettingsRepository {
  read(): Promise<StoredSetting[]> {
    return q<StoredSetting>("select key, value, value_enc from settings");
  }

  async save(writes: SettingWrite[], actorId: string | null): Promise<void> {
    await (await platformDb()).transaction(async (tx) => {
      for (const write of writes) {
        if (write.reset) {
          await tx.query("delete from settings where key = $1", [write.key]);
        } else {
          await tx.query(
            `insert into settings (key, value, value_enc, updated_by, updated_at) values ($1, $2, $3, $4, now())
             on conflict (key) do update set value = excluded.value, value_enc = excluded.value_enc, updated_by = excluded.updated_by, updated_at = now()`,
            [write.key, write.encrypted === null ? JSON.stringify(write.value) : null, write.encrypted, actorId],
          );
        }
        await tx.query("insert into settings_audit (key, actor_id, action) values ($1, $2, $3)", [write.key, actorId, write.reset ? "reset" : "set"]);
      }
    });
  }

  async reset(key: string, actorId: string | null): Promise<void> {
    await this.save([{ key, value: null, encrypted: null, reset: true }], actorId);
  }

  async audit(key: string, actorId: string | null, action: AuditAction): Promise<void> {
    await q("insert into settings_audit (key, actor_id, action) values ($1, $2, $3)", [key, actorId, action]);
  }
}
