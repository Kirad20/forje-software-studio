# Graph Report - agente-planeador-prompt-a0bcfd  (2026-11-02)

## Corpus Check
- 259 files · ~189,993 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 2313 nodes · 6072 edges · 102 communities (88 shown, 14 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 159 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1700f6ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browser.ts
- index.tsx
- orchestrator.ts
- Chat.tsx
- Dashboard.tsx
- github.ts
- Changes.tsx
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- roles.ts
- bandit.ts
- readAllFiles
- vitest
- sha256
- src/api.ts
- e2e.mjs
- tools.ts
- client/index.ts
- collaboration/index.ts
- Inventario de funciones de Lovable → Forja
- server/builder/index.ts
- one
- playground.ts
- Panel de administración del sistema — diseño
- bundler.ts
- IProjectFileRepository
- q
- server.ts
- github.mjs
- projects.ts
- memory.ts
- devDependencies
- Account
- sandboxWorker.mjs
- compilerOptions
- db.ts
- agents.mjs
- llm/router.ts
- plan.ts
- admin/api.ts
- scripts
- llm/catalog.ts
- baas/jobs.ts
- accounts.ts
- projects/ports/repositories.ts
- studioApi.ts
- package.json
- crypto.ts
- Project
- agent.ts
- Forja
- Desplegar Forja en Coolify
- server/index.ts
- sdk/server/index.ts
- identity/index.ts
- serverTypes.test.ts
- CLAUDE.md
- sandbox.ts
- ProjectPath
- metrics.ts
- forja
- realtime.ts
- Inventario de interfaz de Floot → Forja
- ExecutionMetrics
- deps.ts
- api
- evals/api.ts
- base
- identity/ports/repositories.ts
- OrgRole
- projectDb.ts
- services
- Agents.tsx
- serviceContext
- useRoute
- Author
- ui.tsx
- score.ts
- TEST_DATABASE_URL
- apiTypes.test.ts
- safeFetch.ts
- Review Focus
- store.ts
- runner.ts
- Db
- settings/index.ts
- collaboration/ports/repositories.ts
- ApiError
- ProjectInvite
- EndpointContext
- identity/usecases.test.ts
- radix-ui
- sonner
- IMemberRepository
- CheckAccessUseCase.ts
- PostgresOrganizationRepository
- projects/index.ts
- Organization

## God Nodes (most connected - your core abstractions)
1. `q()` - 154 edges
2. `api()` - 73 edges
3. `vitest` - 49 edges
4. `one()` - 43 edges
5. `ProjectView()` - 37 edges
6. `runBuilderTurn()` - 34 edges
7. `readAllFiles()` - 33 edges
8. `react` - 32 edges
9. `sha256()` - 32 edges
10. `timeAgo()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `Hoja de ruta propuesta` --references--> `updateSummary()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/orchestrator.ts
- `2. Crear el recurso` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts
- `Operación` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts

## Import Cycles
- None detected.

## Communities (102 total, 14 thin omitted)

### Community 0 - "browser.ts"
Cohesion: 0.13
Nodes (24): projectView(), baseFor(), appOrigin(), allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe() (+16 more)

### Community 1 - "index.tsx"
Cohesion: 0.10
Nodes (15): clsx@^2.1.1, motion@^14.9.0, clsx, motion, Button, ButtonProps, Checkbox, describe() (+7 more)

### Community 2 - "orchestrator.ts"
Cohesion: 0.14
Nodes (33): describeSchema(), save(), active, commitMessage(), FAST_TOOLS, finishTask(), GATED_ROLES, insertTask() (+25 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.06
Nodes (58): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+50 more)

### Community 4 - "Dashboard.tsx"
Cohesion: 0.16
Nodes (17): Folder, Back, External, Globe, Send, Dashboard(), IDEAS, Sort (+9 more)

### Community 5 - "github.ts"
Cohesion: 0.10
Nodes (31): emitProject(), blobSha(), branchHead(), connectAccount(), createRepo(), disconnectAccount(), doSync(), gh() (+23 more)

### Community 6 - "Changes.tsx"
Cohesion: 0.18
Nodes (17): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+9 more)

### Community 7 - "appServer.ts"
Cohesion: 0.14
Nodes (31): getObject(), rateLimit(), RateLimitError, uploadHeaders(), log(), analyticsBeacon(), baasRoute(), badge() (+23 more)

### Community 8 - "context.ts"
Cohesion: 0.12
Nodes (3): bindJobs(), CheckoutInput, paymentsFor()

