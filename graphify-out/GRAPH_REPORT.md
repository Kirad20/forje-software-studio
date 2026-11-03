# Graph Report - forje-software-studio  (2026-11-02)

## Corpus Check
- 348 files · ~210,123 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .css 3, .example 1)

## Summary
- 2896 nodes · 7426 edges · 123 communities (107 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 250 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3285d15b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- projects/index.ts
- 001_init.sql
- BuilderTurnAdapter.ts
- Chat.tsx
- catalog.ts
- agents.mjs
- BuilderWorkflowPorts
- appServer.ts
- context.ts
- App.tsx
- with
- ProjectView.tsx
- score.ts
- llm/router.ts
- securityScan.ts
- AgentExecutionAdapter.ts
- BuilderTurnAdapter.ts
- react
- appServer.ts
- OrchestrationPolicy.ts
- q
- BuilderWorkflow.ts
- roles.ts
- identity/index.ts
- collaboration/index.ts
- playground.ts
- Panel de administración del sistema — diseño
- BuilderWorkflowPorts
- server/builder/index.ts
- studioApi.ts
- PersonalOrganizationUseCase
- problems.ts
- baas/jobs.ts
- agents.dbg.mjs
- package.json
- providers.ts
- q
- platform/security.ts
- accountLifecycle.ts
- github.mjs
- AgentExecutionResult
- Plan.ts
- server.ts
- server/index.ts
- admin/api.ts
- PostgresSettingsRepository.ts
- providers.ts
- RunAgentUseCase.ts
- memory.ts
- probe.ts
- ProjectsStore
- projectDb.ts
- types.ts
- skills.test.ts
- CreateFinishGateUseCase.ts
- runner.ts
- Project
- one
- IdentityAccountsService
- Inventario de funciones de Lovable → Forja
- guides.ts
- modules/builder/index.ts
- server/index.ts
- forja
- BootstrapService.ts
- PostgresProjectsStore
- roles.ts
- bundler.ts
- execution.test.ts
- ISecretCipher
- base
- ProjectsApplication.ts
- Desplegar Forja en Coolify
- ExecutionMetrics
- PlatformSettingsService
- AgentRole
- IPasswordHasher
- components/Models.tsx
- securityReview.ts
- metrics.ts
- Plan
- package.json
- Tx
- services.ts
- Task 3: Proveedores y modelos en BD + seeders
- store.ts
- PlatformSettingsService
- SettingDefinition
- settings/index.ts
- SettingDefinition
- ApiError
- runCase
- SettingRegistry.ts
- Account
- llm/catalog.ts
- PostgresOrganizationRepository
- collaboration/ports/repositories.ts
- PostgresAccountRepository
- server.ts
- q
- apiTypes.test.ts
- FileMap
- IMemberQueries
- projects/index.ts
- PostgresPlatformSettingsStoreAdapter
- IOrganizationQueries
- Forja
- PostgresProjectsStore.ts
- 1. Capa de datos
- sandbox.ts
- Inventario de interfaz de Floot → Forja
- Desplegar Forja en Coolify
- FastBuildPorts
- soclo-cal.py
- toolOutputs.test.ts
- clsx
- textEdit.ts
- orgSkills.ts
- analytics.ts
- ProjectInvite
- ref_node_path
- usage.ts

## God Nodes (most connected - your core abstractions)
1. `q()` - 139 edges
2. `api()` - 73 edges
3. `vitest` - 70 edges
4. `one()` - 41 edges
5. `ProjectsStore` - 39 edges
6. `ProjectView()` - 37 edges
7. `runBuilderTurn()` - 36 edges
8. `PostgresProjectsStore` - 33 edges
9. `react` - 32 edges
10. `ProjectsApplication` - 32 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/builder/index.ts
- `Arranque` --references--> `main()`  [INFERRED]
  README.md → server/db/cli.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `2. Crear el recurso` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts
- `Operación` --references--> `main()`  [INFERRED]
  docs/despliegue-coolify.md → server/db/cli.ts

## Import Cycles
- None detected.

## Communities (123 total, 16 thin omitted)

### Community 0 - "projects/index.ts"
Cohesion: 0.12
Nodes (27): playwright-core, projectView(), baseFor(), appOrigin(), allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult (+19 more)

### Community 1 - "001_init.sql"
Cohesion: 0.11
Nodes (13): radix-ui@^1.8.1, radix-ui, Button, ButtonProps, Checkbox, describe(), ErrorState(), Field() (+5 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.13
Nodes (35): describeSchema(), skillIndex(), taskClassOf(), addUsage(), emptyUsage(), ScheduleTasksUseCase, rewardOf(), criteriaOf() (+27 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.06
Nodes (58): AgentLanes(), Lane, LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL (+50 more)

### Community 4 - "catalog.ts"
Cohesion: 0.10
Nodes (29): Folder, Back, External, Globe, Send, Avatar(), colorFor(), COLORS (+21 more)

### Community 5 - "agents.mjs"
Cohesion: 0.07
Nodes (40): resetTransport(), ToolCallRecord, createLangfuse(), Event, fromConfig(), langfuse, LangfuseOptions, reloadLangfuse() (+32 more)

### Community 6 - "BuilderWorkflowPorts"
Cohesion: 0.19
Nodes (16): baseName(), cache, ChangeCard(), diffStats(), FileChange, FileDiff(), KIND, TimelineEntry (+8 more)

### Community 7 - "appServer.ts"
Cohesion: 0.12
Nodes (34): AiUnavailableError, appAiChat(), uploadHeaders(), log(), LogEntry, logs, ProjectEvent, projectEvents (+26 more)

### Community 8 - "context.ts"
Cohesion: 0.08
Nodes (18): AppUser, EndpointContext, HttpError, JobContext, publish(), serviceContext, EmailInput, CheckoutInput (+10 more)

### Community 9 - "App.tsx"
Cohesion: 0.16
Nodes (25): api(), bytes(), App(), Me, NAV, Redirect(), Shell(), UserMenu() (+17 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (49): Project, timeAgo(), Refresh, AiPanel(), CodePanel(), EmailPanel(), Header(), JobsPanel() (+41 more)

### Community 12 - "score.ts"
Cohesion: 0.11
Nodes (33): EvalSize, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), RunRow, aggregate, CaseResult (+25 more)

### Community 13 - "llm/router.ts"
Cohesion: 0.08
Nodes (44): Pruebas de conexión, resetRouter(), routerStats, gamma(), gaussian(), meanOf(), Posterior, posteriors() (+36 more)

### Community 14 - "securityScan.ts"
Cohesion: 0.26
Nodes (11): FileMap, fingerprint(), isClient(), isCode(), isServer(), lineOf(), markedPublic(), quickScan() (+3 more)

### Community 15 - "AgentExecutionAdapter.ts"
Cohesion: 0.14
Nodes (14): Task 1: Postgres, migraciones y helper de tests, pg, vitest, migrate(), MIGRATIONS_DIR, freshDatabase(), TEST_DATABASE_URL, dir (+6 more)

### Community 16 - "BuilderTurnAdapter.ts"
Cohesion: 0.12
Nodes (26): AuthError, confirmPasswordReset(), createSession(), endSession(), ensureOwnerAdmin(), normalizeEmail(), requestPasswordReset(), setTemporaryPassword() (+18 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (50): react, ApiError, streamPost(), EMPTY, OrgSkill, OrgSkillsSection(), View, Switch() (+42 more)

### Community 18 - "appServer.ts"
Cohesion: 0.07
Nodes (26): browse(), creation, DATA, evil, files, fresh, got, jar (+18 more)

### Community 19 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 20 - "q"
Cohesion: 0.08
Nodes (27): ai, api, AppUser, auth, baas(), channels, ChatMessage, Contract (+19 more)

### Community 21 - "BuilderWorkflow.ts"
Cohesion: 0.23
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 22 - "roles.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 23 - "identity/index.ts"
Cohesion: 0.06
Nodes (31): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+23 more)

### Community 24 - "collaboration/index.ts"
Cohesion: 0.07
Nodes (38): DEV_FIXTURE, Fixture, seedDev(), ProjectTarget, ORG_ROLES, accessOf(), addOrgMember(), checkAccessUseCase (+30 more)

### Community 25 - "playground.ts"
Cohesion: 0.13
Nodes (26): execute(), listPlaygroundRuns(), PLAYGROUND_ROLES, playgroundBusy(), PlaygroundError, PlaygroundRole, playgroundRoles(), playgroundRun() (+18 more)

### Community 26 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (16): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, Almacén, Decisiones tomadas con el usuario (+8 more)

### Community 28 - "server/builder/index.ts"
Cohesion: 0.09
Nodes (13): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+5 more)

### Community 29 - "studioApi.ts"
Cohesion: 0.07
Nodes (25): Env, memoryOf(), pid(), primaryKeyOf(), SESSION_COOKIE, startSession(), evalsApi, EVAL_EMAIL (+17 more)

### Community 30 - "PersonalOrganizationUseCase"
Cohesion: 0.14
Nodes (8): PersonalOrganizationUseCase, createPersonalOrg(), deletePersonalOrg(), ensurePersonalOrg(), personalOrgId(), PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 31 - "problems.ts"
Cohesion: 0.14
Nodes (25): CreateFinishGateUseCase, FileMap, formatStandard(), isUiSource(), lineOf(), standardsScan(), createFinishGate(), changed() (+17 more)

### Community 32 - "baas/jobs.ts"
Cohesion: 0.17
Nodes (19): bindJobs(), addTimer(), cancelTimer(), crons, filesFor(), fireDueTimers(), LIMITS, listJobs() (+11 more)

### Community 33 - "agents.dbg.mjs"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 34 - "package.json"
Cohesion: 0.14
Nodes (14): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+6 more)

### Community 35 - "providers.ts"
Cohesion: 0.23
Nodes (15): encrypt(), cache, deleteProvider(), encryptHeaders(), listeners, listProviders(), missing(), OPENROUTER_URL (+7 more)

### Community 36 - "q"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 37 - "platform/security.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "accountLifecycle.ts"
Cohesion: 0.08
Nodes (5): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository, IdentityRandom, PasswordResetRepository

### Community 39 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 40 - "AgentExecutionResult"
Cohesion: 0.10
Nodes (15): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository (+7 more)

### Community 41 - "Plan.ts"
Cohesion: 0.13
Nodes (17): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS (+9 more)

### Community 42 - "server.ts"
Cohesion: 0.23
Nodes (13): 6. API de administración, call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion(), PROBE_SYSTEM (+5 more)

### Community 43 - "server/index.ts"
Cohesion: 0.12
Nodes (16): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+8 more)

