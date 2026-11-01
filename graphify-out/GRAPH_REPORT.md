# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 118 files · ~118,306 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1330 nodes · 3519 edges · 68 communities (64 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfdd2b02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/index.ts
- roles.ts
- orchestrator.ts
- Chat.tsx
- q
- github.ts
- ProjectView.tsx
- appServer.ts
- context.ts
- App.tsx
- with
- api
- deps.ts
- llm/router.ts
- Dashboard.tsx
- securityReview.ts
- builder/index.ts
- bundler.ts
- e2e.mjs
- problems.ts
- client/index.ts
- integrations.ts
- agent.ts
- catalog.ts
- accounts.ts
- ServicePanels.tsx
- package.json
- api.ts
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
- db.ts
- tools.ts
- scripts
- projectDb.ts
- github.mjs
- mcp/jobs.ts
- base
- server.ts
- AgentLanes.tsx
- textEdit.ts
- Inventario de interfaz de Floot → Forja
- Forja
- realtime.ts
- log
- apiTypes.test.ts
- safeFetch.ts
- vitest
- ApiError
- CLAUDE.md
- Memory.tsx
- rename.ts
- lib/security.ts
- ref_node_url
- Skills.tsx
- send
- @electric-sql/pglite

## God Nodes (most connected - your core abstractions)
1. `q()` - 102 edges
2. `api()` - 54 edges
3. `ProjectView()` - 37 edges
4. `runBuilderTurn()` - 30 edges
5. `Chat()` - 28 edges
6. `readAllFiles()` - 25 edges
7. `react` - 23 edges
8. `ServiceContext` - 23 edges
9. `sha256()` - 23 edges
10. `one()` - 23 edges

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

## Communities (68 total, 4 thin omitted)

### Community 0 - "server/index.ts"
Cohesion: 0.06
Nodes (53): projectView(), studioApi, baseFor(), closeAll(), estTokens(), GATE_THRESHOLD, MetricsReport, metricsReport() (+45 more)

### Community 1 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+10 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.10
Nodes (45): describeSchema(), imageBlocks(), runAgent(), save(), active, cleanText(), commitMessage(), extractMemories() (+37 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.08
Nodes (36): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+28 more)

### Community 4 - "q"
Cohesion: 0.12
Nodes (36): recordToolCall(), buildServer(), platformDb(), q(), disconnectAccount(), unlink(), assertValidPath(), ChangeEntry (+28 more)

