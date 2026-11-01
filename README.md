# Forja

Constructor de apps full-stack por chat, con su propio BaaS incluido. Es una reimplementación propia del modelo de producto de Floot (y Lovable): describes la app en un chat, un agente escribe el código, crea la base de datos y la publica. No contiene código, marca ni recursos de Floot; se reconstruyó a partir de su documentación pública (`floot.com/docs`).

## Arranque

```bash
npm install
cp .env.example .env   # pon SECRETS_KEY y al menos un proveedor: ANTHROPIC_API_KEY, OPENROUTER_API_KEY u OPENAI_BASE_URL
npm run build          # compila el studio
npm start              # http://localhost:4100
```

Con Docker (incluye Chromium para `browser_test`; `--build-arg BROWSER=0` lo quita):

```bash
docker build -t forja .
docker run -p 4100:4100 -v forja-data:/app/data -e SECRETS_KEY=... -e ANTHROPIC_API_KEY=... forja
```

Desarrollo con recarga: `npm run dev` (servidor en :4100 + studio Vite en :5173). Sin SMTP, el código de acceso al studio aparece en la consola del servidor.

**Primer arranque (sin usuario por defecto).** Una instalación nueva no tiene cuentas ni contraseñas conocidas: el servidor imprime en su log un token de un solo uso (o usa `FORJA_BOOTSTRAP_TOKEN`, mínimo 16 caracteres) y con él se crea la primera cuenta de administración en la pantalla de configuración. Al existir una cuenta, el token deja de servir. Después se entra con correo + contraseña, o con un código por correo (que también crea cuentas nuevas). `FORJA_SIGNUP` controla quién puede crear cuenta: `open` (por defecto), `invite` (solo correos invitados) o `closed`.

**Organizaciones (tenants).** Cada cuenta tiene una organización personal; se pueden crear organizaciones de equipo (`/api/orgs`) con roles `owner`/`admin`/`member`. Cada proyecto pertenece a una organización y sus miembros lo abren como editores. Los tokens MCP pueden limitarse a una organización. Los administradores de la plataforma (`/api/admin/users`) gestionan cuentas, no los proyectos de otros.

Pruebas: `npm run typecheck`, `npm test` (unidad: enrutador, aprendizaje, índice), `npm run test:e2e` (studio, todos los servicios BaaS, vista previa, publicación, tiempo real y MCP, sin LLM) `npm run test:agents` (equipo de agentes contra un modelo simulado: plan, paralelismo, propiedad de archivos, revisión, listas blancas, respaldo, costes, modos Chat/Plan y arreglo automático) y `npm run test:github` (sincronización con una API de GitHub simulada y el registro de problemas). En GitHub, `.github/workflows/ci.yml` pasa tipos, unidad, build, e2e y agentes (con Chromium) en cada PR y push a `main`, y construye y arranca la imagen Docker.

## Cómo está hecho

```
studio (React)  ──/api──▶  servidor de plataforma (Hono, Node 22+)
                              ├─ builder/   equipo de agentes (orquestador, roles, índice del proyecto) + herramientas
                              ├─ llm/       catálogo de modelos, enrutador con aprendizaje, Anthropic / OpenRouter / compatibles OpenAI
                              ├─ mcp/       las mismas herramientas como servidor MCP remoto (/mcp, token Bearer)
                              ├─ runtime/   bundler esbuild desde archivos en BD, servidor de apps, publicación
                              ├─ baas/      Postgres por proyecto, auth, archivos, correo, IA, tareas, tiempo real, pagos, secretos
                              └─ platform/  cuentas, proyectos, archivos, checkpoints, eventos y registros
apps generadas ──▶  pv-<id>.localhost   (vista previa, enlace con token)
                    <slug>.localhost    (publicada)
```

