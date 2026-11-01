# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 139 files · ~140,428 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1564 nodes · 4154 edges · 86 communities (74 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `243b3bda`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- roles.ts
- orchestrator.ts
- Chat.tsx
- q
- github.ts
- api
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- bundler.ts
- llm/router.ts
- Dashboard.tsx
- securityReview.ts
- builder/index.ts
- compileServerModule
- e2e.mjs
- problems.ts
- client/index.ts
- integrations.ts
- agent.ts
- catalog.ts
- auth.ts
- ServicePanels.tsx
- package.json
- src/api.ts
- Changes.tsx
- sandbox.ts
- baas/jobs.ts
- guides.ts
- memory.ts
- dependencies
- devDependencies
- studioApi.ts
- sandboxWorker.mjs
- compilerOptions
- Inventario de funciones de Lovable → Forja
- agents.mjs
- ai.ts
- analytics.ts
- tools.ts
- scripts
- projectDb.ts
- github.mjs
- mcp/jobs.ts
- base
- server.ts
- runner.ts
- score.ts
- Inventario de interfaz de Floot → Forja
- Forja
- realtime.ts
- ProjectSandbox
- apiTypes.test.ts
- sdk/server/index.ts
- vitest
- accounts.ts
- CLAUDE.md
- Memory.tsx
- rename.ts
- log
- forja
- server/index.ts
- db.ts
- @electric-sql/pglite
- orgs.ts
- typecheck.ts
- crypto.ts
- Desplegar Forja en Coolify
- Evals.tsx
- AppEnv
- judge.ts
- forja
- ProjectDb
- usage.ts
- PreviewHandle
- useRoute
- @anthropic-ai/sdk
- @hono/node-server
- playwright-core
- react-dom
- @types/react@^19.3.0
- @types/react-dom@^19.3.0

## God Nodes (most connected - your core abstractions)
1. `q()` - 119 edges
2. `api()` - 57 edges
3. `ProjectView()` - 37 edges
4. `runBuilderTurn()` - 32 edges
5. `sha256()` - 29 edges
6. `readAllFiles()` - 29 edges
7. `one()` - 28 edges
8. `Chat()` - 28 edges
9. `react` - 24 edges
10. `config` - 24 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `Hoja de ruta propuesta` --references--> `updateSummary()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Cómo está hecho` --references--> `api()`  [INFERRED]
  README.md → studio/src/api.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/index.ts

## Import Cycles
- 2-file cycle: `studio/src/App.tsx -> studio/src/pages/ProjectView.tsx -> studio/src/App.tsx`

## Communities (86 total, 12 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.13
Nodes (25): projectView(), baseFor(), appOrigin(), allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe() (+17 more)

### Community 1 - "roles.ts"
Cohesion: 0.09
Nodes (20): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+12 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.11
Nodes (41): describeSchema(), imageBlocks(), save(), active, cleanText(), commitMessage(), extractMemories(), FAST_TOOLS (+33 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (61): ApiError, streamPost(), AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE (+53 more)

### Community 4 - "q"
Cohesion: 0.10
Nodes (36): accountFromApiToken(), deleteApiToken(), endSession(), listApiTokens(), signOutOtherSessions(), updateAccountName(), platformDb(), q() (+28 more)

### Community 5 - "github.ts"
Cohesion: 0.12
Nodes (28): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+20 more)

### Community 6 - "api"
Cohesion: 0.09
Nodes (32): api(), SelectedElement, GithubCommitCard(), GithubSection(), Link, Mark(), ModelChecklist(), ModelRow (+24 more)

### Community 7 - "appServer.ts"
Cohesion: 0.17
Nodes (22): isDevFile(), analyticsBeacon(), badge(), clientBundle(), clientCache, escapeHtml(), examplesHtml(), filesHash() (+14 more)

### Community 8 - "context.ts"
Cohesion: 0.12
Nodes (16): HttpError, publish(), ServiceContext, serviceContext(), EmailInput, sendEmail(), paymentsFor(), secretEnv() (+8 more)

### Community 9 - "App.tsx"
Cohesion: 0.16
Nodes (21): react, App(), Me, NAV, Shell(), UserMenu(), Logo(), AccountModels() (+13 more)

