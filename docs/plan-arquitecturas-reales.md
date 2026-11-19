# Plan: arquitecturas reales en las apps generadas

## Objetivo

Que Forja genere aplicaciones con **varios frontends, APIs, workers y
librerías compartidas**, organizadas como un monorepo real, y que pueda
evolucionarlas hacia microservicios, **sin perder ninguna funcionalidad
actual** (rutas por archivo, `ctx`, BaaS, vista previa, publicación,
migraciones, jobs, realtime, seguridad, GitHub, checkpoints, MCP).

Este plan complementa, no sustituye, a:

- [plan-runtime-multistack.md](plan-runtime-multistack.md): toolchains
  FastAPI/Go/Spring, runner aislado y artefactos.
- [plan-escalado-microservicios.md](plan-escalado-microservicios.md):
  escalar la propia plataforma.
- [project-services.md](project-services.md): `forja.services.json`
  (pools de procesos por servicio).

## Diagnóstico

La limitación no es una carpeta: es que **la ruta de un archivo decide su
significado**, y esa regla está copiada en varios sitios.

| Sitio | Regla fija |
|---|---|
| `projects/domain/ProjectPath.ts` | Lista blanca de carpetas raíz (`pages`, `components`, `helpers`, `endpoints`, `jobs`, `static`, `migrations`, `src/main`…) |
| `app-runtime/domain/routes.ts` | `pages/x.tsx` → ruta; `endpoints/x_GET.ts` → endpoint; `jobs/x.ts` → tarea |
| `app-runtime/infrastructure/bundler.ts` | Un único bundle de navegador desde `pages/`; hash de servidor sobre `endpoints|jobs|helpers` |
| `app-runtime/domain/securityScan.ts` | Cliente/servidor por prefijo |
| `builder/infrastructure/projectIndex.ts` | Tipo de archivo por prefijo |
| `builder/infrastructure/BuilderTurnAdapter.ts` | `BUILDER_FILES`: lo que el agente puede escribir |
| `integrations` (importar de GitHub) | Descarta todo lo que `ProjectPath` rechaza |

Consecuencias: un solo frontend, una sola superficie de API, sin carpetas de
dominio libres, sin monorepo y sin posibilidad de importar repositorios con
otra estructura.

## Idea central

1. Un **layout de proyecto** (`contracts/projectLayout.ts`) es la única
   fuente de verdad sobre qué es cada archivo: componente, rol (página,
   endpoint, tarea, cliente, servidor, compartido, estático, migración,
   configuración) y ruta pública.
2. Un **manifiesto opcional `forja.json`** declara componentes. Cada
   componente es una carpeta con un tipo (`web`, `api`, `worker`,
   `library`) y dentro **reutiliza las convenciones nativas** relativas a su
   raíz (`pages/`, `endpoints/`, `jobs/`, `components/`, `static/`,
   `base.css`) **más carpetas libres** (`domain/`, `application/`,
   `infrastructure/`, `features/`…).
3. **Sin manifiesto, nada cambia.** Los archivos nativos en la raíz forman
   siempre el componente implícito `app`, con las mismas reglas que hoy.
   Con manifiesto, el componente `app` sigue existiendo junto a los nuevos.

Así cada componente obtiene gratis lo que ya funciona (rutas por archivo,
`ctx`, BaaS, sandbox, compilación, jobs, migraciones, servicios), y la
estructura interna deja de estar limitada.

## Manifiesto `forja.json` (versión 1)

```json
{
  "version": 1,
  "components": {
    "admin":   { "kind": "web",     "root": "apps/admin",       "mount": "/admin" },
    "orders":  { "kind": "api",     "root": "services/orders",  "route": "orders", "replicas": 2 },
    "billing": { "kind": "worker",  "root": "services/billing", "maxConcurrency": 2 },
    "domain":  { "kind": "library", "root": "packages/domain" }
  }
}
```

Reglas validadas (un manifiesto inválido falla la compilación, nunca se
ignora en silencio):

- Nombres: `^[a-z][a-z0-9-]{0,39}$`; reservados `app` y `monolith`. 1–32
  componentes. Campos desconocidos rechazados.
