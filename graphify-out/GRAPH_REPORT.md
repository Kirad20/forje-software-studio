# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 106 files · ~110,757 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1248 nodes · 3334 edges · 63 communities (59 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6ee35dbc`
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
- tools.ts
- llm/router.ts
- Dashboard.tsx
- sandbox.ts
- builder/index.ts
- bundler.ts
- e2e.mjs
- problems.ts
- client/index.ts
- studioApi.ts
- agent.ts
- catalog.ts
- auth.ts
- ServicePanels.tsx
- server/index.ts
- api.ts
- Changes.tsx
- securityScan.ts
- jobs.ts
- server.ts
- memory.ts
- dependencies
- package.json
- accounts.ts
- sandboxWorker.mjs
- compilerOptions
- Inventario de funciones de Lovable → Forja
- agents.mjs
- ai.ts
- AgentLanes.tsx
- projectDb.ts
- scripts
- urls.ts
- github.mjs
- securityReview.ts
- base
- realtime.ts
- Memory.tsx
- vitest
- Inventario de interfaz de Floot → Forja
- Forja
- platform/security.ts
- ref_node_crypto
- Skills.tsx
- safeFetch.ts
- send
- ApiError
- CLAUDE.md
- ProjectDb
- usage.ts

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

## Communities (63 total, 4 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.16
Nodes (15): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+7 more)

