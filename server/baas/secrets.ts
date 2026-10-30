import { decrypt, encrypt } from "../lib/crypto.js";
import { q } from "../platform/db.js";

/**
 * Project secrets. The builder may only *request* one by name; the owner types the value
 * in the studio. Values are encrypted at rest and only ever injected into server code.
 */
export const SECRET_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;

export async function requestSecret(projectId: string, name: string, description: string) {
  if (!SECRET_NAME.test(name)) throw new Error("Nombre de variable no válido (usa MAYÚSCULAS_CON_GUIONES)");
  await q(
    `insert into project_secrets (project_id, name, description) values ($1, $2, $3)
     on conflict (project_id, name) do update set description = excluded.description`,
    [projectId, name, description],
  );
}

export async function setSecret(projectId: string, name: string, value: string) {
  if (!SECRET_NAME.test(name)) throw new Error("Nombre de variable no válido");
  await q(
    `insert into project_secrets (project_id, name, value_enc) values ($1, $2, $3)
     on conflict (project_id, name) do update set value_enc = excluded.value_enc`,
    [projectId, name, encrypt(value)],
  );
}

export async function deleteSecret(projectId: string, name: string) {
  await q(`delete from project_secrets where project_id = $1 and name = $2`, [projectId, name]);
}

/** Names and status only — never values. Safe for the studio and the builder. */
export async function listSecrets(projectId: string) {
  return q<{ name: string; description: string; isSet: boolean }>(
    `select name, description, value_enc is not null as "isSet" from project_secrets where project_id = $1 order by name`,
    [projectId],
  );
}

export async function secretEnv(projectId: string): Promise<Record<string, string>> {
  const { integrationEnv } = await import("../platform/integrations.js");
  const fromIntegrations = await integrationEnv(projectId);
  return { ...fromIntegrations, ...(await projectSecretEnv(projectId)) };
}

async function projectSecretEnv(projectId: string): Promise<Record<string, string>> {
  const rows = await q<{ name: string; value_enc: string }>(
    `select name, value_enc from project_secrets where project_id = $1 and value_enc is not null`,
    [projectId],
  );
  const env: Record<string, string> = {};
  for (const r of rows) {
    try {
      env[r.name] = decrypt(r.value_enc);
    } catch {
      // Encrypted with a different SECRETS_KEY; treat as unset.
    }
  }
  return env;
}