- `root`: ruta relativa de 1–4 segmentos `[a-z0-9][a-z0-9._-]*`; no puede
  empezar por una carpeta nativa (`pages`, `components`, `helpers`,
  `endpoints`, `jobs`, `static`, `migrations`, `src`) ni reservada
  (`node_modules`, `docs`, `_forja`); dos raíces no pueden solaparse.
- `web.mount`: `/` o `/segmento[/segmento]` en minúsculas; único; no puede
  empezar por `/_api`, `/_baas`, `/_forja`, `/static`, `/__examples`.
  `/` solo si la raíz no tiene `pages/` propias.
- `api.route`: prefijo de rutas (por defecto el nombre); único.
- `replicas` (1–8) y `maxConcurrency` (1–32) en `api` y `worker`: generan
  automáticamente el servicio equivalente de `forja.services.json`
  (proceso propio por componente). Un archivo no puede estar a la vez en un
  componente con réplicas y en `forja.services.json`.
- `worker` no puede tener `endpoints/`; `library` no puede tener páginas,
  endpoints ni tareas; `web` no puede tener endpoints ni tareas (van en
  una `api`).

### Rutas públicas de cada componente

| Archivo | Componente | Resultado |
|---|---|---|
| `pages/about.tsx` | `app` (implícito) | `/about` (igual que hoy) |
| `apps/admin/pages/_index.tsx` | `admin` (mount `/admin`) | `/admin` |
| `apps/admin/pages/users.$id.tsx` | `admin` | `/admin/users/:id` |
| `endpoints/todos/list_GET.ts` | `app` | `GET /_api/todos/list` (igual) |
| `services/orders/endpoints/create_POST.ts` | `orders` (route `orders`) | `POST /_api/orders/create` |
| `jobs/cleanup.ts` | `app` | tarea `cleanup` (igual) |
| `services/billing/jobs/invoice.ts` | `billing` | tarea `billing.invoice` |

Cada `web` se compila como **bundle propio** (`/_forja/app.js?c=<nombre>`)
con su `_layout.tsx`, `_404.tsx`, `base.css` y `static/` (servido en
`<mount>/static/…`). Navegar entre componentes web es una navegación
completa del navegador.

Imports: rutas relativas dentro del componente; `~/` sigue apuntando a la
raíz del proyecto (`~/packages/domain/order.ts`), así las librerías se
comparten sin alias nuevos.

## Fases

### Fase 0 — Layout como fuente de verdad (sin cambio de comportamiento)

- Crear `contracts/projectLayout.ts` (núcleo compartido puro: lo pueden
  importar las capas `domain` de cualquier contexto).
- `ProjectPath`, `routes.ts`, `securityScan`, `projectIndex`,
  `BUILDER_FILES`/propiedad del agente y el hash de servidor del bundler lo
  consultan en vez de comprobar prefijos.
- **Pruebas de equivalencia**: para cada ruta de los proyectos semilla y de
  un corpus de rutas válidas e inválidas, el resultado sin manifiesto es
  idéntico al de las reglas anteriores (copiadas literalmente en la prueba).

Criterio de salida: suite completa en verde con los mismos resultados que
la línea base.

### Fase 1 — Manifiesto y estructura libre

- Parser/validador del manifiesto con errores en español apuntando a
  `forja.json`.
- `ProjectPath.isValid(path, layout?)`: además de lo nativo, `forja.json` y
  cualquier ruta dentro de la raíz de un componente declarado. Siguen
  prohibidos `..`, `//`, rutas absolutas, `node_modules`/`.git` y caracteres
  fuera del conjunto actual. (`README.md` y `docs/` se dejan fuera a
  propósito: cambiarían lo que se sincroniza con GitHub.)
- Escritura de archivos, renombrado, importación desde GitHub y sincronía
  validan contra el manifiesto del proyecto (el manifiesto se escribe
  primero; escribirlo valida su forma).
- El agente puede escribir en las raíces declaradas; el prompt y una guía
  MCP (`architecture`) explican cuándo usar componentes y cuándo no (por
  defecto, monolito modular).

### Fase 2 — Ejecución de componentes

- `pageRoutes`, `endpointRoutes` y `jobFiles` devuelven las rutas de todos
  los componentes con su `component`; detectan colisiones.
- Servidor de apps: elige el componente web por el prefijo más largo de la
  URL, sirve su HTML/bundle/estáticos; `/_api/*` encuentra endpoints de
  cualquier `api` sin tocar el despacho.