### Community 44 - "admin/api.ts"
Cohesion: 0.21
Nodes (8): adminApi, cancelPlayground(), deleteModel(), ModelError, ModelInput, num(), saveModel(), ProviderInput

### Community 45 - "PostgresSettingsRepository.ts"
Cohesion: 0.13
Nodes (5): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting

### Community 46 - "providers.ts"
Cohesion: 0.07
Nodes (11): accountRepository, identityAccountsService, loginCodeRepository, loginWithPasswordUseCase, mailerService, passwordHasher, requestLoginCodeUseCase, sessionRepository (+3 more)

### Community 47 - "RunAgentUseCase.ts"
Cohesion: 0.09
Nodes (30): RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext, ExecutionModel (+22 more)

### Community 48 - "memory.ts"
Cohesion: 0.15
Nodes (16): addMemory(), assertKind(), cleanText(), deleteMemory(), KIND_LABEL, LIMIT, MAX_MEMORY_CHARS, Memory (+8 more)

### Community 49 - "probe.ts"
Cohesion: 0.06
Nodes (45): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+37 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.06
Nodes (5): ProjectsApplication, ProjectSnapshot, TurnChanges, ProjectsStore, fixture()

### Community 51 - "projectDb.ts"
Cohesion: 0.10
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "types.ts"
Cohesion: 0.16
Nodes (19): AppAiInput, anthropicChat(), getClient(), SERVER_FALLBACK, compatChat(), OpenAiMessage, Part, toOpenAi() (+11 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.17
Nodes (18): ROLE_PROMPTS, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 54 - "CreateFinishGateUseCase.ts"
Cohesion: 0.15
Nodes (9): BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem, assertOwned() (+1 more)

### Community 55 - "runner.ts"
Cohesion: 0.16
Nodes (21): caseById(), EVAL_CASES, EVAL_SET_VERSION, EvalCase, defaultJudge(), Active, activeRunId(), cancelRun() (+13 more)

### Community 56 - "Project"
Cohesion: 0.07
Nodes (8): AiMessage, AppUser, CheckoutInput, Ctx, Db, JobCtx, ServiceCtx, StoredFile

### Community 57 - "one"
Cohesion: 0.11
Nodes (4): PostgresAccountLifecycleRepository, AccountCreation, AccountLifecycleRepository, one()

### Community 58 - "IdentityAccountsService"
Cohesion: 0.09
Nodes (6): IdentityAccountsService, COMMON_PASSWORDS, Password, IdentityAccountsDependencies, PublicAccount, assertStrongPassword()

### Community 60 - "guides.ts"
Cohesion: 0.25
Nodes (11): BUILDER_SYSTEM_PROMPT, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse() (+3 more)

### Community 61 - "modules/builder/index.ts"
Cohesion: 0.12
Nodes (18): GATE_FIXES, calculateSpendUseCase, toolRegistry, BuilderTool, builderTools, toolByName, ToolContext, ToolOutput (+10 more)

### Community 62 - "server/index.ts"
Cohesion: 0.07
Nodes (39): ipOf(), studioApi, cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get() (+31 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "BootstrapService.ts"
Cohesion: 0.16
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 67 - "roles.ts"
Cohesion: 0.10
Nodes (18): BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND (+10 more)

### Community 68 - "bundler.ts"
Cohesion: 0.07
Nodes (51): buildClient(), BuildError, BuildProblem, bundleBrowser(), compileCache, CompiledModule, compileServerModule(), EndpointInfo (+43 more)

### Community 69 - "execution.test.ts"
Cohesion: 0.06
Nodes (40): SelectedElement, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), Kind, kindOf() (+32 more)

### Community 71 - "base"
Cohesion: 0.50
Nodes (5): base(), Link(), navigate(), notify(), runtime()

### Community 72 - "ProjectsApplication.ts"
Cohesion: 0.19
Nodes (8): CreateCheckpointUseCase, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 73 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (5): CreateOrgResult, Organization, OrganizationProps, OrgPolicy, OrgRole

### Community 74 - "ExecutionMetrics"
Cohesion: 0.27
Nodes (3): CalculateSpendUseCase, ExecutionMetrics, ExecutionMetricsProps

### Community 75 - "PlatformSettingsService"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "AgentRole"
Cohesion: 0.15
Nodes (8): ROLE_TOOLS, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, StaticToolRegistryAdapter, IToolRegistry, ITracingService

### Community 77 - "IPasswordHasher"
Cohesion: 0.21
Nodes (4): burnPasswordCheck(), passwordNeedsRehash(), BcryptArgonPasswordHasher, IPasswordHasher

### Community 78 - "components/Models.tsx"
Cohesion: 0.50
Nodes (5): currentPath(), ForjaApp(), matchRoute(), subscribe(), useRoute()

### Community 79 - "securityReview.ts"
Cohesion: 0.19
Nodes (16): Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview(), getSecurity(), ignoredIds(), Row (+8 more)

### Community 80 - "metrics.ts"
Cohesion: 0.17
Nodes (13): estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep(), recordToolCall() (+5 more)

### Community 81 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 83 - "Tx"
Cohesion: 0.29
Nodes (4): ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), Tx

