# Panel de administración + Postgres — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover la BD de plataforma a Postgres con migraciones y seeders, sacar del `.env` la configuración global a la BD, y añadir un panel de administración (ajustes, proveedores, modelos, playground de agentes, enrutador, evals, usuarios).

**Architecture:** `pg` detrás de la interfaz `q/one/platformDb` existente. Un registro tipado de ajustes rellena en sitio el objeto `config`, así sus consumidores no cambian. Proveedores y modelos pasan a tablas, con una caché síncrona para el enrutador. Las rutas nuevas van en `server/admin/api.ts` y la UI en `studio/src/pages/admin/*`.

**Tech Stack:** Node 24, TypeScript, Hono, `pg`, zod, React 19 + Vite, vitest, scripts e2e `.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-01-panel-admin-design.md`

## Global Constraints

- `DATABASE_URL` obligatoria. Solo la BD de plataforma usa Postgres; `server/baas/projectDb.ts` no se toca.
- Variables que quedan en el `.env`: `DATABASE_URL`, `PORT`, `PUBLIC_URL`, `DATA_DIR`, `SECRETS_KEY`, `FORJA_TRUST_PROXY`, `FORJA_BOOTSTRAP_TOKEN`, `FORJA_DOMAIN`, `SERVICE_*`, `FORJA_BROWSER`, `FORJA_CHROMIUM` y `FORJA_SEED_FILE`.
- Los secretos se cifran con `encrypt()`/`decrypt()` de `server/lib/crypto.ts`. Nunca se devuelven en claro ni se registran.
- Toda ruta nueva vive bajo `/api/admin/*` y la protege el middleware de admin existente.
- Los textos de la UI y los mensajes de error van en español, como el resto del repo.
- Tests de BD: `TEST_DATABASE_URL`, por defecto `postgres://forja:forja@127.0.0.1:5433/postgres`.

## Review Focus

- `SECRETS_KEY` cambiada: el arranque no cae. El proveedor o ajuste queda «no configurado» y aparece un aviso (test en Task 2).
- Parche de ajustes con una clave válida y otra inválida: 400, sin escribir nada (test en Task 2).
- Dos procesos arrancando a la vez: las migraciones se aplican una sola vez (advisory lock; test en Task 1).
- `seed.local.json` presente al reiniciar: no pisa un valor editado en el panel (test en Task 3).
- Borrar un proveedor builtin, o un modelo no custom: 400 (test en Task 4).

---

### Task 1: Postgres, migraciones y helper de tests

**Files:**
- Modify: `package.json` (dep `pg`, `@types/pg`; scripts `db:migrate`)
- Modify: `server/config.ts` (`databaseUrl`), `server/platform/db.ts`, `server/index.ts` (cierre del pool)
- Create: `server/db/migrate.ts`, `server/db/migrations/001_init.sql`
- Create: `test/helpers/pg.mjs`
- Modify: `test/unit/auth.test.ts`, `test/unit/metrics.test.ts`, `test/unit/toolOutputs.test.ts`, `test/e2e.mjs`, `test/agents.mjs`, `test/github.mjs`
- Create: `test/unit/migrate.test.ts`
- Modify: `.github/workflows/ci.yml`, `docker-compose.yml`, `docker-compose.local.yml`

**Interfaces:**
- Produces: `q<T>(sql, params?)`, `one<T>(sql, params?)`, `platformDb(): Promise<{ query<T>(sql, params?): Promise<{rows: T[]}>; exec(sql): Promise<void>; transaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R> }>`, `type Tx = { query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> }`, `closePlatformDb(): Promise<void>`. `migrate(pool): Promise<string[]>` (versiones aplicadas). `freshDatabase(): Promise<{ url: string; drop(): Promise<void> }>` en `test/helpers/pg.mjs`.

- [ ] Test `migrate.test.ts`: con BD nueva, `migrate()` devuelve `["001_init", …]` y la segunda llamada `[]`. Dos `migrate()` concurrentes no fallan y `schema_migrations` tiene una fila por versión.
- [ ] Implementar `db.ts` con `pg.Pool`, `types.setTypeParser(20, Number)` y `(1700, Number)`, `001_init.sql` (el esquema actual consolidado, sin backfill) y `migrate.ts` (`pg_advisory_lock(727274)` y una transacción por archivo).
- [ ] Pasar los tests de unidad y los scripts e2e/agents/github a `freshDatabase()` (pasan `DATABASE_URL` al servidor; `drop()` al terminar).
- [ ] Ejecutar `npm run typecheck && npm test && npm run test:e2e && npm run test:agents && npm run test:github`. Todo verde.
- [ ] Añadir el servicio Postgres a CI y Compose, y hacer commit.

### Task 2: Registro y almacén de ajustes

