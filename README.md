# Forja

Constructor de apps full-stack por chat, con su propio BaaS incluido. Es una reimplementación propia del modelo de producto de Floot (y Lovable): describes la app en un chat, un agente escribe el código, crea la base de datos y la publica. No contiene código, marca ni recursos de Floot; se reconstruyó a partir de su documentación pública (`floot.com/docs`).

## Arranque

La plataforma guarda sus datos en Postgres (`DATABASE_URL`). Las bases de datos de cada app siguen siendo PGlite embebido bajo `DATA_DIR`.

```bash
npm install
cp .env.example .env   # pon SECRETS_KEY y DATABASE_URL
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres   # o tu propio Postgres
npm run build          # compila el studio
npm start              # http://localhost:4100 (aplica las migraciones al arrancar)
```

Después, en el studio, **Administración → Proveedores**: activa al menos uno (Anthropic, OpenRouter o un servidor compatible con OpenAI) y pon su clave. Para no repetirlo tras cada reinicio de la base, copia `seed.local.example.json` a `seed.local.json` (fuera de git) con tus claves: se aplica al arrancar a lo que no se haya cambiado en el panel.

Base de datos:

| Script | Qué hace |
|---|---|
| `npm run db:migrate` | Aplica las migraciones pendientes (`server/shared/database/migrations`) y los valores por defecto. También ocurre al arrancar. |
| `npm run db:seed` | Aplica `seed.local.json` (o `FORJA_SEED_FILE`) a lo que falte; `-- --force` lo sobrescribe. |
| `npm run db:seed:dev` | Datos de desarrollo: `admin@forja.test` / `forja-admin-1234`, `dev@forja.test` / `forja-dev-1234`, una organización y dos proyectos. No corre con `NODE_ENV=production`. |
| `npm run db:reset` | Borra todo, migra y vuelve a sembrar. |

Con Docker (incluye Chromium para `browser_test`; `--build-arg BROWSER=0` lo quita):

```bash
docker build -t forja .
docker run -p 4100:4100 -v forja-data:/app/data -e SECRETS_KEY=... -e DATABASE_URL=postgres://... forja
```

Con Docker Compose (Postgres, volúmenes, healthcheck y variables listos; el mismo archivo se importa en Coolify):

