# Graph Report - forje-software-studio  (2026-11-03)

## Corpus Check
- 579 files · ~242,735 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 3960 nodes · 10018 edges · 168 communities (136 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 534 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c6abff0e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthPorts
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
- BuilderToolsAdapter.ts
- vitest
- projectIndex.ts
- bundler.ts
- model-management/catalog.ts
- app-services/projectDb.ts
- OrchestrationPolicy.ts
- react
- application/problems.ts
- PersonalOrganizationUseCase
- Author
- domain/contracts.ts
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- ISettingsStore
- Plan.ts
- Account
- executeRun
- platform/security.ts
- models.ts
- projects/application/usecases.ts
- createModelRouter
- TurnFeedbackPorts.ts
- client/index.ts
- server/index.ts
- app-runtime/infrastructure/browser.ts
- BuilderWorkflowPorts
- modules/projects/index.ts
- mcp/server.ts
- integrations/github.ts
- package.json
- ProjectsStore
- projectDb.ts
- adminApi.ts
- project-observability/security.ts
- infrastructure/repositories.ts
- server/index.ts
- ISessionRepository
- createIdentityModule
- Inventario de funciones de Lovable → Forja
- one
- deps.ts
- sandboxWorker.mjs
- forja
- model-management/index.ts
- PostgresProjectsStore
- github.mjs
- app-runtime/index.ts
- Desplegar Forja en Coolify
- ApplicationLifecycle
- Workspace.tsx
- GithubAccountRepository
- Desplegar Forja en Coolify
- app-services/payments.ts
- PlatformSettingsService
- createGithubSyncService
- e2e.mjs
- http.test.ts
- ContextPorts
- bootstrap/server.ts
- PostgresApiTokenRepository
- package.json
- Memory.tsx
- mcp/jobs.ts
- domain/score.ts
- Changes.tsx
- admission.ts
- urls.ts
- QueryRepository
- JobRuntimePorts
- GithubAuthorization
- GithubRepository
- BootstrapService
- ILoginCodeRepository
- FileMap
- Review Focus
- createAnalytics
- IAccountRepository
- PostgresPasswordResetRepository
- ProjectSandbox
- Account.tsx
- usage/usage.ts
- application/email.ts
- modules/builder/index.ts
- ModelRouter.ts
- createJobs
- 1. Capa de datos
- OrganizationSkillsService.ts
- IdentityRandom
- BuilderRunRegistry
- composition.ts
- bundler.ts
- transports/mcp.test.ts
- safeFetch.ts
- devDependencies
- motion.tsx
- model-management/routerAdmin.ts
- platform.ts
- skills.test.ts
- { api, auth, storage, ai }
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- ProjectsApplication.ts
- domain/securityScan.ts
- PlatformSettingsService
- database/index.ts
- integrations/index.ts
- app-services/context.ts
- infrastructure/auth.ts
- architecture.test.ts
- Panel de administración del sistema — diseño
- infrastructure/github.ts
- collaboration/postgresAdapters.test.ts
- FinishGateAdapter.ts
- apiTypes.test.ts
- guides.ts
- createCollaborationModule
- settings/index.ts
- forms.tsx
- createSecrets
- SqlAgentTaskRepository.ts
- ports/context.ts
- GithubGateway
- AccountLifecycleRepository
- infrastructure/playground.ts
- modules/identity/index.ts
- sandbox.ts
- Plan de escalado a microservicios
- Inventario de interfaz de Floot → Forja
- Fases y dependencias
- GithubProjectPorts
- PostgresProjectFileRepository
- Fases de implementacion
- InviteMemberUseCase.ts
- SettingDefinition
- Forja
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
1. `vitest` - 120 edges
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
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 4: API de administración (ajustes, proveedores, modelos, sondas)` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/shared/security.ts
- `8. Errores y seguridad` --references--> `rateLimit()`  [INFERRED]
  docs/superpowers/specs/2026-11-01-panel-admin-design.md → server/shared/security.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts

## Import Cycles
- None detected.

## Communities (168 total, 32 thin omitted)

### Community 0 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 1 - "index.tsx"
Cohesion: 0.20
Nodes (14): clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState() (+6 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (26): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), EVAL_EMAIL, spentLast24h() (+18 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (66): ChatStreamEvent, api, builderController, streamPost, AgentLanes(), Lane, LaneCard(), LaneStep (+58 more)

### Community 4 - "config.ts"
Cohesion: 0.26
Nodes (6): DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR, MIGRATIONS_DIR

### Community 5 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (43): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+35 more)

### Community 7 - "http-client.ts"
Cohesion: 0.10
Nodes (18): appServicesController, createEvaluationUseCases(), filesController, transport, createProjectUseCases(), subscribeToProjectEvents(), createController(), HttpOptions (+10 more)

### Community 8 - "q"
Cohesion: 0.08
Nodes (6): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, PostgresLoginCodeRepository, q()

### Community 9 - "PostgresProviderRepository.ts"
Cohesion: 0.10
Nodes (23): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+15 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/routing.ts"
Cohesion: 0.10
Nodes (27): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, textOf() (+19 more)

### Community 12 - "crypto.ts"
Cohesion: 0.12
Nodes (18): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, config, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "ExecutionMetrics"
Cohesion: 0.05
Nodes (29): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, BACKEND (+21 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (38): 6. IA dentro de las apps, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+30 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (14): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+6 more)

### Community 17 - "RunAgentUseCase.ts"
Cohesion: 0.08
Nodes (34): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext (+26 more)

### Community 18 - "BuilderToolsAdapter.ts"
Cohesion: 0.08
Nodes (12): configureSecretIntegrations(), secretPorts, deleteSecret, listSecrets, requestSecret, setSecret, B, I (+4 more)

### Community 19 - "vitest"
Cohesion: 0.08
Nodes (26): pg, vitest, createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, dir, monolith (+18 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 21 - "bundler.ts"
Cohesion: 0.14
Nodes (25): createProjectCheck(), Deps, packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo (+17 more)

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.09
Nodes (34): `llm/catalog.ts`, createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels(), availableModels(), deleteModel() (+26 more)

### Community 23 - "app-services/projectDb.ts"
Cohesion: 0.15
Nodes (19): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), Open (+11 more)

### Community 24 - "OrchestrationPolicy.ts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 25 - "react"
Cohesion: 0.06
Nodes (49): react, api, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView (+41 more)

### Community 26 - "application/problems.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 27 - "PersonalOrganizationUseCase"
Cohesion: 0.12
Nodes (9): ProjectIdentity, ProjectTarget, PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository (+1 more)

### Community 28 - "Author"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (11): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, aiPorts (+3 more)

### Community 30 - "agents.mjs"
Cohesion: 0.08
Nodes (29): here, app, DATA, app, DATA, MODELS, ROOT, SEED (+21 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (52): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+44 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (40): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+32 more)

### Community 33 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "Account"
Cohesion: 0.16
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 36 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 37 - "platform/security.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (15): createCatalogService(), deleteModel(), saveModel(), updateProjectModels(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges (+7 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (19): ProjectEvent, ProjectLogLine, projectsController, isProjectLogLine(), isProjectProblem(), isRecord(), parseProjectEvent(), Account (+11 more)

### Community 40 - "createModelRouter"
Cohesion: 0.19
Nodes (16): createModelManagementQueries(), routerAudit(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), taskClassOf() (+8 more)

### Community 41 - "TurnFeedbackPorts.ts"
Cohesion: 0.13
Nodes (19): ROLES, useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback (+11 more)

### Community 42 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

### Community 43 - "server/index.ts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.16
Nodes (17): playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser(), inspectPreview() (+9 more)

### Community 46 - "modules/projects/index.ts"
Cohesion: 0.17
Nodes (11): BeforeImage, ChangeEntry, ProjectPatch, ProjectSnapshot, SeoSettings, TurnFileChange, PATCHABLE, ProjectOrganizations (+3 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.13
Nodes (18): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+10 more)

### Community 48 - "integrations/github.ts"
Cohesion: 0.14
Nodes (17): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+9 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (44): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+36 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.06
Nodes (9): isDevFile(), ProjectsApplication, beforeImages(), restoredFiles(), turnFileChange(), TurnChanges, createProjectsModule(), ProjectsStore (+1 more)

### Community 51 - "projectDb.ts"
Cohesion: 0.10
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "adminApi.ts"
Cohesion: 0.12
Nodes (29): 6. API de administración, hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf() (+21 more)

### Community 53 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 54 - "infrastructure/repositories.ts"
Cohesion: 0.13
Nodes (11): @electric-sql/pglite, createProjectRowsRepository(), projectRowsRepository, authRepository(), createAuthRepository(), createQueryRepository(), platformRepository, statement() (+3 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "ISessionRepository"
Cohesion: 0.21
Nodes (3): LoginWithPasswordUseCase, IPasswordHasher, ISessionRepository

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion(), isValidPackageName() (+25 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "forja"
Cohesion: 0.07
Nodes (32): BROWSER, args, context, dockerfile, postgres, build, depends_on, environment (+24 more)

### Community 65 - "model-management/index.ts"
Cohesion: 0.14
Nodes (18): Catalog, bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView, ProjectModelPatch, ProjectModelSettings (+10 more)

### Community 67 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (21): RuntimeObservationPorts, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, stopAppRuntime(), suggestSlug, bindRuntimeObservation() (+13 more)

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "ApplicationLifecycle"
Cohesion: 0.22
Nodes (3): ApplicationLifecycle, LifecycleService, shutdown()

### Community 71 - "Workspace.tsx"
Cohesion: 0.08
Nodes (43): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+35 more)

### Community 72 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 73 - "Desplegar Forja en Coolify"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 74 - "app-services/payments.ts"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "PlatformSettingsService"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "e2e.mjs"
Cohesion: 0.12
Nodes (11): beginTransaction(), dispatch(), SandboxError, sandboxes, WORKER, DATA, jar, req() (+3 more)

### Community 78 - "http.test.ts"
Cohesion: 0.18
Nodes (10): SettingsModule, account, app, collaboration, identity, mocks, models, projects (+2 more)

### Community 79 - "ContextPorts"
Cohesion: 0.17
Nodes (4): CheckoutInput, EmailResult, StoredObject, ContextPorts

### Community 80 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (31): app, handleMcp, lifecycle, listening(), monolith, reactions, resolveApp(), seedLocal (+23 more)

### Community 81 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 83 - "Memory.tsx"
Cohesion: 0.19
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 84 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "admission.ts"
Cohesion: 0.08
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+9 more)

### Community 88 - "urls.ts"
Cohesion: 0.17
Nodes (12): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+4 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "ILoginCodeRepository"
Cohesion: 0.12
Nodes (6): RequestLoginCodeUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, ILoginCodeRepository, IMailerService

### Community 95 - "FileMap"
Cohesion: 0.12
Nodes (4): CoreModulesDependencies, FileMap, ProjectsModuleDependencies, ProjectServices

### Community 96 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 97 - "createAnalytics"
Cohesion: 0.27
Nodes (7): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), AnalyticsPorts

### Community 101 - "Account.tsx"
Cohesion: 0.08
Nodes (37): App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners, usePath() (+29 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "application/email.ts"
Cohesion: 0.36
Nodes (4): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender()

### Community 104 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (47): describeSchema, GATE_FIXES, AgentEvent, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), BuilderTool (+39 more)

### Community 105 - "ModelRouter.ts"
Cohesion: 0.14
Nodes (20): AgentSpec, KEYWORDS, LAMBDA, RoleProfile, Effort, ModelInfo, AnalysisContext, Billing (+12 more)

### Community 106 - "createJobs"
Cohesion: 0.07
Nodes (29): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+21 more)

### Community 107 - "1. Capa de datos"
Cohesion: 0.40
Nodes (5): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 110 - "BuilderRunRegistry"
Cohesion: 0.20
Nodes (5): BuilderRunRegistry, isBuilding(), runBuilderTurn(), stopBuilder(), stopBuilding()

### Community 111 - "composition.ts"
Cohesion: 0.12
Nodes (27): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+19 more)

### Community 112 - "bundler.ts"
Cohesion: 0.10
Nodes (17): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, ProjectCompilerPort, createPublication(), assertPublishable() (+9 more)

### Community 113 - "transports/mcp.test.ts"
Cohesion: 0.20
Nodes (11): createMcpHandler(), bindBuilderCoreModules(), builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, collaboration (+3 more)

### Community 114 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 116 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 117 - "model-management/routerAdmin.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "skills.test.ts"
Cohesion: 0.18
Nodes (18): ROLE_PROMPTS, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.13
Nodes (15): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+7 more)

### Community 126 - "ProjectsApplication.ts"
Cohesion: 0.30
Nodes (5): CreateCheckpointUseCase, CreateProjectUseCase, Author, Checkpoint, CheckpointProps

### Community 133 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 135 - "database/index.ts"
Cohesion: 0.10
Nodes (21): Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, Conexión, [command, ...flags], main(), monolith, seedDev (+13 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 150 - "app-services/context.ts"
Cohesion: 0.15
Nodes (11): createStorage(), StoredObject, bindJobs, MAX_FILE_BYTES, safeStorageKey(), storagePorts, secretEnv, deleteObject (+3 more)

### Community 157 - "infrastructure/auth.ts"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 180 - "Panel de administración del sistema — diseño"
Cohesion: 0.14
Nodes (14): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario (+6 more)

### Community 188 - "infrastructure/github.ts"
Cohesion: 0.24
Nodes (7): connectAccount(), GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 191 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (20): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+12 more)

### Community 259 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 273 - "guides.ts"
Cohesion: 0.18
Nodes (12): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug() (+4 more)

### Community 277 - "createCollaborationModule"
Cohesion: 0.10
Nodes (12): MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries (+4 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 286 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 288 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 300 - "SqlAgentTaskRepository.ts"
Cohesion: 0.08
Nodes (17): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView (+9 more)

### Community 301 - "ports/context.ts"
Cohesion: 0.12
Nodes (9): AppTarget, AppEnv, JOB_LIMITS, JobsApi, EmailPorts, JobCron, JobPorts, AppServiceEvent (+1 more)

### Community 339 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (30): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), admitPlayground() (+22 more)

### Community 341 - "modules/identity/index.ts"
Cohesion: 0.20
Nodes (10): PlatformRole, COMMON_PASSWORDS, Password, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation (+2 more)

### Community 344 - "sandbox.ts"
Cohesion: 0.09
Nodes (11): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext (+3 more)

### Community 346 - "Plan de escalado a microservicios"
Cohesion: 0.17
Nodes (12): Arquitectura objetivo inicial, Cache y estado distribuido, Decisiones propuestas, Estado actual verificado, Eventos, colas y transacciones, Objetivo y alcance, Operacion, despliegue y rollback, Plan de escalado a microservicios (+4 more)

### Community 347 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.20
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 349 - "Fases y dependencias"
Cohesion: 0.33
Nodes (6): Fase 0. Medir y fijar contratos, Fase 1. Infraestructura distribuida dentro del monolito, Fase 2. Extraer runner y workloads pesados, Fase 3. Gateways horizontales y datos de apps, Fase 4. Extraer otros contextos solo con justificacion, Fases y dependencias

### Community 360 - "Fases de implementacion"
Cohesion: 0.33
Nodes (6): Fase 0. Contratos y aislamiento, Fase 1. Piloto FastAPI + React, Fase 2. Go + React, Fase 3. Spring Boot + React, Fase 4. Producto y operaciones multi-stack, Fases de implementacion

### Community 361 - "InviteMemberUseCase.ts"
Cohesion: 0.09
Nodes (14): CheckAccessUseCase, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, RemoveMemberUseCase, Access, MemberAccess, ProjectInvite (+6 more)

### Community 362 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 373 - "Forja"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1167 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `apiTypes.test.ts`, `config.ts`, `IntegrationRepository`, `PlatformSettingsService`, `http-client.ts`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `crypto.ts`, `evaluations/bindings.test.ts`, `ExecutionMetrics`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `RunAgentUseCase.ts`, `guides.ts`, `BuilderToolsAdapter.ts`, `projectIndex.ts`, `createCollaborationModule`, `model-management/catalog.ts`, `OrchestrationPolicy.ts`, `application/problems.ts`, `PersonalOrganizationUseCase`, `Author`, `ISettingsStore`, `Plan.ts`, `models.ts`, `createModelRouter`, `TurnFeedbackPorts.ts`, `client/index.ts`, `SqlAgentTaskRepository.ts`, `integrations/github.ts`, `package.json`, `architecture.test.ts`, `ProjectsStore`, `projectDb.ts`, `project-observability/security.ts`, `infrastructure/repositories.ts`, `deps.test.ts`, `ISessionRepository`, `createIdentityModule`, `infrastructure/github.ts`, `deps.ts`, `collaboration/postgresAdapters.test.ts`, `model-management/index.ts`, `app-runtime/index.ts`, `ApplicationLifecycle`, `GithubAccountRepository`, `Desplegar Forja en Coolify`, `app-services/payments.ts`, `http.test.ts`, `bootstrap/server.ts`, `mcp/jobs.ts`, `domain/score.ts`, `Changes.tsx`, `admission.ts`, `modules/identity/index.ts`, `sandbox.ts`, `BootstrapService`, `ILoginCodeRepository`, `IAccountRepository`, `usage/usage.ts`, `modules/builder/index.ts`, `InviteMemberUseCase.ts`, `SettingDefinition`, `OrganizationSkillsService.ts`, `BuilderRunRegistry`, `composition.ts`, `bundler.ts`, `transports/mcp.test.ts`, `devDependencies`, `model-management/routerAdmin.ts`, `skills.test.ts`, `FinishGateAdapter.ts`, `ProjectsApplication.ts`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14919354838709678 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `Account.tsx`, `Workspace.tsx`, `client/index.ts`, `package.json`, `integrations/index.ts`, `Memory.tsx`, `motion.tsx`, `Changes.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05052631578947368 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `infrastructure/runner.ts`, `IntegrationRepository`, `database/index.ts`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `crypto.ts`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `createCollaborationModule`, `model-management/catalog.ts`, `PersonalOrganizationUseCase`, `Account`, `TurnFeedbackPorts.ts`, `SqlAgentTaskRepository.ts`, `integrations/github.ts`, `projectDb.ts`, `adminApi.ts`, `project-observability/security.ts`, `infrastructure/repositories.ts`, `one`, `model-management/index.ts`, `PostgresApiTokenRepository`, `infrastructure/playground.ts`, `modules/identity/index.ts`, `PostgresPasswordResetRepository`, `usage/usage.ts`, `modules/builder/index.ts`, `OrganizationSkillsService.ts`, `model-management/routerAdmin.ts`, `platform.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._