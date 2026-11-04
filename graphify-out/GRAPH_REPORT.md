# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 598 files · ~247,423 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4070 nodes · 10415 edges · 185 communities (151 shown, 34 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea511835`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ports/context.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- config.ts
- IntegrationRepository
- appServer.ts
- http-client.ts
- q
- PostgresProviderRepository.ts
- with
- infrastructure/routing.ts
- crypto.ts
- evaluations/bindings.test.ts
- ExecutionMetrics
- BuilderTurnAdapter.ts
- memory/application/service.ts
- RunAgentUseCase.ts
- createProblemService
- ref_node_fs
- projectIndex.ts
- bundler.ts
- model-management/catalog.ts
- app-services/realtime.ts
- BuilderWorkflowPorts
- administration/presentation/Models.tsx
- project-observability/events.ts
- CollaborationModuleDependencies
- modules/projects/index.ts
- createModelRouter
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- builderService.ts
- bootstrap/server.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- infrastructure/repositories.ts
- model-management/router.ts
- client.ts
- scripts
- Account
- roles.ts
- ProjectsApplication.ts
- mcp/server.ts
- integrations/github.ts
- package.json
- ProjectsStore
- Project
- adminApi.ts
- project-observability/security.ts
- ProjectDb
- vitest
- server/index.ts
- models/presentation/Models.tsx
- createIdentityModule
- CLAUDE.md
- client/index.ts
- deps.ts
- sandboxWorker.mjs
- postgres
- model-management/index.ts
- PostgresProjectsStore
- github.mjs
- app-runtime/index.ts
- Desplegar Forja en Coolify
- ApplicationLifecycle
- Workspace.tsx
- GithubAccountRepository
- IOrganizationRepository
- policies.test.ts
- services
- createGithubSyncService
- toolOutputs.test.ts
- sha256
- internal/router.ts
- AgentExecution.ts
- OrgRole
- TEST_DATABASE_URL
- Memory.tsx
- app-services/projectDb.ts
- domain/score.ts
- Changes.tsx
- admission.ts
- urls.ts
- createJobs
- app-services/email.ts
- GithubAuthorization
- GithubRepository
- BootstrapService
- modules/identity/index.ts
- FileMap
- Panel de administración del sistema — diseño
- QueryRepository
- projectRows.ts
- BuilderWorkflow.ts
- AccountLifecycleRepository
- react
- usage/usage.ts
- Inventario de funciones de Lovable → Forja
- modules/builder/index.ts
- ModelRouter.ts
- sandbox.ts
- bootstrap/coreModules.ts
- OrganizationSkillsService.ts
- OrchestrationPolicy.ts
- appRuntimeServer.ts
- composition.ts
- ports.ts
- e2e.mjs
- app-services/analytics.ts
- devDependencies
- guides.ts
- RouterAdministration.ts
- platform.ts
- skills.test.ts
- mcp/jobs.ts
- { api, auth, storage, ai }
- ISettingsStore
- studio.mjs
- ProjectDbClient
- PostgresPlatformSettingsStoreAdapter
- platformRepository.test.ts
- postgres
- healthcheck
- Tx
- app-runtime
- IPasswordHasher
- build
- domain/securityScan.ts
- PlatformSettingsService
- Plan
- builder
- FastBuildPorts
- model-management/router.test.ts
- BuilderToolsAdapter.ts
- forja
- RealtimeTransport
- createHttp
- http.test.ts
- Password
- integrations/index.ts
- integrations/boundaries.test.ts
- AuthPorts
- AgentExecutionResult
- securityReview.ts
- TaskQueriesAdapter.ts
- app-services/auth.ts
- replaceVisibleText
- execution.test.ts
- JobCron
- AgentExecutionSpec
- identity/boundaries.test.ts
- createAuth
- architecture.test.ts
- accounts.ts
- FinishGateAdapter.ts
- apiTypes.test.ts
- createCollaborationModule
- settings/index.ts
- forms.tsx
- createSecrets
- SqlAgentTaskRepository.ts
- GithubGateway
- accountLifecycle.ts
- application/context.ts
- GithubProjectPorts
- PostgresProjectFileRepository
- modules/collaboration/index.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 128 edges
2. `q()` - 98 edges
3. `createStudioApi()` - 68 edges
4. `createIdentityModule()` - 42 edges
5. `ProjectsStore` - 40 edges
6. `one()` - 40 edges
7. `react` - 39 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 39 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 4: API de administración (ajustes, proveedores, modelos, sondas)` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/shared/security.ts
- `8. Errores y seguridad` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/specs/2026-11-01-panel-admin-design.md → server/shared/security.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx

## Import Cycles
- None detected.

## Communities (185 total, 34 thin omitted)

### Community 0 - "ports/context.ts"
Cohesion: 0.12
Nodes (12): AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput, EmailResult, StoredObject, AiModel (+4 more)

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+8 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.10
Nodes (51): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, runBudget(), RunRequest (+43 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (67): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+59 more)

### Community 4 - "config.ts"
Cohesion: 0.14
Nodes (11): DEV_FIXTURE, Fixture, storagePorts, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR (+3 more)

### Community 5 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 6 - "appServer.ts"
Cohesion: 0.08
Nodes (46): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+38 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (26): appServicesController, api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), money() (+18 more)

### Community 8 - "q"
Cohesion: 0.05
Nodes (26): pg, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed() (+18 more)

### Community 9 - "PostgresProviderRepository.ts"
Cohesion: 0.11
Nodes (19): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+11 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/routing.ts"
Cohesion: 0.15
Nodes (19): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, anthropicChat() (+11 more)

### Community 12 - "crypto.ts"
Cohesion: 0.21
Nodes (12): BcryptArgonPasswordHasher, burnPasswordCheck(), hashPassword(), LEGACY, newToken(), numericCode(), passwordNeedsRehash(), SCRYPT (+4 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (19): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+11 more)

### Community 14 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (48): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+40 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "RunAgentUseCase.ts"
Cohesion: 0.22
Nodes (18): summarize(), addUsage(), emptyUsage(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults() (+10 more)

### Community 18 - "createProblemService"
Cohesion: 0.40
Nodes (10): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+2 more)

### Community 19 - "ref_node_fs"
Cohesion: 0.14
Nodes (14): createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, dir, monolith, seedLocal, pool (+6 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 21 - "bundler.ts"
Cohesion: 0.15
Nodes (24): createProjectCheck(), ProjectCompilerPort, packageName(), FileMap, EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles() (+16 more)

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.13
Nodes (23): deleteModel(), lastSync(), providers(), startCatalogSync(), sync(), syncOpenRouter(), Provider, createCatalogSync() (+15 more)

### Community 23 - "app-services/realtime.ts"
Cohesion: 0.31
Nodes (3): RealtimeSocket, publish, realtimeStats

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (35): administrationController, api, TABS, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel() (+27 more)

### Community 26 - "project-observability/events.ts"
Cohesion: 0.09
Nodes (15): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, Problem, ProblemEffects, ProblemKind (+7 more)

### Community 27 - "CollaborationModuleDependencies"
Cohesion: 0.12
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.08
Nodes (19): CreateCheckpointUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, Checkpoint, CheckpointProps, ProjectPath (+11 more)

### Community 29 - "createModelRouter"
Cohesion: 0.20
Nodes (14): analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), useFastPath(), posteriors, gamma() (+6 more)

### Community 30 - "agents.mjs"
Cohesion: 0.11
Nodes (17): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+9 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+46 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (52): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, addTimer, cancelTimer (+44 more)

### Community 33 - "SettingDefinition"
Cohesion: 0.18
Nodes (3): SettingDefinition, SettingValue, PlatformSettingsRegistryAdapter

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "builderService.ts"
Cohesion: 0.09
Nodes (16): AgentEvent, ChatMode, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput (+8 more)

### Community 36 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (30): hono@^4.13.14, hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+22 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (16): createCatalogService(), deleteModel(), saveModel(), updateProjectModels(), CompatEndpoint, creditsAtRate(), globToRegex(), matchesModelPolicy() (+8 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+15 more)

### Community 40 - "infrastructure/repositories.ts"
Cohesion: 0.23
Nodes (8): projectDb(), authRepository(), createAuthRepository(), createQueryRepository(), schemaRows(), statement(), statements, DatabasePorts

### Community 41 - "model-management/router.ts"
Cohesion: 0.17
Nodes (16): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository (+8 more)

### Community 42 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "Account"
Cohesion: 0.10
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 45 - "roles.ts"
Cohesion: 0.09
Nodes (19): BUILDER_SYSTEM_PROMPT, BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD (+11 more)

### Community 46 - "ProjectsApplication.ts"
Cohesion: 0.17
Nodes (13): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+5 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+7 more)

### Community 48 - "integrations/github.ts"
Cohesion: 0.14
Nodes (18): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+10 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+34 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.08
Nodes (5): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.09
Nodes (9): CreateProjectInput, CreateProjectUseCase, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository (+1 more)

### Community 52 - "adminApi.ts"
Cohesion: 0.11
Nodes (30): 6. API de administración, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+22 more)

### Community 53 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 54 - "ProjectDb"
Cohesion: 0.17
Nodes (6): AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, ProjectDb

### Community 55 - "vitest"
Cohesion: 0.15
Nodes (9): vitest, PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "models/presentation/Models.tsx"
Cohesion: 0.15
Nodes (16): api, billingController, Meter(), Plan(), Usage, api, modelsController, ModelChecklist() (+8 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (3): IdentityAccountsService, createIdentityModule(), fixture()

### Community 60 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (36): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+28 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "model-management/index.ts"
Cohesion: 0.13
Nodes (20): Catalog, createModelManagementQueries(), routerAudit(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), meanOf() (+12 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.05
Nodes (43): playwright-core@1.64.1, playwright-core, RuntimeProjectsPort, JobInfo, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug (+35 more)

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.09
Nodes (19): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+11 more)

### Community 70 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 71 - "Workspace.tsx"
Cohesion: 0.08
Nodes (43): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+35 more)

### Community 72 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (5): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrgPolicy, IOrganizationRepository

### Community 74 - "policies.test.ts"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "toolOutputs.test.ts"
Cohesion: 0.13
Nodes (9): 4. Playground de agentes, Cómo está hecho, out(), ctx(), dir, usage(), BEFORE, conforms() (+1 more)

### Community 78 - "sha256"
Cohesion: 0.12
Nodes (5): PostgresLoginCodeRepository, PostgresSessionRepository, SessionAccountRow, ISessionRepository, sha256()

### Community 79 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 80 - "AgentExecution.ts"
Cohesion: 0.12
Nodes (10): Block, ExecutionContext, ExecutionModel, ExecutionTool, Message, ToolDefinition, Usage, AgentExecutionPorts (+2 more)

### Community 81 - "OrgRole"
Cohesion: 0.11
Nodes (11): OrganizationNamesQuery, ORG_ROLES, OrgRole, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, MemberView (+3 more)

### Community 83 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 84 - "app-services/projectDb.ts"
Cohesion: 0.17
Nodes (16): cloneDatabase(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open, openDb() (+8 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.22
Nodes (13): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+5 more)

### Community 87 - "admission.ts"
Cohesion: 0.07
Nodes (21): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+13 more)

### Community 88 - "urls.ts"
Cohesion: 0.16
Nodes (14): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+6 more)

### Community 89 - "createJobs"
Cohesion: 0.18
Nodes (18): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+10 more)

### Community 90 - "app-services/email.ts"
Cohesion: 0.10
Nodes (13): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, aiPorts, emailPorts, resetTransport() (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.12
Nodes (9): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IAccountRepository, ILoginCodeRepository (+1 more)

### Community 95 - "FileMap"
Cohesion: 0.13
Nodes (3): CoreModulesDependencies, FileMap, ProjectServices

### Community 96 - "Panel de administración del sistema — diseño"
Cohesion: 0.07
Nodes (31): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+23 more)

### Community 97 - "QueryRepository"
Cohesion: 0.13
Nodes (7): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), EmailPorts, QueryRepository, StoragePorts

### Community 98 - "projectRows.ts"
Cohesion: 0.12
Nodes (13): @electric-sql/pglite, createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask() (+5 more)

### Community 99 - "BuilderWorkflow.ts"
Cohesion: 0.22
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, useFastPath(), fixture(), workflowFixture()

### Community 101 - "react"
Cohesion: 0.14
Nodes (24): react, App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners (+16 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.20
Nodes (5): createUsageService(), DAILY_ACTIONS, UsageRepository, actionsToday, countAction

### Community 103 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 104 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (28): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), estTokens(), GATE_THRESHOLD (+20 more)

### Community 105 - "ModelRouter.ts"
Cohesion: 0.14
Nodes (19): KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, ModelInfo, AnalysisContext, CallOptions (+11 more)

### Community 106 - "sandbox.ts"
Cohesion: 0.14
Nodes (10): beginTransaction(), dispatch(), ProjectSandbox, RunInput, SandboxError, sandboxes, SandboxRunError, WORKER (+2 more)

### Community 107 - "bootstrap/coreModules.ts"
Cohesion: 0.14
Nodes (3): createCoreModules(), PostgresMemberRepository, PostgresOrganizationSkillsRepository

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "OrchestrationPolicy.ts"
Cohesion: 0.29
Nodes (8): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 110 - "appRuntimeServer.ts"
Cohesion: 0.07
Nodes (32): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, runtimePorts, wss (+24 more)

### Community 111 - "composition.ts"
Cohesion: 0.15
Nodes (22): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+14 more)

### Community 112 - "ports.ts"
Cohesion: 0.10
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 116 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+5 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 120 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 122 - "ISettingsStore"
Cohesion: 0.19
Nodes (8): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 123 - "studio.mjs"
Cohesion: 0.25
Nodes (13): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+5 more)

### Community 126 - "platformRepository.test.ts"
Cohesion: 0.19
Nodes (6): createStorage(), StoredObject, JOB_LIMITS, MAX_FILE_BYTES, safeStorageKey(), SECRET_NAME

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "Tx"
Cohesion: 0.15
Nodes (10): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, Tx, ANTHROPIC_MODELS (+2 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 138 - "model-management/router.test.ts"
Cohesion: 0.25
Nodes (6): a, b, features, response, scope, setup()

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (7): B, I, N, S, assertPublic(), fetchPublicText(), isPrivate()

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 142 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 143 - "http.test.ts"
Cohesion: 0.11
Nodes (18): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+10 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 147 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 148 - "AgentExecutionResult"
Cohesion: 0.20
Nodes (6): RunTaskLaneUseCase, AgentExecutionResult, TaskLanePorts, fixture(), result, task

### Community 149 - "securityReview.ts"
Cohesion: 0.17
Nodes (7): BuilderTool, toolByName, typed(), ROLE_PROMPTS, Reported, running, SEVERITIES

### Community 150 - "TaskQueriesAdapter.ts"
Cohesion: 0.36
Nodes (4): ListAgentTasksUseCase, listTasks(), AgentTaskQueries, AgentTaskView

### Community 151 - "app-services/auth.ts"
Cohesion: 0.20
Nodes (9): confirmPasswordReset, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut, signUp, userFromSession (+1 more)

### Community 152 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 153 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 157 - "createAuth"
Cohesion: 0.24
Nodes (12): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+4 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 188 - "accounts.ts"
Cohesion: 0.24
Nodes (7): connectAccount(), GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (20): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+12 more)

### Community 259 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 277 - "createCollaborationModule"
Cohesion: 0.15
Nodes (5): MemberQueries, OrganizationQueries, createCollaborationModule(), IOrganizationQueries, fixture()

### Community 279 - "settings/index.ts"
Cohesion: 0.17
Nodes (19): encryptHeaders(), PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 286 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 288 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 300 - "SqlAgentTaskRepository.ts"
Cohesion: 0.16
Nodes (6): TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 341 - "accountLifecycle.ts"
Cohesion: 0.16
Nodes (9): PlatformRole, AccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity, IdentityAccountsDependencies, IdentityRandom (+1 more)

### Community 344 - "application/context.ts"
Cohesion: 0.10
Nodes (9): Run, createContext(), serviceContext(), publish(), ServiceContext, EmailInput, AppEnv, JobsApi (+1 more)

### Community 361 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (16): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, Access (+8 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1177 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `config.ts`, `IntegrationRepository`, `http-client.ts`, `q`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `crypto.ts`, `evaluations/bindings.test.ts`, `ExecutionMetrics`, `memory/application/service.ts`, `RunAgentUseCase.ts`, `ref_node_fs`, `projectIndex.ts`, `model-management/catalog.ts`, `project-observability/events.ts`, `CollaborationModuleDependencies`, `modules/projects/index.ts`, `createModelRouter`, `studioApi.ts`, `SettingDefinition`, `Plan.ts`, `builderService.ts`, `bootstrap/server.ts`, `models.ts`, `projects/application/usecases.ts`, `model-management/router.ts`, `integrations/github.ts`, `package.json`, `Project`, `project-observability/security.ts`, `ProjectDb`, `server/index.ts`, `createIdentityModule`, `deps.ts`, `model-management/index.ts`, `app-runtime/index.ts`, `ApplicationLifecycle`, `GithubAccountRepository`, `IOrganizationRepository`, `policies.test.ts`, `toolOutputs.test.ts`, `AgentExecution.ts`, `domain/score.ts`, `Changes.tsx`, `admission.ts`, `app-services/email.ts`, `BootstrapService`, `modules/identity/index.ts`, `projectRows.ts`, `BuilderWorkflow.ts`, `usage/usage.ts`, `modules/builder/index.ts`, `bootstrap/coreModules.ts`, `OrganizationSkillsService.ts`, `appRuntimeServer.ts`, `composition.ts`, `ports.ts`, `devDependencies`, `guides.ts`, `RouterAdministration.ts`, `skills.test.ts`, `mcp/jobs.ts`, `ISettingsStore`, `platformRepository.test.ts`, `PlatformSettingsService`, `model-management/router.test.ts`, `BuilderToolsAdapter.ts`, `createHttp`, `http.test.ts`, `Password`, `integrations/boundaries.test.ts`, `AgentExecutionResult`, `TaskQueriesAdapter.ts`, `replaceVisibleText`, `execution.test.ts`, `identity/boundaries.test.ts`, `architecture.test.ts`, `accounts.ts`, `FinishGateAdapter.ts`, `apiTypes.test.ts`, `createCollaborationModule`, `SqlAgentTaskRepository.ts`, `accountLifecycle.ts`, `modules/collaboration/index.ts`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ports/context.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11827956989247312 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `Workspace.tsx`, `http-client.ts`, `models/presentation/Models.tsx`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Memory.tsx`, `Changes.tsx`, `administration/presentation/Models.tsx`, `client/index.ts`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09548022598870057 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `infrastructure/runner.ts`, `config.ts`, `IntegrationRepository`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `model-management/catalog.ts`, `CollaborationModuleDependencies`, `infrastructure/repositories.ts`, `model-management/router.ts`, `SqlAgentTaskRepository.ts`, `Account`, `integrations/github.ts`, `Project`, `adminApi.ts`, `project-observability/security.ts`, `model-management/index.ts`, `sha256`, `OrgRole`, `accountLifecycle.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `bootstrap/coreModules.ts`, `OrganizationSkillsService.ts`, `RouterAdministration.ts`, `platform.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._