```bash
cp .env.example .env   # define SERVICE_HEX_64_SECRETSKEY, SERVICE_PASSWORD_POSTGRES, SERVICE_PASSWORD_APP_DATA y SERVICE_PASSWORD_BUILDER
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Producción en Coolify, con dominio, HTTPS y subdominios comodín para las apps: [docs/despliegue-coolify.md](docs/despliegue-coolify.md).

Desarrollo con recarga: `npm run dev` (servidor en :4100 + studio Vite en :5173). Sin SMTP, el código de acceso al studio aparece en la consola del servidor.

**PWA del Studio.** `npm run build` genera el manifest, los iconos y un service worker versionado. Sirve la aplicación por HTTPS (localhost también permite probarla): Chrome/Edge ofrecen «Instalar Forja» cuando el navegador la considera instalable; en iOS se usa Safari → Compartir → Añadir a pantalla de inicio. No necesita claves ni servicios externos y el worker no se registra en desarrollo. El servidor revalida HTML, manifest y worker; los assets con hash son inmutables. Conserva esa política en el proxy/CDN.

Solo se precachean recursos estáticos públicos y una pantalla offline. Nunca se cachean respuestas de `/api`, sesiones, proyectos, imágenes privadas ni apps publicadas. Sin conexión no se pueden editar proyectos o ejecutar agentes; mantén abiertas las pestañas con cambios pendientes. Las actualizaciones no recargan automáticamente: se avisa para guardar el trabajo y luego actualizar. El alcance de esta PWA es Forja, no las aplicaciones construidas por sus usuarios.

Validación: `npm run build` y `npm run test:pwa` prueban con Chromium la instalabilidad, los iconos, el modo offline, la exclusión de datos privados, las actualizaciones con varias pestañas y la limpieza de cachés. `npm run test:studio` verifica también las cabeceras del servidor real. El worker conserva como máximo la versión actual y una anterior para los chunks de pestañas abiertas; tras varios despliegues, una pestaña antigua puede requerir recarga y mostrará un aviso.

**Primer arranque (sin usuario por defecto).** Una instalación nueva no tiene cuentas ni contraseñas conocidas: el servidor imprime en su log un token de un solo uso (o usa `FORJA_BOOTSTRAP_TOKEN`, mínimo 16 caracteres) y con él se crea la primera cuenta de administración en la pantalla de configuración. Al existir una cuenta, el token deja de servir. Después se entra con correo + contraseña, o con un código por correo (que también crea cuentas nuevas). Quién puede crear cuenta se decide en Administración → General: abierto (por defecto), solo invitados o cerrado.

**Administración.** Las cuentas con rol de administración de la plataforma ven «Administración» en el menú (`/admin`). Todo lo que antes eran variables de entorno se cambia ahí, sin reiniciar:
- **General**: registro de cuentas, créditos, lista blanca de modelos, SMTP, Stripe, GitHub, Langfuse, paquetes npm, navegador y los topes de los evals. Lo genera el registro `server/modules/settings/index.ts`; los secretos se guardan cifrados con `SECRETS_KEY` y nunca vuelven al navegador.
- **Proveedores**: claves y URL de Anthropic, OpenRouter, el compatible con OpenAI y los que añadas, con «Probar conexión».
- **Modelos**: el catálogo entero (activar, calidad, velocidad, precios), modelos propios, la lista blanca con cuántos modelos casa cada patrón, la sincronización de OpenRouter y «Probar» por modelo (texto y una llamada a herramienta; el coste no se cobra a nadie).
- **Agentes**: un playground que ejecuta un agente de un rol con el modelo que elijas en un proyecto desechable, y muestra sus pasos, su coste y los archivos que escribió.
- **Enrutador**: lo que ha aprendido por tipo de tarea y sus últimas decisiones; se puede olvidar.
- **Evals** y **Usuarios**.

**Organizaciones (tenants).** Cada cuenta tiene una organización personal; se pueden crear organizaciones de equipo (`/api/orgs`) con roles `owner`/`admin`/`member`. Cada proyecto pertenece a una organización y sus miembros lo abren como editores. Los tokens MCP pueden limitarse a una organización. Los administradores de la plataforma gestionan cuentas, no los proyectos de otros.

Pruebas: necesitan un Postgres en `TEST_DATABASE_URL` (por defecto `postgres://forja:forja@127.0.0.1:5433/postgres`; cada prueba crea y borra su propia base): `docker run -d -p 5433:5432 -e POSTGRES_USER=forja -e POSTGRES_PASSWORD=forja postgres:17-alpine`. Luego `npm run typecheck`, `npm test` (unidad: enrutador, aprendizaje, índice, ajustes, catálogo, migraciones), `npm run test:e2e` (studio, todos los servicios BaaS, vista previa, publicación, tiempo real, MCP y la API de administración, sin LLM) `npm run test:agents` (equipo de agentes contra un modelo simulado: plan, paralelismo, propiedad de archivos, revisión, listas blancas, respaldo, costes, modos Chat/Plan, arreglo automático, pruebas de conexión y playground) y `npm run test:github` (sincronización con una API de GitHub simulada y el registro de problemas). En GitHub, `.github/workflows/ci.yml` pasa tipos, unidad, build, e2e y agentes (con Chromium y un servicio Postgres) en cada PR y push a `main`, y construye y arranca la imagen Docker.

## Cómo está hecho

La aplicación conserva un núcleo modular y sus APIs públicas, pero Compose ejecuta tres procesos Node: `forja` (studio/API/MCP), `app-runtime` (apps y propietario único de PGlite) y `builder` (turnos de agentes y tools). Comparten Postgres y el volumen de archivos; las llamadas internas están autenticadas. En desarrollo sin Compose, los límites de servicios siguen siendo opcionales y los adaptadores locales se conservan. Los contextos de negocio están en `server/modules/`:

