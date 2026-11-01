# Panel de administración del sistema — diseño

Fecha: 2026-11-01 · Rama: `feat/admin-panel`

## Objetivo

Un panel en el studio, solo para cuentas con `platformRole = "admin"`, desde el que se gestiona
toda la configuración global de Forja sin tocar el `.env` ni reiniciar: ajustes de la plataforma,
proveedores y modelos, pruebas de los agentes, aprendizaje del enrutador, evals y usuarios.

Para eso la base de datos de la plataforma pasa de PGlite embebido a un servidor Postgres, con
migraciones versionadas y seeders.

### Decisiones tomadas con el usuario

- **El `.env` queda mínimo**: solo lo que hace falta para arrancar el proceso. Todo lo demás vive
  en la base de datos y se edita en el panel. No hay precedencia `.env` vs. panel: los valores
  movidos dejan de leerse del entorno.
- **Postgres solo para la BD de plataforma.** Las BDs de cada app generada siguen en PGlite
  (`server/baas/projectDb.ts` no cambia).
- **Se empieza limpio**: no hay migración de datos desde PGlite.
- **Seeders**: valores por defecto (siempre, idempotentes), datos de desarrollo (solo bajo demanda)
  y claves desde un `seed.local.json` opcional fuera de git.
- **Pruebas de agentes**: probar conexión de proveedor/modelo, playground por rol, evals dentro del
  panel y estadísticas del enrutador.

### Fuera de alcance

- Mover las BDs de las apps generadas a Postgres.
- Migrar datos de instalaciones PGlite existentes.
- Permisos de administración más finos que `platformRole = "admin"`.

## 1. Capa de datos

### Conexión

- Dependencia nueva: `pg` (node-postgres). `DATABASE_URL` es obligatoria; sin ella el servidor
  termina con un mensaje claro.
- `server/platform/db.ts` conserva su interfaz pública para que los ~40 módulos que consultan la BD
  no cambien:
  - `q<T>(sql, params)` → filas, `one<T>(sql, params)` → fila o `undefined`.
  - `platformDb()` → `{ query, exec, transaction }`. `transaction(fn)` toma un cliente del pool,
    hace `begin`/`commit`/`rollback` y pasa a `fn` un `Tx` con `query<T>(sql, params) → { rows }`
    (la misma forma que usaba PGlite, así `accounts.ts` y `projects.ts` no cambian).
  - `closePlatformDb()` para el apagado y los tests.
- Tipos: `int8` y `numeric` se convierten a `number` (PGlite ya lo hacía y el código asume números).
  `timestamptz` sigue llegando como `Date`, como en PGlite.

### Migraciones

- `server/db/migrations/NNN_nombre.sql`, aplicadas en orden por `server/db/migrate.ts`, que guarda
  las aplicadas en `schema_migrations (version text primary key, applied_at timestamptz)`.
- Cada migración corre en su propia transacción, bajo `pg_advisory_lock`, para que dos procesos
  que arrancan a la vez no las apliquen dos veces.
- `001_init.sql`: el esquema actual de `db.ts`, consolidado (los `alter table … add column` se
  integran en sus `create table`; sin el backfill de organizaciones, porque se empieza limpio).
- `002_admin.sql`: tablas nuevas del panel (ver §2 y §3).
- Se aplican al arrancar (`platformDb()`) y con `npm run db:migrate`.

### Seeders

Todos viven en `server/db/seeds/` y se lanzan con `server/db/seed.ts`.

| Seeder | Cuándo corre | Qué hace |
|---|---|---|
| `defaults` | En cada arranque, tras las migraciones, y con `npm run db:seed` | Inserta (`on conflict do nothing`) los proveedores conocidos (`anthropic`, `openrouter`, `openai`) desactivados y sin clave, y los modelos de Anthropic del catálogo (`source = 'builtin'`). No escribe ajustes: sus valores por defecto viven en el registro (§2). |
| `local` | En cada arranque si existe el archivo, y con `npm run db:seed` | Lee `FORJA_SEED_FILE` (por defecto `./seed.local.json`, en `.gitignore`). Rellena **solo lo que un admin no ha tocado**: un ajuste sin fila, un proveedor nunca editado o un modelo inexistente. Lo editado, restablecido o borrado en el panel (con entrada en `settings_audit` con actor) nunca se pisa ni se recrea. `npm run db:seed -- --force` sí sobrescribe. |
| `dev` | Solo con `npm run db:seed:dev` | Carga `server/db/seeds/dev.fixture.json`: un admin y un usuario con contraseña conocida, una organización de equipo y un proyecto de ejemplo. Se niega si `NODE_ENV=production`. |