### Community 84 - "services.ts"
Cohesion: 0.19
Nodes (5): projectOrganizations, projectServices, ProjectOrganizations, QueryHandle, starterFiles()

### Community 85 - "Task 3: Proveedores y modelos en BD + seeders"
Cohesion: 0.17
Nodes (10): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final, 8. Errores y seguridad (+2 more)

### Community 86 - "store.ts"
Cohesion: 0.19
Nodes (11): [command, ...flags], readSeedFile(), SeedFile, seedLocal(), platformSettings, listSettings, loadSettings, MOVED_ENV (+3 more)

### Community 87 - "PlatformSettingsService"
Cohesion: 0.22
Nodes (7): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture()

### Community 89 - "settings/index.ts"
Cohesion: 0.12
Nodes (11): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, getPlatformSettingsUseCase, settingsRegistry, settingsStore (+3 more)

### Community 90 - "SettingDefinition"
Cohesion: 0.14
Nodes (13): sendPlatformEmail(), CreateOrgUseCase, InviteMemberResult, InviteMemberUseCase, ManageOrgMemberUseCase, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount (+5 more)

### Community 92 - "runCase"
Cohesion: 0.29
Nodes (8): sessionCookie(), checkOf(), checkPreview(), emptyResult(), isFatal(), runCase(), spentOn(), designSignals