- Componentes con `replicas`/`maxConcurrency` → servicio derivado (proceso
  aislado por componente) usando la infraestructura de `forja.services.json`.
- `check_build` compila cada bundle web y cada módulo de servidor y aplica
  las reglas por tipo (worker sin endpoints, etc.).

### Fase 3 — Constructor y estándares por componente

- `project_map` agrupa por componente; el planificador puede proponer el
  manifiesto (decisión de arquitectura) y asignar tareas por raíz de
  componente.
- `check_standards`: reglas de capas dentro de cada componente
  (`domain` → `application` → `ports` → `infrastructure`), una `web` no
  importa código de servidor de una `api`, una `library` no importa de
  componentes.
- Plantillas: monolito (actual), web + api, web + admin + api + worker.

### Fase 4 — Datos por servicio

- `database` por componente: esquema Postgres propio dentro de la base del
  proyecto, con `search_path` del `ctx.db` del componente y migraciones en
  `<root>/migrations/`. Publicación, vista previa y duplicado iteran por
  esquema.
- Eventos entre componentes sobre la cola durable actual (`ctx.jobs`),
  con idempotencia y entrega al menos una vez.
- Después: base física separada por componente cuando haya Postgres
  gestionado para apps.

### Fase 5 — Otros stacks por componente

- `stack` en el componente (`forja` por defecto; `spring-boot` ya existe
  para la raíz). Se reutiliza el runtime Java aislado con `root` del
  componente y prefijo `/_api/<route>/`.
- FastAPI y Go siguen el [plan multi-stack](plan-runtime-multistack.md).
- Ampliar el puente de datos de otros lenguajes a una API BaaS completa
  (auth, storage, email, IA, jobs, realtime), no solo SQL.

### Fase 6 — Salida fuera de Forja

- Exportar con un Dockerfile por componente y `docker-compose.yml`
  generado desde el manifiesto.
- Importar de GitHub monorepos con workspaces generando el manifiesto en
  lugar de rechazarlos.

## Garantías de no regresión

1. Proyectos sin `forja.json` ejecutan exactamente las mismas reglas
   (pruebas de equivalencia de la Fase 0).
2. Las suites existentes (`test`, `test:e2e`, `test:agents`,
   `test:github`, `test:studio`) deben pasar sin modificar sus
   expectativas en cada fase.
3. El manifiesto se valida estrictamente: un error bloquea la compilación y
   aparece en «Problemas»; nunca se degrada a otra topología en silencio.
4. Rutas públicas existentes (`/`, `/_api/*`, `/_baas/*`, `/_forja/*`,
   `/static/*`) no cambian de dueño: el componente `app` las conserva.

## Riesgos y límites

- **Aislamiento.** Los endpoints siguen corriendo en el sandbox Node por
  proyecto; más componentes no cambian el límite documentado en el README
  para alojar apps de terceros.
- **Contexto del agente.** Más carpetas suponen más tokens: el índice debe
  agrupar por componente antes de recomendar arquitecturas grandes. El
  agente propone microservicios solo cuando el usuario lo pide o el dominio
  lo justifica.
- **Dependencias.** Un único `package.json` por proyecto (instalación
  compartida). `package.json` por componente queda para la Fase 6.
- **Memoria.** Cada componente con réplicas es un proceso más; aplican los
  límites de [memory.md](memory.md).

## Estado

| Fase | Estado |
|---|---|
| 0 — Layout como fuente de verdad | Implementada y verificada con pruebas de equivalencia |
| 1 — Manifiesto y estructura libre | Implementada |
| 2 — Ejecución de componentes | Implementada (preview y publicación usan el mismo servidor de apps) |
| 3 — Constructor y estándares | Implementada: guía, propiedad por rol, mapa, estándares por componente y plantilla `components` |
| 4 — Datos por servicio | Implementada: esquema y rol de Postgres por componente, migraciones propias, eventos por la cola durable |
| 5 — Otros stacks por componente | Pendiente (no hay proyectos Spring que lo necesiten) |
| 6 — Salida fuera de Forja | Implementada: «Exportar para producción» (Docker Compose) e importación/sincronización de GitHub con `forja.json` |

## Registro de implementación

### Núcleo