Formato de `seed.local.json` (se versiona `seed.local.example.json`):

```json
{
  "settings": { "smtpUrl": "smtp://…", "signup": "invite" },
  "providers": [
    { "id": "anthropic", "apiKey": "sk-ant-…", "enabled": true },
    { "id": "lab", "kind": "openai", "label": "Ollama", "baseUrl": "http://host:11434/v1", "enabled": true }
  ],
  "models": [{ "provider": "lab", "model": "qwen3.8:latest", "label": "Qwen 3.8", "tier": 3 }]
}
```

Los tests usan este mismo formato (vía `FORJA_SEED_FILE`) para configurar proveedores falsos en
lugar de las variables de entorno que usan hoy.

Otros scripts: `npm run db:reset` (borra el esquema `public` y vuelve a migrar y sembrar; se
niega si `NODE_ENV=production`).

### Infraestructura

- `docker-compose.yml`: servicio `postgres` (`postgres:17-alpine`, volumen `forja-pg`,
  healthcheck `pg_isready`). `forja` depende de él (`condition: service_healthy`) y recibe
  `DATABASE_URL`. En Coolify, la contraseña sale de `SERVICE_PASSWORD_POSTGRES`.
- `docker-compose.local.yml` expone el puerto 5432 para desarrollo.
- CI: servicio `postgres` en el job `check`. El job `docker` arranca un Postgres al lado de la
  imagen.

### `.env` resultante

Se quedan solo: `DATABASE_URL`, `PORT`, `PUBLIC_URL`, `DATA_DIR`, `SECRETS_KEY`,
`FORJA_TRUST_PROXY`, `FORJA_BOOTSTRAP_TOKEN`, `FORJA_DOMAIN` y las variables de Compose/Coolify
(`SERVICE_*`), más `FORJA_BROWSER`/`FORJA_CHROMIUM` (dependen de la imagen) y `FORJA_SEED_FILE`.
Las variables movidas dejan de leerse. Si al arrancar se detecta alguna en el entorno, se escribe
un aviso en el log que dice que se ignora y dónde se configura ahora.

## 2. Ajustes globales

### Registro

`server/settings/registry.ts` declara cada ajuste una sola vez:

```ts
interface SettingDef {
  key: string;          // también la ruta en `config`: "github.clientId", "evals.maxRunUsd"
  group: "accounts" | "credits" | "email" | "payments" | "github" | "observability" | "runtime" | "evals" | "models";
  label: string;        // en español, para la UI
  help?: string;
  type: "string" | "url" | "number" | "boolean" | "enum" | "secret" | "list";
  options?: string[];   // enum
  min?: number; max?: number; integer?: boolean;
  default: unknown;
}
```

Ajustes iniciales:

| Grupo | Claves |
|---|---|
| accounts | `signup` (open/invite/closed) |
| credits | `freeCredits`, `creditsPerUsd` |
| email | `smtpUrl` (secret), `emailFrom` |
| payments | `stripeKey` (secret) |
| github | `github.apiUrl`, `github.webUrl`, `github.clientId`, `github.clientSecret` (secret), `github.webhookSecret` (secret), `github.pollMs` |
| observability | `langfuse.publicKey`, `langfuse.secretKey` (secret), `langfuse.baseUrl` |
| runtime | `npm.enabled`, `npm.registry`, `browser.enabled` |
| evals | `evals.enabled`, `evals.maxRunUsd`, `evals.maxDailyUsd`, `evals.concurrency` (1–4) |
| models | `models.allow` (list de globs; por defecto la lista actual `DEFAULT_ALLOW`) |

`browser.enabled` no puede activar el navegador si la imagen se construyó sin él
(`FORJA_BROWSER=0`): el entorno es un tope.

### Almacén

- Tabla `settings (key text primary key, value jsonb, value_enc text, updated_by text, updated_at timestamptz)`.
  Los secretos van cifrados en `value_enc` con `encrypt()` de `lib/crypto.ts` (`SECRETS_KEY`). Lo
  demás va en `value`.
- Tabla `settings_audit (id serial, key, actor_id, action 'set'|'reset', at)`. No guarda valores:
  así un secreto no queda en claro en la auditoría.