| Contexto DDD | Responsabilidad |
|---|---|
| `identity` | Cuentas, acceso, sesiones, contraseñas y tokens |
| `collaboration` | Organizaciones, miembros, invitaciones y permisos |
| `projects` | Proyectos, archivos virtuales, carpetas, checkpoints e historial |
| `settings` | Validación de ajustes, secretos, auditoría y configuración en vivo |
| `builder` | Ejecución de agentes y políticas del constructor |
| `model-management` | Catálogo, proveedores, selección y aprendizaje de modelos |
| `app-runtime` | Compilación, ejecución aislada, vistas previas y publicación |
| `app-services` | Datos PGlite, autenticación, storage, correo, IA, jobs, realtime y pagos de las apps |
| `integrations` | Conexiones externas y sincronización con GitHub |
| `usage` | Contabilidad y límites de uso |
| `memory` | Memoria persistente del constructor |
| `project-observability` | Eventos, problemas y revisiones de los proyectos |
| `evaluations` | Admisión, presupuesto, ejecución, scoring y playground de evaluaciones |

Cada contexto separa `domain/` (entidades, objetos de valor y reglas), `application/` (casos de uso), `ports/` (contratos) e `infrastructure/` (Postgres e integraciones). Las dependencias del núcleo apuntan hacia dentro y se inyectan; otros contextos acceden únicamente por entradas públicas. No quedan directorios ni fachadas de compatibilidad del backend antiguo.

`server/bootstrap/` compone los módulos y los entrypoints de los tres procesos (`server.ts`, `appRuntimeServer.ts`, `builderServer.ts`). Los servicios comparten Postgres; `app-runtime` es el único que abre las bases PGlite y `forja`/`builder` acceden por su API interna. Los turnos SSE y tools del builder cruzan un API interno autenticado; eventos de archivos y cambios de configuración se propagan entre procesos. Las transacciones de Postgres preservan cuenta + organización personal y proyecto + archivos; Postgres, PGlite y servicios externos no forman una transacción distribuida.

Studio organiza su shell en `studio/src/app/`, capacidades en `studio/src/features/` y componentes/transportes técnicos en `studio/src/shared/`. Los workflows usan puertos de transporte comprobables sin navegador. SDK mantiene las entradas de producto `@forja/client`, `@forja/server` y `@forja/ui`, con implementaciones internas por capacidad y dependencias de navegador inyectables.

**Compatibilidad:** no cambia el esquema existente ni el contrato público HTTP, cookies, SSE, WebSocket, MCP o SDK. Los imports internos antiguos sí se eliminan: herramientas locales deben usar `server/modules/<contexto>/` y los nuevos comandos de `package.json`. El punto de arranque es `server/bootstrap/server.ts`; las migraciones viven en `server/shared/database/`; CLI y seeds de instalación/desarrollo en `server/bootstrap/database/`.

La migración se valida con ciclos TDD y pruebas de regresión. `npm run test:architecture` comprueba todos los contextos: dependencias hacia dentro, entradas públicas, ciclos runtime (incluyendo imports dinámicos y reexports), aislamiento de Studio/SDK y ausencia de SQL en núcleo y handlers. `npm test` incluye estas restricciones y la ausencia de acceso a DB/timers al importar módulos. Los casos de uso con puertos simulados no requieren Postgres; los adaptadores e integraciones sí. En equipos con pocos recursos o Postgres compartido: `npm test -- --maxWorkers=2 --hookTimeout=30000`. `npm run test:studio` verifica flujos reales del Studio en Chromium; CI ejecuta también GitHub simulado y arranque/Chromium de Docker.

```
studio ──/api──▶ forja (Hono, Node 22+) ──┬──▶ Postgres
                   │                      ├──▶ builder (SSE, tools, Node 22+)
                   │                      └──▶ app-runtime (apps, PGlite propietario)
                   └── MCP (/mcp) ────────────▶ builder
apps generadas ──▶ app-runtime: pv-<id> (vista previa) / <slug> (publicada)
```

