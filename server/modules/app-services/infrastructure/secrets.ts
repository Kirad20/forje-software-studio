import { decrypt, encrypt } from "../../../shared/crypto.js";
import { platformRepository } from "./repositories.js";
import type { SecretPorts } from "../ports/secrets.js";
let integrations: Pick<SecretPorts, "integrationEnv"> | undefined;
let registration: symbol | undefined;
export function configureSecretIntegrations(ports: Pick<SecretPorts, "integrationEnv">): () => void {
  const token = Symbol();
  integrations = ports;
  registration = token;
  return () => {
    if (registration !== token) return;
    integrations = undefined;
    registration = undefined;
  };
}
export const secretPorts: SecretPorts = {
  q: platformRepository.q, decrypt, encrypt,
  integrationEnv(projectId) {
    if (!integrations) throw new Error("Secret integration capability is not configured");
    return integrations.integrationEnv(projectId);
  },
  onDecryptError(projectId, name) { console.error(`[forja] secreto ${name} de ${projectId} no se pudo descifrar`); },
};
