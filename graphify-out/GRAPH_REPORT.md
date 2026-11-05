# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 639 files · ~283,047 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4310 nodes · 11125 edges · 180 communities (150 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 599 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4db9cd00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ProviderService.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- vitest
- model-management/providers.ts
- appServer.ts
- http-client.ts
- composition.ts
- model-management/index.ts
- with
- domain/services.ts
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- Workspace.tsx
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- skills.test.ts
- studio.mjs
- AppEnv
- ProjectSandbox
- Account
- domain/messages.ts
- urls.ts
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- App.tsx
- ProjectView.tsx
- studioApi.ts
- IdentityRandom
- appRuntimeHttp.ts
- app-services/storage.ts
- Desplegar Forja en Coolify
- compilerOptions
- models.ts
- projects/application/usecases.ts
- createCollaborationModule
- model-management/router.ts
- client.ts
- scripts
- model-management/catalog.ts
- SqlAgentTaskRepository.ts
- adminApi.ts
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
- cli.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- project-observability/security.ts
- PostgresProjectsStore
- client/index.ts
- internal/router.ts
- roles.ts
- mcp/jobs.ts
- GithubGateway
- IntegrationRepository
- IOrganizationRepository
- application/serviceControl.ts
- services
- OrgRole
- Panel de administración del sistema — diseño
- app-runtime/index.ts
- typecheck.ts
- q
- ProjectServices
- TEST_DATABASE_URL
- TurnFeedbackPorts.ts
- AgentExecution.ts
- domain/score.ts
- Changes.tsx
- ISettingsStore
- model-management/index.ts
- RunAgentUseCase.ts
- crypto.ts
- Inventario de funciones de Lovable → Forja
- config.ts
- BootstrapService
- e2e.mjs
- createJobs
- modules/projects/index.ts
- AuthPorts
- AgentExecutionAdapter.ts
- app-services/payments.ts
- format.ts
- models/presentation/Models.tsx
- usage/usage.ts
- database/index.ts
- .execute
- integrations/index.ts
- policies.ts
- apiTypes.test.ts
- OrganizationSkillsService.ts
- domain/securityScan.ts
- Memory.tsx
- app-services/analytics.ts
- ports.ts
- createGithubSyncService
- PostgresCatalogRepository.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- AgentExecutionResult
- ref_node_path
- { api, auth, storage, ai }
- SettingDefinition
- Cómo está hecho
- PostgresPlatformSettingsStoreAdapter
- modules/builder/index.ts
- react-dom
- postgres
- healthcheck
- AgentExecutionPorts
- app-runtime
- modules/collaboration/index.ts
- build
- motion.tsx
- PlatformSettingsService
- accountLifecycle.ts
- builder
- infrastructure/appDataService.ts
- application.test.ts
- RealtimeTransport
- forja
- FinishGateAdapter.ts
- ApiError
- accounts.ts
- app-services/context.ts
- integrations/github.ts
- agents.dbg.mjs
- ports/context.ts
- spring.ts
- collaboration/postgresAdapters.test.ts
- job-worker
- bootstrap/server.ts
- Account
- createAuth
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- forms.tsx
- Review Focus
- GithubAuthorization
- developmentSeed.ts
- GithubProjectPorts
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- ServiceControlPanel.tsx
- architecture.test.ts
- RunTaskLaneUseCase.ts
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
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (180 total, 30 thin omitted)

### Community 0 - "ProviderService.ts"
Cohesion: 0.12
Nodes (19): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+11 more)

### Community 1 - "index.tsx"
Cohesion: 0.20
Nodes (14): clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState() (+6 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.11
Nodes (40): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+32 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (65): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+57 more)

### Community 4 - "vitest"
Cohesion: 0.09
Nodes (21): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), drop(), freshDatabase(), TEST_DATABASE_URL (+13 more)

### Community 5 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (26): 6. API de administración, providerOf(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), tierFor(), call() (+18 more)

### Community 6 - "appServer.ts"
Cohesion: 0.07
Nodes (56): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+48 more)