### Community 9 - "App.tsx"
Cohesion: 0.10
Nodes (34): react, App(), Me, NAV, Redirect(), Shell(), UserMenu(), Logo() (+26 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (49): Project, timeAgo(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel() (+41 more)

### Community 12 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND (+10 more)

### Community 13 - "bandit.ts"
Cohesion: 0.19
Nodes (14): resetRouter(), routerStats, gamma(), gaussian(), meanOf(), Posterior, posteriors(), prior() (+6 more)

### Community 14 - "readAllFiles"
Cohesion: 0.11
Nodes (30): ROLE_PROMPTS, Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), toolByName, readAllFiles() (+22 more)

### Community 15 - "vitest"
Cohesion: 0.13
Nodes (16): Task 1: Postgres, migraciones y helper de tests, pg, vitest, migrate(), MIGRATIONS_DIR, freshDatabase(), TEST_DATABASE_URL, dir (+8 more)

### Community 16 - "sha256"
Cohesion: 0.16
Nodes (19): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+11 more)

### Community 17 - "src/api.ts"
Cohesion: 0.13
Nodes (20): ApiError, bytes(), streamPost(), AddModel(), CatalogModel, enc(), matches(), Models() (+12 more)

### Community 18 - "e2e.mjs"
Cohesion: 0.08
Nodes (25): browse(), creation, DATA, evil, files, fresh, got, jar (+17 more)

### Community 19 - "tools.ts"
Cohesion: 0.07
Nodes (39): createFinishGate(), key(), mine(), newBuildProblems(), newRuntimeProblems(), FileMap, formatStandard(), isUiSource() (+31 more)

### Community 20 - "client/index.ts"
Cohesion: 0.08
Nodes (27): ai, api, AppUser, auth, baas(), channels, ChatMessage, Contract (+19 more)

### Community 21 - "collaboration/index.ts"
Cohesion: 0.19
Nodes (11): checkAccessUseCase, collaborationAccountRepository, collaborationMailerService, inviteMemberUseCase, memberRepository, removeMemberUseCase, loginWithPasswordUseCase, verifyLoginCodeUseCase (+3 more)

### Community 22 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "server/builder/index.ts"
Cohesion: 0.12
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 24 - "one"
Cohesion: 0.11
Nodes (19): DEV_FIXTURE, Fixture, seedDev(), ORG_ROLES, createOrgUseCase, manageOrgMemberUseCase, organizationRepository, createAccount() (+11 more)

### Community 25 - "playground.ts"
Cohesion: 0.17
Nodes (18): execute(), listPlaygroundRuns(), PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles(), playgroundRun() (+10 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.11
Nodes (19): 10. Documentación, 1. Capa de datos, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 8. Errores y seguridad, Decisiones tomadas con el usuario, `.env` resultante (+11 more)

### Community 27 - "bundler.ts"
Cohesion: 0.14
Nodes (24): BuildError, buildExamples(), bundleBrowser(), checkProject(), compileCache, CompiledModule, compileServerModule(), EndpointInfo (+16 more)

### Community 28 - "IProjectFileRepository"
Cohesion: 0.19
Nodes (4): CreateCheckpointUseCase, DeleteFileUseCase, WriteFileUseCase, IProjectFileRepository

### Community 29 - "q"
Cohesion: 0.08
Nodes (33): addTimer(), deleteSecret(), listSecrets(), projectSecretEnv(), requestSecret(), SECRET_NAME, secretEnv(), setSecret() (+25 more)

### Community 30 - "server.ts"
Cohesion: 0.05
Nodes (62): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+54 more)

### Community 31 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 32 - "projects.ts"
Cohesion: 0.08
Nodes (37): checkPlan(), deleteAccount(), ensurePersonalOrg(), personalOrgId(), Author, ChangeEntry, createCheckpoint(), createProject() (+29 more)

### Community 33 - "memory.ts"
Cohesion: 0.11
Nodes (25): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, listMemories(), MAX_MEMORY_CHARS (+17 more)

### Community 34 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+7 more)

### Community 35 - "Account"
Cohesion: 0.15
Nodes (7): Account, AccountProps, PlatformRole, Email, AccountRow, PostgresAccountRepository, SessionAccountRow

### Community 36 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "db.ts"
Cohesion: 0.13
Nodes (16): Conexión, analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId(), [command, ...flags], main() (+8 more)

