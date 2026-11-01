# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 171 files · ~164,127 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1859 nodes · 4974 edges · 98 communities (86 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `365d5c16`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- 001_init.sql
- orchestrator.ts
- Chat.tsx
- Dashboard.tsx
- github.ts
- api
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- components/Models.tsx
- llm/router.ts
- roles.ts
- vitest
- runner.ts
- api
- e2e.mjs
- problems.ts
- client/index.ts
- studioApi.ts
- Inventario de funciones de Lovable → Forja
- builder/index.ts
- tools.ts
- q
- Panel de administración del sistema — diseño
- bundler.ts
- Changes.tsx
- agents.mjs
- server.ts
- github.mjs
- projects.ts
- memory.ts
- devDependencies
- Integrations.tsx
- sandboxWorker.mjs
- compilerOptions
- probe.ts
- agents.dbg.mjs
- ai.ts
- package.json
- crypto.ts
- scripts
- readAllFiles
- baas/jobs.ts
- accounts.ts
- catalog.ts
- typecheck.ts
- dependencies
- crypto.ts
- projects.ts
- agent.ts
- Forja
- Desplegar Forja en Coolify
- server/index.ts
- sdk/server/index.ts
- db.ts
- serviceContext
- CLAUDE.md
- sandbox.ts
- securityReview.ts
- gate.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- updateSettings
- registry.ts
- Evals.tsx
- projectDb.ts
- base
- AgentLanes.tsx
- memory.ts
- serverTypes.test.ts
- forja
- send
- Skills.tsx
- useRoute
- analytics.ts
- Db
- EndpointContext
- TEST_DATABASE_URL
- apiTypes.test.ts
- serviceContext
- Review Focus
- store.ts
- Agents.tsx
- events.ts
- 1. Capa de datos
- safeFetch.ts
- ApiError
- @anthropic-ai/sdk
- croner
- hono
- @types/node@^26.6.6
- @types/pg@^8.23.1
- @types/react@^19.3.0

