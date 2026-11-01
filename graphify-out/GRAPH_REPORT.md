# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 104 files · ~108,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1225 nodes · 3283 edges · 65 communities (58 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2c507ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/index.ts
- securityReview.ts
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
- tools.ts
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
- auth.ts
- ServicePanels.tsx
- accounts.ts
- api.ts
- Changes.tsx
- studioApi.ts
- jobs.ts
- server.ts
- memory.ts
- dependencies
- devDependencies
- members.ts
- sandboxWorker.mjs
- compilerOptions
- Inventario de funciones de Lovable → Forja
- agents.mjs
- openaiCompat.ts
- AgentLanes.tsx
- projectDb.ts
- scripts
- db.ts
- github.mjs
- package.json
- base
- lib/security.ts
- Memory.tsx
- ai.ts
- Inventario de interfaz de Floot → Forja
- Forja
- ref_node_crypto
- fakeGithub.mjs
- Skills.tsx
- safeFetch.ts
- send
- ApiError
- CLAUDE.md
- @anthropic-ai/sdk
- @types/node@^26.6.6
- @types/ws@^8.18.2
- typescript@^7.0.2

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
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Cómo está hecho` --references--> `api()`  [INFERRED]
  README.md → studio/src/api.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/index.ts

## Import Cycles
- 2-file cycle: `studio/src/App.tsx -> studio/src/pages/ProjectView.tsx -> studio/src/App.tsx`

## Communities (65 total, 7 thin omitted)

### Community 0 - "server/index.ts"
Cohesion: 0.06
Nodes (52): ws@^8.22.0, playwright-core, ws, projectView(), studioApi, baseFor(), closeAll(), attachSocket() (+44 more)

### Community 1 - "securityReview.ts"
Cohesion: 0.05
Nodes (47): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+39 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.10
Nodes (45): describeSchema(), runAgent(), save(), active, cleanText(), commitMessage(), extractMemories(), FAST_TOOLS (+37 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.08
Nodes (36): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+28 more)

### Community 4 - "q"
Cohesion: 0.11
Nodes (35): imageBlocks(), finishTask(), insertTask(), runLane(), platformDb(), q(), projectPath(), assertValidPath() (+27 more)

### Community 5 - "github.ts"
Cohesion: 0.11
Nodes (31): getAccount(), one(), emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount() (+23 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (29): SelectedElement, Switch(), AppearanceSection(), AUTHOR, Change, Collaborators(), Device, DEVICES (+21 more)

### Community 7 - "appServer.ts"
Cohesion: 0.14
Nodes (31): AiUnavailableError, appAiChat(), sessionCookie(), log(), hasUnpublishedChanges(), isDevFile(), analyticsBeacon(), baasRoute() (+23 more)

### Community 8 - "context.ts"
Cohesion: 0.10
Nodes (13): HttpError, JobContext, publish(), ServiceContext, serviceContext(), EmailInput, ProjectDb, deleteObject() (+5 more)

### Community 9 - "App.tsx"
Cohesion: 0.15
Nodes (22): react, bytes(), App(), Me, NAV, Shell(), UserMenu(), Logo() (+14 more)

### Community 10 - "with"
Cohesion: 0.07
Nodes (29): env, runs-on, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, jobs, check (+21 more)

### Community 11 - "api"
Cohesion: 0.22
Nodes (27): api(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading() (+19 more)

### Community 12 - "tools.ts"
Cohesion: 0.11
Nodes (17): ToolOutput, projectPackages(), BUILTIN_PACKAGES, depsDir(), depsKey(), ensureDeps(), installing, isValidPackageName() (+9 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.13
Nodes (24): gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), sampleBeta(), analysisCache (+16 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (23): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+15 more)

### Community 15 - "sandbox.ts"
Cohesion: 0.12
Nodes (15): AppUser, AppEnv, EndpointContext, ROOT_DIR, Project, AppTarget, beginTransaction(), dispatch() (+7 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.13
Nodes (22): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+14 more)

### Community 17 - "bundler.ts"
Cohesion: 0.14
Nodes (23): buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule() (+15 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.09
Nodes (21): browse(), creation, DATA, evil, files, fresh, got, jar (+13 more)

### Community 19 - "problems.ts"
Cohesion: 0.14
Nodes (20): LogEntry, logs, ProjectEvent, projectEvents, readLogs(), changed(), clearProblems(), fingerprint() (+12 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "integrations.ts"
Cohesion: 0.13
Nodes (21): deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret(), decrypt() (+13 more)

### Community 22 - "agent.ts"
Cohesion: 0.15
Nodes (19): AgentEvent, AgentResult, AgentSpec, IMAGE_TYPES, loadHistory(), summarize(), UPLOADS, TurnState (+11 more)

### Community 23 - "catalog.ts"
Cohesion: 0.16
Nodes (20): allowedModels(), ANTHROPIC, availableModels(), creditsForUsd(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync() (+12 more)

### Community 24 - "auth.ts"
Cohesion: 0.26
Nodes (18): primaryKeyOf(), AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset() (+10 more)

### Community 25 - "ServicePanels.tsx"
Cohesion: 0.18
Nodes (18): AddRowDialog(), Analytics, Bars(), Col, DataPanel(), fmt(), Rows, SqlConsole() (+10 more)

### Community 26 - "accounts.ts"
Cohesion: 0.20
Nodes (15): newId(), newToken(), numericCode(), sha256(), accountFromApiToken(), accountFromSession(), createApiToken(), deleteAccount() (+7 more)

### Community 27 - "api.ts"
Cohesion: 0.16
Nodes (16): Folder, Project, timeAgo(), GithubCommitCard(), GithubSection(), Link, Mark(), AccountModels() (+8 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "studioApi.ts"
Cohesion: 0.12
Nodes (7): Env, memoryOf(), pid(), SESSION_COOKIE, ChatMode, stopBuilding(), zip()

### Community 30 - "jobs.ts"
Cohesion: 0.19
Nodes (17): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+9 more)

### Community 31 - "server.ts"
Cohesion: 0.18
Nodes (15): BUILDER_SYSTEM_PROMPT, builderTools, buildServer(), extraTools, handleMcp(), projectIdProp, accessOf(), sharedProjectIds() (+7 more)

### Community 32 - "memory.ts"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, croner@^11.0.0, @electric-sql/pglite@^0.5.13, hono@^4.13.14, @hono/node-server@^2.1.5, nodemailer@^10.3.1, playwright-core@1.64.1, react@^19.3.1 (+9 more)

### Community 34 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+9 more)

### Community 35 - "members.ts"
Cohesion: 0.15
Nodes (13): getTransport(), listEmails(), receiveEmail(), sendEmail(), sendPlatformEmail(), CheckoutInput, paymentsFor(), config (+5 more)

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

### Community 40 - "openaiCompat.ts"
Cohesion: 0.22
Nodes (12): anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part, toOpenAi(), CallResult (+4 more)

### Community 41 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 42 - "projectDb.ts"
Cohesion: 0.26
Nodes (12): removeProjectData(), cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open (+4 more)

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "db.ts"
Cohesion: 0.27
Nodes (5): MAX_FILE_BYTES, storageUsage(), StoredObject, paths, here

### Community 45 - "github.mjs"
Cohesion: 0.20
Nodes (4): app, DATA, jar, ROOT

### Community 46 - "package.json"
Cohesion: 0.20
Nodes (9): esbuild@^0.28.2, @modelcontextprotocol/sdk@^1.32.2, engines, node, name, private, type, esbuild (+1 more)

### Community 47 - "base"
Cohesion: 0.24
Nodes (10): base(), currentPath(), ForjaApp(), Link(), matchRoute(), navigate(), notify(), runtime() (+2 more)

### Community 48 - "lib/security.ts"
Cohesion: 0.24
Nodes (8): appHeaders(), isHttps(), rateLimit(), RateLimitError, STUDIO_HEADERS, studioOrigins(), uploadHeaders(), windows

### Community 49 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 50 - "ai.ts"
Cohesion: 0.50
Nodes (5): aiUsage(), AppAiInput, Block, LlmMessage, LlmTool

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.29
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi()

### Community 53 - "ref_node_crypto"
Cohesion: 0.43
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 54 - "fakeGithub.mjs"
Cohesion: 0.38
Nodes (3): blobId(), sha1(), startFakeGithub()

### Community 55 - "Skills.tsx"
Cohesion: 0.33
Nodes (6): filterSkills(), norm(), Skill, SkillMode, SKILLS, SlashMenu()

### Community 56 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 57 - "send"
Cohesion: 0.33
Nodes (5): ApiError, streamPost(), send(), userItem(), withElement()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `Chat.tsx`, `ProjectView.tsx`, `AgentLanes.tsx`, `api`, `package.json`, `Dashboard.tsx`, `Memory.tsx`, `client/index.ts`, `ServicePanels.tsx`, `api.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.317) - this node is a cross-community bridge._
- **Should `server/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06370543541788427 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `dependencies` to `server/index.ts`, `studioApi.ts`, `package.json`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `securityReview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05450733752620545 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `memory.ts`, `server/index.ts`, `orchestrator.ts`, `members.ts`, `securityReview.ts`, `github.ts`, `context.ts`, `db.ts`, `llm/router.ts`, `ai.ts`, `catalog.ts`, `ref_node_crypto`, `integrations.ts`, `agent.ts`, `accounts.ts`, `studioApi.ts`, `jobs.ts`, `server.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10453283996299723 - nodes in this community are weakly interconnected._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0796221322537112 - nodes in this community are weakly interconnected._