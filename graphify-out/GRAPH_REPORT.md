# Graph Report - forje-software-studio  (2026-11-01)

## Corpus Check
- 116 files · ~117,223 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 2, .example 1)

## Summary
- 1320 nodes · 3497 edges · 62 communities (57 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dc308a5e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/index.ts
- readAllFiles
- orchestrator.ts
- Chat.tsx
- tools.ts
- github.ts
- api
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- readAllFiles
- bandit.ts
- Dashboard.tsx
- securityReview.ts
- builder/index.ts
- bundler.ts
- e2e.mjs
- problems.ts
- client/index.ts
- accounts.ts
- agent.ts
- catalog.ts
- auth.ts
- ServicePanels.tsx
- roles.ts
- Models.tsx
- Changes.tsx
- studioApi.ts
- jobs.ts
- server.ts
- ref_node_fs
- dependencies
- devDependencies
- ref_node_url
- sandboxWorker.mjs
- compilerOptions
- Inventario de funciones de Lovable → Forja
- agents.mjs
- ai.ts
- db.ts
- tools.ts
- scripts
- projectDb.ts
- analytics.ts
- AgentLanes.tsx
- base
- urls.ts
- accounts.ts
- textEdit.ts
- Inventario de interfaz de Floot → Forja
- Forja
- realtime.ts
- config
- apiTypes.test.ts
- tools.ts
- metrics.test.ts
- ApiError
- CLAUDE.md
- PreviewHandle

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

## Communities (62 total, 5 thin omitted)

### Community 0 - "server/index.ts"
Cohesion: 0.16
Nodes (15): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+7 more)