### Community 1 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+10 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.10
Nodes (46): describeSchema(), AgentEvent, imageBlocks(), runAgent(), save(), active, commitMessage(), FAST_TOOLS (+38 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.08
Nodes (36): Block, Chat(), fileName(), inline(), Item, Markdown(), markId(), MentionMenu() (+28 more)

### Community 4 - "q"
Cohesion: 0.15
Nodes (27): platformDb(), q(), assertValidPath(), ChangeEntry, createFolder(), deleteFile(), deleteFolder(), deleteProject() (+19 more)

### Community 5 - "github.ts"
Cohesion: 0.12
Nodes (27): blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh(), GithubError (+19 more)

### Community 6 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (29): SelectedElement, Switch(), AppearanceSection(), AUTHOR, Change, Collaborators(), Device, DEVICES (+21 more)

### Community 7 - "appServer.ts"
Cohesion: 0.10
Nodes (39): AiUnavailableError, appAiChat(), sessionCookie(), appHeaders(), isHttps(), rateLimit(), RateLimitError, STUDIO_HEADERS (+31 more)

### Community 8 - "context.ts"
Cohesion: 0.09
Nodes (19): bindJobs(), HttpError, JobContext, publish(), ServiceContext, serviceContext(), EmailInput, sendEmail() (+11 more)

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
Cohesion: 0.18
Nodes (10): ToolOutput, Author, isSlugTaken(), recordPublish(), runQuickScan(), formatProblem(), publishProject(), suggestSlug() (+2 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.11
Nodes (34): penalizeTurn(), gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), recordOutcome() (+26 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.13
Nodes (23): Back, External, Globe, Send, Avatar(), colorFor(), COLORS, copyText() (+15 more)

### Community 15 - "sandbox.ts"
Cohesion: 0.14
Nodes (12): AppUser, AppEnv, EndpointContext, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput (+4 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.20
Nodes (16): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+8 more)

### Community 17 - "bundler.ts"
Cohesion: 0.09
Nodes (38): FileMap, BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule() (+30 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.09
Nodes (23): browse(), creation, DATA, evil, files, fresh, got, jar (+15 more)

### Community 19 - "problems.ts"
Cohesion: 0.14
Nodes (21): emitProject(), LogEntry, logs, ProjectEvent, projectEvents, readLogs(), changed(), clearProblems() (+13 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "studioApi.ts"
Cohesion: 0.06
Nodes (36): Env, memoryOf(), pid(), SESSION_COOKIE, aiUsage(), cancelTimer(), setJobEnabled(), deleteSecret() (+28 more)

### Community 22 - "agent.ts"
Cohesion: 0.20
Nodes (14): AgentResult, AgentSpec, IMAGE_TYPES, loadHistory(), summarize(), UPLOADS, BuilderTool, ToolContext (+6 more)

### Community 23 - "catalog.ts"
Cohesion: 0.20
Nodes (17): allowedModels(), ANTHROPIC, availableModels(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync(), openrouterModels() (+9 more)

### Community 24 - "auth.ts"
Cohesion: 0.20
Nodes (25): primaryKeyOf(), AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset() (+17 more)

### Community 25 - "ServicePanels.tsx"
Cohesion: 0.18
Nodes (18): AddRowDialog(), Analytics, Bars(), Col, DataPanel(), fmt(), Rows, SqlConsole() (+10 more)

### Community 26 - "server/index.ts"
Cohesion: 0.15
Nodes (16): @hono/node-server@^2.1.5, @hono/node-server, studioApi, closeAll(), ROOT_DIR, app, resolveApp(), server (+8 more)

### Community 27 - "api.ts"
Cohesion: 0.16
Nodes (16): Folder, Project, timeAgo(), GithubCommitCard(), GithubSection(), Link, Mark(), AccountModels() (+8 more)

### Community 28 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 29 - "securityScan.ts"
Cohesion: 0.26
Nodes (11): FileMap, fingerprint(), isClient(), isCode(), isServer(), lineOf(), markedPublic(), quickScan() (+3 more)

### Community 30 - "jobs.ts"
Cohesion: 0.25
Nodes (15): crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob(), running, scheduleProject() (+7 more)

### Community 31 - "server.ts"
Cohesion: 0.10
Nodes (30): BUILDER_SYSTEM_PROMPT, builderTools, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+22 more)

### Community 32 - "memory.ts"
Cohesion: 0.16
Nodes (16): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+8 more)

### Community 33 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1 (+12 more)

### Community 34 - "package.json"
Cohesion: 0.10
Nodes (26): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/node@^26.6.6, @types/nodemailer@^8.0.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, @types/ws@^8.18.2 (+18 more)

### Community 35 - "accounts.ts"
Cohesion: 0.10
Nodes (27): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId(), getTransport(), listEmails(), receiveEmail() (+19 more)

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
Cohesion: 0.16
Nodes (21): AppAiInput, cleanText(), extractMemories(), turnContext(), updateSummary(), anthropicChat(), getClient(), SERVER_FALLBACK (+13 more)

### Community 41 - "AgentLanes.tsx"
Cohesion: 0.24
Nodes (13): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+5 more)

### Community 42 - "projectDb.ts"
Cohesion: 0.26
Nodes (12): removeProjectData(), cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open (+4 more)

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "urls.ts"
Cohesion: 0.33
Nodes (11): projectView(), baseFor(), isBuilding(), appOrigin(), appUrl(), checkShareToken(), previewOrigin(), previewUrl() (+3 more)

### Community 45 - "github.mjs"
Cohesion: 0.15
Nodes (5): here, app, DATA, jar, ROOT

### Community 46 - "securityReview.ts"
Cohesion: 0.24
Nodes (10): ROLE_PROMPTS, ROLE_TOOLS, Reported, running, SEVERITIES, startSecurityReview(), toolByName, saveScan() (+2 more)

### Community 47 - "base"
Cohesion: 0.24
Nodes (10): base(), currentPath(), ForjaApp(), Link(), matchRoute(), navigate(), notify(), runtime() (+2 more)

### Community 48 - "realtime.ts"
Cohesion: 0.39
Nodes (7): ws@^8.22.0, ws, attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 49 - "Memory.tsx"
Cohesion: 0.24
Nodes (9): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+1 more)

### Community 50 - "vitest"
Cohesion: 0.32
Nodes (6): vitest@^5.0.5, vitest, escapeRe(), replaceVisibleText(), TextEditResult, page()

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.29
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi()

### Community 53 - "platform/security.ts"
Cohesion: 0.38
Nodes (6): getSecurity(), ignoredIds(), Row, ScanView, SecurityView, Finding

### Community 54 - "ref_node_crypto"
Cohesion: 0.32
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

### Community 61 - "usage.ts"
Cohesion: 0.50
Nodes (4): actionsToday(), countAction(), DAILY_ACTIONS, usageSummary()

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `package.json`, `Chat.tsx`, `ProjectView.tsx`, `AgentLanes.tsx`, `api`, `Dashboard.tsx`, `Memory.tsx`, `client/index.ts`, `ServicePanels.tsx`, `api.ts`, `Changes.tsx`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Should `roles.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `dependencies` to `package.json`, `server/index.ts`, `studioApi.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09574468085106383 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `memory.ts`, `orchestrator.ts`, `accounts.ts`, `github.ts`, `ai.ts`, `context.ts`, `tools.ts`, `llm/router.ts`, `securityReview.ts`, `studioApi.ts`, `agent.ts`, `catalog.ts`, `auth.ts`, `platform/security.ts`, `server/index.ts`, `usage.ts`, `jobs.ts`, `server.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0796221322537112 - nodes in this community are weakly interconnected._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._