### Community 93 - "SettingRegistry.ts"
Cohesion: 0.18
Nodes (14): browserAvailable, CONFIG_DEFAULTS, PlatformSettingType, SettingGroup, createPlatformSettings(), byKey, Def, defs (+6 more)

### Community 94 - "Account"
Cohesion: 0.07
Nodes (15): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, PlatformRole, Email (+7 more)

### Community 95 - "llm/catalog.ts"
Cohesion: 0.19
Nodes (20): Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, `llm/catalog.ts`, availableModels(), CatalogRow, globToRegex(), lastSync(), listCatalog() (+12 more)

### Community 96 - "PostgresOrganizationRepository"
Cohesion: 0.13
Nodes (8): OrganizationNamesQuery, PostgresOrganizationRepository, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 97 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 99 - "server.ts"
Cohesion: 0.09
Nodes (25): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+17 more)

### Community 100 - "q"
Cohesion: 0.08
Nodes (19): aiUsage(), getTransport(), listEmails(), receiveEmail(), sendEmail(), deleteSecret(), listSecrets(), projectSecretEnv() (+11 more)

### Community 101 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 104 - "projects/index.ts"
Cohesion: 0.08
Nodes (43): buildServer(), isDevFile(), SeoSettings, TurnFileChange, assertValidPath, createCheckpoint, createCheckpointUseCase, createFolder (+35 more)

