# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 679 files · ~310,206 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4524 nodes · 11870 edges · 195 communities (162 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 626 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79e1a23e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- model-management/providers.ts
- index.tsx
- ProjectsApplication.ts
- Chat.tsx
- modules/projects/index.ts
- ProviderService.ts
- appServer.ts
- http-client.ts
- AgentExecution.ts
- one
- with
- textOf
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- mcp/jobs.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- infrastructure/repositories.ts
- infrastructure/runner.ts
- adminApi.ts
- modules/builder/index.ts
- modules/identity/index.ts
- FusionOrchestrator.ts
- app-runtime/infrastructure/browser.ts
- react
- BuilderToolsAdapter.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- config.ts
- ProjectView.tsx
- studioApi.ts
- FileMap
- appRuntimeServer.ts
- projectIndex.ts
- createJobs
- compilerOptions
- models.ts
- skills.test.ts
- PostgresOrganizationRepository.ts
- roles.ts
- client.ts
- scripts
- builderService.ts
- composition.ts
- model-management/index.ts
- mcp/server.ts
- ref_node_path
- package.json
- ProjectsStore
- Project
- Panel de administración del sistema — diseño
- BuilderWorkflowPorts
- usage/usage.ts
- bootstrap/server.ts
- server/index.ts
- policies.test.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- platformDb
- PostgresProjectsStore
- RunTaskLaneUseCase.ts
- integrations/index.ts
- domain/messages.ts
- ProjectSandbox
- GithubGateway
- IOrganizationRepository
- Account
- services
- projects/application/usecases.ts
- studio.mjs
- integrations/github.ts
- e2e.mjs
- builder/contracts.ts
- Workspace.tsx
- TEST_DATABASE_URL
- model-management/router.ts
- fusion.test.ts
- domain/score.ts
- AuthPorts
- app-services/analytics.ts
- FusionOrchestrator.ts
- Desplegar Forja en Coolify
- createCollaborationModule
- infrastructure/probe.ts
- infrastructure/projects.ts
- BootstrapService
- ProjectServices
- github.mjs
- agents.mjs
- OrchestrationPolicy.ts
- BuilderWorkflow.ts
- builderServer.ts
- ApplicationLifecycle
- IntegrationRepository
- client/index.ts
- http.test.ts
- ExecutionAudit.ts
- internal/router.ts
- createSecrets
- apiTypes.test.ts
- OrganizationSkillsService.ts
- accountLifecycle.ts
- unit/catalog.test.ts
- infrastructure/repositories.ts
- ports.ts
- createGithubSyncService
- devDependencies
- domain/securityScan.ts
- ISettingsStore
- RouterAdministration.ts
- platform.ts
- collaboration/postgresAdapters.test.ts
- SqlAgentTaskRepository.ts
- { api, auth, storage, ai }
- SettingDefinition
- App.tsx
- cli.ts
- Plan
- models/presentation/Models.tsx
- postgres
- healthcheck
- AppEnv
- app-runtime
- collaboration/ports/repositories.ts
- build
- react-dom
- PlatformSettingsService
- domain/contracts.ts
- builder
- GithubAccountRepository
- application.test.ts
- shared/security.ts
- forja
- FinishGateAdapter.ts
- InviteMemberUseCase.ts
- Inventario de funciones de Lovable → Forja
- policies.test.ts
- application/context.ts
- ContextPorts
- forms.tsx
- vitest
- AccountLifecycleRepository
- projectMicroservices.test.ts
- app-services/realtime.ts
- http.test.ts
- job-worker
- crypto.ts
- GithubError
- createProblemService
- createAuth
- PostgresPlatformSettingsStoreAdapter
- JobRuntimePorts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- GithubAuthorization
- spring.ts
- GithubProjectPorts
- settingReactions.ts
- RealtimeTransport
- ApiError
- BuilderRunRegistry
- replaceVisibleText
- createJobQueue
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- createAdminMcpHandler
- execution.test.ts
- ServiceControlPanel.tsx
- Cómo está hecho
- architecture.test.ts
- q
- Audit.tsx
- motion.tsx
- AgentExecutionSpec
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
1. `vitest` - 154 edges
2. `q()` - 110 edges
3. `createStudioApi()` - 73 edges
4. `react` - 48 edges
5. `createIdentityModule()` - 46 edges
6. `one()` - 42 edges
7. `ProjectsStore` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 36 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts

## Import Cycles
- None detected.

## Communities (195 total, 33 thin omitted)

### Community 0 - "model-management/providers.ts"
Cohesion: 0.11
Nodes (32): `llm/catalog.ts`, tasks, allowedModels(), availableModels(), catalog(), deleteModel(), lastSync(), listCatalog() (+24 more)

### Community 1 - "index.tsx"
Cohesion: 0.19
Nodes (15): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 2 - "ProjectsApplication.ts"
Cohesion: 0.17
Nodes (13): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, Checkpoint, CheckpointProps, parseStarterTemplate(), starterFiles() (+5 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 4 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (16): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, normalizeProjectProfile(), ProjectPatch (+8 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), ProviderError (+6 more)

### Community 6 - "appServer.ts"
Cohesion: 0.08
Nodes (54): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+46 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (26): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+18 more)

### Community 8 - "AgentExecution.ts"
Cohesion: 0.13
Nodes (15): GATE_FIXES, addUsage(), Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, emptyUsage() (+7 more)

### Community 9 - "one"
Cohesion: 0.10
Nodes (12): AccountProps, PlatformRole, Email, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView (+4 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "textOf"
Cohesion: 0.11
Nodes (21): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, CompatEndpoint, anthropicChat(), getClient() (+13 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (20): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), ownsFile(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+12 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (48): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), active (+40 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "infrastructure/repositories.ts"
Cohesion: 0.05
Nodes (22): @electric-sql/pglite, createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask() (+14 more)

### Community 19 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (38): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+30 more)

### Community 20 - "adminApi.ts"
Cohesion: 0.10
Nodes (31): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+23 more)

### Community 21 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (37): AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), toolByName, bindBuilderCoreModules(), readFile() (+29 more)

### Community 22 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (9): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IAccountRepository, ILoginCodeRepository, IMailerService, IPasswordHasher (+1 more)

### Community 23 - "FusionOrchestrator.ts"
Cohesion: 0.26
Nodes (22): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+14 more)

### Community 24 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 25 - "react"
Cohesion: 0.07
Nodes (59): radix-ui@^1.8.1, radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent (+51 more)

### Community 26 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+14 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Plan.ts"
Cohesion: 0.13
Nodes (18): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+10 more)

### Community 30 - "config.ts"
Cohesion: 0.10
Nodes (20): zod@^4.6.7, zod, callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall, beginTransaction(), dispatch(), getSandboxServices() (+12 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (64): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+56 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (57): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+49 more)

### Community 33 - "FileMap"
Cohesion: 0.09
Nodes (37): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes(), exampleFiles() (+29 more)

### Community 34 - "appRuntimeServer.ts"
Cohesion: 0.11
Nodes (15): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+7 more)

### Community 35 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 36 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.09
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+23 more)

### Community 39 - "skills.test.ts"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 40 - "PostgresOrganizationRepository.ts"
Cohesion: 0.12
Nodes (9): OrganizationNamesQuery, OrganizationQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView, Org, OrgMemberView (+1 more)

### Community 41 - "roles.ts"
Cohesion: 0.07
Nodes (25): PLAN_DOC, PLAN_SECTIONS, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT (+17 more)

### Community 42 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 45 - "composition.ts"
Cohesion: 0.08
Nodes (40): createMonolith(), startBindings(), stopBindings(), bindJobs, sendEmail, configureJobRuntime(), jobPorts, configureAppServiceObserver() (+32 more)

### Community 46 - "model-management/index.ts"
Cohesion: 0.11
Nodes (24): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService() (+16 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.10
Nodes (28): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+20 more)