### Community 39 - "agents.mjs"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 40 - "llm/router.ts"
Cohesion: 0.09
Nodes (42): AiUnavailableError, aiUsage(), appAiChat(), AppAiInput, cleanText(), extractMemories(), updateSummary(), anthropicChat() (+34 more)

### Community 41 - "plan.ts"
Cohesion: 0.16
Nodes (16): checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 42 - "admin/api.ts"
Cohesion: 0.14
Nodes (18): 6. API de administración, adminApi, cancelPlayground(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+10 more)

### Community 43 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+7 more)

### Community 44 - "llm/catalog.ts"
Cohesion: 0.10
Nodes (39): Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, `llm/catalog.ts`, readSeedFile(), SeedFile, seedLocal(), availableModels(), CatalogRow (+31 more)

### Community 45 - "baas/jobs.ts"
Cohesion: 0.29
Nodes (13): crons, filesFor(), fireDueTimers(), LIMITS, listJobs(), runJob(), running, scheduleProject() (+5 more)

### Community 46 - "accounts.ts"
Cohesion: 0.10
Nodes (17): COMMON_PASSWORDS, Password, accountFromApiToken(), accountFromSession(), assertStrongPassword(), canSignUp(), changePassword(), COMMON (+9 more)

### Community 47 - "projects/ports/repositories.ts"
Cohesion: 0.21
Nodes (6): CreateProjectInput, CreateProjectUseCase, ProjectProps, Visibility, ProjectRow, IProjectRepository

### Community 48 - "studioApi.ts"
Cohesion: 0.06
Nodes (26): Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, startSession(), studioApi, getTransport() (+18 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (44): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+36 more)

### Community 50 - "crypto.ts"
Cohesion: 0.24
Nodes (10): burnPasswordCheck(), hashPassword(), LEGACY, passwordNeedsRehash(), SCRYPT, scryptKey(), verifyPassword(), waiting (+2 more)

### Community 52 - "agent.ts"
Cohesion: 0.13
Nodes (22): PlaygroundView, AgentEvent, AgentResult, AgentSpec, GATE_FIXES, IMAGE_TYPES, imageBlocks(), UPLOADS (+14 more)

### Community 53 - "Forja"
Cohesion: 0.22
Nodes (9): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), createApi(), useApi() (+1 more)

### Community 54 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 55 - "server/index.ts"
Cohesion: 0.10
Nodes (24): ipOf(), closeAll(), config, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR (+16 more)

### Community 56 - "sdk/server/index.ts"
Cohesion: 0.11
Nodes (4): AiMessage, AppUser, CheckoutInput, StoredFile

### Community 57 - "identity/index.ts"
Cohesion: 0.19
Nodes (9): sendPlatformEmail(), accountRepository, loginCodeRepository, mailerService, passwordHasher, requestLoginCodeUseCase, sessionRepository, updateAccountNameUseCase (+1 more)

### Community 58 - "serverTypes.test.ts"
Cohesion: 0.20
Nodes (4): Ctx, JobCtx, ServiceCtx, JobContext

### Community 60 - "sandbox.ts"
Cohesion: 0.16
Nodes (11): AppEnv, AppTarget, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, SandboxError (+3 more)