### Community 107 - "Forja"
Cohesion: 0.22
Nodes (9): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, apiUrl(), createApi(), useApi() (+1 more)

### Community 108 - "PostgresProjectsStore.ts"
Cohesion: 0.14
Nodes (9): BeforeImage, ChangeEntry, ProjectPatch, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput, platformDb (+1 more)

### Community 109 - "1. Capa de datos"
Cohesion: 0.29
Nodes (7): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, closePlatformDb()

### Community 110 - "sandbox.ts"
Cohesion: 0.16
Nodes (12): AppEnv, AppTarget, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, runInSandbox() (+4 more)

### Community 111 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 112 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (11): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+3 more)

### Community 115 - "toolOutputs.test.ts"
Cohesion: 0.29
Nodes (4): runFixture(), BEFORE, conforms(), dir

### Community 116 - "clsx"
Cohesion: 0.33
Nodes (4): clsx@^2.1.1, motion@^14.9.0, clsx, motion

### Community 117 - "textEdit.ts"
Cohesion: 0.47
Nodes (4): escapeRe(), replaceVisibleText(), TextEditResult, page()

### Community 118 - "orgSkills.ts"
Cohesion: 0.62
Nodes (6): canWrite(), deleteOrgSkill(), listOrgSkills(), OrgSkillError, saveOrgSkill(), findSecret()

### Community 119 - "analytics.ts"
Cohesion: 0.53
Nodes (5): analyticsSummary(), browserOf(), deviceOf(), recordPageView(), visitorId()

### Community 121 - "ref_node_path"
Cohesion: 0.15
Nodes (7): here, contexts, modulesRoot, root, sources(), root, sources()

### Community 122 - "usage.ts"
Cohesion: 0.67
Nodes (3): actionsToday(), DAILY_ACTIONS, usageSummary()

## Knowledge Gaps
- **1 isolated node(s):** `TEST_DATABASE_URL`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 895 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `AgentExecutionAdapter.ts` to `projects/index.ts`, `agents.mjs`, `BuilderWorkflowPorts`, `context.ts`, `score.ts`, `llm/router.ts`, `securityScan.ts`, `BuilderWorkflow.ts`, `identity/index.ts`, `collaboration/index.ts`, `server/builder/index.ts`, `problems.ts`, `package.json`, `AgentExecutionResult`, `Plan.ts`, `RunAgentUseCase.ts`, `probe.ts`, `ProjectsStore`, `types.ts`, `skills.test.ts`, `CreateFinishGateUseCase.ts`, `IdentityAccountsService`, `guides.ts`, `modules/builder/index.ts`, `server/index.ts`, `BootstrapService.ts`, `bundler.ts`, `ProjectsApplication.ts`, `Desplegar Forja en Coolify`, `ExecutionMetrics`, `PlatformSettingsService`, `settings/index.ts`, `SettingDefinition`, `Account`, `collaboration/ports/repositories.ts`, `server.ts`, `apiTypes.test.ts`, `toolOutputs.test.ts`, `textEdit.ts`, `ref_node_path`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `api()` (e.g. with `Task 6: Studio — página de administración` and `7. Studio`) actually correct?**
  _`api()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEST_DATABASE_URL` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projects/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `001_init.sql`, `Chat.tsx`, `catalog.ts`, `execution.test.ts`, `BuilderWorkflowPorts`, `App.tsx`, `ProjectView.tsx`, `probe.ts`, `q`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `001_init.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.11231884057971014 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `BuilderTurnAdapter.ts`, `agents.mjs`, `context.ts`, `llm/router.ts`, `AgentExecutionAdapter.ts`, `BuilderTurnAdapter.ts`, `collaboration/index.ts`, `playground.ts`, `studioApi.ts`, `PersonalOrganizationUseCase`, `baas/jobs.ts`, `providers.ts`, `accountLifecycle.ts`, `AgentExecutionResult`, `server.ts`, `admin/api.ts`, `PostgresSettingsRepository.ts`, `providers.ts`, `memory.ts`, `projectDb.ts`, `types.ts`, `runner.ts`, `one`, `modules/builder/index.ts`, `Desplegar Forja en Coolify`, `securityReview.ts`, `metrics.ts`, `store.ts`, `Account`, `llm/catalog.ts`, `PostgresOrganizationRepository`, `PostgresAccountRepository`, `orgSkills.ts`, `analytics.ts`, `usage.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._