- **Proyecto** = árbol de archivos virtual guardado en la BD de la plataforma: `pages/`, `components/`, `helpers/`, `endpoints/<ruta>_GET|POST.ts`, `jobs/`, `static/`, `base.css`. No hay disco por proyecto; esbuild compila directo desde la BD.
- **Cada app vive en su propio origen**, así su código nunca toca la sesión del studio. Dentro del iframe del studio sus cookies van particionadas (CHIPS).
- **Base de datos**: un Postgres 18 embebido (PGlite) por proyecto, compartido por vista previa y app publicada. Se "duerme" tras 60 s sin consultas y despierta en la siguiente.
- **Equipo de agentes**: cada mensaje pasa por un análisis (heurística + clasificador barato si hace falta). Los cambios pequeños van por la vía rápida (un agente). Los grandes los planifica un agente que reparte tareas con dependencias y archivos propios entre especialistas de **datos**, **backend** e **interfaz**, que trabajan **en paralelo** (cada uno solo puede escribir sus archivos); después un agente de **revisión** compila, prueba y devuelve arreglos (hasta 2 rondas). El chat muestra un carril por agente con su modelo, pasos, tokens y coste.
- **Enrutador de modelos** (`server/modules/model-management/router.ts`): para cada agente puntúa los modelos permitidos (lista blanca de plataforma ∩ cuenta ∩ proyecto) por calidad aprendida (Thompson sampling por tipo de tarea, con recompensas de compilación, pruebas, revisión, Detener y deshacer), precio según el modo del proyecto (Ahorro/Equilibrado/Calidad) y velocidad; si un modelo falla, pasa al siguiente. Cada decisión queda registrada y visible en Ajustes del proyecto.
- **Ahorro de tokens**: índice del proyecto estilo grafo (`server/modules/builder/infrastructure/projectIndex.ts`: exports, imports, rutas, endpoints, tablas, llamadas a la API) con las herramientas `project_map`, `find_symbol`, `related_files` y lecturas por rangos; cada especialista recibe solo los archivos de su tarea y vecinos; caché de prompts de Anthropic; prompts por rol; resumen acumulado de la conversación en vez del historial completo; `edit_file` antes que reescribir. Cada turno informa coste, tokens servidos desde caché y ahorro frente a usar siempre el modelo más potente.
- **Errores al alcance del chat**: la vista previa informa de errores no capturados (con su pila), `console.error` y llamadas a `/_api` que fallan (método, ruta, código HTTP y respuesta); el servidor añade los fallos de endpoints y tareas, y la compilación se vuelve a comprobar tras cada cambio. Todo queda deduplicado en «Problemas» (`server/modules/project-observability/problems.ts`): el studio lo muestra sobre el chat con «Intentar arreglar», la página de error de la vista previa trae su propio botón, cada turno empieza con los problemas abiertos en el contexto, el agente tiene `get_problems`, y si un cambio rápido rompe la compilación se lanza solo una pasada de arreglo (hasta dos).
- **Modos del chat**: *Construir* (cambia la app), *Chat* (pregunta e investiga con herramientas de solo lectura, modelo barato) y *Plan* (el planificador prepara un plan que se revisa y se lanza con «Implementar plan», sin volver a planificar). Los mensajes escritos mientras trabaja se ponen en cola.
- **GitHub** (`server/modules/integrations/github.ts`): sincronización en los dos sentidos solo con la API REST (sin git ni disco). Cada turno del constructor se sube como un commit con el nombre de la petición; otras ediciones, a los pocos segundos. Los commits hechos fuera entran al proyecto (por webhook firmado o consultando cada minuto) y aparecen en el chat con su resultado de compilación y «Intentar arreglar» si fallan. Solo se sincronizan las carpetas del proyecto; el resto del repositorio (README, CI…) no se toca. La cuenta se conecta con OAuth o con un token personal guardado cifrado.
- **SDK**: el navegador usa `@forja/client` (router, `api`, `useApi`, `auth`, `storage`, `realtime`, `ai`); los endpoints y tareas reciben `ctx` (`db`, `user`, `storage`, `email`, `ai`, `jobs`, `realtime`, `payments`, `env`). El manual completo que lee el agente está en `server/modules/builder/infrastructure/prompt.ts`.
- **Paquetes npm** (`server/modules/app-runtime/index.ts`): además de `react`, `react-dom` y `zod`, cada app puede usar cualquier paquete de npm. El agente lo añade con `add_dependency`, que fija la versión exacta en el `package.json` del proyecto y lo instala sin ejecutar scripts. Cada conjunto de dependencias se instala una sola vez en `node_modules/.forja-deps/<hash>` y lo comparten todos los proyectos que lo usen. El navegador recibe los paquetes empaquetados, siempre con una única copia de React; los endpoints los cargan desde esa carpeta, dentro del entorno aislado. Importar un paquete sin instalarlo da un error de compilación. Se desactiva o cambia de registro en Administración → General.
- **Pruebas en navegador** (`server/modules/app-runtime/index.ts`): con `browser_test`, el agente abre la vista previa en un Chromium sin interfaz (Playwright), navega, hace clic, escribe y comprueba textos, como visitante anónimo o con la sesión de un usuario de la app, y en tamaño móvil, tablet o escritorio. Recibe el resultado de cada paso, los errores de consola, las peticiones fallidas, el texto visible y hasta tres capturas que el modelo ve. Solo puede pedir la propia vista previa y recursos https públicos; el estudio, otras apps y las redes privadas quedan bloqueados. Las capturas no se guardan en el historial. Necesita Chromium (`npx playwright-core install chromium-headless-shell`) o `FORJA_CHROMIUM` con la ruta de un Chrome; se apaga en Administración → General, y una imagen construida con `FORJA_BROWSER=0` no lo tiene.
- **Seguridad** (`server/modules/app-runtime/index.ts`, `server/modules/builder/index.ts`): un escaneo rápido de reglas fijas se pasa en cada publicación (los hallazgos críticos, como una clave secreta en una página, la bloquean) y está disponible para el agente como `security_scan`. Busca secretos en páginas o escritos en el código, SQL construido con texto, endpoints que cambian datos sin sesión o de admin sin rol, POST sin validar, importes que vienen del navegador y HTML sin escapar; un endpoint abierto a propósito se marca con `// forja:public`. La revisión profunda la hace en segundo plano un agente de solo lectura que lee el código como un atacante. Ambos resultados se ven en Servicios → Seguridad, donde cada hallazgo se puede mandar al constructor («Arreglar») o ignorar.
- **Memoria** (`server/modules/memory/memory.ts`): hechos que el constructor guarda entre conversaciones (preferencias, decisiones, enfoques descartados y datos del negocio). La memoria del proyecto la comparten quienes lo editan; la personal sigue a cada persona en todos sus proyectos. El agente guarda con `remember` y corrige o borra con `forget`; además, al resumir los turnos antiguos un modelo barato extrae hasta cinco hechos nuevos. Se añade al prompt de todos los agentes del turno, rechaza secretos y se ve, edita y apaga en Ajustes → Memoria.