- `server/settings/store.ts`:
  - `loadSettings()`: al arrancar, aplica los valores por defecto del registro y luego las filas
    sobre el objeto `config` existente. Como `config` se muta en el sitio, los 27 módulos que lo
    importan siguen funcionando sin cambios.
  - `listSettings()`: lo que ve el panel. Los secretos salen como `{ set: true, hint: "…abcd" }` y
    nunca en claro.
  - `updateSettings(patch, actorId)`: valida todo el parche con el registro (zod) antes de escribir
    nada, lo escribe en una transacción, lo audita, vuelve a aplicarlo a `config` y emite
    `settingsChanged(keys)`. Una clave desconocida o un valor inválido → 400 con el campo y el
    motivo.
  - `resetSetting(key, actorId)`: borra la fila, con lo que vuelve el valor por defecto.
- **Reacción a los cambios** (`onSettingsChanged`): los módulos que cachean algo derivado de la
  configuración se suscriben:
  - `baas/email.ts` descarta el transporte SMTP.
  - `builder/tracing.ts` recrea o apaga el cliente Langfuse.
  - `platform/github.ts` reprograma el sondeo.
  - `evals` recupera ejecuciones al activarse.

`config.ts` queda con lo de arranque (`port`, `publicUrl`, `dataDir`, `databaseUrl`, `secretsKey`,
`trustProxy`, `bootstrapToken`, `browser.executablePath`, `dbIdleMs`, `maxRunMs`) y con los demás
campos inicializados al valor por defecto del registro. Desaparecen `builder`, `appAi`,
`anthropicKey`, `openai*`, `openrouterKey`, `extraProviders`, `extraModels` y `modelsAllow`, que
pasan a la tabla de proveedores y modelos.

## 3. Proveedores y modelos

### Tablas (`002_admin.sql`)

- `providers (id text pk, kind text check (kind in ('anthropic','openai')), label text, base_url text, api_key_enc text, headers_enc text, enabled boolean default false, builtin boolean default false, created_at, updated_at)`.
  - `anthropic` (kind `anthropic`), `openrouter` (kind `openai`, URL fija, con sincronización de
    catálogo) y `openai` (kind `openai`, URL editable; sirve para OpenAI, Ollama, vLLM…) son
    `builtin`: se editan, pero no se borran.
  - Se pueden dar de alta más proveedores compatibles con OpenAI, con cualquier id
    (`^[a-z0-9-]{2,32}$`).
  - Un proveedor está **disponible** si está `enabled` y tiene lo que necesita: clave en
    `anthropic` y `openrouter`; URL base en los `openai`.
- `model_catalog` gana `source text not null default 'openrouter'` (`builtin` | `openrouter` |
  `custom`) y `enabled boolean not null default true`.
  - Los modelos de Anthropic se siembran como `builtin`.
  - Los propios se crean desde el panel como `custom`.
  - La sincronización de OpenRouter sigue sin tocar `tier` ni `enabled` en el `on conflict`, así no
    pisa lo editado.

### `llm/catalog.ts`

- `providers()` sigue siendo síncrona (la usa el enrutador en caliente): lee una caché en memoria
  que se carga al arrancar y se recarga en cada cambio desde el panel (`reloadProviders()`).
- `availableModels()` = filas de `model_catalog` con `enabled` cuyo proveedor está disponible.
- `platformAllows()` usa `config.models.allow`.
- `syncOpenRouter()` / `startCatalogSync()` leen la clave del proveedor `openrouter`. Al activarlo
  desde el panel arranca la sincronización.
- `llm/anthropic.ts` descarta su cliente cuando cambia la clave.
- Se eliminan `ANTHROPIC` (pasa al seed), `customModels()` y la compatibilidad con
  `BUILDER_MODEL`/`APP_AI_MODEL`.

### Pruebas de conexión

`server/admin/probe.ts`:

- `probeProvider(id)`: `GET {baseUrl}/models` en los compatibles OpenAI y
  `anthropic.models.list()` en Anthropic. Devuelve `{ ok, ms, models?: number, error? }`.
- `probeModel(id)` hace dos llamadas mínimas con `max_tokens` bajo:
  1. Texto: «Responde exactamente: OK».
  2. Herramientas: una tool `echo` que el modelo debe llamar (solo si el modelo declara `tools`).

  Devuelve `{ ok, ms, inputTokens, outputTokens, usd, toolsOk, text, error? }`.
- El coste se calcula con `costUsd()` y **no se cobra a ninguna cuenta**. Se registra en
  `ai_usage` con `source = 'admin_probe'` y `account_id` del admin, `credits = 0`.
- Errores del proveedor (401, 404, timeout de 30 s) → `ok: false` con el mensaje, nunca 500.

## 4. Playground de agentes