- `contracts/projectLayout.ts` (nuevo): manifiesto, validación, componentes,
  validez de rutas, tipo y lado (cliente/servidor) de cada archivo, rutas de
  páginas/endpoints/tareas, componente por URL y problemas del layout. Puro;
  añadido a `tsconfig.json` y a la imagen Docker (`COPY contracts`).
- `projects/domain/ProjectPath.ts`: delega en el layout; la API pública se
  conserva con un parámetro `layout` opcional.

### Escritura y GitHub

- `WriteFileUseCase` / `RenameFileUseCase`: las rutas no nativas se validan
  contra el `forja.json` del proyecto; escribir `forja.json` valida su
  contenido.
- `projects.assertValidPath(path, manifest?)`: importación y sincronización
  con GitHub aceptan las carpetas de componentes cuando el repositorio trae
  `forja.json` (se escribe primero; los estáticos binarios de componentes se
  admiten).

### Ejecución

- `app-runtime/domain/routes.ts`: páginas, endpoints, ejemplos y tareas de
  todos los componentes; las entradas del componente `app` conservan su forma.
- `bundler.ts`: `buildClient(files, { component })` con `_layout`, `_404` y
  `base.css` del componente; ejemplos con el `base.css` de su componente; el
  hash de servidor incluye `forja.json` y los componentes no web.
- `appServer.ts`: HTML, bundle (`/_forja/app.js?c=<nombre>`) y estáticos
  (`<mount>/static/…`) por componente web.
- `projectBuild.ts`: `check_build` informa del manifiesto inválido, de los
  problemas del layout y compila cada componente web.
- `domain/services.ts`: componentes `api`/`worker` con `replicas` o
  `maxConcurrency` generan su servicio; conflictos con
  `forja.services.json` se rechazan. `serviceControl` escala esos servicios
  escribiendo en `forja.json`.
- `securityScan.ts`: cliente/servidor según el layout.
- Panel de servicios: detecta tareas de componentes.

### Constructor

- `BuilderTurnAdapter.ts`: propiedad del agente = carpetas nativas +
  `forja.json` + raíces de componentes.
- `Plan.ts` / `OrchestrationPolicy.ts`: `roleCanWrite` (web → ui; api,
  worker y library → backend; `forja.json` → backend) en la validación del
  plan y en las rondas de corrección.
- `projectIndex.ts`: tipo de archivo por layout y sección «Componentes» en el
  mapa del proyecto.
- `Standards.ts`: reglas por componente (UI en web, SQL fuera de los puntos
  de entrada, límites entre componentes y entre capas `domain`/`application`
  e `infrastructure`).
- Manual (`prompt.ts`), skill `microservices-ddd` y guía MCP `components`.
- Plantilla inicial `components` (`ComponentsStarter.ts`), seleccionable en
  el Studio y por API (`template: "components"`).

### Pruebas

- `test/unit/projectLayout.test.ts`: equivalencia con las reglas anteriores
  (copiadas literalmente) sobre un corpus de rutas y las plantillas, y
  validación del manifiesto.
- `test/unit/modules/app-runtime/components.test.ts`: rutas, bundles por
  componente, compilación de endpoints por capas con librería compartida,
  servicios derivados, `check_build`, escaneo, mapa, roles del plan,
  estándares y plantilla.
- `test/e2e-components.mjs` (`npm run test:e2e:components`, añadido a CI):
  servidor real, escritura por la API, `/admin`, bundles, estáticos, API por
  capas, worker, centro de servicios, escalado y plantilla.
- Casos nuevos en `fileUseCases.test.ts` y
  `projectManagementUseCases.test.ts`. En esta última, la aserción «no lee
  nada antes de rechazar» pasa a «no lee el archivo de origen ni renombra»:
  para decidir si una ruta no nativa es válida hay que leer `forja.json`.

Resultado sobre la línea base: suite unitaria 959 correctas (938 antes) y los
mismos 5 fallos previos (Chromium no instalado, finales de línea de una skill
y dos pruebas de `projectDbEnvironments` con rutas de Windows). `test:e2e`
con los mismos resultados (solo fallan las 3 comprobaciones de Chromium) y
`test:agents` igual (solo las 3 de capturas con Chromium).

### Fase 4 — Base de datos por servicio

`"database": true` (o un nombre de esquema `[a-z][a-z0-9_]*`) en un componente
`api` o `worker`:

