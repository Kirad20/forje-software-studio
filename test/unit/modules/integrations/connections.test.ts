import { expect, it, vi } from "vitest";
import { createIntegrationService } from "../../../../server/modules/integrations/application/connections.js";
it("normalizes validated integration input and checks account ownership before connecting", async () => {
  const repository = { list: vi.fn(async () => []), create: vi.fn(), updateValue: vi.fn(), delete: vi.fn(), exists: vi.fn(async () => false), connect: vi.fn(), disconnect: vi.fn(), projectIds: vi.fn(async () => []), env: vi.fn(async () => ({})) };
  const service = createIntegrationService(repository, () => "id");
  await expect(service.createIntegration("a", { type: "generic", name: "", envName: "X", value: "value" })).rejects.toThrow("Nombre");
  await expect(service.connectIntegration("a", "p", "foreign")).rejects.toThrow("no encontrada");
  expect(repository.connect).not.toHaveBeenCalled();
  expect(await service.createIntegration("a", { type: "openai", name: " ", value: " value " })).toBe("id");
  expect(repository.create).toHaveBeenCalledWith("a", { id: "id", type: "openai", name: "OpenAI", description: "", envName: "OPENAI_API_KEY", value: "value" });
});