Prueba un **solo agente** de un rol con un modelo concreto, sin crear nada en el espacio de nadie.
Roles: `fast`, `data`, `backend`, `ui` y `chat`. Planificador, revisión y seguridad necesitan herramientas
que solo les da el orquestador (`submit_plan`, `report_review`…), así que no se ofrecen. Mientras hay una
ejecución de evals en curso no se puede lanzar (ambos fijan los modelos de la cuenta interna).

- `POST /api/admin/agents/runs { role, modelId, prompt, files?: Record<string,string>, maxSteps? }`
  → `{ runId }`. `GET /api/admin/agents/runs/:id` → estado y transcripción. `POST …/:id/cancel`.
- Corre como los evals (`server/evals/runner.ts`):
  - En un proyecto desechable de la cuenta interna `evals@forja.internal`, sembrado con el
    starter más `files`.
  - Con `setProjectModels(project, [modelId])`, así el enrutador solo puede elegir ese modelo.
  - Usa `ROLE_PROMPTS[role]`, `ROLE_TOOLS[role]` y `runAgent()`, con `maxSteps` limitado por
    `MAX_STEPS[role]`.
- Los eventos del agente (`text`, `tool_start`, `tool_end`) se guardan en memoria por ejecución.
  La UI los consulta cada 1,5 s, el mismo patrón que la página de evals.
- Al terminar se devuelve:
  - texto final, pasos, `usage`, `usd`, `gate`, `buildOk`;
  - los archivos escritos, con su contenido (máx. 200 KB en total).

  Después se borra el proyecto.
- Límites:
  - Una ejecución de playground a la vez en toda la plataforma, y nunca junto a una de evals (comparten la cuenta interna). Se registra antes del primer `await`.
  - Antes de borrar el proyecto, sus filas de `ai_usage` se desligan (`project_id = null`) para que su gasto siga contando en el tope diario.
  - Tope de gasto por ejecución = `evals.maxRunUsd`, controlado con el mismo vigilante de saldo que
    los evals.
  - Cuenta para el tope diario de evals.
  - Requiere el navegador solo si el rol usa `browser_test` (si no está, la herramienta devuelve su
    error normal).
- Las ejecuciones se marcan `synthetic`, así que el enrutador no aprende de ellas.

## 5. Enrutador

- `GET /api/admin/router/stats`:
  - Por `task_class`: cada modelo con `alpha`, `beta`, media `alpha/(alpha+beta)`, `uses` y `usd`
    medio por uso.
  - Las 100 decisiones más recientes (`router_decisions`), con el proyecto, el rol, el modelo
    elegido y el motivo.
- `POST /api/admin/router/reset { taskClass?, modelId? }` borra las filas correspondientes de
  `router_stats`, para olvidar lo aprendido tras cambiar precios o modelos. Pide confirmación en la
  UI.

## 6. API de administración

Todo bajo el middleware `/admin/*` existente (403 a quien no sea admin de plataforma):

| Método y ruta | Uso |
|---|---|
| `GET /admin/settings` | Registro + valores actuales (secretos enmascarados) + si es por defecto |
| `PATCH /admin/settings` | `{ [key]: value }`; un secreto con `null` se borra |
| `DELETE /admin/settings/:key` | Volver al valor por defecto |
| `GET/POST /admin/providers` | Lista / alta (solo kind `openai`) |
| `PATCH/DELETE /admin/providers/:id` | Editar (clave nueva, URL, cabeceras, enabled) / borrar (no `builtin`, y sus modelos `custom`) |
| `POST /admin/providers/:id/test` | `probeProvider` |
| `GET/POST /admin/models` | Catálogo completo con `enabled`, `allowed` y `available` / alta `custom` |
| `PATCH/DELETE /admin/models/item/<id>` (el id lleva `:` y a veces `/`) | Editar label, precios, contexto, tools, vision, tier, speed, enabled / borrar (solo `custom`) |
| `POST /admin/models/test/<id>` | `probeModel` |
| `POST /admin/models/sync` | Sincronizar OpenRouter |
| `GET /admin/agents/roles` | Roles con sus herramientas y pasos máximos |
| `POST /admin/agents/runs`, `GET …/:id`, `POST …/:id/cancel` | Playground |
| `GET /admin/router/stats`, `POST /admin/router/reset` | Enrutador |
| `/admin/users`, `/admin/evals/*` | Ya existen |

La validación usa zod, como el resto de `studioApi.ts`. Las rutas nuevas van en
`server/admin/api.ts`, montado con `studioApi.route("/admin", adminApi)`, y no en el ya grande
`studioApi.ts`.

## 7. Studio