- **Proyecto** = árbol de archivos virtual guardado en la BD de la plataforma: `pages/`, `components/`, `helpers/`, `endpoints/<ruta>_GET|POST.ts`, `jobs/`, `static/`, `base.css`. No hay disco por proyecto; esbuild compila directo desde la BD.
- **Cada app vive en su propio origen**, así su código nunca toca la sesión del studio. Dentro del iframe del studio sus cookies van particionadas (CHIPS).
- **Base de datos**: un Postgres 18 embebido (PGlite) por proyecto, compartido por vista previa y app publicada. Se "duerme" tras 60 s sin consultas y despierta en la siguiente.
- **Equipo de agentes**: cada mensaje pasa por un análisis (heurística + clasificador barato si hace falta). Los cambios pequeños van por la vía rápida (un agente). Los grandes los planifica un agente que reparte tareas con dependencias y archivos propios entre especialistas de **datos**, **backend** e **interfaz**, que trabajan **en paralelo** (cada uno solo puede escribir sus archivos); después un agente de **revisión** compila, prueba y devuelve arreglos (hasta 2 rondas). El chat muestra un carril por agente con su modelo, pasos, tokens y coste.
- **Enrutador de modelos** (`server/llm/router.ts`): para cada agente puntúa los modelos permitidos (lista blanca de plataforma ∩ cuenta ∩ proyecto) por calidad aprendida (Thompson sampling por tipo de tarea, con recompensas de compilación, pruebas, revisión, Detener y deshacer), precio según el modo del proyecto (Ahorro/Equilibrado/Calidad) y velocidad; si un modelo falla, pasa al siguiente. Cada decisión queda registrada y visible en Ajustes del proyecto.
- **Ahorro de tokens**: índice del proyecto estilo grafo (`builder/index.ts`: exports, imports, rutas, endpoints, tablas, llamadas a la API) con las herramientas `project_map`, `find_symbol`, `related_files` y lecturas por rangos; cada especialista recibe solo los archivos de su tarea y vecinos; caché de prompts de Anthropic; prompts por rol; resumen acumulado de la conversación en vez del historial completo; `edit_file` antes que reescribir. Cada turno informa coste, tokens servidos desde caché y ahorro frente a usar siempre el modelo más potente.
- **Errores al alcance del chat**: la vista previa informa de errores no capturados (con su pila), `console.error` y llamadas a `/_api` que fallan (método, ruta, código HTTP y respuesta); el servidor añade los fallos de endpoints y tareas, y la compilación se vuelve a comprobar tras cada cambio. Todo queda deduplicado en «Problemas» (`platform/problems.ts`): el studio lo muestra sobre el chat con «Intentar arreglar», la página de error de la vista previa trae su propio botón, cada turno empieza con los problemas abiertos en el contexto, el agente tiene `get_problems`, y si un cambio rápido rompe la compilación se lanza solo una pasada de arreglo (hasta dos).
- **Modos del chat**: *Construir* (cambia la app), *Chat* (pregunta e investiga con herramientas de solo lectura, modelo barato) y *Plan* (el planificador prepara un plan que se revisa y se lanza con «Implementar plan», sin volver a planificar). Los mensajes escritos mientras trabaja se ponen en cola.
- **GitHub** (`platform/github.ts`): sincronización en los dos sentidos solo con la API REST (sin git ni disco). Cada turno del constructor se sube como un commit con el nombre de la petición; otras ediciones, a los pocos segundos. Los commits hechos fuera entran al proyecto (por webhook firmado o consultando cada minuto) y aparecen en el chat con su resultado de compilación y «Intentar arreglar» si fallan. Solo se sincronizan las carpetas del proyecto; el resto del repositorio (README, CI…) no se toca. La cuenta se conecta con OAuth o con un token personal guardado cifrado.
- **SDK**: el navegador usa `@forja/client` (router, `api`, `useApi`, `auth`, `storage`, `realtime`, `ai`); los endpoints y tareas reciben `ctx` (`db`, `user`, `storage`, `email`, `ai`, `jobs`, `realtime`, `payments`, `env`). El manual completo que lee el agente está en `server/builder/prompt.ts`.
- **Paquetes npm** (`runtime/deps.ts`): además de `react`, `react-dom` y `zod`, cada app puede usar cualquier paquete de npm. El agente lo añade con `add_dependency`, que fija la versión exacta en el `package.json` del proyecto y lo instala sin ejecutar scripts. Cada conjunto de dependencias se instala una sola vez en `node_modules/.forja-deps/<hash>` y lo comparten todos los proyectos que lo usen. El navegador recibe los paquetes empaquetados, siempre con una única copia de React; los endpoints los cargan desde esa carpeta, dentro del entorno aislado. Importar un paquete sin instalarlo da un error de compilación. `FORJA_NPM=0` lo desactiva y `FORJA_NPM_REGISTRY` cambia el registro.
- **Pruebas en navegador** (`runtime/browser.ts`): con `browser_test`, el agente abre la vista previa en un Chromium sin interfaz (Playwright), navega, hace clic, escribe y comprueba textos, como visitante anónimo o con la sesión de un usuario de la app, y en tamaño móvil, tablet o escritorio. Recibe el resultado de cada paso, los errores de consola, las peticiones fallidas, el texto visible y hasta tres capturas que el modelo ve. Solo puede pedir la propia vista previa y recursos https públicos; el estudio, otras apps y las redes privadas quedan bloqueados. Las capturas no se guardan en el historial. Necesita Chromium (`npx playwright-core install chromium-headless-shell`) o `FORJA_CHROMIUM` con la ruta de un Chrome; `FORJA_BROWSER=0` lo desactiva.
- **Seguridad** (`runtime/securityScan.ts`, `builder/securityReview.ts`): un escaneo rápido de reglas fijas se pasa en cada publicación (los hallazgos críticos, como una clave secreta en una página, la bloquean) y está disponible para el agente como `security_scan`. Busca secretos en páginas o escritos en el código, SQL construido con texto, endpoints que cambian datos sin sesión o de admin sin rol, POST sin validar, importes que vienen del navegador y HTML sin escapar; un endpoint abierto a propósito se marca con `// forja:public`. La revisión profunda la hace en segundo plano un agente de solo lectura que lee el código como un atacante. Ambos resultados se ven en Servicios → Seguridad, donde cada hallazgo se puede mandar al constructor («Arreglar») o ignorar.
- **Memoria** (`platform/memory.ts`): hechos que el constructor guarda entre conversaciones (preferencias, decisiones, enfoques descartados y datos del negocio). La memoria del proyecto la comparten quienes lo editan; la personal sigue a cada persona en todos sus proyectos. El agente guarda con `remember` y corrige o borra con `forget`; además, al resumir los turnos antiguos un modelo barato extrae hasta cinco hechos nuevos. Se añade al prompt de todos los agentes del turno, rechaza secretos y se ve, edita y apaga en Ajustes → Memoria.

