# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 173 files · ~165,854 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1869 nodes · 4990 edges · 98 communities (87 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36f28893`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- 001_init.sql
- orchestrator.ts
- Chat.tsx
- Dashboard.tsx
- github.ts
- ProjectView.tsx
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- roles.ts
- llm/router.ts
- platform/security.ts
- ref_node_path
- auth.ts
- api
- e2e.mjs
- problems.ts
- client/index.ts
- members.ts
- Inventario de funciones de Lovable → Forja
- builder/index.ts
- tools.ts
- runner.ts
- Panel de administración del sistema — diseño
- bundler.ts
- Changes.tsx
- q
- server.ts
- github.mjs
- projects.ts
- memory.ts
- devDependencies
- Integrations.tsx
- sandboxWorker.mjs
- compilerOptions
- platformDb
- agents.dbg.mjs
- ai.ts
- package.json
- probe.ts
- scripts
- catalog.ts
- baas/jobs.ts
- accounts.ts
- admin/api.ts
- local.ts
- dependencies
- crypto.ts
- judge.ts
- agent.ts
- Forja
- Desplegar Forja en Coolify
- server/index.ts
- sdk/server/index.ts
- urls.ts
- reactions.ts
- CLAUDE.md
- sandbox.ts
- rename.ts
- metrics.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- orgs.ts
- deps.ts
- components/Models.tsx
- config.ts
- base
- AgentLanes.tsx
- publish.ts
- projectDb.ts
- forja
- analytics.ts
- soclo-cal.py
- useRoute
- securityReview.ts
- Memory.tsx
- Evals.tsx
- TEST_DATABASE_URL
- apiTypes.test.ts
- safeFetch.ts
- Review Focus
- store.ts
- Agents.tsx
- FileMap
- @electric-sql/pglite
- playwright-core
- ApiError
- send
- croner
- Skills.tsx
- react-dom
- @types/node@^26.6.6
- typescript@^7.0.2

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
10. `projects` - 28 edges

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

## Communities (98 total, 11 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.16
Nodes (16): allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser(), inspectPreview(), launch() (+8 more)