**Files:**
- Create: `server/db/migrations/002_admin.sql` (`settings`, `settings_audit`, `providers`, columnas `source`/`enabled` en `model_catalog`)
- Create: `server/settings/registry.ts`, `server/settings/store.ts`
- Modify: `server/config.ts` (campos movidos con valores por defecto del registro; se quitan las lecturas de entorno; aviso si hay variables movidas)
- Modify: `server/baas/email.ts`, `server/builder/tracing.ts`, `server/platform/github.ts`, `server/runtime/browser.ts` (suscripción a cambios / tope `FORJA_BROWSER`)
- Modify: `server/index.ts` (`loadSettings()` tras `platformDb()`)
- Test: `test/unit/settings.test.ts`

**Interfaces:**
- Produces: `SETTINGS: SettingDef[]` y `settingDef(key)` (registry). `loadSettings(): Promise<void>`, `listSettings(): Promise<SettingView[]>` (`SettingView = SettingDef & { value: unknown; isDefault: boolean; secret?: { set: boolean; hint: string | null; broken?: boolean } }`), `updateSettings(patch: Record<string, unknown>, actorId: string | null): Promise<string[]>`, `resetSetting(key: string, actorId: string | null): Promise<void>`, `onSettingsChanged(fn: (keys: string[]) => void): void`, `class SettingsError extends Error { field: string }`. Claves y valores por defecto según la tabla del spec §2; `models.allow` por defecto es el `DEFAULT_ALLOW` actual.

- [ ] Tests:
  - `updateSettings({signup:"closed"})` → `config.signup === "closed"`; `resetSetting` lo vuelve a `"open"`.
  - `{signup:"x", freeCredits:5}` → lanza `SettingsError` con field `signup` y `config.freeCredits` no cambia.
  - `smtpUrl` secreto: `listSettings()` da `secret.hint === "…2525"` y ningún `value` en claro.
  - Fila con `value_enc` corrupto → `loadSettings()` no lanza y el ajuste queda con `broken: true`.
  - `evals.concurrency: 9` → error.
  - `onSettingsChanged` recibe las claves.
- [ ] Implementar `registry.ts` y `store.ts`, y adelgazar `config.ts`.
- [ ] Pasar a ajustes las variables de entorno de los tests (`FORJA_EVALS*`, `GITHUB_*`), vía la parte `settings` del seed local (llega en Task 3; hasta entonces el test fija con `updateSettings` en su arranque). Ejecutar toda la suite y hacer commit.

### Task 3: Proveedores y modelos en BD + seeders

**Files:**
- Create: `server/db/seed.ts`, `server/db/seeds/defaults.ts`, `server/db/seeds/local.ts`, `server/db/seeds/dev.ts`, `server/db/seeds/dev.fixture.json`
- Create: `server/llm/providers.ts` (CRUD + caché)
- Modify: `server/llm/catalog.ts`, `server/llm/anthropic.ts`, `server/api/studioApi.ts` (rutas `/models` que leían `config.openrouterKey`)
- Modify: `package.json` (scripts `db:seed`, `db:seed:dev`, `db:reset`), `.gitignore` (`seed.local.json`)
- Create: `seed.local.example.json`
- Modify: `test/agents.mjs`, `test/github.mjs` (escriben un seed temporal y pasan `FORJA_SEED_FILE`)
- Test: `test/unit/seeds.test.ts`, `test/unit/catalog.test.ts`

**Interfaces:**
- Consumes: `updateSettings` (Task 2) para la parte `settings` del seed.
- Produces:
  - `ProviderRow = { id; kind: "anthropic"|"openai"; label; baseUrl: string|null; headers: Record<string,string>; enabled; builtin; keySet: boolean; keyHint: string|null; keyBroken: boolean; available: boolean }`.
  - `listProviders(): Promise<ProviderRow[]>`, `saveProvider(input: { id; kind?; label?; baseUrl?; apiKey?: string|null; headers?; enabled? }, actorId): Promise<void>`, `deleteProvider(id, actorId)`, `reloadProviders(): Promise<void>`, `providerSecret(id): string|undefined`.
  - `providers()` sigue síncrona en `catalog.ts`.
  - `saveModel(input: Partial<ModelInfo> & { provider; model }, actorId)`, `deleteModel(id, actorId)`, `listCatalog(): Promise<(ModelInfo & { enabled; allowed; available })[]>`.
  - `seedDefaults()`, `seedLocal(file: string, opts?: { force?: boolean })`, `seedDev()`.
  - El seed corre en el arranque tras `migrate`, antes de `loadSettings` y `reloadProviders`.

- [ ] Tests:
  - `seedDefaults()` dos veces → 3 proveedores builtin y 3 modelos `builtin`.
  - `seedLocal` con `anthropic.apiKey` → disponible. Cambiar la clave con `saveProvider` y volver a `seedLocal` → se conserva la del panel. Con `force` → la del archivo.
  - `availableModels()` solo da modelos de proveedores disponibles y activos.
  - Un modelo `enabled=false` no aparece.
  - `platformAllows` usa `config.models.allow`.
