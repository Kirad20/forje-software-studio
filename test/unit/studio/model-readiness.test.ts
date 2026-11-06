import { describe, expect, it } from "vitest";
import { modelBlockers, playgroundModel, usableModel } from "../../../studio/src/features/administration/application/model-readiness.js";

const ready = { available: true, allowed: true, tools: true, blockers: [] };

describe("configuration model readiness", () => {
  it("does not call a model usable when account or project permissions block it", () => {
    expect(usableModel(ready)).toBe(true);
    expect(usableModel({ ...ready, blockers: ["No permitido en tu cuenta"] })).toBe(false);
    expect(usableModel({ ...ready, blockers: ["No permitido en este proyecto"] })).toBe(false);
    expect(usableModel({ ...ready, available: false })).toBe(false);
    expect(modelBlockers({ available: false, allowed: false, tools: false })).toEqual([
      "Modelo o proveedor no disponible", "Bloqueado por la lista de la plataforma",
    ]);
  });

  it("requires tools for building roles but permits text-only chat", () => {
    for (const role of ["fast", "data", "backend", "ui"]) {
      expect(playgroundModel(ready, role)).toBe(true);
      expect(playgroundModel({ ...ready, tools: false }, role)).toBe(false);
    }
    expect(playgroundModel({ ...ready, tools: false }, "chat")).toBe(true);
    expect(playgroundModel({ ...ready, available: false }, "chat")).toBe(false);
    expect(playgroundModel({ ...ready, allowed: false }, "backend")).toBe(false);
  });

  it("keeps the playground independent of the admin account whitelist", () => {
    const blockedAccount = { ...ready, blockers: ["No permitido en tu cuenta"] };
    expect(playgroundModel(blockedAccount, "backend")).toBe(true);
    expect(usableModel(blockedAccount)).toBe(false);
  });
});