### Community 10 - "with"
Cohesion: 0.07
Nodes (29): env, runs-on, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, jobs, check (+21 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.16
Nodes (35): timeAgo(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading() (+27 more)

### Community 12 - "bundler.ts"
Cohesion: 0.09
Nodes (31): paths, page(), compileCache, CompiledModule, EndpointInfo, exampleFiles(), JobInfo, Packages (+23 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.11
Nodes (33): penalizeTurn(), gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), recordOutcome() (+25 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (23): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+15 more)

### Community 15 - "securityReview.ts"
Cohesion: 0.09
Nodes (42): listJobs(), scheduleProject(), Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), getProject() (+34 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.20
Nodes (17): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+9 more)

### Community 17 - "compileServerModule"
Cohesion: 0.60
Nodes (6): BuildError, buildExamples(), bundleBrowser(), compileServerModule(), projectPackages(), toProblems()

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.12
Nodes (28): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), ToolContext, LogEntry, logs (+20 more)

### Community 20 - "client/index.ts"
Cohesion: 0.09
Nodes (23): ai, api, ApiError, AppUser, auth, baas(), channels, ChatMessage (+15 more)

### Community 21 - "integrations.ts"
Cohesion: 0.13
Nodes (20): deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, setSecret(), decrypt(), encrypt() (+12 more)

### Community 22 - "agent.ts"
Cohesion: 0.10
Nodes (30): AgentEvent, AgentResult, AgentSpec, GATE_FIXES, IMAGE_TYPES, loadHistory(), runAgent(), summarize() (+22 more)

### Community 23 - "catalog.ts"
Cohesion: 0.18
Nodes (18): allowedModels(), ANTHROPIC, availableModels(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync(), openrouterModels() (+10 more)

### Community 24 - "auth.ts"
Cohesion: 0.25
Nodes (21): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+13 more)

### Community 25 - "ServicePanels.tsx"
Cohesion: 0.17
Nodes (19): AddRowDialog(), Analytics, Bars(), Col, DataPanel(), fmt(), Rows, SeoPanel() (+11 more)

### Community 26 - "package.json"
Cohesion: 0.20
Nodes (9): esbuild@^0.28.2, ws@^8.22.0, engines, node, name, private, type, esbuild (+1 more)

### Community 27 - "src/api.ts"
Cohesion: 0.36
Nodes (6): bytes(), Folder, Project, Meter(), Plan(), Usage

### Community 28 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TurnChanges (+7 more)

### Community 29 - "sandbox.ts"
Cohesion: 0.17
Nodes (10): CheckoutInput, config, env, ROOT_DIR, removeProjectData(), beginTransaction(), dispatch(), sandboxes (+2 more)

### Community 30 - "baas/jobs.ts"
Cohesion: 0.18
Nodes (14): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, runJob() (+6 more)

### Community 31 - "guides.ts"
Cohesion: 0.19
Nodes (14): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+6 more)

### Community 32 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, croner@^11.0.0, hono@^4.13.14, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1, react@^19.3.1, @types/node@^26.6.6, typescript@^7.0.2 (+7 more)

### Community 34 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "studioApi.ts"
Cohesion: 0.07
Nodes (17): Env, ipOf(), memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, startSession(), studioApi (+9 more)

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 39 - "agents.mjs"
Cohesion: 0.18
Nodes (10): app, DATA, MODELS, req(), ROOT, call(), log, reply() (+2 more)

### Community 40 - "ai.ts"
Cohesion: 0.18
Nodes (17): aiUsage(), AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part (+9 more)

### Community 41 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 42 - "tools.ts"
Cohesion: 0.10
Nodes (9): B, I, N, S, ToolOutput, typed(), assertPublic(), fetchPublicText() (+1 more)

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "projectDb.ts"
Cohesion: 0.27
Nodes (11): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, open (+3 more)

### Community 45 - "github.mjs"
Cohesion: 0.16
Nodes (7): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT

### Community 46 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 47 - "base"
Cohesion: 0.40
Nodes (6): base(), currentPath(), Link(), navigate(), notify(), runtime()

### Community 48 - "server.ts"
Cohesion: 0.14
Nodes (17): toolByName, buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+9 more)

### Community 49 - "runner.ts"
Cohesion: 0.11
Nodes (35): hono, sessionCookie(), isBuilding(), stopBuilding(), caseById(), defaultJudge(), Active, activeRunId() (+27 more)