## Paridad con Floot

| Floot | Forja | Estado |
| --- | --- | --- |
| Chat que construye la app, preview en vivo | Chat del studio + iframe con recarga en vivo | ✅ |
| Conector MCP para Claude/ChatGPT/Cursor | `/mcp` Streamable HTTP, token Bearer, las mismas herramientas que el constructor | ✅ |
| Postgres gestionado que se duerme | PGlite por proyecto, duerme a los 60 s | ✅ (embebido, no Neon) |
| Pestaña Data: navegar, SQL, exportar | Datos: tablas, consola SQL, exportar | ✅ (export = tar del data dir, no pg_dump) |
| Auth email/contraseña, bloqueo, reset con código de 8 dígitos, admin del dueño | Igual | ✅ |
| Google/Microsoft sign-in gestionado | — | ❌ falta |
| Storage con CDN, 100 MB/archivo | Disco local, 100 MB/archivo y 1 GB/proyecto | ⚠️ sin CDN/S3 |
| Correo con sandbox hasta verificar dominio | Igual; SMTP opcional | ⚠️ la verificación DNS es manual (botón) |
| Correo entrante | Endpoint de ingreso + registro | ⚠️ sin MX real |
| Floot AI con créditos, interruptor por proyecto | Forja AI: texto y visión en modelos compatibles, créditos, interruptor | ⚠️ sin embeddings/voz |
| Tareas: background, timers, cron (≥5 min, 10/proyecto, 15 min) | Igual | ✅ |
| Realtime WebSocket | Canales por proyecto, publish y presencia efímera; 250 conexiones/proyecto, 50 canales/conexión, 64 KB/mensaje | ✅ (sin fan-out entre réplicas) |
| Pagos Stripe | `ctx.payments.checkout` con clave propia | ⚠️ sin Stripe Connect ni comisión |
| Secretos que el agente nunca ve | Cifrados AES-GCM, el agente solo pide nombres | ✅ |

