# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 110 files · ~112,753 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1276 nodes · 3388 edges · 65 communities (58 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed1bf493`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
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
- publish.ts
- llm/router.ts
- Dashboard.tsx
- sandbox.ts
- builder/index.ts
- bundler.ts
- e2e.mjs
- problems.ts
- client/index.ts
- integrations.ts
- agent.ts
- catalog.ts
- accounts.ts
- Integrations.tsx
- server/index.ts
- api.ts
- Changes.tsx
- securityScan.ts
- jobs.ts
- server.ts
- memory.ts
- dependencies
- package.json
- studioApi.ts
- sandboxWorker.mjs
- compilerOptions
- Inventario de funciones de Lovable → Forja
- agents.mjs
- ai.ts
- AgentLanes.tsx
- tools.ts
- scripts
- package.json
- github.mjs
- api.ts
- base
- rename.ts
- Memory.tsx
- vitest
- Inventario de interfaz de Floot → Forja
- Forja
- useRoute
- config.ts
- Skills.tsx
- safeFetch.ts
- send
- ApiError
- CLAUDE.md
- @anthropic-ai/sdk
- @electric-sql/pglite
- esbuild
- zod@^4.6.7

## God Nodes (most connected - your core abstractions)
1. `q()` - 99 edges
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
- `Cómo está hecho` --references--> `api()`  [INFERRED]
  README.md → studio/src/api.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/index.ts
- `Avance` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/index.ts

## Import Cycles
- 2-file cycle: `studio/src/App.tsx -> studio/src/pages/ProjectView.tsx -> studio/src/App.tsx`

## Communities (65 total, 7 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.12
Nodes (27): playwright-core, projectView(), baseFor(), isBuilding(), resolveApp(), appOrigin(), allowedRequest(), BrowserStep (+19 more)

### Community 1 - "roles.ts"
Cohesion: 0.07
Nodes (29): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+21 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.11
Nodes (40): 6. IA dentro de las apps, describeSchema(), imageBlocks(), save(), active, ChatMode, cleanText(), commitMessage() (+32 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.08
Nodes (33): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+25 more)

### Community 4 - "q"
Cohesion: 0.12
Nodes (34): analyticsSummary(), platformDb(), q(), assertValidPath(), ChangeEntry, createCheckpoint(), createFolder(), createProject() (+26 more)