### Community 50 - "score.ts"
Cohesion: 0.12
Nodes (31): EVAL_CASES, EVAL_SET_VERSION, EvalCase, EvalSize, RunRow, Aggregate, aggregate(), CaseResult (+23 more)

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.25
Nodes (8): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi(), ctx()

### Community 53 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 55 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.07
Nodes (9): AiMessage, AppUser, CheckoutInput, Ctx, Db, JobCtx, ServiceCtx, StoredFile (+1 more)

### Community 57 - "vitest"
Cohesion: 0.11
Nodes (9): vitest, out(), createLangfuse(), handleMcp(), dir, BEFORE, conforms(), dir (+1 more)

### Community 58 - "accounts.ts"
Cohesion: 0.17
Nodes (21): ensureEvalAccount(), accountFromSession(), assertStrongPassword(), canSignUp(), changePassword(), COMMON, createAccount(), createSession() (+13 more)

### Community 60 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 61 - "rename.ts"
Cohesion: 0.19
Nodes (7): rewriteImports(), specFor(), escapeRe(), replaceVisibleText(), TextEditResult, FileMap, files

### Community 62 - "log"
Cohesion: 0.17
Nodes (16): AiUnavailableError, appAiChat(), appHeaders(), rateLimit(), RateLimitError, STUDIO_HEADERS, studioOrigins(), uploadHeaders() (+8 more)

### Community 63 - "forja"
Cohesion: 0.09
Nodes (22): BROWSER, args, context, dockerfile, build, environment, expose, healthcheck (+14 more)

### Community 65 - "server/index.ts"
Cohesion: 0.13
Nodes (17): closeAll(), Event, Langfuse, langfuse, LangfuseOptions, app, resolveApp(), server (+9 more)

### Community 66 - "db.ts"
Cohesion: 0.22
Nodes (10): getTransport(), listEmails(), receiveEmail(), sendPlatformEmail(), one(), accessOf(), claimInvites(), inviteMember() (+2 more)

### Community 68 - "orgs.ts"
Cohesion: 0.21
Nodes (14): addOrgMember(), assertCanManage(), createOrg(), listOrgMembers(), listOrgs(), Org, ORG_ROLES, OrgRole (+6 more)

### Community 69 - "typecheck.ts"
Cohesion: 0.25
Nodes (12): readDeps(), IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 70 - "crypto.ts"
Cohesion: 0.35
Nodes (10): burnPasswordCheck(), hashPassword(), LEGACY, passwordNeedsRehash(), SCRYPT, scryptKey(), verifyPassword(), waiting (+2 more)

### Community 71 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 72 - "Evals.tsx"
Cohesion: 0.28
Nodes (8): Agg, download(), EvalCfg, Evals(), money(), RunDetail, RunSummary, STATUS

### Community 73 - "AppEnv"
Cohesion: 0.29
Nodes (6): AppUser, AppEnv, EndpointContext, AppTarget, Run, RunInput

### Community 74 - "judge.ts"
Cohesion: 0.29
Nodes (7): JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), JUDGE_DIMENSIONS, JudgeDimension, Judgement

### Community 75 - "forja"
Cohesion: 0.40
Nodes (4): environment, ports, services, forja

### Community 77 - "usage.ts"
Cohesion: 0.50
Nodes (4): actionsToday(), countAction(), DAILY_ACTIONS, usageSummary()

### Community 79 - "useRoute"
Cohesion: 0.67
Nodes (4): ForjaApp(), matchRoute(), subscribe(), useRoute()

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `Chat.tsx`, `api`, `Evals.tsx`, `ProjectView.tsx`, `Memory.tsx`, `Dashboard.tsx`, `client/index.ts`, `ServicePanels.tsx`, `package.json`, `src/api.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `browser.ts`, `devDependencies`, `db.ts`, `studioApi.ts`, `typecheck.ts`, `bundler.ts`, `llm/router.ts`, `mcp/jobs.ts`, `securityReview.ts`, `builder/index.ts`, `score.ts`, `problems.ts`, `apiTypes.test.ts`, `sdk/server/index.ts`, `package.json`, `Changes.tsx`, `rename.ts`, `guides.ts`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Should `roles.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `runner.ts` to `server/index.ts`, `dependencies`, `package.json`, `studioApi.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10631229235880399 - nodes in this community are weakly interconnected._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05201266395296246 - nodes in this community are weakly interconnected._