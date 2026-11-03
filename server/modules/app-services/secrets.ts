export { createSecrets, SECRET_NAME } from "./application/secrets.js";
export { configureSecretIntegrations } from "./infrastructure/secrets.js";
import { createSecrets } from "./application/secrets.js";
import { secretPorts } from "./infrastructure/secrets.js";
export const { requestSecret, setSecret, deleteSecret, listSecrets, secretEnv } = createSecrets(secretPorts);
