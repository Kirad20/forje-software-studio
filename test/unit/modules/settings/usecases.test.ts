import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPlatformSettingsUseCase } from "../../../../server/modules/settings/application/GetPlatformSettingsUseCase.js";
import { UpdatePlatformSettingsUseCase } from "../../../../server/modules/settings/application/UpdatePlatformSettingsUseCase.js";
import { SettingDefinition } from "../../../../server/modules/settings/domain/SettingDefinition.js";
import type { ISettingsRegistry, ISettingsStore } from "../../../../server/modules/settings/ports/repositories.js";

describe("Settings Use Cases (TDD)", () => {
  let registry: ISettingsRegistry;
  let store: ISettingsStore;

  beforeEach(() => {
    const signupDef = new SettingDefinition({
      key: "signup",
      type: "select",
      default: "open",
      secret: false,
      options: ["open", "closed"],
    });

    const apiKeyDef = new SettingDefinition({
      key: "stripeKey",
      type: "string",
      default: "",
      secret: true,
    });

    registry = {
      getDefinition: vi.fn((key: string) => (key === "signup" ? signupDef : key === "stripeKey" ? apiKeyDef : undefined)),
      listDefinitions: vi.fn(() => [signupDef, apiKeyDef]),
    };

    const inMemory: Record<string, unknown> = {
      signup: "open",
      stripeKey: "sk_secret_123",
    };

    store = {
      get: vi.fn(async (k: string) => inMemory[k]),
      set: vi.fn(async (k: string, v: unknown) => {
        inMemory[k] = v;
      }),
      setMany: vi.fn(async (patch: Record<string, unknown>) => {
        Object.assign(inMemory, patch);
      }),
      reset: vi.fn(async (k: string) => {
        delete inMemory[k];
      }),
      getAll: vi.fn(async () => ({ ...inMemory })),
    };
  });

  describe("GetPlatformSettingsUseCase", () => {
    it("returns settings masking secrets", async () => {
      const useCase = new GetPlatformSettingsUseCase(registry, store);
      const res = await useCase.execute();

      expect(res.signup).toBe("open");
      expect(res.stripeKey).toBe("••••••••");
    });
  });

  describe("UpdatePlatformSettingsUseCase", () => {
    it("does not partially write a patch rejected by a later key", async () => {
      const useCase = new UpdatePlatformSettingsUseCase(registry, store);
      await expect(useCase.execute({ signup: "closed", unknown_key: "value" })).rejects.toThrow("Ajuste desconocido");
      expect(store.set).not.toHaveBeenCalled();
      expect(store.setMany).not.toHaveBeenCalled();
    });

    it("validates and updates valid non-masked settings", async () => {
      const useCase = new UpdatePlatformSettingsUseCase(registry, store);
      await useCase.execute({ signup: "closed" });

      expect(store.setMany).toHaveBeenCalledWith({ signup: "closed" });
    });

    it("ignores masked secret values so keys are not accidentally overwritten", async () => {
      const useCase = new UpdatePlatformSettingsUseCase(registry, store);
      await useCase.execute({ stripeKey: "••••••••" });

      expect(store.set).not.toHaveBeenCalledWith("stripeKey", "••••••••");
    });

    it("rejects unknown setting key", async () => {
      const useCase = new UpdatePlatformSettingsUseCase(registry, store);
      await expect(useCase.execute({ unknown_key: "value" })).rejects.toThrow("Ajuste desconocido");
    });
  });
});