### Community 48 - "ref_node_path"
Cohesion: 0.21
Nodes (7): vite, studioPwa(), here, root, sources(), files(), scopes

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5 (+28 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Panel de administración del sistema — diseño"
Cohesion: 0.07
Nodes (27): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad (+19 more)

### Community 54 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 55 - "bootstrap/server.ts"
Cohesion: 0.11
Nodes (14): withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions, resolveApp() (+6 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "policies.test.ts"
Cohesion: 0.15
Nodes (12): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+4 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.13
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (37): createDependencyResolution(), KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion(), Deps (+29 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "platformDb"
Cohesion: 0.13
Nodes (21): lifecycle, lifecycle, monolith, server, lifecycle, seedLocal, stopRuntimeEventRelay(), stopAppRuntime() (+13 more)

### Community 67 - "RunTaskLaneUseCase.ts"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 68 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 69 - "domain/messages.ts"
Cohesion: 0.16
Nodes (17): ClassificationPorts, createModelClassification(), importProviderModels(), parseModelClassifications(), addUsage(), emptyUsage(), LlmTool, billing (+9 more)

### Community 70 - "ProjectSandbox"
Cohesion: 0.22
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 71 - "GithubGateway"
Cohesion: 0.19
Nodes (4): Registro, GithubGateway, Link, SyncResult

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "projects/application/usecases.ts"
Cohesion: 0.06
Nodes (43): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+35 more)

### Community 77 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 78 - "integrations/github.ts"
Cohesion: 0.14
Nodes (18): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+10 more)

### Community 79 - "e2e.mjs"
Cohesion: 0.13
Nodes (7): DATA, jar, req(), ROOT, server, signInAs(), dir

### Community 80 - "builder/contracts.ts"
Cohesion: 0.23
Nodes (16): summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS (+8 more)

### Community 81 - "Workspace.tsx"
Cohesion: 0.08
Nodes (39): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+31 more)

### Community 83 - "model-management/router.ts"
Cohesion: 0.09
Nodes (28): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors (+20 more)

### Community 84 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 87 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 88 - "FusionOrchestrator.ts"
Cohesion: 0.09
Nodes (31): TurnState, KEYWORDS, RoleProfile, ROLES, ExecutionContextMetrics, FusionBudget, FusionEffort, FusionPhase (+23 more)

### Community 89 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 90 - "createCollaborationModule"
Cohesion: 0.26
Nodes (4): MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 91 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 92 - "infrastructure/projects.ts"
Cohesion: 0.07
Nodes (28): RuntimeProjectsPort, ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, ServiceExecution (+20 more)

### Community 93 - "BootstrapService"
Cohesion: 0.11
Nodes (11): BootstrapService, SetupError, AdminApiTokenError, COMMON_PASSWORDS, Password, IdentityModuleDependencies, IdentityAccountsDependencies, BootstrapAccounts (+3 more)

### Community 94 - "ProjectServices"
Cohesion: 0.17
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 95 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 96 - "agents.mjs"
Cohesion: 0.09
Nodes (19): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+11 more)

### Community 97 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 98 - "BuilderWorkflow.ts"
Cohesion: 0.16
Nodes (9): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), FastBuildPorts (+1 more)

### Community 99 - "builderServer.ts"
Cohesion: 0.21
Nodes (11): @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), runBuilderTurn(), stopBuilder() (+3 more)

### Community 100 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 101 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 102 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 103 - "http.test.ts"
Cohesion: 0.10
Nodes (21): DEV_FIXTURE, Fixture, ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds (+13 more)

### Community 104 - "ExecutionAudit.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 105 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 106 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.44
Nodes (7): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), builderTools

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (8): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom, PasswordResetRepository, state

### Community 110 - "unit/catalog.test.ts"
Cohesion: 0.11
Nodes (15): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+7 more)

### Community 111 - "infrastructure/repositories.ts"
Cohesion: 0.20
Nodes (10): projectDb(), authRepository(), createQueryRepository(), platformRepository, schemaRows(), statement(), statements, storagePorts (+2 more)

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, ProjectCompilerPort, createPublication() (+11 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 114 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 115 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 116 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.25
Nodes (9): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.14
Nodes (10): PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository (+2 more)

### Community 120 - "SqlAgentTaskRepository.ts"
Cohesion: 0.26
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "App.tsx"
Cohesion: 0.10
Nodes (26): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+18 more)

### Community 124 - "cli.ts"
Cohesion: 0.19
Nodes (12): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+4 more)

### Community 125 - "Plan"
Cohesion: 0.25
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "AppEnv"
Cohesion: 0.08
Nodes (10): ClaimedJob, AppEnv, JobsApi, EmailPorts, JobCron, JobPorts, AppServiceEvent, ObserverPorts (+2 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 134 - "PlatformSettingsService"
Cohesion: 0.24
Nodes (5): PlatformSettingsService, SettingsError, SettingsDependencies, fixture(), fixture()

### Community 135 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 138 - "application.test.ts"
Cohesion: 0.07
Nodes (21): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+13 more)

### Community 139 - "shared/security.ts"
Cohesion: 0.24
Nodes (8): clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup(), STUDIO_HEADERS

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (16): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, FileMap (+8 more)

