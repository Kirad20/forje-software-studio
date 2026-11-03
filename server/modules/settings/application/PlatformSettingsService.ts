import { SettingsError, type SettingDef, type SettingView } from "../domain/PlatformSetting.js";
import type { AuditAction, SettingsDependencies, SettingWrite } from "../ports/platform.js";

export class PlatformSettingsService {
  private readonly broken = new Set<string>();
  private readonly listeners: ((keys: string[]) => void)[] = [];

  constructor(private readonly deps: SettingsDependencies) {}

  onChanged(fn: (keys: string[]) => void): () => void {
    this.listeners.push(fn);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      const index = this.listeners.indexOf(fn);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  async load(): Promise<void> {
    const rows = await this.deps.repository.read();
    const next = new Map(this.deps.registry.list().map((def) => [def.key, structuredClone(def.default)]));
    const unreadable = new Set<string>();
    for (const row of rows) {
      const def = this.deps.registry.find(row.key);
      if (!def) continue;
      try {
        const raw = def.type === "secret" ? this.deps.cipher.decrypt(row.value_enc ?? "") : row.value;
        const parsed = this.deps.registry.validate(def, raw);
        if (parsed !== null && parsed !== undefined) next.set(def.key, parsed);
      } catch (error) {
        unreadable.add(def.key);
        this.deps.warn(`[forja] El ajuste ${def.key} guardado no se puede usar (${this.message(error)}); se usa el valor por defecto. Vuelve a guardarlo en Administración.`);
      }
    }
    this.deps.runtime.apply(next);
    this.broken.clear();
    for (const key of unreadable) this.broken.add(key);
  }

  async list(): Promise<SettingView[]> {
    const stored = new Set((await this.deps.repository.read()).map((row) => row.key));
    return this.deps.registry.list().map((def) => {
      const current = this.deps.runtime.get(def.key);
      const view: SettingView = { ...def, isDefault: !stored.has(def.key) };
      if (def.type === "secret") {
        view.default = "";
        const secret = String(current ?? "");
        view.secret = { set: !!current, hint: secret.length >= 8 ? `…${secret.slice(-4)}` : null, broken: this.broken.has(def.key) };
      } else view.value = current;
      return view;
    });
  }

  async update(patch: Record<string, unknown>, actorId: string | null): Promise<string[]> {
    const parsed = Object.entries(patch).map(([key, raw]) => {
      const def = this.definition(key);
      try {
        return { def, value: this.deps.registry.validate(def, raw) };
      } catch (error) {
        throw new SettingsError(key, `${def.label}: ${this.message(error)}`);
      }
    });
    if (!parsed.length) return [];
    const writes: SettingWrite[] = parsed.map(({ def, value }) => ({
      key: def.key,
      value: def.type === "secret" ? null : value,
      encrypted: def.type === "secret" && value !== null ? this.deps.cipher.encrypt(String(value)) : null,
      reset: def.type === "secret" && value === null,
    }));
    await this.deps.repository.save(writes, actorId);
    const keys = parsed.map(({ def }) => def.key);
    await this.load();
    this.emit(keys);
    return keys;
  }

  async reset(key: string, actorId: string | null): Promise<void> {
    this.definition(key);
    await this.deps.repository.reset(key, actorId);
    await this.load();
    this.emit([key]);
  }

  audit(key: string, actorId: string | null, action: AuditAction): Promise<void> {
    return this.deps.repository.audit(key, actorId, action);
  }

  private definition(key: string): SettingDef {
    const def = this.deps.registry.find(key);
    if (!def) throw new SettingsError(key, `Ajuste desconocido: ${key}`);
    return def;
  }

  private emit(keys: string[]): void {
    for (const fn of this.listeners) {
      try {
        fn(keys);
      } catch (error) {
        this.deps.warn(`[forja] al aplicar ajustes: ${this.message(error)}`);
      }
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