- **Esquema y rol.** El componente obtiene un esquema propio y el rol
  `forja_c_<esquema>`, con permisos solo sobre ese esquema (y sus tablas
  futuras). Se crean al aplicar sus migraciones o en su primer uso.
- **`ctx.db` confinado.** Cada sentencia del componente corre en una
  transacción con `SET LOCAL ROLE` y `search_path` a su esquema: las tablas de
  la app, de otros servicios y del BaaS (`_forja_users`) dan
  `permission denied`. Como la conexión de PGlite es de superusuario, en ese
  modo se rechaza `set_config` (y los identificadores `U&"…"` que podrían
  ocultarlo), que permitiría volver al rol original dentro de una sentencia.
  Probado también con `pg_read_file`, esquemas ajenos y transacciones.
- **Migraciones.** Viven en `<root>migrations/<n>_<nombre>.sql`, con
  numeración independiente de las de la raíz, y se aplican dentro de su
  esquema (con `public` visible para referenciar, p. ej., `_forja_users`).
  Mismo registro `_forja_migrations` (ruta + checksum): una migración aplicada
  modificada o borrada bloquea vista previa y publicación, igual que antes.
- **Constructor.** `execute_sql` acepta `component`; el rol `data` del plan
  puede encargarse de `<root>migrations/`; los archivos de migración de los
  componentes están protegidos como los de la raíz.
- **Datos y worker externo.** Datos y `describe_database` muestran sus tablas
  como `esquema.tabla` (las de `public`, sin cambios). El esquema viaja por la
  API interna de datos, así que el worker externo (`job-worker`) también lo
  respeta.
- **Plantilla `components`.** `orders` y `billing` tienen cada uno su esquema y
  se comunican por eventos (`billing.invoice` → `orders.invoiced`); ninguno toca
  las tablas del otro.
- **Retirar o mover la base de datos de un componente.** Las migraciones de un
  componente se registran por esquema y nombre de archivo
  (`orders:migrations/001_orders.sql`), así que mover su carpeta conserva su
  historial; las filas antiguas registradas por ruta se reescriben solas. Si
  ningún componente declara ya un esquema (se quitó `"database"` o se cambió su
  nombre), queda **retirado**: el esquema y sus datos se conservan intactos,
  su historial deja de bloquear vista previa y publicación, y la publicación
  devuelve un aviso (Studio, `publish_app`) con cómo recuperarlo (volver a
  declararlo con sus migraciones) o copiar sus datos a otro esquema (una
  migración del nuevo esquema puede leer el anterior). `check_build` pide borrar
  las migraciones de un componente sin `"database"`; el constructor solo puede
  borrarlas en ese caso, y solo puede moverlas con su carpeta sin cambiarles el
  nombre. Borrar migraciones aplicadas de un esquema que sigue declarado se
  sigue rechazando, ahora explicando cómo retirarlo. La exportación
  (`migrate.mjs`) aplica las mismas reglas.
- **Arreglo previo de la cola.** La cola durable embebida ahora arranca aunque
  no haya proyectos publicados: antes `ctx.jobs.enqueue` no se procesaba en
  vista previa hasta publicar algo.

La app y los componentes sin `database` siguen igual: `migrations/` de la raíz y
`ctx.db` con acceso completo. La app puede leer los esquemas de los
componentes (por ejemplo, para informes).

### Fase 6 — Exportar para producción

Ajustes del proyecto → «Exportar para producción»
(`GET /api/projects/:id/export-standalone`) descarga un zip que funciona sin
Forja (`docker compose up --build`):

| Pieza | Contenido |
|---|---|
| `db` | Postgres 17 con volumen. |
| `migrate` | `migrate.mjs` + `plan.json` + migraciones: crea el rol de la app, un esquema y un rol con contraseña por componente con base de datos, y la cola `public.forja_jobs`; aplica las migraciones una vez, con el mismo registro y las mismas reglas que Forja. |
| `services/<nombre>` | Uno por `api`/`worker` (y `app` si tiene endpoints o tareas): endpoints y tareas compilados con el bundler de Forja, `server.mjs` (runtime mínimo), `manifest.json`, `package.json` con lo que importan los bundles y Dockerfile. Se conecta con el rol de su componente. `replicas` se traduce a `deploy.replicas`. |
| `gateway` | nginx: cada frontend compilado en su `mount`, `/_api/<route>/` hacia su servicio, `/_api/` hacia `app`, `/_baas/` responde 501. |