### Community 1 - "readAllFiles"
Cohesion: 0.09
Nodes (20): BACKEND, CHECKLIST, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND, JOBS (+12 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.10
Nodes (45): describeSchema(), save(), active, cleanText(), commitMessage(), extractMemories(), FAST_TOOLS, finishTask() (+37 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (61): ApiError, streamPost(), AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE (+53 more)

### Community 4 - "tools.ts"
Cohesion: 0.10
Nodes (32): platformDb(), emitProject(), projectPath(), pull(), assertValidPath(), Author, ChangeEntry, createFolder() (+24 more)

### Community 5 - "github.ts"
Cohesion: 0.12
Nodes (25): blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh(), GithubError (+17 more)

### Community 6 - "api"
Cohesion: 0.09
Nodes (37): api(), SelectedElement, GithubCommitCard(), GithubSection(), Link, Mark(), Kind, kindOf() (+29 more)

### Community 7 - "appServer.ts"
Cohesion: 0.10
Nodes (38): AiUnavailableError, appAiChat(), sessionCookie(), getObject(), appHeaders(), isHttps(), rateLimit(), RateLimitError (+30 more)

### Community 8 - "context.ts"
Cohesion: 0.06
Nodes (29): AppUser, AppEnv, bindJobs(), EndpointContext, HttpError, JobContext, publish(), ServiceContext (+21 more)

### Community 9 - "App.tsx"
Cohesion: 0.18
Nodes (19): react, App(), Me, NAV, Shell(), UserMenu(), Logo(), AccountModels() (+11 more)

### Community 10 - "with"
Cohesion: 0.07
Nodes (29): env, runs-on, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, jobs, check (+21 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.16
Nodes (33): timeAgo(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel(), Loading() (+25 more)

### Community 12 - "readAllFiles"
Cohesion: 0.28
Nodes (12): hasUnpublishedChanges(), isDevFile(), isSlugTaken(), readAllFiles(), recordPublish(), unpublish(), runQuickScan(), publishProject() (+4 more)

### Community 13 - "bandit.ts"
Cohesion: 0.12
Nodes (30): gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior(), sampleBeta(), costUsd() (+22 more)

### Community 14 - "Dashboard.tsx"
Cohesion: 0.16
Nodes (17): Back, External, Globe, Send, copyText(), Dashboard(), IDEAS, Sort (+9 more)

### Community 15 - "securityReview.ts"
Cohesion: 0.18
Nodes (16): Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), toolByName, getProject(), getSecurity() (+8 more)

### Community 16 - "builder/index.ts"
Cohesion: 0.13
Nodes (19): buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+11 more)

### Community 17 - "bundler.ts"
Cohesion: 0.09
Nodes (40): FileMap, buildClient(), BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule (+32 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "problems.ts"
Cohesion: 0.14
Nodes (20): LogEntry, logs, ProjectEvent, projectEvents, readLogs(), changed(), clearProblems(), fingerprint() (+12 more)

### Community 20 - "client/index.ts"
Cohesion: 0.10
Nodes (21): ai, api, AppUser, auth, baas(), channels, ChatMessage, ensureSocket() (+13 more)

### Community 21 - "accounts.ts"
Cohesion: 0.14
Nodes (25): aiUsage(), deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret() (+17 more)

### Community 22 - "agent.ts"
Cohesion: 0.10
Nodes (32): AgentEvent, AgentResult, AgentSpec, IMAGE_TYPES, imageBlocks(), runAgent(), summarize(), UPLOADS (+24 more)

### Community 23 - "catalog.ts"
Cohesion: 0.20
Nodes (17): allowedModels(), ANTHROPIC, availableModels(), customModels(), DEFAULT_ALLOW, globToRegex(), lastSync(), openrouterModels() (+9 more)

### Community 24 - "auth.ts"
Cohesion: 0.22
Nodes (24): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+16 more)

### Community 25 - "ServicePanels.tsx"
Cohesion: 0.15
Nodes (24): AddRowDialog(), Analytics, Bars(), Col, DataPanel(), fmt(), IntegrationsPanel(), Rows (+16 more)

### Community 26 - "roles.ts"
Cohesion: 0.18
Nodes (14): @hono/node-server@^2.1.5, @hono/node-server, studioApi, closeAll(), app, resolveApp(), server, shutdown() (+6 more)

### Community 27 - "Models.tsx"
Cohesion: 0.29
Nodes (7): ModelChecklist(), ModelRow, MODES, price(), PROVIDER, ROLE_LABEL, RouterInfo

### Community 28 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TurnChanges (+7 more)

### Community 29 - "studioApi.ts"
Cohesion: 0.23
Nodes (12): FileMap, fingerprint(), isClient(), isCode(), isServer(), lineOf(), markedPublic(), quickScan() (+4 more)

### Community 30 - "jobs.ts"
Cohesion: 0.21
Nodes (17): addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob() (+9 more)

### Community 31 - "server.ts"
Cohesion: 0.06
Nodes (47): @modelcontextprotocol/sdk@^1.32.2, @modelcontextprotocol/sdk, BUILDER_SYSTEM_PROMPT, builderTools, out(), build(), Guide, guideById (+39 more)

### Community 32 - "ref_node_fs"
Cohesion: 0.15
Nodes (17): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+9 more)

### Community 33 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, nodemailer@^10.3.1, react@^19.3.1 (+10 more)

### Community 34 - "devDependencies"
Cohesion: 0.10
Nodes (28): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/node@^26.6.6, @types/nodemailer@^8.0.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, @types/ws@^8.18.2 (+20 more)

### Community 35 - "ref_node_url"
Cohesion: 0.08
Nodes (22): Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, getTransport(), listEmails(), receiveEmail() (+14 more)

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
Cohesion: 0.19
Nodes (16): AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part, toOpenAi() (+8 more)

### Community 41 - "db.ts"
Cohesion: 0.22
Nodes (6): MAX_FILE_BYTES, storageUsage(), StoredObject, paths, here, runFixture()

### Community 42 - "tools.ts"
Cohesion: 0.12
Nodes (6): B, I, N, S, ToolOutput, typed()

### Community 43 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, dev:server, dev:studio, start, test, test:agents (+3 more)

### Community 44 - "projectDb.ts"
Cohesion: 0.26
Nodes (12): removeProjectData(), cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open (+4 more)

### Community 45 - "analytics.ts"
Cohesion: 0.16
Nodes (7): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT

### Community 46 - "AgentLanes.tsx"
Cohesion: 0.36
Nodes (6): bytes(), Folder, Project, Meter(), Plan(), Usage

### Community 47 - "base"
Cohesion: 0.24
Nodes (10): base(), currentPath(), ForjaApp(), Link(), matchRoute(), navigate(), notify(), runtime() (+2 more)

### Community 48 - "urls.ts"
Cohesion: 0.33
Nodes (11): projectView(), baseFor(), isBuilding(), appOrigin(), appUrl(), checkShareToken(), previewOrigin(), previewUrl() (+3 more)

### Community 49 - "accounts.ts"
Cohesion: 0.20
Nodes (8): accountFromApiToken(), accountFromSession(), deleteAccount(), deleteApiToken(), endSession(), listApiTokens(), signOutOtherSessions(), updateAccountName()

### Community 50 - "textEdit.ts"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, page()

### Community 51 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.29
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 52 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), useApi()

### Community 53 - "realtime.ts"
Cohesion: 0.39
Nodes (7): ws@^8.22.0, ws, attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 54 - "config"
Cohesion: 0.27
Nodes (7): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId(), CheckoutInput, config

### Community 55 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 56 - "tools.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `dependencies`, `devDependencies`, `Chat.tsx`, `api`, `ProjectView.tsx`, `Dashboard.tsx`, `AgentLanes.tsx`, `client/index.ts`, `ServicePanels.tsx`, `Models.tsx`, `Changes.tsx`?**
  _High betweenness centrality (0.318) - this node is a cross-community bridge._
- **Should `readAllFiles` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Why does `hono` connect `dependencies` to `roles.ts`, `devDependencies`, `ref_node_url`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `orchestrator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1036077705827937 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `devDependencies` to `server/index.ts`, `bandit.ts`, `builder/index.ts`, `bundler.ts`, `textEdit.ts`, `apiTypes.test.ts`, `metrics.test.ts`, `Changes.tsx`, `studioApi.ts`, `server.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05201266395296246 - nodes in this community are weakly interconnected._
- **Should `tools.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10160427807486631 - nodes in this community are weakly interconnected._