- Nueva página `studio/src/pages/Admin.tsx` en `/admin/<pestaña>`. En la navegación, la entrada
  «Evals de calidad» se sustituye por «Administración», visible solo a admins.
- Pestañas, una por archivo en `studio/src/pages/admin/`:
  - **General** (`Settings.tsx`): formulario generado por el registro, agrupado. Cada campo indica
    si es el valor por defecto y tiene «Restablecer». Los secretos muestran `••••abcd` con
    «Cambiar» y «Quitar». Guardar envía solo lo cambiado.
  - **Proveedores** (`Providers.tsx`): tarjetas con estado (disponible / falta clave / desactivado),
    clave, URL y cabeceras, y «Probar conexión» con el resultado al lado. Alta de compatible OpenAI.
  - **Modelos** (`Models.tsx`): tabla filtrable por proveedor, permitido y activo. Edición en línea
    de tier, velocidad, precios y activo, y «Probar» por fila. Editor de la lista blanca (globs),
    con cuántos modelos casa cada uno. «Sincronizar OpenRouter» con la fecha de la última
    sincronización. Alta de modelo propio.
  - **Agentes** (`Agents.tsx`): selector de rol y modelo, prompt, archivos iniciales opcionales y
    «Ejecutar». Muestra los pasos en vivo, el texto final, el coste y los archivos resultantes.
  - **Enrutador** (`Router.tsx`): una tabla por clase de tarea (barras de media con `uses`) y la
    lista de decisiones recientes. Botón para olvidar.
  - **Evals** (`Evals.tsx`): reutiliza la página actual. Si están desactivados, un enlace a
    General → Evals.
  - **Usuarios** (`Users.tsx`): tabla de `/admin/users` con rol y deshabilitar.
- Se reutilizan los componentes de `components/ui.tsx` y el patrón `api()` / `useLoad` existente.

## 8. Errores y seguridad

- Los secretos (claves de proveedor, SMTP, Stripe, GitHub, Langfuse):
  - se cifran en reposo;
  - nunca vuelven al navegador;
  - nunca se registran en log ni auditoría.
- Un fallo al descifrar (cambió `SECRETS_KEY`) no tumba el arranque: el ajuste o proveedor queda
  como «no configurado», con un aviso en el log y en el panel («no se pudo descifrar; vuelve a
  introducirla»).
- Un valor inválido guardado en la BD (por ejemplo, editado a mano) se ignora con aviso y se usa el
  valor por defecto.
- Todas las rutas nuevas exigen admin de plataforma. Se reutiliza `rateLimit` para `test` y
  `runs`.
- Los cambios en `settings`, `providers` y `model_catalog` quedan en `settings_audit` (con `key`
  `provider:<id>` / `model:<id>`).

## 9. Pruebas

- **Helper** `test/helpers/pg.mjs`: `freshDatabase()` crea `forja_t_<aleatorio>` en el servidor de
  `TEST_DATABASE_URL` (por defecto `postgres://forja:forja@127.0.0.1:5433/postgres`) y devuelve su
  URL y una función `drop()`. Lo usan `e2e`, `agents`, `github` y los tests unitarios que tocan la
  plataforma (`auth`, `metrics`, `toolOutputs`).
- `agents.mjs` y `github.mjs` sustituyen sus variables `OPENAI_*`, `FORJA_MODELS`, `FORJA_EVALS*`
  y `GITHUB_*` por un `seed.local.json` temporal.
- **Unidad nuevas**:
  - registro y validación de ajustes, enmascarado de secretos;
  - aplicación sobre `config` y reset;
  - migraciones idempotentes;
  - seeders `defaults`/`local` idempotentes, con `local` rellenando solo lo que falta;
  - `providers()`/`availableModels()` desde la BD.
- **e2e**:
  - un no-admin recibe 403 en `/admin/settings`;
  - ida y vuelta de un ajuste y efecto real (cambiar `signup` a `closed` impide crear cuenta por
    código);
  - un secreto no vuelve en claro.
- **agents.mjs** (modelo simulado):
  - probar proveedor y modelo contra el LLM falso;
  - una ejecución de playground del rol `backend` que escribe un archivo;
  - estadísticas del enrutador no vacías tras un turno.
- CI con servicio Postgres. Antes de terminar se pasan `typecheck`, `test`, `build`, `test:e2e`,
  `test:agents` y `test:github`.

## 10. Documentación

- `.env.example` reducido.
- `seed.local.example.json`.
- `README.md` (arranque con Postgres, scripts `db:*`, panel de administración).
- `docs/despliegue-coolify.md` (servicio Postgres y variables que desaparecen).