### Community 142 - "InviteMemberUseCase.ts"
Cohesion: 0.17
Nodes (6): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, ICollaborationMailerService

### Community 143 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 144 - "policies.test.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 145 - "application/context.ts"
Cohesion: 0.09
Nodes (11): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 146 - "ContextPorts"
Cohesion: 0.17
Nodes (4): CheckoutInput, EmailResult, StoredObject, ContextPorts

### Community 147 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 148 - "vitest"
Cohesion: 0.09
Nodes (30): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, createTestCoreModules() (+22 more)

### Community 150 - "projectMicroservices.test.ts"
Cohesion: 0.20
Nodes (5): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate()

### Community 151 - "app-services/realtime.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 152 - "http.test.ts"
Cohesion: 0.20
Nodes (9): account, app, collaboration, identity, mocks, models, projects, settings (+1 more)

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "crypto.ts"
Cohesion: 0.11
Nodes (18): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+10 more)

### Community 155 - "GithubError"
Cohesion: 0.22
Nodes (8): connectAccount(), GithubError, gh(), tokenFor(), encryptHeaders(), decrypt(), encrypt(), key()

### Community 156 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 163 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 165 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 168 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 169 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 170 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 174 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 175 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 177 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "q"
Cohesion: 0.08
Nodes (7): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, recordClassificationUsage(), q()

### Community 180 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 181 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1322 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `model-management/providers.ts`, `ProjectsApplication.ts`, `Chat.tsx`, `modules/projects/index.ts`, `ProviderService.ts`, `http-client.ts`, `AgentExecution.ts`, `one`, `textOf`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `mcp/jobs.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `infrastructure/repositories.ts`, `adminApi.ts`, `modules/builder/index.ts`, `modules/identity/index.ts`, `BuilderToolsAdapter.ts`, `modules/projects/index.ts`, `Plan.ts`, `config.ts`, `ProjectView.tsx`, `FileMap`, `projectIndex.ts`, `models.ts`, `skills.test.ts`, `roles.ts`, `builderService.ts`, `composition.ts`, `model-management/index.ts`, `mcp/server.ts`, `ref_node_path`, `package.json`, `Panel de administración del sistema — diseño`, `usage/usage.ts`, `bootstrap/server.ts`, `policies.test.ts`, `createIdentityModule`, `RunTaskLaneUseCase.ts`, `domain/messages.ts`, `deps.test.ts`, `IOrganizationRepository`, `projects/application/usecases.ts`, `integrations/github.ts`, `e2e.mjs`, `builder/contracts.ts`, `model-management/router.ts`, `fusion.test.ts`, `domain/score.ts`, `createCollaborationModule`, `infrastructure/probe.ts`, `infrastructure/projects.ts`, `BootstrapService`, `BuilderWorkflow.ts`, `builderServer.ts`, `ApplicationLifecycle`, `IntegrationRepository`, `http.test.ts`, `ExecutionAudit.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `accountLifecycle.ts`, `unit/catalog.test.ts`, `ports.ts`, `createGithubSyncService`, `devDependencies`, `ISettingsStore`, `RouterAdministration.ts`, `collaboration/postgresAdapters.test.ts`, `SqlAgentTaskRepository.ts`, `SettingDefinition`, `collaboration/ports/repositories.ts`, `react-dom`, `PlatformSettingsService`, `GithubAccountRepository`, `application.test.ts`, `shared/security.ts`, `FinishGateAdapter.ts`, `InviteMemberUseCase.ts`, `application/context.ts`, `projectMicroservices.test.ts`, `http.test.ts`, `crypto.ts`, `settingReactions.ts`, `ApiError`, `BuilderRunRegistry`, `replaceVisibleText`, `createAdminMcpHandler`, `execution.test.ts`, `ServiceControlPanel.tsx`, `architecture.test.ts`, `Audit.tsx`?**
  _High betweenness centrality (0.294) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `model-management/providers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10931174089068826 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `integrations/index.ts`, `react-dom`, `client/index.ts`, `http-client.ts`, `internal/router.ts`, `projects/application/usecases.ts`, `ServiceControlPanel.tsx`, `package.json`, `Workspace.tsx`, `forms.tsx`, `Audit.tsx`, `motion.tsx`, `App.tsx`, `models/presentation/Models.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0496620628856891 - nodes in this community are weakly interconnected._