### Community 5 - "github.ts"
Cohesion: 0.11
Nodes (29): blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh(), GithubError (+21 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (28): Me, SelectedElement, Switch(), AUTHOR, Change, CheckpointPanel(), Device, DEVICES (+20 more)

### Community 7 - "appServer.ts"
Cohesion: 0.12
Nodes (34): appHeaders(), rateLimit(), RateLimitError, STUDIO_HEADERS, studioOrigins(), uploadHeaders(), windows, Project (+26 more)

### Community 8 - "context.ts"
Cohesion: 0.10
Nodes (18): AiUnavailableError, appAiChat(), bindJobs(), HttpError, JobContext, publish(), ServiceContext, serviceContext() (+10 more)

### Community 9 - "App.tsx"
Cohesion: 0.23
Nodes (13): react, App(), NAV, Shell(), UserMenu(), Logo(), Login(), go() (+5 more)

### Community 10 - "with"
Cohesion: 0.07
Nodes (29): env, runs-on, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, jobs, check (+21 more)

### Community 11 - "api"
Cohesion: 0.14
Nodes (36): Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading(), LogsPanel() (+28 more)

### Community 12 - "publish.ts"
Cohesion: 0.15
Nodes (20): one(), Author, getProject(), getProjectBySlug(), isSlugTaken(), recordPublish(), unpublish(), getSecurity() (+12 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.12
Nodes (30): gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), sampleBeta(), costUsd() (+22 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (23): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+15 more)

### Community 15 - "sandbox.ts"
Cohesion: 0.14
Nodes (13): AppUser, AppEnv, EndpointContext, log(), beginTransaction(), dispatch(), ProjectSandbox, Run (+5 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.21
Nodes (16): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+8 more)

### Community 17 - "bundler.ts"
Cohesion: 0.12
Nodes (26): buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule() (+18 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.16
Nodes (19): emitProject(), LogEntry, logs, projectEvents, changed(), clearProblems(), fingerprint(), fromLog() (+11 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "integrations.ts"
Cohesion: 0.13
Nodes (21): deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret(), decrypt() (+13 more)

### Community 22 - "agent.ts"
Cohesion: 0.14
Nodes (21): AgentEvent, AgentResult, AgentSpec, IMAGE_TYPES, loadHistory(), runAgent(), summarize(), UPLOADS (+13 more)

### Community 23 - "catalog.ts"
Cohesion: 0.16
Nodes (20): allowedModels(), ANTHROPIC, availableModels(), creditsForUsd(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync() (+12 more)

### Community 24 - "accounts.ts"
Cohesion: 0.08
Nodes (46): primaryKeyOf(), removeProjectData(), AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail() (+38 more)

### Community 25 - "Integrations.tsx"
Cohesion: 0.48
Nodes (6): Modal(), CreateDialog(), Integrations(), TYPE_HINT, Types, ValueDialog()

### Community 26 - "server/index.ts"
Cohesion: 0.19
Nodes (14): studioApi, closeAll(), attachSocket(), publish(), realtimeStats(), room(), rooms, app (+6 more)

### Community 27 - "api.ts"
Cohesion: 0.16
Nodes (22): api(), timeAgo(), GithubSection(), Link, Mark(), AccountModels(), ModelChecklist(), ModelRow (+14 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "securityScan.ts"
Cohesion: 0.26
Nodes (11): FileMap, fingerprint(), isClient(), isCode(), isServer(), lineOf(), markedPublic(), quickScan() (+3 more)

### Community 30 - "jobs.ts"
Cohesion: 0.21
Nodes (16): addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob() (+8 more)

### Community 31 - "server.ts"
Cohesion: 0.07
Nodes (40): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+32 more)

### Community 32 - "memory.ts"
Cohesion: 0.14
Nodes (19): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, listMemories(), MAX_MEMORY_CHARS (+11 more)

### Community 33 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, croner@^11.0.0, hono@^4.13.14, @hono/node-server@^2.1.5, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1, playwright-core@1.64.1, react@^19.3.1 (+9 more)

### Community 34 - "package.json"
Cohesion: 0.11
Nodes (18): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/node@^26.6.6, @types/nodemailer@^8.0.2, @types/react-dom@^19.3.0, typescript@^7.0.2, vite@^8.3.5 (+10 more)

### Community 35 - "studioApi.ts"
Cohesion: 0.08
Nodes (23): Env, memoryOf(), pid(), SESSION_COOKIE, EmailInput, getTransport(), listEmails(), receiveEmail() (+15 more)

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.18
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 38 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.14
Nodes (14): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+6 more)

### Community 39 - "agents.mjs"
Cohesion: 0.17
Nodes (10): app, DATA, MODELS, req(), ROOT, call(), log, reply() (+2 more)

### Community 40 - "ai.ts"
Cohesion: 0.18
Nodes (18): aiUsage(), AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part (+10 more)

### Community 41 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 42 - "tools.ts"
Cohesion: 0.11
Nodes (16): sessionCookie(), ToolOutput, BUILTIN_PACKAGES, depsDir(), depsKey(), ensureDeps(), installing, isValidPackageName() (+8 more)

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "package.json"
Cohesion: 0.20
Nodes (9): @types/react@^19.3.0, @types/ws@^8.18.2, engines, node, name, private, type, @types/react (+1 more)

### Community 45 - "github.mjs"
Cohesion: 0.15
Nodes (7): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT

### Community 46 - "api.ts"
Cohesion: 0.27
Nodes (7): ApiError, bytes(), Folder, Project, Meter(), Plan(), Usage

### Community 47 - "base"
Cohesion: 0.50
Nodes (5): base(), Link(), navigate(), notify(), runtime()

### Community 48 - "rename.ts"
Cohesion: 0.31
Nodes (4): resolveImport(), rewriteImports(), specFor(), files

### Community 49 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 50 - "vitest"
Cohesion: 0.32
Nodes (6): vitest, escapeRe(), replaceVisibleText(), TextEditResult, page(), FileMap

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.29
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi()

### Community 53 - "useRoute"
Cohesion: 0.50
Nodes (5): currentPath(), ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 54 - "config.ts"
Cohesion: 0.23
Nodes (8): browserOf(), deviceOf(), recordPageView(), visitorId(), CheckoutInput, config, paths, ROOT_DIR

### Community 55 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

### Community 56 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 57 - "send"
Cohesion: 0.25
Nodes (8): streamPost(), send(), summarize(), teamOf(), toItems(), turnTitle(), userItem(), withElement()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `Chat.tsx`, `ProjectView.tsx`, `AgentLanes.tsx`, `api`, `package.json`, `Dashboard.tsx`, `api.ts`, `Memory.tsx`, `client/index.ts`, `Integrations.tsx`, `api.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12043010752688173 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `dependencies` to `server/index.ts`, `studioApi.ts`, `package.json`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `roles.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `browser.ts`, `package.json`, `package.json`, `llm/router.ts`, `builder/index.ts`, `bundler.ts`, `rename.ts`, `Changes.tsx`, `securityScan.ts`, `server.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10569105691056911 - nodes in this community are weakly interconnected._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._