## Paridad con Floot

| Floot | Forja | Estado |
| --- | --- | --- |
| Chat que construye la app, preview en vivo | Chat del studio + iframe con recarga en vivo | ✅ |
| Conector MCP para Claude/ChatGPT/Cursor | `/mcp` Streamable HTTP, token Bearer, las mismas herramientas que el constructor | ✅ |
| Postgres gestionado que se duerme | PGlite por proyecto, duerme a los 60 s | ✅ (embebido, no Neon) |
| Pestaña Data: navegar, SQL, exportar | Datos: tablas, consola SQL, exportar | ✅ (export = tar del data dir, no pg_dump) |
| Auth email/contraseña, bloqueo, reset con código de 8 dígitos, admin del dueño | Igual | ✅ |
| Google/Microsoft sign-in gestionado | — | ❌ falta |
| Storage con CDN, 100 MB/archivo | Disco local, 100 MB/archivo | ✅ (sin CDN) |
| Correo con sandbox hasta verificar dominio | Igual; SMTP opcional | ⚠️ la verificación DNS es manual (botón) |
| Correo entrante | Endpoint de ingreso + registro | ⚠️ sin MX real |
| Floot AI con créditos, interruptor por proyecto | Forja AI: Anthropic u OpenAI-compatible, créditos, interruptor | ✅ (sin imágenes/embeddings/voz) |
| Tareas: background, timers, cron (≥5 min, 10/proyecto, 15 min) | Igual | ✅ |
| Realtime WebSocket | Canales por proyecto, publish desde servidor y navegador | ✅ (sin presencia) |
| Pagos Stripe | `ctx.payments.checkout` con clave propia | ⚠️ sin Stripe Connect ni comisión |
| Secretos que el agente nunca ve | Cifrados AES-GCM, el agente solo pide nombres | ✅ |
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