El runtime replica el contrato de `ctx`: respuestas JSON o `Response`, `fail`,
errores de zod → 400, 404 para rutas desconocidas, `setCookie`, secretos por
variables de entorno con el mismo nombre (Forja nunca exporta valores) y caché
en memoria. Las tareas usan una cola compartida en Postgres (`SKIP LOCKED`, al
menos una vez, 3 intentos con espera creciente, estado `dead`); cada servicio
ejecuta solo las suyas y `schedule` funciona con cron, con una clave de
deduplicación para que varias réplicas no repitan un disparo. Inicio de sesión
(`ctx.user` es `null`, `requireUser` → 401), archivos, correo, IA, tiempo real y
pagos responden 501 con un mensaje claro. No se copian filas: la exportación
parte de una base vacía. Exportar una app que no compila se rechaza con sus
errores.

Verificado con `npm run test:export`: exporta la plantilla, ejecuta las
migraciones y los tres servicios con Node contra Postgres, recorre la cadena de
eventos entre procesos y comprueba el aislamiento por roles en Postgres. El
`docker-compose.yml` generado se validó como YAML. No había Docker ni nginx en
la máquina de verificación: la construcción de las imágenes y la configuración
de nginx no se ejecutaron.

### Proyectos legacy y migración asistida

Los proyectos legacy (sin `forja.json`, todo en `pages/`, `components/`,
`helpers/`, `endpoints/`, `jobs/`, con o sin `forja.services.json`) siguen
funcionando igual y se puede seguir trabajando en ellos; migrar es opcional y
por contextos. El agente y cualquier cliente MCP tienen:

| Herramienta / guía | Qué hace |
|---|---|
| `architecture_migration_plan` (lectura) | Un componente por contexto (`endpoints/<ctx>/`, `helpers/<ctx>/`, servicios de `forja.services.json`): archivos que van a `services/<ctx>/` y a una library `packages/<ctx>/` (lo que importan las páginas), rutas, tareas, tablas exclusivas o compartidas, escala heredada y avisos (prefijos de ruta imposibles, adaptadores importados desde páginas, imports entre contextos, helpers compartidos). |
| `extract_component` (escritura, versionada en MCP) | Extrae un contexto: declara el componente (y su library) en `forja.json`, mueve los archivos con su historial, reescribe los imports, quita esos archivos de `forja.services.json` (y lo elimina si queda vacío) heredando réplicas y concurrencia. Compila el resultado en memoria antes de escribir y deshace todo si algo falla. Rechaza contextos inexistentes, rutas ya servidas por otro componente y tablas no exclusivas, explicando qué hacer. |
| `database: true` + `move_tables` | Base de datos por servicio como paso aparte: genera `<root>migrations/<ts>_extract_<esquema>.sql` con `alter table public."t" set schema …` para tablas que solo usa el contexto; tras la migración se vuelven a conceder permisos al rol (las tablas movidas no heredan los permisos por defecto). |
| Skill `migrate-to-components`, guía MCP `legacy-migration`, manual | El procedimiento: planificar, resolver avisos, extraer un contexto, verificar (`check_build`, `call_endpoint`, `get_problems`) y seguir con el siguiente; no migrar sin que el dueño lo pida. |

Lo que no cambia al extraer:

- **Rutas públicas:** el prefijo de la `api` es el nombre del contexto, así que
  `endpoints/orders/create_POST.ts` → `services/orders/endpoints/create_POST.ts`
  sigue en `/_api/orders/create`.
- **Nombres de las tareas:** `legacyJobNames: true` mantiene `invoice` en lugar
  de `billing.invoice`. Así siguen funcionando las colas pendientes, los
  temporizadores, los ajustes y cada `ctx.jobs.enqueue("invoice")`. Si dos
  tareas terminan con el mismo nombre, `check_build` lo avisa.
- **Las páginas** siguen en la app.

Verificado con `componentMigration.test.ts` (plantilla `orders-invoices` como
proyecto legacy real: plan, extracción de cada contexto hasta retirar
`forja.services.json`, compilación, rutas, tareas, escala, `move_tables` y
rechazos) y con la e2e de componentes por MCP (plan, extracción, mismas URLs y
datos en vista previa, centro de servicios, publicación).