### Community 7 - "http-client.ts"
Cohesion: 0.09
Nodes (20): appServicesController, createEvaluationUseCases(), createIdentityUseCases(), api, observabilityController, projectsController, transport, createProjectUseCases() (+12 more)

### Community 8 - "composition.ts"
Cohesion: 0.12
Nodes (26): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+18 more)

### Community 9 - "model-management/index.ts"
Cohesion: 0.13
Nodes (19): createModelManagementQueries(), updateProjectModels(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView, ProjectModelPatch (+11 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "domain/services.ts"
Cohesion: 0.12
Nodes (30): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes(), exampleFiles() (+22 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (20): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+12 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "Workspace.tsx"
Cohesion: 0.07
Nodes (49): SelectedElement, api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, TurnDetails() (+41 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (48): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+40 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "skills.test.ts"
Cohesion: 0.17
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 19 - "studio.mjs"
Cohesion: 0.12
Nodes (24): app, DATA, MODELS, ROOT, SEED, call(), log, reply() (+16 more)

### Community 20 - "AppEnv"
Cohesion: 0.11
Nodes (13): Run, ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop() (+5 more)

### Community 21 - "ProjectSandbox"
Cohesion: 0.20
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 22 - "Account"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.12
Nodes (23): anthropicChat(), Block, LlmMessage, LlmRequest, LlmTool, ModelCallError, textOf(), CompatEndpoint (+15 more)

### Community 24 - "urls.ts"
Cohesion: 0.09
Nodes (30): playwright-core, SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+22 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.07
Nodes (55): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+47 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.09
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Plan.ts"
Cohesion: 0.08
Nodes (26): CheckPlanUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT (+18 more)

### Community 30 - "App.tsx"
Cohesion: 0.09
Nodes (28): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+20 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.15
Nodes (37): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+29 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.05
Nodes (58): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, addTimer, cancelTimer (+50 more)

### Community 34 - "appRuntimeHttp.ts"
Cohesion: 0.07
Nodes (21): hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+13 more)

### Community 35 - "app-services/storage.ts"
Cohesion: 0.12
Nodes (10): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey(), storagePorts (+2 more)

### Community 36 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (19): createCatalogService(), deleteModel(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), Catalog, creditsAtRate() (+11 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (37): ProjectEvent, ProjectLogLine, CreateProjectOptions, isProjectLogLine(), isProjectProblem(), isRecord(), parseProjectEvent(), subscribeToProjectEvents() (+29 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 41 - "model-management/router.ts"
Cohesion: 0.12
Nodes (21): analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), useFastPath(), posteriors, gamma() (+13 more)

### Community 42 - "client.ts"
Cohesion: 0.18
Nodes (13): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler (+5 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "model-management/catalog.ts"
Cohesion: 0.19
Nodes (16): `llm/catalog.ts`, tasks, allowedModels(), availableModels(), catalog(), deleteModel(), lastSync(), listCatalog() (+8 more)

### Community 45 - "SqlAgentTaskRepository.ts"
Cohesion: 0.18
Nodes (8): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, AgentTaskRepository, TaskCompletion, mocks

### Community 46 - "adminApi.ts"
Cohesion: 0.12
Nodes (25): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+17 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (18): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+10 more)

### Community 48 - "createProjectRows"
Cohesion: 0.10
Nodes (28): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+20 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0 (+32 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.10
Nodes (11): BeforeImage, Project, ProjectProps, Visibility, ChangeEntry, PostgresProjectRepository, ProjectRow, PATCHABLE (+3 more)

### Community 52 - "app-services/context.ts"
Cohesion: 0.09
Nodes (18): @electric-sql/pglite, bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport() (+10 more)

### Community 53 - "BuilderWorkflowPorts"
Cohesion: 0.07
Nodes (13): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+5 more)

### Community 54 - "guides.ts"
Cohesion: 0.23
Nodes (10): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug() (+2 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "cli.ts"
Cohesion: 0.21
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "PostgresProjectFileRepository"
Cohesion: 0.13
Nodes (4): PostgresProjectFileRepository, platformDb, Tx, wrap()

### Community 61 - "deps.ts"
Cohesion: 0.12
Nodes (26): createDependencyResolution(), KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion(), Deps (+18 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 68 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 69 - "roles.ts"
Cohesion: 0.07
Nodes (26): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+18 more)

### Community 70 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 71 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 72 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 74 - "application/serviceControl.ts"
Cohesion: 0.15
Nodes (13): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, getSandboxServices(), restartSandboxService() (+5 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "OrgRole"
Cohesion: 0.15
Nodes (7): OrgRole, PostgresOrganizationRepository, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.11
Nodes (18): 10. Documentación, 1. Capa de datos, 3. Proveedores y modelos, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Conexión, Decisiones tomadas con el usuario (+10 more)

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.11
Nodes (20): RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation() (+12 more)

### Community 79 - "typecheck.ts"
Cohesion: 0.22
Nodes (12): checkProject, IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 80 - "q"
Cohesion: 0.07
Nodes (9): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, ApiTokenInfo, ApiTokenRepository, PasswordResetRepository (+1 more)

### Community 81 - "ProjectServices"
Cohesion: 0.18
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 83 - "TurnFeedbackPorts.ts"
Cohesion: 0.17
Nodes (16): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository (+8 more)

### Community 84 - "AgentExecution.ts"
Cohesion: 0.19
Nodes (12): summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext, ExecutionModel, ExecutionTool (+4 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.09
Nodes (35): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+27 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 88 - "model-management/index.ts"
Cohesion: 0.12
Nodes (24): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, LlmResponse (+16 more)

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.18
Nodes (17): page(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS, pruneToolResults() (+9 more)

### Community 90 - "crypto.ts"
Cohesion: 0.13
Nodes (17): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+9 more)

### Community 91 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 92 - "config.ts"
Cohesion: 0.09
Nodes (19): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall, beginTransaction(), dispatch(), sandboxes, WORKER, StepRecord (+11 more)

### Community 93 - "BootstrapService"
Cohesion: 0.15
Nodes (8): BootstrapService, SetupError, COMMON_PASSWORDS, Password, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "e2e.mjs"
Cohesion: 0.14
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 95 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 96 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (22): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+14 more)

### Community 98 - "AgentExecutionAdapter.ts"
Cohesion: 0.28
Nodes (11): runAgent(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep() (+3 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 101 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "database/index.ts"
Cohesion: 0.17
Nodes (10): ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder (+2 more)

### Community 105 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 106 - "policies.ts"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.26
Nodes (9): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), BuilderTool, builderTools (+1 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 111 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, ProjectCompilerPort, createPublication() (+11 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 114 - "PostgresCatalogRepository.ts"
Cohesion: 0.29
Nodes (6): audit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.25
Nodes (10): routerAudit(), createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "ref_node_path"
Cohesion: 0.14
Nodes (12): vite, DEV_FIXTURE, Fixture, ROOT_DIR, MIGRATIONS_DIR, studioPwa(), here, database (+4 more)

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 125 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (18): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber (+10 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "AgentExecutionPorts"
Cohesion: 0.13
Nodes (6): RunAgentUseCase, Usage, AgentExecutionPorts, fixture(), model, usage

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (17): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, OrganizationNamesQuery, RemoveMemberUseCase (+9 more)

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (8): createDevelopmentSeed(), PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, one()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "infrastructure/appDataService.ts"
Cohesion: 0.09
Nodes (10): AppDataPorts, createAppDataService(), TransactionSession, ProjectDbClient, SqlExecutionResult, TransactionAction, authRepository(), createAuthRepository() (+2 more)

### Community 138 - "application.test.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.12
Nodes (16): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+8 more)

### Community 144 - "accounts.ts"
Cohesion: 0.13
Nodes (9): createGithubAccountService(), connectAccount(), GithubAccountRepository, GithubError, Link, SyncResult, gh(), setup() (+1 more)

### Community 145 - "app-services/context.ts"
Cohesion: 0.08
Nodes (18): AiUnavailableError, createAi(), appAiChat(), AppUser, createContext(), serviceContext(), EndpointContext, enqueue() (+10 more)

### Community 147 - "integrations/github.ts"
Cohesion: 0.13
Nodes (20): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+12 more)

### Community 148 - "agents.dbg.mjs"
Cohesion: 0.17
Nodes (9): cookie(), app, DATA, MODELS, req(), ROOT, SEED, req() (+1 more)

### Community 149 - "ports/context.ts"
Cohesion: 0.09
Nodes (14): AiBlock, AppAiResult, AppUser, CheckoutInput, EmailInput, EmailResult, StoredObject, AiModel (+6 more)

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 155 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (55): @hono/node-server@^2.1.5, @hono/node-server, ApplicationLifecycle, LifecycleService, startAppRuntimeEventRelay(), lifecycle, shutdown(), app (+47 more)

### Community 156 - "Account"
Cohesion: 0.12
Nodes (7): Account, AccountProps, PlatformRole, Email, AccountRow, PostgresAccountRepository, SessionAccountRow

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 165 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 166 - "Review Focus"
Cohesion: 0.22
Nodes (8): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 169 - "developmentSeed.ts"
Cohesion: 0.11
Nodes (19): createMcpHandler(), builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration (+11 more)

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.18
Nodes (12): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+4 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "RunTaskLaneUseCase.ts"
Cohesion: 0.16
Nodes (9): RunTaskLaneUseCase, AgentEvent, AgentExecutionResult, LaneTask, TaskLaneHooks, TaskLanePorts, fixture(), result (+1 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.21
Nodes (15): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+7 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `ProviderService.ts`, `model-management/providers.ts`, `appServer.ts`, `http-client.ts`, `composition.ts`, `domain/services.ts`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `skills.test.ts`, `Account`, `domain/messages.ts`, `project-observability/problems.ts`, `modules/projects/index.ts`, `Plan.ts`, `studioApi.ts`, `models.ts`, `createCollaborationModule`, `model-management/router.ts`, `SqlAgentTaskRepository.ts`, `createProjectRows`, `package.json`, `ProjectsStore`, `app-services/context.ts`, `BuilderWorkflowPorts`, `guides.ts`, `projectIndex.ts`, `server/index.ts`, `createIdentityModule`, `deps.ts`, `project-observability/security.ts`, `mcp/jobs.ts`, `IntegrationRepository`, `IOrganizationRepository`, `application/serviceControl.ts`, `app-runtime/index.ts`, `TurnFeedbackPorts.ts`, `AgentExecution.ts`, `domain/score.ts`, `Changes.tsx`, `ISettingsStore`, `RunAgentUseCase.ts`, `crypto.ts`, `config.ts`, `BootstrapService`, `e2e.mjs`, `modules/projects/index.ts`, `usage/usage.ts`, `database/index.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `ref_node_path`, `SettingDefinition`, `modules/builder/index.ts`, `react-dom`, `AgentExecutionPorts`, `modules/collaboration/index.ts`, `PlatformSettingsService`, `accountLifecycle.ts`, `infrastructure/appDataService.ts`, `application.test.ts`, `FinishGateAdapter.ts`, `ApiError`, `accounts.ts`, `app-services/context.ts`, `integrations/github.ts`, `collaboration/postgresAdapters.test.ts`, `bootstrap/server.ts`, `Account`, `developmentSeed.ts`, `ServiceControlPanel.tsx`, `architecture.test.ts`, `RunTaskLaneUseCase.ts`, `securityScan.test.ts`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProviderService.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12043010752688173 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `client/index.ts`, `internal/router.ts`, `forms.tsx`, `motion.tsx`, `format.ts`, `Chat.tsx`, `integrations/index.ts`, `models/presentation/Models.tsx`, `projects/application/usecases.ts`, `Workspace.tsx`, `Memory.tsx`, `ServiceControlPanel.tsx`, `package.json`, `Changes.tsx`, `react-dom`, `App.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11436170212765957 - nodes in this community are weakly interconnected._