## God Nodes (most connected - your core abstractions)
1. `q()` - 134 edges
2. `api()` - 72 edges
3. `ProjectView()` - 37 edges
4. `one()` - 35 edges
5. `runBuilderTurn()` - 32 edges
6. `readAllFiles()` - 31 edges
7. `react` - 30 edges
8. `sha256()` - 29 edges
9. `timeAgo()` - 29 edges
10. `config` - 28 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Hoja de ruta propuesta` --references--> `updateSummary()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Arranque` --references--> `main()`  [INFERRED]
  README.md → server/db/cli.ts
- `Task 4: API de administración (ajustes, proveedores, modelos, sondas)` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/lib/security.ts

## Import Cycles
- None detected.

## Communities (98 total, 12 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.16
Nodes (17): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+9 more)

### Community 1 - "001_init.sql"
Cohesion: 0.06
Nodes (58): account_integrations, account_models, account_sessions, accounts, agent_steps, agent_steps_project, agent_steps_run, agent_tasks (+50 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.08
Nodes (48): imageBlocks(), UPLOADS, active, cleanText(), commitMessage(), extractMemories(), FAST_TOOLS, finishTask() (+40 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.09
Nodes (32): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+24 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (22): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+14 more)

### Community 5 - "github.ts"
Cohesion: 0.12
Nodes (28): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+20 more)

### Community 6 - "api"
Cohesion: 0.08
Nodes (24): SelectedElement, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView (+16 more)

### Community 7 - "appServer.ts"
Cohesion: 0.11
Nodes (37): appHeaders(), clientIp(), rateLimit(), RateLimitError, studioOrigins(), uploadHeaders(), windows, log() (+29 more)

### Community 8 - "context.ts"
Cohesion: 0.12
Nodes (3): bindJobs(), CheckoutInput, paymentsFor()

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (26): react, bytes(), App(), Me, NAV, Redirect(), Shell(), UserMenu() (+18 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.12
Nodes (46): Project, Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading() (+38 more)

### Community 12 - "components/Models.tsx"
Cohesion: 0.28
Nodes (8): AccountModels(), ModelChecklist(), ModelRow, MODES, price(), PROVIDER, ROLE_LABEL, RouterInfo

### Community 13 - "llm/router.ts"
Cohesion: 0.10
Nodes (31): resetRouter(), routerStats, gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior() (+23 more)

### Community 14 - "roles.ts"
Cohesion: 0.07
Nodes (32): listPlaygroundRuns(), PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole, playgroundRoles(), playgroundRun(), PlaygroundView, runs (+24 more)

### Community 15 - "vitest"
Cohesion: 0.09
Nodes (27): Task 1: Postgres, migraciones y helper de tests, pg, vitest, out(), config, DEFAULT_MODELS_ALLOW, env, ROOT_DIR (+19 more)

### Community 16 - "runner.ts"
Cohesion: 0.06
Nodes (71): execute(), prune(), startPlayground(), sessionCookie(), isBuilding(), stopBuilding(), evalsApi, caseById() (+63 more)

### Community 17 - "api"
Cohesion: 0.09
Nodes (42): Task 6: Studio — página de administración, 7. Studio, api(), ApiError, Folder, streamPost(), timeAgo(), GithubCommitCard() (+34 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.23
Nodes (14): changed(), clearProblems(), fingerprint(), fromLog(), listProblems(), locate(), ProblemKind, recheckBuild() (+6 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "studioApi.ts"
Cohesion: 0.07
Nodes (23): Env, ipOf(), memoryOf(), pid(), SESSION_COOKIE, startSession(), studioApi, getTransport() (+15 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "builder/index.ts"
Cohesion: 0.10
Nodes (23): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+15 more)

### Community 24 - "tools.ts"
Cohesion: 0.12
Nodes (6): B, I, N, S, ToolOutput, typed()

### Community 25 - "q"
Cohesion: 0.10
Nodes (30): Global Constraints, Panel de administración + Postgres — plan de implementación, aiUsage(), cancelTimer(), setJobEnabled(), deleteSecret(), listSecrets(), projectSecretEnv() (+22 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.15
Nodes (12): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario, Fuera de alcance (+4 more)

### Community 27 - "bundler.ts"
Cohesion: 0.10
Nodes (37): paths, buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule (+29 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "agents.mjs"
Cohesion: 0.18
Nodes (11): app, DATA, MODELS, req(), ROOT, SEED, call(), log (+3 more)

### Community 30 - "server.ts"
Cohesion: 0.07
Nodes (41): BUILDER_SYSTEM_PROMPT, builderTools, toolByName, build(), Guide, guideById, guideList(), GUIDES (+33 more)

### Community 31 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 32 - "projects.ts"
Cohesion: 0.11
Nodes (29): deleteAccount(), ensurePersonalOrg(), personalOrgId(), assertValidPath(), ChangeEntry, createFolder(), createProject(), deleteFile() (+21 more)

### Community 33 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "Integrations.tsx"
Cohesion: 0.32
Nodes (7): CreateDialog(), Integration, Integrations(), TYPE_HINT, TYPE_ICON, Types, ValueDialog()

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "probe.ts"
Cohesion: 0.18
Nodes (13): 3. Proveedores y modelos, 6. API de administración, Pruebas de conexión, Tablas (`002_admin.sql`), call(), ECHO_TOOL, errorOf(), ModelProbe (+5 more)

### Community 39 - "agents.dbg.mjs"
Cohesion: 0.20
Nodes (6): app, DATA, MODELS, req(), ROOT, SEED

### Community 40 - "ai.ts"
Cohesion: 0.13
Nodes (23): AiUnavailableError, appAiChat(), AppAiInput, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), anthropicChat() (+15 more)

### Community 41 - "package.json"
Cohesion: 0.17
Nodes (11): @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1, ws@^8.22.0, engines, node, name, private, type (+3 more)

### Community 42 - "crypto.ts"
Cohesion: 0.21
Nodes (16): primaryKeyOf(), AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset() (+8 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "readAllFiles"
Cohesion: 0.30
Nodes (11): Author, isSlugTaken(), readAllFiles(), recordPublish(), unpublish(), runQuickScan(), publishProject(), suggestSlug() (+3 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.15
Nodes (26): projectView(), baseFor(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob() (+18 more)

### Community 46 - "accounts.ts"
Cohesion: 0.16
Nodes (26): sendPlatformEmail(), numericCode(), sha256(), accountFromApiToken(), accountFromSession(), assertStrongPassword(), canSignUp(), changePassword() (+18 more)

### Community 47 - "catalog.ts"
Cohesion: 0.09
Nodes (47): Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, `llm/catalog.ts`, adminApi, cancelPlayground(), probeProvider(), readSeedFile(), SeedFile (+39 more)

### Community 48 - "typecheck.ts"
Cohesion: 0.21
Nodes (13): depsDir(), depsKey(), IGNORED, isSource(), MODULES, parseDiagnostics(), require, run() (+5 more)

### Community 49 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, pg@^8.23.1, react@^19.3.1, react-dom@^19.3.1, @types/react-dom@^19.3.0 (+9 more)

### Community 50 - "crypto.ts"
Cohesion: 0.35
Nodes (10): burnPasswordCheck(), hashPassword(), LEGACY, passwordNeedsRehash(), SCRYPT, scryptKey(), verifyPassword(), waiting (+2 more)

### Community 51 - "projects.ts"
Cohesion: 0.19
Nodes (15): addTimer(), newId(), assertCanManage(), createOrg(), listOrgMembers(), listOrgs(), Org, ORG_ROLES (+7 more)

### Community 52 - "agent.ts"
Cohesion: 0.12
Nodes (24): AgentSpec, GATE_FIXES, IMAGE_TYPES, runAgent(), save(), summarize(), estTokens(), GATE_THRESHOLD (+16 more)

### Community 53 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (11): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+3 more)

### Community 55 - "server/index.ts"
Cohesion: 0.10
Nodes (24): resetTransport(), closeAll(), createLangfuse(), Event, fromConfig(), langfuse, LangfuseOptions, reloadLangfuse() (+16 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.11
Nodes (4): AiMessage, AppUser, CheckoutInput, StoredFile

### Community 57 - "db.ts"
Cohesion: 0.22
Nodes (7): Conexión, ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), platformDb, Tx, wrap()

### Community 58 - "serviceContext"
Cohesion: 0.36
Nodes (8): deleteObject(), filePath(), getObject(), MAX_FILE_BYTES, putObject(), safeKey(), storageUsage(), StoredObject

### Community 60 - "sandbox.ts"
Cohesion: 0.14
Nodes (11): AppEnv, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, SandboxError, sandboxes (+3 more)

### Community 61 - "securityReview.ts"
Cohesion: 0.36
Nodes (9): describeSchema(), Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), getProject(), saveScan() (+1 more)

### Community 62 - "gate.ts"
Cohesion: 0.36
Nodes (8): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), formatProblems(), Problem, BuildProblem

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 66 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 67 - "updateSettings"
Cohesion: 0.44
Nodes (8): Task 2: Registro y almacén de ajustes, schemaOf(), settingDef, emit(), loadSettings(), resetSetting(), SettingsError, updateSettings()

### Community 68 - "registry.ts"
Cohesion: 0.22
Nodes (8): CONFIG_DEFAULTS, byKey, Def, defs, GROUPS, setPath(), SettingGroup, SettingType

### Community 69 - "Evals.tsx"
Cohesion: 0.28
Nodes (8): Agg, download(), EvalCfg, Evals(), money(), RunDetail, RunSummary, STATUS

### Community 70 - "projectDb.ts"
Cohesion: 0.26
Nodes (11): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+3 more)

### Community 71 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 72 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 73 - "memory.ts"
Cohesion: 0.14
Nodes (19): getSecurity(), ignoredIds(), Row, ScanView, SecurityView, setIgnored(), FileMap, Finding (+11 more)

### Community 74 - "serverTypes.test.ts"
Cohesion: 0.20
Nodes (4): Ctx, JobCtx, ServiceCtx, JobContext

### Community 75 - "forja"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "send"
Cohesion: 0.29
Nodes (7): send(), summarize(), teamOf(), toItems(), turnTitle(), userItem(), withElement()

### Community 77 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

### Community 78 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "serviceContext"
Cohesion: 0.25
Nodes (5): HttpError, publish(), serviceContext, EmailInput, listObjects()

### Community 85 - "Review Focus"
Cohesion: 0.50
Nodes (4): Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 7: `.env`, documentación y verificación final

### Community 86 - "store.ts"
Cohesion: 0.24
Nodes (10): browserAvailable, getPath(), SETTINGS, broken, hintOf(), listeners, listSettings(), MOVED_ENV (+2 more)

### Community 87 - "Agents.tsx"
Cohesion: 0.32
Nodes (7): AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView, ToolLine()

### Community 88 - "events.ts"
Cohesion: 0.29
Nodes (5): LogEntry, logs, ProjectEvent, projectEvents, readLogs()

### Community 89 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders, check()

### Community 90 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 601 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `Chat.tsx`, `Dashboard.tsx`, `Evals.tsx`, `api`, `Integrations.tsx`, `AgentLanes.tsx`, `package.json`, `ProjectView.tsx`, `components/Models.tsx`, `dependencies`, `api`, `client/index.ts`, `Agents.tsx`, `Changes.tsx`?**
  _High betweenness centrality (0.267) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `browser.ts`, `devDependencies`, `appServer.ts`, `package.json`, `memory.ts`, `serverTypes.test.ts`, `llm/router.ts`, `runner.ts`, `typecheck.ts`, `apiTypes.test.ts`, `server.ts`, `server/index.ts`, `builder/index.ts`, `bundler.ts`, `Changes.tsx`, `gate.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08408163265306122 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `hono` to `package.json`, `catalog.ts`, `runner.ts`, `studioApi.ts`, `server/index.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._