### Community 5 - "github.ts"
Cohesion: 0.13
Nodes (26): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), doSync(), gh(), GithubError (+18 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (29): SelectedElement, Switch(), AppearanceSection(), AUTHOR, Change, Collaborators(), Device, DEVICES (+21 more)

### Community 7 - "appServer.ts"
Cohesion: 0.13
Nodes (31): AppEnv, uploadHeaders(), Project, analyticsBeacon(), AppTarget, baasRoute(), badge(), callEndpoint() (+23 more)

### Community 8 - "context.ts"
Cohesion: 0.10
Nodes (17): AiUnavailableError, appAiChat(), HttpError, JobContext, publish(), ServiceContext, serviceContext(), EmailInput (+9 more)

### Community 9 - "App.tsx"
Cohesion: 0.15
Nodes (22): react, bytes(), App(), Me, NAV, Shell(), UserMenu(), Logo() (+14 more)

### Community 10 - "with"
Cohesion: 0.07
Nodes (29): env, runs-on, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, jobs, check (+21 more)

### Community 11 - "api"
Cohesion: 0.22
Nodes (27): api(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading() (+19 more)

### Community 12 - "deps.ts"
Cohesion: 0.15
Nodes (16): page(), BUILTIN_PACKAGES, depsDir(), depsKey(), ensureDeps(), installing, isValidPackageName(), locks (+8 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.12
Nodes (32): gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), recordOutcome(), sampleBeta() (+24 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (23): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+15 more)

### Community 15 - "securityReview.ts"
Cohesion: 0.10
Nodes (30): ROLE_PROMPTS, ROLE_TOOLS, Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), toolByName (+22 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.21
Nodes (16): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+8 more)

### Community 17 - "bundler.ts"
Cohesion: 0.16
Nodes (20): BuildError, buildExamples(), bundleBrowser(), compileCache, CompiledModule, compileServerModule(), EndpointInfo, JobInfo (+12 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.14
Nodes (15): LogEntry, logs, ProjectEvent, projectEvents, readLogs(), fingerprint(), fromLog(), locate() (+7 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "integrations.ts"
Cohesion: 0.13
Nodes (21): deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret(), decrypt() (+13 more)

### Community 22 - "agent.ts"
Cohesion: 0.15
Nodes (18): AgentEvent, AgentResult, AgentSpec, IMAGE_TYPES, loadHistory(), summarize(), UPLOADS, TurnState (+10 more)

### Community 23 - "catalog.ts"
Cohesion: 0.17
Nodes (19): allowedModels(), ANTHROPIC, availableModels(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync(), openrouterModels() (+11 more)

### Community 24 - "accounts.ts"
Cohesion: 0.15
Nodes (32): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+24 more)

### Community 25 - "ServicePanels.tsx"
Cohesion: 0.18
Nodes (18): AddRowDialog(), Analytics, Bars(), Col, DataPanel(), fmt(), Rows, SqlConsole() (+10 more)

### Community 26 - "package.json"
Cohesion: 0.17
Nodes (11): croner@^11.0.0, esbuild@^0.28.2, @hono/node-server@^2.1.5, engines, node, name, private, type (+3 more)

### Community 27 - "api.ts"
Cohesion: 0.16
Nodes (16): Folder, Project, timeAgo(), GithubCommitCard(), GithubSection(), Link, Mark(), AccountModels() (+8 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "sandbox.ts"
Cohesion: 0.13
Nodes (10): AppUser, EndpointContext, ProjectDb, ROOT_DIR, beginTransaction(), dispatch(), RunInput, SandboxError (+2 more)

### Community 30 - "baas/jobs.ts"
Cohesion: 0.11
Nodes (31): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+23 more)

### Community 31 - "guides.ts"
Cohesion: 0.19
Nodes (14): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+6 more)

### Community 32 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, @anthropic-ai/sdk@^1.3.0, hono@^4.13.14, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1, playwright-core@1.64.1, react@^19.3.1, react-dom@^19.3.1 (+10 more)

### Community 34 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/node@^26.6.6, @types/nodemailer@^8.0.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, @types/ws@^8.18.2 (+10 more)

### Community 35 - "studioApi.ts"
Cohesion: 0.08
Nodes (25): Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, getTransport(), listEmails(), receiveEmail() (+17 more)

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
Nodes (18): aiUsage(), AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part (+10 more)

### Community 41 - "db.ts"
Cohesion: 0.21
Nodes (10): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId(), MAX_FILE_BYTES, storageUsage(), StoredObject (+2 more)

### Community 42 - "tools.ts"
Cohesion: 0.12
Nodes (7): sessionCookie(), B, I, N, S, ToolOutput, typed()

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "projectDb.ts"
Cohesion: 0.22
Nodes (13): removeProjectData(), cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open (+5 more)

### Community 45 - "github.mjs"
Cohesion: 0.16
Nodes (7): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT

### Community 46 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 47 - "base"
Cohesion: 0.24
Nodes (10): base(), currentPath(), ForjaApp(), Link(), matchRoute(), navigate(), notify(), runtime() (+2 more)

### Community 48 - "server.ts"
Cohesion: 0.15
Nodes (13): CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), projectContext(), projectIdProp (+5 more)

### Community 49 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 50 - "textEdit.ts"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, FileMap

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.29
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi()

### Community 53 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 54 - "log"
Cohesion: 0.29
Nodes (5): runJob(), log(), ProjectSandbox, runInSandbox(), SandboxRunError

### Community 55 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 56 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 57 - "vitest"
Cohesion: 0.14
Nodes (7): vitest, out(), handleMcp(), dir, BEFORE, conforms(), dir

### Community 60 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 61 - "rename.ts"
Cohesion: 0.31
Nodes (4): resolveImport(), rewriteImports(), specFor(), files

### Community 62 - "lib/security.ts"
Cohesion: 0.28
Nodes (7): appHeaders(), isHttps(), rateLimit(), RateLimitError, STUDIO_HEADERS, studioOrigins(), windows

### Community 63 - "ref_node_url"
Cohesion: 0.29
Nodes (5): vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vite, @vitejs/plugin-react, here

### Community 65 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

### Community 66 - "send"
Cohesion: 0.33
Nodes (5): ApiError, streamPost(), send(), userItem(), withElement()

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `Chat.tsx`, `ProjectView.tsx`, `api`, `Memory.tsx`, `Dashboard.tsx`, `AgentLanes.tsx`, `client/index.ts`, `ServicePanels.tsx`, `package.json`, `api.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.312) - this node is a cross-community bridge._
- **Should `server/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055299539170506916 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `dependencies` to `server/index.ts`, `package.json`, `studioApi.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `roles.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `server/index.ts`, `devDependencies`, `deps.ts`, `llm/router.ts`, `mcp/jobs.ts`, `securityReview.ts`, `builder/index.ts`, `textEdit.ts`, `apiTypes.test.ts`, `package.json`, `Changes.tsx`, `rename.ts`, `guides.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0971322849213691 - nodes in this community are weakly interconnected._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0796221322537112 - nodes in this community are weakly interconnected._