### Community 62 - "metrics.ts"
Cohesion: 0.11
Nodes (20): runAgent(), summarize(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet() (+12 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "realtime.ts"
Cohesion: 0.60
Nodes (5): attachSocket(), publish(), realtimeStats(), room(), rooms

### Community 66 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 67 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (13): ROLE_TOOLS, CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps (+5 more)

### Community 68 - "deps.ts"
Cohesion: 0.10
Nodes (31): page(), FileMap, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, depsDir() (+23 more)

### Community 69 - "api"
Cohesion: 0.07
Nodes (42): Task 6: Studio — página de administración, 7. Studio, api(), SelectedElement, GithubCard, GithubCommitCard(), GithubSection(), Link (+34 more)

### Community 70 - "evals/api.ts"
Cohesion: 0.17
Nodes (14): evalsApi, caseById(), defaultJudge(), activeRunId(), evalConfig(), EvalError, exportRun(), getRun() (+6 more)

### Community 71 - "base"
Cohesion: 0.50
Nodes (5): base(), Link(), navigate(), notify(), runtime()

### Community 72 - "identity/ports/repositories.ts"
Cohesion: 0.14
Nodes (5): LoginWithPasswordUseCase, UpdateAccountNameUseCase, IAccountRepository, IPasswordHasher, ISessionRepository

### Community 73 - "OrgRole"
Cohesion: 0.15
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, OrgPolicy, OrgRole, IOrganizationRepository

### Community 74 - "projectDb.ts"
Cohesion: 0.31
Nodes (10): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+2 more)

### Community 75 - "services"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "Agents.tsx"
Cohesion: 0.32
Nodes (7): AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView, ToolLine()

### Community 77 - "serviceContext"
Cohesion: 0.29
Nodes (4): HttpError, publish(), serviceContext, EmailInput

### Community 78 - "useRoute"
Cohesion: 0.50
Nodes (5): currentPath(), ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "Author"
Cohesion: 0.48
Nodes (3): Checkpoint, CheckpointProps, Author

### Community 80 - "ui.tsx"
Cohesion: 0.10
Nodes (25): Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection(), MemoryView, Scope (+17 more)

### Community 81 - "score.ts"
Cohesion: 0.10
Nodes (34): EVAL_CASES, EVAL_SET_VERSION, EvalCase, EvalSize, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement() (+26 more)

### Community 83 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 84 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 85 - "Review Focus"
Cohesion: 0.29
Nodes (6): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 7: `.env`, documentación y verificación final

### Community 86 - "store.ts"
Cohesion: 0.09
Nodes (35): Task 2: Registro y almacén de ajustes, 2. Ajustes globales, Almacén, Registro, resetTransport(), reloadLangfuse(), browserAvailable, CONFIG_DEFAULTS (+27 more)

### Community 87 - "runner.ts"
Cohesion: 0.17
Nodes (23): sessionCookie(), isBuilding(), stopBuilding(), Active, cancelRun(), checkOf(), checkPreview(), emptyResult() (+15 more)

### Community 89 - "settings/index.ts"
Cohesion: 0.10
Nodes (14): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, getPlatformSettingsUseCase, PlatformSettingsRegistryAdapter (+6 more)

### Community 90 - "collaboration/ports/repositories.ts"
Cohesion: 0.22
Nodes (9): InviteMemberResult, InviteMemberUseCase, ProjectTarget, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount, ICollaborationAccountRepository, ICollaborationMailerService (+1 more)

### Community 94 - "identity/usecases.test.ts"
Cohesion: 0.13
Nodes (5): RequestLoginCodeUseCase, VerifyLoginCodeUseCase, PostgresLoginCodeRepository, ILoginCodeRepository, IMailerService

### Community 99 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 104 - "projects/index.ts"
Cohesion: 0.13
Nodes (9): createCheckpointUseCase, createProjectUseCase, deleteFileUseCase, projectFileRepository, projectRepository, renameFileUseCase, writeFileUseCase, PostgresProjectFileRepository (+1 more)

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 723 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `index.tsx`, `Chat.tsx`, `Dashboard.tsx`, `api`, `Changes.tsx`, `ProjectView.tsx`, `Agents.tsx`, `ui.tsx`, `package.json`, `src/api.ts`, `client/index.ts`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `browser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `browser.ts`, `Changes.tsx`, `bandit.ts`, `readAllFiles`, `tools.ts`, `server/builder/index.ts`, `IProjectFileRepository`, `server.ts`, `devDependencies`, `Account`, `plan.ts`, `projects/ports/repositories.ts`, `studioApi.ts`, `package.json`, `server/index.ts`, `serverTypes.test.ts`, `ProjectPath`, `metrics.ts`, `ExecutionMetrics`, `deps.ts`, `identity/ports/repositories.ts`, `OrgRole`, `Author`, `score.ts`, `apiTypes.test.ts`, `settings/index.ts`, `collaboration/ports/repositories.ts`, `identity/usecases.test.ts`, `IMemberRepository`, `CheckAccessUseCase.ts`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `orchestrator.ts`, `github.ts`, `bandit.ts`, `readAllFiles`, `sha256`, `collaboration/index.ts`, `one`, `playground.ts`, `server.ts`, `projects.ts`, `memory.ts`, `Account`, `db.ts`, `llm/router.ts`, `admin/api.ts`, `llm/catalog.ts`, `baas/jobs.ts`, `accounts.ts`, `projects/ports/repositories.ts`, `studioApi.ts`, `Project`, `agent.ts`, `metrics.ts`, `evals/api.ts`, `OrgRole`, `store.ts`, `runner.ts`, `identity/usecases.test.ts`, `PostgresOrganizationRepository`, `projects/index.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._