export const INTEGRATION_TYPES = {
  openai: { label: "OpenAI", env: "OPENAI_API_KEY" }, anthropic: { label: "Anthropic", env: "ANTHROPIC_API_KEY" },
  postgres: { label: "PostgreSQL", env: "DATABASE_URL" }, generic: { label: "Clave de API genérica", env: "" },
} as const;
export type IntegrationType = keyof typeof INTEGRATION_TYPES;
export interface Integration { id: string; type: IntegrationType; name: string; description: string; envName: string; createdAt: string; projectCount: number }
export interface IntegrationInput { type: IntegrationType; name: string; description?: string; envName?: string; value: string }
export interface IntegrationRepository {
  list(accountId: string): Promise<Integration[]>;
  create(accountId: string, record: { id: string; type: IntegrationType; name: string; description: string; envName: string; value: string }): Promise<void>;
  updateValue(accountId: string, id: string, value: string): Promise<void>;
  delete(accountId: string, id: string): Promise<void>;
  exists(accountId: string, id: string): Promise<boolean>;
  connect(projectId: string, id: string): Promise<void>;
  disconnect(projectId: string, id: string): Promise<void>;
  projectIds(projectId: string): Promise<string[]>;
  env(projectId: string): Promise<Record<string, string>>;
}
export function createIntegrationService(repository: IntegrationRepository, newId: () => string) {
  return {
    listIntegrations: (a: string) => repository.list(a),
    async createIntegration(accountId: string, input: IntegrationInput) {
      const def = INTEGRATION_TYPES[input.type];
      if (!def) throw new Error("Tipo de integración no válido");
      const envName = (input.envName || def.env).toUpperCase();
      if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(envName)) throw new Error("Nombre de variable no válido (MAYÚSCULAS_CON_GUIONES)");
      if (!input.value.trim()) throw new Error("Falta el valor");
      const id = newId();
      await repository.create(accountId, { id, type: input.type, name: input.name.trim() || def.label, description: input.description ?? "", envName, value: input.value.trim() });
      return id;
    },
    updateIntegrationValue: (a: string, id: string, value: string) => repository.updateValue(a, id, value.trim()),
    deleteIntegration: (a: string, id: string) => repository.delete(a, id),
    async connectIntegration(a: string, p: string, id: string) {
      if (!await repository.exists(a, id)) throw new Error("Integración no encontrada");
      await repository.connect(p, id);
    },
    disconnectIntegration: (p: string, id: string) => repository.disconnect(p, id),
    projectIntegrationIds: (p: string) => repository.projectIds(p),
    integrationEnv: (p: string) => repository.env(p),
  };
}
