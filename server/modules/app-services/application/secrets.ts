import type { SecretPorts } from "../ports/secrets.js";
import { SECRET_NAME } from "../domain/policies.js";
export { SECRET_NAME } from "../domain/policies.js";

/**
 * Project secrets. The builder may only *request* one by name; the owner types the value
 * in the studio. Values are encrypted at rest and only ever injected into server code.
 */
export function createSecrets({ q, encrypt, decrypt, integrationEnv, onDecryptError }: SecretPorts) {
async function requestSecret(projectId: string, name: string, description: string) {
  if (!SECRET_NAME.test(name)) throw new Error("Nombre de variable no válido (usa MAYÚSCULAS_CON_GUIONES)");
  await q(
    "secretRequest",
    [projectId, name, description],
  );
}

async function setSecret(projectId: string, name: string, value: string) {
  if (!SECRET_NAME.test(name)) throw new Error("Nombre de variable no válido");
  await q(
    "secretSet",
    [projectId, name, encrypt(value)],
  );
}

async function deleteSecret(projectId: string, name: string) {
  await q("secretDelete", [projectId, name]);
}

/** Names and status only — never values. Safe for the studio and the builder. */
async function listSecrets(projectId: string) {
  return q<{ name: string; description: string; isSet: boolean }>(
    "secretList",
    [projectId],
  );
}

async function secretEnv(projectId: string): Promise<Record<string, string>> {
  const fromIntegrations = await integrationEnv(projectId);
  return { ...fromIntegrations, ...(await projectSecretEnv(projectId)) };
}

async function projectSecretEnv(projectId: string): Promise<Record<string, string>> {
  const rows = await q<{ name: string; value_enc: string }>(
    "secretValues",
    [projectId],
  );
  const env: Record<string, string> = {};
  for (const r of rows) {
    try {
      env[r.name] = decrypt(r.value_enc);
    } catch (error) {
      onDecryptError(projectId, r.name, error);
      // Encrypted with a different SECRETS_KEY; treat as unset.
    }
  }
  return env;
}
return { requestSecret, setSecret, deleteSecret, listSecrets, secretEnv };
}
