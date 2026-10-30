import { decrypt, encrypt, newId } from "../lib/crypto.js";
import { SECRET_NAME } from "../baas/secrets.js";
import { q } from "./db.js";

/**
 * Keys saved once on the account and connected to any number of projects. A connected
 * integration reaches the project's server code as an env var, like a project secret.
 */
export const INTEGRATION_TYPES = {
  openai: { label: "OpenAI", env: "OPENAI_API_KEY" },
  anthropic: { label: "Anthropic", env: "ANTHROPIC_API_KEY" },
  postgres: { label: "PostgreSQL", env: "DATABASE_URL" },
  generic: { label: "Clave de API genérica", env: "" },
} as const;

export type IntegrationType = keyof typeof INTEGRATION_TYPES;

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  envName: string;
  createdAt: string;
  projectCount: number;
}

export async function listIntegrations(accountId: string): Promise<Integration[]> {
  return q<Integration>(
    `select i.id, i.type, i.name, i.description, i.env_name as "envName", i.created_at as "createdAt",
       (select count(*)::int from project_integrations pi where pi.integration_id = i.id) as "projectCount"
     from account_integrations i where i.account_id = $1 order by i.created_at desc`,
    [accountId],
  );
}

export async function createIntegration(
  accountId: string,
  input: { type: IntegrationType; name: string; description?: string; envName?: string; value: string },
) {
  const def = INTEGRATION_TYPES[input.type];
  if (!def) throw new Error("Tipo de integración no válido");
  const envName = (input.envName || def.env).toUpperCase();
  if (!SECRET_NAME.test(envName)) throw new Error("Nombre de variable no válido (MAYÚSCULAS_CON_GUIONES)");
  if (!input.value.trim()) throw new Error("Falta el valor");
  const id = newId();
  await q(
    `insert into account_integrations (id, account_id, type, name, description, env_name, value_enc) values ($1, $2, $3, $4, $5, $6, $7)`,
    [id, accountId, input.type, input.name.trim() || def.label, input.description ?? "", envName, encrypt(input.value.trim())],
  );
  return id;
}

export async function updateIntegrationValue(accountId: string, id: string, value: string) {
  await q(`update account_integrations set value_enc = $3 where account_id = $1 and id = $2`, [accountId, id, encrypt(value.trim())]);
}

export async function deleteIntegration(accountId: string, id: string) {
  await q(`delete from account_integrations where account_id = $1 and id = $2`, [accountId, id]);
}

export async function connectIntegration(accountId: string, projectId: string, integrationId: string) {
  const r = await q(`select 1 from account_integrations where account_id = $1 and id = $2`, [accountId, integrationId]);
  if (!r.length) throw new Error("Integración no encontrada");
  await q(`insert into project_integrations (project_id, integration_id) values ($1, $2) on conflict do nothing`, [projectId, integrationId]);
}

export async function disconnectIntegration(projectId: string, integrationId: string) {
  await q(`delete from project_integrations where project_id = $1 and integration_id = $2`, [projectId, integrationId]);
}

export async function projectIntegrationIds(projectId: string) {
  return (await q<{ integration_id: string }>(`select integration_id from project_integrations where project_id = $1`, [projectId])).map(
    (r) => r.integration_id,
  );
}

/** Env vars from connected integrations. Project secrets with the same name win. */
export async function integrationEnv(projectId: string): Promise<Record<string, string>> {
  const rows = await q<{ env_name: string; value_enc: string }>(
    `select i.env_name, i.value_enc from project_integrations pi join account_integrations i on i.id = pi.integration_id where pi.project_id = $1`,
    [projectId],
  );
  const env: Record<string, string> = {};
  for (const r of rows) {
    try {
      env[r.env_name] = decrypt(r.value_enc);
    } catch {
      // Encrypted under another SECRETS_KEY: treat as missing.
    }
  }
  return env;
}
