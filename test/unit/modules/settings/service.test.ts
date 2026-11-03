import { describe, expect, it, vi } from "vitest";
import { PlatformSettingsService } from "../../../../server/modules/settings/application/PlatformSettingsService.js";
import type { SettingsDependencies } from "../../../../server/modules/settings/ports/platform.js";

function fixture() {
  const values: Record<string, unknown> = { signup: "open", stripeKey: "" };
  const definitions = [
    { key: "signup", group: "accounts" as const, label: "Registro", type: "enum" as const, default: "open" },
    { key: "stripeKey", group: "payments" as const, label: "Stripe", type: "secret" as const, default: "" },
  ];
  const deps: SettingsDependencies = {
    registry: {
      list: () => definitions,
      find: (key) => definitions.find((def) => def.key === key),
      validate: (def, value) => {
        if (def.key === "signup" && !["open", "closed"].includes(String(value))) throw new Error("valor no válido");
        return value;
      },
    },
    repository: { read: vi.fn().mockResolvedValue([]), save: vi.fn(), reset: vi.fn(), audit: vi.fn() },
    cipher: { encrypt: (value) => `encrypted:${value}`, decrypt: (value) => {
      if (!value.startsWith("encrypted:")) throw new Error("ciphertext inválido");
      return value.slice(10);
    } },
    runtime: { get: (key) => values[key], apply: (next) => Object.assign(values, Object.fromEntries(next)) },
    warn: vi.fn(),
  };
  return { deps, values, service: new PlatformSettingsService(deps) };
}

describe("Platform settings hexagon", () => {
  it("validates the whole patch before persisting or notifying", async () => {
    const { service, deps } = fixture();
    const listener = vi.fn();
    service.onChanged(listener);
    await expect(service.update({ stripeKey: "secret", signup: "invalid" }, "actor")).rejects.toMatchObject({ field: "signup" });
    expect(deps.repository.save).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it("encrypts secrets, preserves actor, then reloads before notifying", async () => {
    const { service, deps, values } = fixture();
    vi.mocked(deps.repository.read).mockResolvedValue([
      { key: "signup", value: "closed", value_enc: null },
      { key: "stripeKey", value: null, value_enc: "encrypted:secret1234" },
    ]);
    const listener = vi.fn(() => expect(values.signup).toBe("closed"));
    service.onChanged(listener);
    expect(await service.update({ signup: "closed", stripeKey: "secret1234" }, "actor")).toEqual(["signup", "stripeKey"]);
    expect(deps.repository.save).toHaveBeenCalledWith([
      { key: "signup", value: "closed", encrypted: null, reset: false },
      { key: "stripeKey", value: null, encrypted: "encrypted:secret1234", reset: false },
    ], "actor");
    expect(listener).toHaveBeenCalledOnce();
    const views = await service.list();
    expect(views[0]).toMatchObject({ value: "closed", isDefault: false });
    expect(views[1]).toMatchObject({ default: "", secret: { set: true, hint: "…1234", broken: false } });
    expect(JSON.stringify(views)).not.toContain("secret1234");
  });

  it("applies defaults atomically and warns for unreadable stored values", async () => {
    const { service, deps, values } = fixture();
    values.signup = "closed";
    vi.mocked(deps.repository.read).mockResolvedValue([{ key: "stripeKey", value: null, value_enc: "invalid" }]);
    const apply = vi.spyOn(deps.runtime, "apply");
    await service.load();
    expect(apply).toHaveBeenCalledOnce();
    expect(values).toEqual({ signup: "open", stripeKey: "" });
    expect(deps.warn).toHaveBeenCalledOnce();
    expect((await service.list())[1]?.secret?.broken).toBe(true);
  });

  it("persists secret resets and emits nothing for an empty patch", async () => {
    const { service, deps } = fixture();
    await service.update({ stripeKey: null }, null);
    expect(deps.repository.save).toHaveBeenCalledWith([{ key: "stripeKey", value: null, encrypted: null, reset: true }], null);
    const listener = vi.fn();
    service.onChanged(listener);
    expect(await service.update({}, null)).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
    await expect(service.reset("missing", null)).rejects.toMatchObject({ field: "missing" });
  });

  it("logs listener failures without suppressing later listeners", async () => {
    const { service, deps } = fixture();
    const later = vi.fn();
    service.onChanged(() => { throw new Error("listener failed"); });
    service.onChanged(later);
    await service.reset("signup", "actor");
    expect(deps.repository.reset).toHaveBeenCalledWith("signup", "actor");
    expect(deps.warn).toHaveBeenCalled();
    expect(later).toHaveBeenCalledWith(["signup"]);
  });
});