### Mapear proyectos con otra estructura

Un proyecto no tiene que reorganizarse para Forja: `forja.json` puede mapear su
estructura.

```json
{
  "version": 1,
  "components": {
    "site": {
      "kind": "web", "root": "src", "mount": "/",
      "paths": { "pages": "routes", "components": "ui", "static": "public", "styles": "index.css" },
      "conventions": { "pages": "folders" }
    },
    "backend": {
      "kind": "api", "root": "backend", "route": "api",
      "paths": { "endpoints": "handlers", "jobs": "workers", "migrations": "db/sql" },
      "conventions": { "endpoints": "dot" },
      "database": true
    }
  }
}
```

- **`paths`** (relativas a `root`):
  - `web`: `pages`, `components`, `static`, `styles` (un `.css`);
  - `api`: `endpoints`, `jobs`, `migrations`;
  - `worker`: `jobs`, `migrations`.

  `pages` y `endpoints` admiten `""` (la raíz del componente). Los estáticos se
  sirven siempre en `<mount>/static/…`, también en la exportación.
- **`conventions`**:
  - páginas `dots` (`posts.$id.tsx`) o `folders` (`posts/[id].tsx`, con
    `index.tsx` para la raíz de cada carpeta; las carpetas `_privadas` no son
    rutas);
  - endpoints `suffix` (`create_POST.ts`), `dot` (`create.post.ts`) o `folders`
    (`create/POST.ts`). Los endpoints con parámetros en la ruta (`[id]`) se
    señalan como problema.
- **Raíz `src`:** se permite (código de otros frameworks), salvo `src/main` y
  `src/test`, que son del backend Spring. Si conviven, `check_build` lo avisa.
- **Patrones en `forja.services.json`:** `endpoints` y `jobs` aceptan patrones
  (`backend/handlers/**/*.post.ts`; `*` dentro de una carpeta, `**` a cualquier
  profundidad). Un patrón sin coincidencias es un error. Al extraer un contexto
  se retiran los patrones que dejan de coincidir.
- **Editar los manifiestos:** el agente del Studio puede editar
  `forja.services.json` (antes no estaba entre sus archivos) además de
  `forja.json`; en el plan del equipo los dos son del rol backend.
- **`check_manifest`** (herramienta de lectura, también en MCP): aplica en
  memoria un `forja.json` y/o `forja.services.json` propuestos y muestra qué
  sirve cada componente, los servicios expandidos, los problemas y los archivos
  que quedan fuera, sin escribir nada.
- **GitHub:** un repositorio con configuración de otro framework (Vite, Next…)
  se importa si trae un `forja.json` que lo mapee. Su configuración no se
  importa y se avisa.
- **Migraciones en carpetas mapeadas:** se registran por esquema y nombre de
  archivo, con las mismas reglas que las de `migrations/`. Siguen protegidas: el
  constructor solo las crea con `execute_sql` y `component`.

La app nativa (sin `forja.json`) no cambia: usa siempre las carpetas y nombres
de Forja. Las pruebas de equivalencia lo siguen comprobando.

Verificado con `projectMapping.test.ts` (convenciones, roles, validación,
compilación, rutas, migraciones en su esquema, patrones, `check_manifest`,
permisos del plan), la exportación de un proyecto mapeado y la e2e de
componentes. En esa e2e, un proyecto con `src/routes`, `src/ui`, `src/public`,
`backend/handlers/*.post.ts` y `backend/db/sql` se mapea por MCP y la vista
previa sirve sus páginas, estáticos y endpoints con su tabla en el esquema del
servicio.

### Pendiente

- **Fase 5.** Spring Boot dentro de un componente (`services/x/pom.xml`) se
  puede escribir, pero el runtime Java solo arranca con `pom.xml` en la raíz. La
  exportación tampoco incluye backends Java.
- **Servicios de plataforma en la exportación**: sustituir inicio de sesión,
  archivos, correo, IA, tiempo real y pagos por adaptadores propios.
- **Navegación entre componentes web**: es una navegación completa; un
  `<Link>` de `@forja/client` solo navega dentro de su componente.
- **Borrar un esquema retirado**: se conserva siempre; borrarlo (y sus datos)
  requiere hacerlo a mano en la base de datos.