Los límites de abuso de Forja y de las apps se guardan en Postgres y se comparten entre
procesos; las claves se almacenan como HMAC, no como correos o direcciones IP en claro. Si
Postgres no está disponible, los endpoints protegidos fallan con `503` en vez de dejar pasar
la solicitud sin límite. Las apps conservan PGlite local por proyecto: no hay todavía
réplicas de realtime, backups automáticos/restauración administrada ni opción de Postgres
gestionado para los datos de cada app. Para recuperación ante pérdida del volumen, configura
snapshots externos de `DATA_DIR` y prueba su restauración.
El panel Datos expone `GET /api/projects/:id/db/metrics` con aperturas, errores de inicio,
tiempo acumulado en cola y duración de operaciones; son acumulados del proceso, no percentiles.

El storage sigue en disco local; la cuota inicial es 1 GB por proyecto y 100 MB por archivo.
OAuth de Google/Microsoft, entrega entrante con MX real, S3/CDN, embeddings/voz, Stripe
Connect y presencia duradera no están habilitados por estas APIs.
| Checkpoints: línea de tiempo por cambio con autor, restaurar a cualquier punto | Registro de cambios (Constructor/Tú/Agente MCP), checkpoints con nombre, marca de publicación; restaurar es deshacible | ✅ |
| Publicar a subdominio, despublicar, app privada | `<slug>.localhost`, privada por token | ✅ |
| Panel: carpetas, favoritos, estado, orden, lista/cuadrícula, renombrar/duplicar/archivar/borrar | Igual | ✅ |
| Plan y uso, Integraciones de cuenta, Cuenta (perfil, agentes, sesiones, borrar) | Igual, con medidores reales | ✅ |
| Vista de proyecto: Preview/Services, selector de páginas (Ctrl+K), dispositivos, Select, pantalla completa | Igual; Edit abre el chat integrado | ✅ (Select sin mapeo a línea de código) |
| Services: Analytics, SEO (robots/sitemap/meta), Docs del agente | Igual, analítica sin cookies | ✅ (sin países, sin prerender) |
| Ajustes del proyecto: compartir, duplicar (con BD), descargar código, System/Design Prompt, uso | Igual | ✅ |
| Dominios propios, PWA/móvil nativo, apps conectadas, colaboradores, Annotate, notificaciones push, facturación | — | ❌ fuera de este corte |

El recorrido completo de la interfaz de Floot y qué se replicó está en [docs/inventario-floot.md](docs/inventario-floot.md).

## Límites conocidos

- El código de los endpoints corre **dentro del proceso** de la plataforma: sirve para uso local o de confianza, no para alojar apps de terceros. Para multi-inquilino real hace falta aislar (contenedor o `isolated-vm` por app).
- `check_build` detecta errores de sintaxis y de imports (esbuild), no errores de tipos.
- Los registros viven en memoria (500 por proyecto) y se pierden al reiniciar.
- Los paquetes con código nativo o que necesitan scripts de instalación no funcionan (los scripts nunca se ejecutan). `check_build` no comprueba los tipos de los paquetes.