- [ ] Implementar. Quitar `ANTHROPIC`, `customModels` y la compatibilidad con `BUILDER_MODEL`.
- [ ] Pasar `agents.mjs`/`github.mjs` al seed file. Suite completa en verde y commit.

### Task 4: API de administración (ajustes, proveedores, modelos, sondas)

**Files:**
- Create: `server/admin/api.ts`, `server/admin/probe.ts`
- Modify: `server/api/studioApi.ts` (montar `adminApi` en `/admin` junto a users/evals)
- Test: `test/e2e.mjs` (sección admin), `test/agents.mjs` (sondas contra el LLM falso)

**Interfaces:**
- Consumes: Task 2 y Task 3.
- Produces: las rutas de la tabla del spec §6 (salvo agents/router). `probeProvider(id): Promise<{ ok; ms; models?: number; error? }>`, `probeModel(id, accountId): Promise<{ ok; ms; inputTokens; outputTokens; usd; toolsOk: boolean|null; text; error? }>`.

- [ ] Tests e2e:
  - Un miembro recibe 403 en `GET /api/admin/settings`.
  - Admin: `PATCH {signup:"closed"}` → `/api/auth/status` dice `closed`.
  - `PATCH {smtpUrl:"smtp://u:p@h:2525"}` → la respuesta de GET no contiene `u:p`.
  - `DELETE /admin/providers/anthropic` → 400.
  - Alta `POST /admin/providers {id:"lab",kind:"openai",baseUrl:…}` y luego `DELETE` → 200.
- [ ] Tests en agents.mjs: `POST /admin/providers/openai/test` → ok; `POST /admin/models/<id>/test` → `ok:true` y `toolsOk:true`.
- [ ] Implementar (zod, `rateLimit` en las sondas, `ai_usage` con `source='admin_probe'`, `credits=0`). Commit.

### Task 5: Playground de agentes y enrutador

**Files:**
- Create: `server/admin/playground.ts`, `server/admin/router.ts`
- Modify: `server/admin/api.ts`, y extraer de `server/evals/runner.ts` lo que se comparte (cuenta interna, vigilante de gasto, tope diario) si hace falta
- Test: `test/agents.mjs`

**Interfaces:**
- Produces: `startPlayground(input: { role; modelId; prompt; files?; maxSteps? }, adminId): Promise<string>`, `playgroundRun(id): PlaygroundView | undefined` (`{ id; status: "running"|"done"|"failed"|"cancelled"; role; modelId; events: AgentEvent[]; result?: { text; usd; steps; gate; buildOk; files: Record<string,string> }; error? }`), `cancelPlayground(id)`, `routerStats(): Promise<{ classes: { taskClass; models: { modelId; alpha; beta; mean; uses; usdPerUse }[] }[]; decisions: … }>`, `resetRouter(f: { taskClass?; modelId? }): Promise<number>`.

- [ ] Tests en agents.mjs:
  - Una ejecución de playground con rol `backend` y el modelo falso termina `done`, con `files` que incluye un `endpoints/…` y el proyecto desechable ya no existe.
  - Una segunda ejecución concurrente del mismo admin → 409.
  - `GET /admin/router/stats` tras el turno normal del test → `classes.length > 0`.
  - `POST /admin/router/reset {}` → las estadísticas quedan vacías.
- [ ] Implementar y hacer commit.

### Task 6: Studio — página de administración

**Files:**
- Create: `studio/src/pages/Admin.tsx`, `studio/src/pages/admin/{Settings,Providers,Models,Agents,Router,Users}.tsx`
- Modify: `studio/src/App.tsx` (navegación «Administración» → `/admin`; `/evals` redirige a `/admin/evals`), `studio/src/pages/Evals.tsx` (embebible, con aviso «desactivados → General»)

- [ ] Implementar las pestañas según el spec §7 con `api()`, `useLoad` y los componentes de `ui.tsx`.
- [ ] `npm run build` sin errores. Recorrido real en el navegador con `npm run dev`: cambiar un ajuste, probar el proveedor `openai` con el seed dev, ejecutar el playground y ver el enrutador. Commit.

### Task 7: `.env`, documentación y verificación final

**Files:**
- Modify: `.env.example`, `README.md`, `docs/despliegue-coolify.md`, `Dockerfile` (si hace falta), `CLAUDE.md` no
- [ ] Reducir `.env.example` a las variables de arranque. Actualizar README (Postgres, `db:*`, panel) y Coolify.
- [ ] Ejecutar `npm run typecheck && npm test && npm run build && npm run test:e2e && npm run test:agents && npm run test:github`. Todo verde.
- [ ] Construir la imagen y arrancarla con Compose: `/healthz` responde 200.
- [ ] Commit, incluidos los cambios de `graphify-out/`.
