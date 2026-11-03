# Graph Report - forje-software-studio  (2026-11-03)

## Corpus Check
- 579 files · ~241,932 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 3959 nodes · 10016 edges · 175 communities (142 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 534 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `885b3b23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ports/context.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- database/index.ts
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
- BuilderWorkflow.ts
- react
- application/problems.ts
- PersonalOrganizationUseCase
- Author
- app-services/context.ts
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
- internal/router.ts
- server/index.ts
- OrchestrationPolicy.ts
- BuilderWorkflowPorts
- modules/projects/index.ts
- mcp/server.ts
- integrations/github.ts
- package.json
- ProjectsStore
- projectDb.ts
- infrastructure/probe.ts
- project-observability/security.ts
- infrastructure/repositories.ts
- Inventario de funciones de Lovable → Forja
- server/index.ts
- client.ts
- createIdentityModule
- Inventario de funciones de Lovable → Forja
- Plan
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
- projects/postgres.test.ts
- bootstrap/server.ts
- toolOutputs.test.ts
- package.json
- createProblemService
- mcp/jobs.ts
- domain/score.ts
- Changes.tsx
- admission.ts
- urls.ts
- createHttp
- JobRuntimePorts
- GithubAuthorization
- GithubRepository
- BootstrapService
- modules/identity/index.ts
- bootstrap/coreModules.ts
- RealtimeTransport
- RealtimeSocket
- CheckPlanUseCase.ts
- audit.ts
- agentCompact.test.ts
- Account.tsx
- usage/usage.ts
- client/index.ts
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
- exports.test.tsx
- devDependencies
- identity/boundaries.test.ts
- model-management/routerAdmin.ts
- platform.ts
- roles.ts
- collaboration/ports/repositories.ts
- { api, auth, storage, ai }
- integrations/boundaries.test.ts
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- models/presentation/Models.tsx
- ProjectsApplication.ts
- domain/securityScan.ts
- PlatformSettingsService
- Review Focus
- studio.mjs
- integrations/index.ts
- platformRepository.test.ts
- infrastructure/auth.ts
- architecture.test.ts
- Panel de administración del sistema — diseño
- infrastructure/github.ts
- collaboration/postgresAdapters.test.ts
- FinishGateAdapter.ts
- apiTypes.test.ts
- createProjectRows
- guides.ts
- typecheck.ts
- createCollaborationModule
- settings/index.ts
- forms.tsx
- createSecrets
- PostgresPlatformSettingsStoreAdapter
- SqlAgentTaskRepository.ts
- ports/jobs.ts
- GithubGateway
- AccountLifecycleRepository
- infrastructure/playground.ts
- one
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
9. `ProjectView()` - 38 edges
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

## Communities (175 total, 33 thin omitted)

### Community 0 - "ports/context.ts"
Cohesion: 0.08
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AppAiInput, AppAiResult, AppUser, CheckoutInput, EmailInput (+5 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (36): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+28 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (66): ChatStreamEvent, api, builderController, streamPost, AgentLanes(), Lane, LaneCard(), LaneStep (+58 more)

### Community 4 - "database/index.ts"
Cohesion: 0.12
Nodes (17): DEV_FIXTURE, Fixture, storagePorts, config, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+9 more)

### Community 5 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (41): analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache, cookie() (+33 more)

### Community 7 - "http-client.ts"
Cohesion: 0.11
Nodes (15): appServicesController, createEvaluationUseCases(), filesController, createController(), HttpOptions, HttpPort, ApiError, dispatchEvents() (+7 more)

### Community 8 - "q"
Cohesion: 0.06
Nodes (9): PostgresMemberRepository, PostgresOrganizationRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, sha256() (+1 more)

### Community 9 - "PostgresProviderRepository.ts"
Cohesion: 0.11
Nodes (23): createLocalSeed(), readSeedFile(), SeedFile, createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders() (+15 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/routing.ts"
Cohesion: 0.13
Nodes (21): anthropicChat(), Block, LlmRequest, LlmResponse, LlmTool, ModelCallError, anthropicChat(), getClient() (+13 more)

### Community 12 - "crypto.ts"
Cohesion: 0.16
Nodes (16): secretPorts, BcryptArgonPasswordHasher, encryptHeaders(), Input, burnPasswordCheck(), decrypt(), encrypt(), hashPassword() (+8 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (50): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), toolByName, active, AgentResult (+42 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "RunAgentUseCase.ts"
Cohesion: 0.08
Nodes (33): page(), RunAgentUseCase, summarize(), addUsage(), AgentEvent, AgentExecutionSpec, Block, emptyUsage() (+25 more)

### Community 18 - "BuilderToolsAdapter.ts"
Cohesion: 0.04
Nodes (16): requestSecret, assertOwned(), B, BuilderTool, I, N, out(), S (+8 more)

### Community 19 - "vitest"
Cohesion: 0.16
Nodes (12): pg, vitest, createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, pool, state (+4 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 21 - "bundler.ts"
Cohesion: 0.14
Nodes (27): createProjectCheck(), Deps, packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo (+19 more)

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.10
Nodes (27): `llm/catalog.ts`, tasks, allowedModels(), availableModels(), deleteModel(), lastSync(), listCatalog(), platformAllows() (+19 more)

### Community 23 - "app-services/projectDb.ts"
Cohesion: 0.11
Nodes (24): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), ProjectDataError, cloneDatabase() (+16 more)

### Community 24 - "BuilderWorkflow.ts"
Cohesion: 0.15
Nodes (9): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), FastBuildPorts (+1 more)

### Community 25 - "react"
Cohesion: 0.09
Nodes (37): react, api, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView (+29 more)

### Community 26 - "application/problems.ts"
Cohesion: 0.11
Nodes (12): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, Problem, ProblemEffects, ProblemKind (+4 more)

### Community 27 - "PersonalOrganizationUseCase"
Cohesion: 0.10
Nodes (9): OrganizationNamesQuery, OrganizationQueries, PersonalOrganizationUseCase, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle, IOrganizationNameDirectory (+1 more)

### Community 28 - "Author"
Cohesion: 0.13
Nodes (8): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, ProjectPath, ProjectsModuleDependencies, IProjectFileRepository

### Community 29 - "app-services/context.ts"
Cohesion: 0.14
Nodes (16): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, aiPorts, emailPorts, resetTransport() (+8 more)

### Community 30 - "agents.mjs"
Cohesion: 0.10
Nodes (16): here, app, DATA, app, DATA, MODELS, ROOT, SEED (+8 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+43 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.08
Nodes (38): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, addTimer, cancelTimer (+30 more)

### Community 33 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 34 - "Plan.ts"
Cohesion: 0.17
Nodes (14): checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order(), overlap() (+6 more)

### Community 35 - "Account"
Cohesion: 0.12
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 36 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 37 - "platform/security.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (14): createCatalogService(), deleteModel(), saveModel(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges, ModelError (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (37): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+29 more)

### Community 40 - "createModelRouter"
Cohesion: 0.19
Nodes (16): createModelManagementQueries(), routerAudit(), updateProjectModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+8 more)

### Community 41 - "TurnFeedbackPorts.ts"
Cohesion: 0.14
Nodes (19): ROLES, createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback, routingPorts (+11 more)

### Community 42 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 43 - "server/index.ts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 46 - "modules/projects/index.ts"
Cohesion: 0.10
Nodes (17): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, FileMap, ProjectPatch, SeoSettings (+9 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 48 - "integrations/github.ts"
Cohesion: 0.13
Nodes (16): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+8 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "projectDb.ts"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 53 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 54 - "infrastructure/repositories.ts"
Cohesion: 0.15
Nodes (13): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, projectDb(), createProjectRowsRepository(), projectRowsRepository, authRepository(), createAuthRepository(), createQueryRepository() (+5 more)

### Community 55 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (6): IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "Plan"
Cohesion: 0.25
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 61 - "deps.ts"
Cohesion: 0.12
Nodes (24): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+16 more)

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
Cohesion: 0.06
Nodes (35): playwright-core, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, stopAppRuntime(), suggestSlug, loadFiles() (+27 more)

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "ApplicationLifecycle"
Cohesion: 0.22
Nodes (3): ApplicationLifecycle, LifecycleService, shutdown()

### Community 71 - "Workspace.tsx"
Cohesion: 0.07
Nodes (35): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+27 more)

### Community 72 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 73 - "Desplegar Forja en Coolify"
Cohesion: 0.12
Nodes (9): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository (+1 more)

### Community 74 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "PlatformSettingsService"
Cohesion: 0.29
Nodes (6): environment, ports, ports, services, forja, postgres

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 78 - "http.test.ts"
Cohesion: 0.18
Nodes (10): SettingsModule, account, app, collaboration, identity, mocks, models, projects (+2 more)

### Community 79 - "projects/postgres.test.ts"
Cohesion: 0.18
Nodes (9): app, database, pool, projectOrganizations, remove, rename, services, store (+1 more)

### Community 80 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (32): Conexión, app, handleMcp, lifecycle, listening(), monolith, reactions, resolveApp() (+24 more)

### Community 81 - "toolOutputs.test.ts"
Cohesion: 0.20
Nodes (4): dir, BEFORE, conforms(), dir

### Community 83 - "createProblemService"
Cohesion: 0.40
Nodes (10): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+2 more)

### Community 84 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "admission.ts"
Cohesion: 0.10
Nodes (15): AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget(), RunConfiguration (+7 more)

### Community 88 - "urls.ts"
Cohesion: 0.19
Nodes (11): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+3 more)

### Community 89 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 93 - "BootstrapService"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 95 - "bootstrap/coreModules.ts"
Cohesion: 0.20
Nodes (5): CoreModulesDependencies, createCoreModules(), ProjectServices, newToken(), numericCode()

### Community 99 - "audit.ts"
Cohesion: 0.67
Nodes (3): audit(), postgresModelAudit(), ModelAudit

### Community 100 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): LlmMessage, calls, model, usage

### Community 101 - "Account.tsx"
Cohesion: 0.09
Nodes (34): App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners, usePath() (+26 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 104 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (39): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), ToolContext, cleanText() (+31 more)

### Community 105 - "ModelRouter.ts"
Cohesion: 0.13
Nodes (22): TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, Usage, ModelInfo (+14 more)

### Community 106 - "createJobs"
Cohesion: 0.18
Nodes (18): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+10 more)

### Community 107 - "1. Capa de datos"
Cohesion: 0.40
Nodes (5): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 110 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, runBuilderTurn(), stopBuilder()

### Community 111 - "composition.ts"
Cohesion: 0.13
Nodes (25): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+17 more)

### Community 112 - "bundler.ts"
Cohesion: 0.09
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, ProjectCompilerPort, createPublication(), assertPublishable() (+9 more)

### Community 113 - "transports/mcp.test.ts"
Cohesion: 0.22
Nodes (9): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, collaboration, handleMcp, identity (+1 more)

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 117 - "model-management/routerAdmin.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "roles.ts"
Cohesion: 0.07
Nodes (38): builderTools, BUILDER_SYSTEM_PROMPT, BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS (+30 more)

### Community 120 - "collaboration/ports/repositories.ts"
Cohesion: 0.17
Nodes (7): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess, Organization, PostgresCollaborationAccountRepository, CollaborationAccount

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.13
Nodes (15): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+7 more)

### Community 124 - "models/presentation/Models.tsx"
Cohesion: 0.15
Nodes (17): api, billingController, Meter(), Plan(), Usage, api, modelsController, AccountModels() (+9 more)

### Community 126 - "ProjectsApplication.ts"
Cohesion: 0.23
Nodes (4): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Checkpoint

### Community 133 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "Review Focus"
Cohesion: 0.10
Nodes (15): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+7 more)

### Community 138 - "studio.mjs"
Cohesion: 0.25
Nodes (13): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+5 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 150 - "platformRepository.test.ts"
Cohesion: 0.10
Nodes (16): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail(), sendPlatformEmail() (+8 more)

### Community 157 - "infrastructure/auth.ts"
Cohesion: 0.12
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 180 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (16): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+8 more)

### Community 188 - "infrastructure/github.ts"
Cohesion: 0.25
Nodes (8): GithubError, Link, SyncResult, gh(), githubAccountRepository, githubAuthorization, tokenFor(), setup()

### Community 191 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.15
Nodes (12): IMemberQueries, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord, collaboration, collaborationAccountRepository (+4 more)

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (16): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+8 more)

### Community 259 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 265 - "createProjectRows"
Cohesion: 0.16
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectRowsPort (+1 more)

### Community 273 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 276 - "typecheck.ts"
Cohesion: 0.20
Nodes (12): checkProject, IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 277 - "createCollaborationModule"
Cohesion: 0.20
Nodes (4): ClaimInvitesUseCase, MemberQueries, createCollaborationModule(), fixture()

### Community 279 - "settings/index.ts"
Cohesion: 0.21
Nodes (15): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+7 more)

### Community 286 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 288 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 300 - "SqlAgentTaskRepository.ts"
Cohesion: 0.08
Nodes (17): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView (+9 more)

### Community 301 - "ports/jobs.ts"
Cohesion: 0.09
Nodes (10): AiBlock, AiModel, AiPorts, EmailPorts, JobCron, JobPorts, AppServiceEvent, ObserverPorts (+2 more)

### Community 339 - "infrastructure/playground.ts"
Cohesion: 0.09
Nodes (37): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+29 more)

### Community 341 - "one"
Cohesion: 0.10
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+3 more)

### Community 344 - "sandbox.ts"
Cohesion: 0.07
Nodes (20): AppTarget, beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, SandboxError, sandboxes (+12 more)

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
Cohesion: 0.10
Nodes (10): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService (+2 more)

### Community 362 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 373 - "Forja"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1167 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `database/index.ts`, `IntegrationRepository`, `http-client.ts`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `evaluations/bindings.test.ts`, `ExecutionMetrics`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `RunAgentUseCase.ts`, `BuilderToolsAdapter.ts`, `projectIndex.ts`, `model-management/catalog.ts`, `BuilderWorkflow.ts`, `application/problems.ts`, `PersonalOrganizationUseCase`, `Author`, `ISettingsStore`, `Plan.ts`, `models.ts`, `projects/application/usecases.ts`, `createModelRouter`, `TurnFeedbackPorts.ts`, `integrations/github.ts`, `package.json`, `ProjectsStore`, `projectDb.ts`, `project-observability/security.ts`, `infrastructure/repositories.ts`, `server/index.ts`, `createIdentityModule`, `deps.ts`, `model-management/index.ts`, `app-runtime/index.ts`, `ApplicationLifecycle`, `GithubAccountRepository`, `Desplegar Forja en Coolify`, `http.test.ts`, `projects/postgres.test.ts`, `bootstrap/server.ts`, `toolOutputs.test.ts`, `mcp/jobs.ts`, `domain/score.ts`, `Changes.tsx`, `admission.ts`, `createHttp`, `BootstrapService`, `modules/identity/index.ts`, `bootstrap/coreModules.ts`, `agentCompact.test.ts`, `usage/usage.ts`, `modules/builder/index.ts`, `OrganizationSkillsService.ts`, `BuilderRunRegistry`, `composition.ts`, `bundler.ts`, `transports/mcp.test.ts`, `exports.test.tsx`, `devDependencies`, `identity/boundaries.test.ts`, `model-management/routerAdmin.ts`, `roles.ts`, `collaboration/ports/repositories.ts`, `integrations/boundaries.test.ts`, `ProjectsApplication.ts`, `PlatformSettingsService`, `platformRepository.test.ts`, `architecture.test.ts`, `infrastructure/github.ts`, `collaboration/postgresAdapters.test.ts`, `FinishGateAdapter.ts`, `apiTypes.test.ts`, `guides.ts`, `createCollaborationModule`, `SqlAgentTaskRepository.ts`, `InviteMemberUseCase.ts`, `SettingDefinition`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ports/context.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `Account.tsx`, `client/index.ts`, `Workspace.tsx`, `projects/application/usecases.ts`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `exports.test.tsx`, `Changes.tsx`, `models/presentation/Models.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1226215644820296 - nodes in this community are weakly interconnected._
- **Why does `q()` connect `q` to `infrastructure/runner.ts`, `database/index.ts`, `PostgresProviderRepository.ts`, `infrastructure/routing.ts`, `crypto.ts`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `model-management/catalog.ts`, `app-services/projectDb.ts`, `PersonalOrganizationUseCase`, `Account`, `TurnFeedbackPorts.ts`, `SqlAgentTaskRepository.ts`, `projectDb.ts`, `infrastructure/probe.ts`, `project-observability/security.ts`, `infrastructure/repositories.ts`, `infrastructure/github.ts`, `collaboration/postgresAdapters.test.ts`, `model-management/index.ts`, `infrastructure/playground.ts`, `one`, `modules/identity/index.ts`, `audit.ts`, `usage/usage.ts`, `modules/builder/index.ts`, `OrganizationSkillsService.ts`, `model-management/routerAdmin.ts`, `platform.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._