### Community 1 - "001_init.sql"
Cohesion: 0.06
Nodes (58): account_integrations, account_models, account_sessions, accounts, agent_steps, agent_steps_project, agent_steps_run, agent_tasks (+50 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.11
Nodes (38): describeSchema(), imageBlocks(), runAgent(), save(), summarize(), active, commitMessage(), FAST_TOOLS (+30 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.08
Nodes (36): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+28 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.14
Nodes (19): Folder, Project, Back, External, Globe, Send, Dashboard(), DeleteDialog() (+11 more)

### Community 5 - "github.ts"
Cohesion: 0.12
Nodes (28): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+20 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (35): Me, SelectedElement, Avatar(), colorFor(), COLORS, copyText(), Menu(), useDismiss() (+27 more)

### Community 7 - "appServer.ts"
Cohesion: 0.11
Nodes (36): AiUnavailableError, appAiChat(), getObject(), appHeaders(), rateLimit(), RateLimitError, studioOrigins(), uploadHeaders() (+28 more)

### Community 8 - "context.ts"
Cohesion: 0.08
Nodes (17): AppUser, EndpointContext, HttpError, JobContext, publish(), serviceContext, CheckoutInput, paymentsFor() (+9 more)

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (26): react, bytes(), App(), NAV, Redirect(), Shell(), UserMenu(), Logo() (+18 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.16
Nodes (37): Task 6: Studio — página de administración, 7. Studio, api(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header() (+29 more)

### Community 12 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+10 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.09
Nodes (37): Pruebas de conexión, resetRouter(), routerStats, penalizeTurn(), gamma(), gaussian(), meanOf(), Posterior (+29 more)

### Community 14 - "platform/security.ts"
Cohesion: 0.26
Nodes (11): FileMap, fingerprint(), isClient(), isCode(), isServer(), lineOf(), markedPublic(), quickScan() (+3 more)

### Community 15 - "ref_node_path"
Cohesion: 0.15
Nodes (11): pg, vitest, freshDatabase(), TEST_DATABASE_URL, dir, dir, pool, dir (+3 more)

### Community 16 - "auth.ts"
Cohesion: 0.21
Nodes (17): primaryKeyOf(), AuthError, confirmPasswordReset(), createSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+9 more)

### Community 17 - "api"
Cohesion: 0.12
Nodes (27): timeAgo(), Switch(), PublishPanel(), AddModel(), CatalogModel, enc(), matches(), Models() (+19 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.16
Nodes (23): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), ToolContext, LogEntry, changed() (+15 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "members.ts"
Cohesion: 0.17
Nodes (14): EmailInput, getTransport(), listEmails(), receiveEmail(), sendEmail(), sendPlatformEmail(), numericCode(), requestLoginCode() (+6 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "builder/index.ts"
Cohesion: 0.21
Nodes (15): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+7 more)

### Community 24 - "tools.ts"
Cohesion: 0.11
Nodes (8): B, I, N, out(), S, ToolOutput, typed(), readLogs()

### Community 25 - "runner.ts"
Cohesion: 0.05
Nodes (81): execute(), listPlaygroundRuns(), PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles(), playgroundRun() (+73 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (17): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, Decisiones tomadas con el usuario, `.env` resultante, Fuera de alcance (+9 more)

### Community 27 - "bundler.ts"
Cohesion: 0.15
Nodes (24): buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule() (+16 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "q"
Cohesion: 0.06
Nodes (34): Global Constraints, Panel de administración + Postgres — plan de implementación, Env, ipOf(), memoryOf(), pid(), SESSION_COOKIE, startSession() (+26 more)

### Community 30 - "server.ts"
Cohesion: 0.06
Nodes (43): BUILDER_SYSTEM_PROMPT, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse() (+35 more)

### Community 31 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 32 - "projects.ts"
Cohesion: 0.13
Nodes (29): q(), assertValidPath(), ChangeEntry, createCheckpoint(), createFolder(), deleteFile(), deleteFolder(), diffable() (+21 more)

### Community 33 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "Integrations.tsx"
Cohesion: 0.33
Nodes (8): Modal(), CreateDialog(), Integration, Integrations(), TYPE_HINT, TYPE_ICON, Types, ValueDialog()

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "platformDb"
Cohesion: 0.22
Nodes (9): Task 1: Postgres, migraciones y helper de tests, Conexión, migrate(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), closePlatformDb(), Tx (+1 more)

### Community 39 - "agents.dbg.mjs"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 40 - "ai.ts"
Cohesion: 0.19
Nodes (16): aiUsage(), AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part (+8 more)

### Community 41 - "package.json"
Cohesion: 0.17
Nodes (11): hono@^4.13.14, @modelcontextprotocol/sdk@^1.32.2, ws@^8.22.0, engines, node, name, private, type (+3 more)

### Community 42 - "probe.ts"
Cohesion: 0.27
Nodes (10): 6. API de administración, call(), ECHO_TOOL, errorOf(), ModelProbe, PROBE_SYSTEM, probeModel(), probeProvider() (+2 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "catalog.ts"
Cohesion: 0.16
Nodes (22): 3. Proveedores y modelos, 8. Errores y seguridad, 9. Pruebas, `llm/catalog.ts`, Tablas (`002_admin.sql`), availableModels(), CatalogRow, globToRegex() (+14 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.13
Nodes (22): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+14 more)

### Community 46 - "accounts.ts"
Cohesion: 0.18
Nodes (20): endSession(), sha256(), accountFromSession(), assertStrongPassword(), canSignUp(), COMMON, createAccount(), createSession() (+12 more)

### Community 47 - "admin/api.ts"
Cohesion: 0.13
Nodes (22): adminApi, cancelPlayground(), deleteModel(), ModelError, ModelInput, num(), saveModel(), cache (+14 more)

### Community 48 - "local.ts"
Cohesion: 0.20
Nodes (8): zod@^4.6.7, zod, [command, ...flags], readSeedFile(), SeedFile, seedLocal(), platformDb, wrap()

### Community 49 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @anthropic-ai/sdk@^1.3.0, esbuild@^0.28.2, @hono/node-server@^2.1.5, nodemailer@^10.3.1, pg@^8.23.1, react@^19.3.1, @types/pg@^8.23.1 (+9 more)

### Community 50 - "crypto.ts"
Cohesion: 0.30
Nodes (11): burnPasswordCheck(), hashPassword(), LEGACY, passwordNeedsRehash(), SCRYPT, scryptKey(), verifyPassword(), waiting (+3 more)

### Community 51 - "judge.ts"
Cohesion: 0.21
Nodes (12): cleanText(), extractMemories(), turnContext(), updateSummary(), JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement() (+4 more)

### Community 52 - "agent.ts"
Cohesion: 0.16
Nodes (17): PlaygroundView, AgentEvent, AgentResult, AgentSpec, GATE_FIXES, IMAGE_TYPES, loadHistory(), UPLOADS (+9 more)

### Community 53 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (11): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+3 more)

### Community 55 - "server/index.ts"
Cohesion: 0.17
Nodes (15): studioApi, closeAll(), app, resolveApp(), server, shutdown(), STUDIO_DIST, wss (+7 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.07
Nodes (8): AiMessage, AppUser, CheckoutInput, Ctx, Db, JobCtx, ServiceCtx, StoredFile

### Community 57 - "urls.ts"
Cohesion: 0.38
Nodes (10): projectView(), baseFor(), appOrigin(), appUrl(), checkShareToken(), previewOrigin(), previewUrl(), shareToken() (+2 more)

### Community 58 - "reactions.ts"
Cohesion: 0.24
Nodes (7): resetTransport(), createLangfuse(), fromConfig(), reloadLangfuse(), reschedulePoll(), wireSettingReactions(), usage

### Community 60 - "sandbox.ts"
Cohesion: 0.18
Nodes (10): AppEnv, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, SandboxError, sandboxes (+2 more)

### Community 61 - "rename.ts"
Cohesion: 0.31
Nodes (4): resolveImport(), rewriteImports(), specFor(), files

### Community 62 - "metrics.ts"
Cohesion: 0.16
Nodes (14): estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep(), recordToolCall() (+6 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 66 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 67 - "orgs.ts"
Cohesion: 0.13
Nodes (25): DEV_FIXTURE, Fixture, seedDev(), deleteAccount(), resetPassword(), setPassword(), one(), addOrgMember() (+17 more)

### Community 68 - "deps.ts"
Cohesion: 0.11
Nodes (26): BUILTIN_PACKAGES, depsDir(), depsKey(), ensureDeps(), installing, isValidPackageName(), locks, MANIFEST (+18 more)

### Community 69 - "components/Models.tsx"
Cohesion: 0.28
Nodes (8): ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER, ROLE_LABEL, RouterInfo

### Community 70 - "config.ts"
Cohesion: 0.21
Nodes (7): DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR, MIGRATIONS_DIR, requestOrigin(), here

### Community 71 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 72 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 73 - "publish.ts"
Cohesion: 0.24
Nodes (11): Author, getProject(), hasUnpublishedChanges(), isDevFile(), isSlugTaken(), recordPublish(), formatProblem(), publishProject() (+3 more)

### Community 74 - "projectDb.ts"
Cohesion: 0.31
Nodes (10): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+2 more)

### Community 75 - "forja"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 78 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "securityReview.ts"
Cohesion: 0.16
Nodes (20): ROLE_PROMPTS, ROLE_TOOLS, Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), toolByName (+12 more)

### Community 80 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 81 - "Evals.tsx"
Cohesion: 0.28
Nodes (8): Agg, download(), EvalCfg, Evals(), money(), RunDetail, RunSummary, STATUS

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.44
Nodes (7): builderTools, apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 85 - "Review Focus"
Cohesion: 0.50
Nodes (4): Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 7: `.env`, documentación y verificación final

### Community 86 - "store.ts"
Cohesion: 0.13
Nodes (28): Task 2: Registro y almacén de ajustes, Task 3: Proveedores y modelos en BD + seeders, Almacén, browserAvailable, CONFIG_DEFAULTS, byKey, Def, defs (+20 more)

### Community 87 - "Agents.tsx"
Cohesion: 0.19
Nodes (11): GithubCommitCard(), GithubSection(), Link, Mark(), AgentEvent, Agents(), ROLE_LABEL, RoleInfo (+3 more)

### Community 88 - "FileMap"
Cohesion: 0.38
Nodes (5): escapeRe(), replaceVisibleText(), TextEditResult, page(), FileMap

### Community 92 - "send"
Cohesion: 0.33
Nodes (5): ApiError, streamPost(), send(), userItem(), withElement()

### Community 94 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 602 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `Chat.tsx`, `Dashboard.tsx`, `components/Models.tsx`, `ProjectView.tsx`, `Integrations.tsx`, `AgentLanes.tsx`, `package.json`, `ProjectView.tsx`, `Memory.tsx`, `dependencies`, `api`, `Evals.tsx`, `client/index.ts`, `Agents.tsx`, `Changes.tsx`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `ref_node_path` to `browser.ts`, `devDependencies`, `deps.ts`, `config.ts`, `context.ts`, `package.json`, `llm/router.ts`, `platform/security.ts`, `apiTypes.test.ts`, `problems.ts`, `rename.ts`, `builder/index.ts`, `FileMap`, `runner.ts`, `reactions.ts`, `Changes.tsx`, `q`, `server.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11153846153846154 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `package.json` to `runner.ts`, `server/index.ts`, `q`, `admin/api.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._