# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 639 files · ~282,408 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .css 4, .example 1)

## Summary
- 4302 nodes · 11113 edges · 188 communities (157 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 599 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5dfa3f76`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProviderService.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- vitest
- AgentExecution.ts
- appServer.ts
- http-client.ts
- composition.ts
- roles.ts
- with
- domain/services.ts
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- timeAgo
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- skills.test.ts
- studio.mjs
- bootstrap/coreModules.ts
- sandbox.ts
- modules/identity/index.ts
- domain/messages.ts
- urls.ts
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- vitest
- ProjectView.tsx
- studioApi.ts
- infrastructure/probe.ts
- appRuntimeHttp.ts
- app-services/storage.ts
- Panel de administración del sistema — diseño
- compilerOptions
- models.ts
- projects/application/usecases.ts
- createCollaborationModule
- model-management/router.ts
- client/index.ts
- scripts
- model-management/catalog.ts
- RunTaskLaneUseCase.ts
- infrastructure/playground.ts
- mcp/server.ts
- createProjectRows
- package.json
- ProjectsStore
- Project
- app-services/context.ts
- BuilderWorkflowPorts
- guides.ts
- projectIndex.ts
- server/index.ts
- database/index.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- BuilderWorkflow.ts
- PostgresProjectsStore
- createJobQueue
- AgentExecutionPorts
- ApplicationLifecycle
- mcp/jobs.ts
- GithubGateway
- IntegrationRepository
- IOrganizationRepository
- AppEnv
- services
- app-services/realtime.ts
- Account
- app-runtime/index.ts
- OrchestrationPolicy.ts
- q
- CreateProjectUseCase.ts
- TEST_DATABASE_URL
- TurnFeedbackPorts.ts
- domain/score.ts
- Changes.tsx
- ISettingsStore
- model-management/index.ts
- RunAgentUseCase.ts
- IPasswordHasher
- FileMap
- modules/builder/index.ts
- BootstrapService
- e2e.mjs
- createJobs
- modules/projects/index.ts
- executeRun
- app-runtime/infrastructure/browser.ts
- app-services/payments.ts
- app-services/email.ts
- react
- usage/usage.ts
- toolOutputs.test.ts
- settingReactions.ts
- Workspace.tsx
- Evals.tsx
- apiTypes.test.ts
- OrganizationSkillsService.ts
- domain/securityScan.ts
- Memory.tsx
- app-services/analytics.ts
- ports.ts
- createGithubSyncService
- model-management/providers.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- BuilderRunRegistry
- ref_node_path
- { api, auth, storage, ai }
- SettingDefinition
- execution.test.ts
- Author
- builderService.ts
- collaboration/ports/repositories.ts
- postgres
- healthcheck
- AuthPorts
- app-runtime
- InviteMemberUseCase.ts
- build
- createSecrets
- PlatformSettingsService
- accountLifecycle.ts
- builder
- infrastructure/appDataService.ts
- application.test.ts
- replaceVisibleText
- forja
- FinishGateAdapter.ts
- safeFetch.ts
- ProjectDbClient
- accounts.ts
- app-services/context.ts
- PostgresApiTokenRepository
- integrations/github.ts
- agents.mjs
- ContextPorts
- app-services/projectDb.ts
- spring.ts
- collaboration/postgresAdapters.test.ts
- job-worker
- crypto.ts
- bootstrap/server.ts
- securityReview.ts
- createAuth
- forms.tsx
- sha256
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- AgentExecutionSpec
- Plan
- createProblemService
- FastBuildPorts
- Review Focus
- PostgresProviderRepository.ts
- GithubAuthorization
- http.test.ts
- GithubProjectPorts
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- service-control/application/controller.ts
- architecture.test.ts
- settings/index.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 140 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 73 edges
4. `react` - 46 edges
5. `createIdentityModule()` - 42 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 36 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts
- `Avance` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (188 total, 31 thin omitted)

### Community 0 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (37): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+29 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (67): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+59 more)

### Community 4 - "vitest"
Cohesion: 0.15
Nodes (14): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, ROOT_DIR, migrate(), MIGRATIONS_DIR, drop(), freshDatabase() (+6 more)

### Community 5 - "AgentExecution.ts"
Cohesion: 0.13
Nodes (11): RunTaskLaneUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), LaneTask, TaskLaneHooks, TaskLanePorts (+3 more)

### Community 6 - "appServer.ts"
Cohesion: 0.11
Nodes (39): formatProblem(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+31 more)

### Community 7 - "http-client.ts"
Cohesion: 0.08
Nodes (23): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases(), transport (+15 more)

### Community 8 - "composition.ts"
Cohesion: 0.10
Nodes (31): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+23 more)

### Community 9 - "roles.ts"
Cohesion: 0.09
Nodes (21): AgentToolRole, allowedToolsForRole(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FIRST_BUILD (+13 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "domain/services.ts"
Cohesion: 0.10
Nodes (28): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), FileMap, endpointRoutes() (+20 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.08
Nodes (19): requestSecret, assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), ownsFile(), assertOwnerRequestedForget() (+11 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 14 - "timeAgo"
Cohesion: 0.09
Nodes (37): Account(), DeleteAccount(), PasswordSection(), Row(), Token, api, integrationsController, GithubCard (+29 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (49): 6. IA dentro de las apps, Pruebas de conexión, ScheduleTasksUseCase, rewardOf(), formatStandard(), active, AgentResult, background() (+41 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "skills.test.ts"
Cohesion: 0.16
Nodes (19): builderTools, BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED (+11 more)

### Community 19 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 20 - "bootstrap/coreModules.ts"
Cohesion: 0.17
Nodes (6): CoreModulesDependencies, createCoreModules(), createSettingsModule(), PostgresPlatformSettingsStoreAdapter, newToken(), numericCode()

### Community 21 - "sandbox.ts"
Cohesion: 0.07
Nodes (27): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+19 more)

### Community 22 - "modules/identity/index.ts"
Cohesion: 0.10
Nodes (14): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, PlatformRole, IdentityModuleDependencies, PlatformMailerService, AccountRow (+6 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.12
Nodes (24): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, CompatEndpoint (+16 more)

### Community 24 - "urls.ts"
Cohesion: 0.16
Nodes (14): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+6 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (45): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+37 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.06
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+14 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (16): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, ProjectsModuleDependencies, ordersInvoicesFiles(), IProjectFileRepository, app (+8 more)

### Community 29 - "Plan.ts"
Cohesion: 0.12
Nodes (18): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), criteriaOf(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS (+10 more)

### Community 30 - "vitest"
Cohesion: 0.10
Nodes (13): @electric-sql/pglite, vitest, TransactionAction, createProjectRowsRepository(), projectRowsRepository, authRepository(), createAuthRepository(), createQueryRepository() (+5 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (44): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+36 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.05
Nodes (64): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, call(), readServiceRuntime(), restartServiceRuntime(), aiUsage (+56 more)

### Community 33 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (16): 6. API de administración, providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+8 more)

### Community 34 - "appRuntimeHttp.ts"
Cohesion: 0.13
Nodes (9): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+1 more)

### Community 35 - "app-services/storage.ts"
Cohesion: 0.09
Nodes (13): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, JOB_LIMITS, MAX_FILE_BYTES, safeStorageKey() (+5 more)

### Community 36 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (35): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+27 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (17): createCatalogService(), deleteModel(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), updateProjectModels(), creditsAtRate() (+9 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (26): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+18 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.11
Nodes (23): createModelManagementQueries(), routerAudit(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), taskClassOf() (+15 more)

### Community 42 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "model-management/catalog.ts"
Cohesion: 0.17
Nodes (18): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels(), catalog() (+10 more)

### Community 45 - "RunTaskLaneUseCase.ts"
Cohesion: 0.15
Nodes (8): ListAgentTasksUseCase, TaskLifecycleUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, AgentTaskRepository, TaskCompletion

### Community 46 - "infrastructure/playground.ts"
Cohesion: 0.11
Nodes (30): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+22 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.10
Nodes (22): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+14 more)

### Community 48 - "createProjectRows"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+34 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "app-services/context.ts"
Cohesion: 0.11
Nodes (12): AiUnavailableError, createAi(), appAiChat(), bindJobs, aiPorts, jobPorts, configureAppServiceObserver(), log() (+4 more)

### Community 54 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "database/index.ts"
Cohesion: 0.09
Nodes (23): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, [command, ...flags], main() (+15 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+25 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 68 - "AgentExecutionPorts"
Cohesion: 0.16
Nodes (6): Block, ExecutionTool, Message, ToolDefinition, Usage, AgentExecutionPorts

### Community 69 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 70 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 72 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "AppEnv"
Cohesion: 0.09
Nodes (16): ClaimedJob, AiBlock, AppAiInput, AppAiResult, AppEnv, AppUser, CheckoutInput, EmailResult (+8 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "app-services/realtime.ts"
Cohesion: 0.25
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 77 - "Account"
Cohesion: 0.11
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.10
Nodes (20): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation(), configureRuntimeProjects() (+12 more)

### Community 79 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 80 - "q"
Cohesion: 0.06
Nodes (11): createDevelopmentSeed(), DEV_FIXTURE, Fixture, PostgresMemberRepository, PostgresOrganizationRepository, PostgresAccountLifecycleRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository (+3 more)

### Community 81 - "CreateProjectUseCase.ts"
Cohesion: 0.15
Nodes (10): CreateProjectInput, CreateProjectUseCase, parseStarterTemplate(), starterFiles(), StarterTemplate, starterFiles(), ProjectServices, fixture() (+2 more)

### Community 83 - "TurnFeedbackPorts.ts"
Cohesion: 0.13
Nodes (19): createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback, routingPorts, TurnFeedbackPorts (+11 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "ISettingsStore"
Cohesion: 0.24
Nodes (5): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 88 - "model-management/index.ts"
Cohesion: 0.10
Nodes (33): AgentSpec, TurnState, Catalog, KEYWORDS, LAMBDA, RoleProfile, ROLES, Posterior (+25 more)

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.21
Nodes (19): GATE_FIXES, summarize(), addUsage(), emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+11 more)

### Community 90 - "IPasswordHasher"
Cohesion: 0.12
Nodes (8): BcryptArgonPasswordHasher, IPasswordHasher, burnPasswordCheck(), hashPassword(), passwordNeedsRehash(), scryptKey(), verifyPassword(), withSlot()

### Community 91 - "FileMap"
Cohesion: 0.15
Nodes (22): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, pageRoutes(), buildClient(), BuildError (+14 more)

### Community 92 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (33): app, lifecycle, monolith, stopRuntimeEventRelay(), AgentResult, calculateSpendUseCase, toolRegistry, runAgent() (+25 more)

### Community 93 - "BootstrapService"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 95 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 96 - "modules/projects/index.ts"
Cohesion: 0.17
Nodes (13): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, ProjectPatch, ProjectProfile (+5 more)

### Community 97 - "executeRun"
Cohesion: 0.19
Nodes (8): ActiveRun, executeRun(), Ledger, Outcome, recoverRuns(), RunPorts, CaseResult, run()

### Community 98 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.18
Nodes (15): allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser(), inspectPreview(), launch() (+7 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "app-services/email.ts"
Cohesion: 0.21
Nodes (7): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), sendPlatformEmail, emailPorts, resetTransport()

### Community 101 - "react"
Cohesion: 0.09
Nodes (26): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+18 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "toolOutputs.test.ts"
Cohesion: 0.18
Nodes (7): out(), dir, monolith, seedLocal, BEFORE, conforms(), dir

### Community 104 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 105 - "Workspace.tsx"
Cohesion: 0.08
Nodes (42): api, CreateProjectOptions, Dashboard(), DeleteDialog(), IDEAS, Sort, SORT_LABEL, Status (+34 more)

### Community 106 - "Evals.tsx"
Cohesion: 0.23
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 111 - "app-services/analytics.ts"
Cohesion: 0.19
Nodes (10): recordPageView, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays() (+2 more)

### Community 112 - "ports.ts"
Cohesion: 0.10
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 114 - "model-management/providers.ts"
Cohesion: 0.11
Nodes (25): audit(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformModelManagement(), createCatalogSync(), lastSync(), startCatalogSync() (+17 more)

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.27
Nodes (9): createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "ref_node_path"
Cohesion: 0.14
Nodes (9): vite, studioPwa(), here, dir, database, root, sources(), files() (+1 more)

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 124 - "Author"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 125 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 126 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "AuthPorts"
Cohesion: 0.14
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "InviteMemberUseCase.ts"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (8): COMMON_PASSWORDS, Password, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, IdentityRandom

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "infrastructure/appDataService.ts"
Cohesion: 0.19
Nodes (5): AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, isInternalServiceRequest()

### Community 138 - "application.test.ts"
Cohesion: 0.08
Nodes (15): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+7 more)

### Community 139 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.12
Nodes (14): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+6 more)

### Community 142 - "safeFetch.ts"
Cohesion: 0.15
Nodes (6): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate(), endpoint()

### Community 144 - "accounts.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 145 - "app-services/context.ts"
Cohesion: 0.09
Nodes (11): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 146 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 147 - "integrations/github.ts"
Cohesion: 0.11
Nodes (23): GithubError, Link, SyncResult, accountStatus, connectAccount, createRepo, disconnectAccount, getLink (+15 more)

### Community 148 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 150 - "app-services/projectDb.ts"
Cohesion: 0.17
Nodes (22): app, monolith, runtimePorts, startHttp(), wss, cloneDatabase(), closeAll(), closeProject() (+14 more)

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "crypto.ts"
Cohesion: 0.18
Nodes (10): LEGACY, SCRYPT, waiting, createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder (+2 more)

### Community 155 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (31): lifecycle, withDefaultHeaders(), lifecycle, monolith, server, app, handleMcp, lifecycle (+23 more)

### Community 156 - "securityReview.ts"
Cohesion: 0.18
Nodes (9): describeSchema, BuilderTool, typed(), Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview() (+1 more)

### Community 157 - "createAuth"
Cohesion: 0.12
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 163 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 164 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 166 - "Review Focus"
Cohesion: 0.25
Nodes (7): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 167 - "PostgresProviderRepository.ts"
Cohesion: 0.38
Nodes (6): encryptHeaders(), Input, postgresProviderRepository, decrypt(), encrypt(), key()

### Community 169 - "http.test.ts"
Cohesion: 0.16
Nodes (13): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+5 more)

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 176 - "service-control/application/controller.ts"
Cohesion: 0.27
Nodes (8): serviceControlController, transport, Actions, ServiceCard(), ServiceControlPanel(), ServiceControlView(), ControlledService, ServiceControlSnapshot

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.23
Nodes (14): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+6 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1258 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `ProviderService.ts`, `vitest`, `AgentExecution.ts`, `http-client.ts`, `composition.ts`, `domain/services.ts`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `skills.test.ts`, `sandbox.ts`, `modules/identity/index.ts`, `domain/messages.ts`, `project-observability/problems.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `Plan.ts`, `studioApi.ts`, `appRuntimeHttp.ts`, `models.ts`, `projects/application/usecases.ts`, `createCollaborationModule`, `model-management/router.ts`, `client/index.ts`, `RunTaskLaneUseCase.ts`, `mcp/server.ts`, `package.json`, `app-services/context.ts`, `guides.ts`, `projectIndex.ts`, `createIdentityModule`, `deps.ts`, `BuilderWorkflow.ts`, `AgentExecutionPorts`, `ApplicationLifecycle`, `mcp/jobs.ts`, `IntegrationRepository`, `IOrganizationRepository`, `app-runtime/index.ts`, `CreateProjectUseCase.ts`, `TurnFeedbackPorts.ts`, `deps.test.ts`, `domain/score.ts`, `Changes.tsx`, `ISettingsStore`, `model-management/index.ts`, `RunAgentUseCase.ts`, `modules/builder/index.ts`, `BootstrapService`, `executeRun`, `app-services/payments.ts`, `usage/usage.ts`, `toolOutputs.test.ts`, `settingReactions.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `model-management/providers.ts`, `devDependencies`, `RouterAdministration.ts`, `BuilderRunRegistry`, `ref_node_path`, `SettingDefinition`, `execution.test.ts`, `Author`, `builderService.ts`, `collaboration/ports/repositories.ts`, `InviteMemberUseCase.ts`, `PlatformSettingsService`, `accountLifecycle.ts`, `replaceVisibleText`, `FinishGateAdapter.ts`, `safeFetch.ts`, `accounts.ts`, `app-services/context.ts`, `integrations/github.ts`, `collaboration/postgresAdapters.test.ts`, `crypto.ts`, `bootstrap/server.ts`, `http.test.ts`, `service-control/application/controller.ts`, `architecture.test.ts`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11945031712473574 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `Chat.tsx`, `react`, `http-client.ts`, `projects/application/usecases.ts`, `Workspace.tsx`, `client/index.ts`, `Evals.tsx`, `timeAgo`, `Memory.tsx`, `service-control/application/controller.ts`, `package.json`, `Changes.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053998632946001365 - nodes in this community are weakly interconnected._