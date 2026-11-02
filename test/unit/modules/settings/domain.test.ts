import { describe, it, expect } from "vitest";
import { SettingDefinition } from "../../../../server/modules/settings/domain/SettingDefinition.js";
import { SettingValue } from "../../../../server/modules/settings/domain/SettingValue.js";

describe("Settings Domain (DDD & TDD)", () => {
  describe("SettingDefinition Entity", () => {
    it("validates and parses a string setting definition", () => {
      const def = new SettingDefinition({
        key: "signup",
        type: "select",
        default: "open",
        secret: false,
        options: ["open", "invite_only", "closed"],
      });

      expect(def.key).toBe("signup");
      expect(def.isSecret()).toBe(false);
      expect(def.validate("closed")).toBe("closed");
      expect(() => def.validate("invalid_choice")).toThrow("Valor no válido");
    });

    it("validates a numeric setting with min/max bounds", () => {
      const def = new SettingDefinition({
        key: "freeCredits",
        type: "number",
        default: 50,
        secret: false,
        min: 0,
        max: 1000,
      });

      expect(def.validate(100)).toBe(100);
      expect(() => def.validate(-5)).toThrow("Debe ser mayor o igual");
      expect(() => def.validate("not_a_number")).toThrow("Debe ser un número");
    });

    it("marks secret settings properly", () => {
      const def = new SettingDefinition({
        key: "stripeKey",
        type: "string",
        default: "",
        secret: true,
      });

      expect(def.isSecret()).toBe(true);
    });
  });

  describe("SettingValue Value Object", () => {
    it("masks secret values when exposed for public view", () => {
      const val = new SettingValue("sk_live_1234567890", true);
      expect(val.toPublicRepresentation()).toBe("••••••••");
      expect(val.rawValue).toBe("sk_live_1234567890");
    });

    it("preserves non-secret values as is", () => {
      const val = new SettingValue("open", false);
      expect(val.toPublicRepresentation()).toBe("open");
      expect(val.rawValue).toBe("open");
    });
  });
});
