# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 682 files · ~311,824 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4533 nodes · 11899 edges · 184 communities (153 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 626 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `705e5d3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- model-management/providers.ts
- index.tsx
- ProjectsApplication.ts
- Chat.tsx
- ProjectPatch
- ProviderService.ts
- appServer.ts
- http-client.ts
- AgentExecution.ts
- one
- with
- bundler.ts
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- modules/builder/index.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- projectRows.ts
- infrastructure/runner.ts
- adminApi.ts
- app-services/projectDb.ts
- modules/identity/index.ts
- FusionOrchestrator.ts
- app-runtime/infrastructure/browser.ts
- react
- BuilderToolsAdapter.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- ref_node_fs
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
- collaboration/postgresAdapters.test.ts
- roles.ts
- client/index.ts
- scripts
- builderService.ts
- composition.ts
- model-management/index.ts
- mcp/server.ts
- app-runtime/services.test.ts
- package.json
- ProjectsStore
- Project
- Panel de administración del sistema — diseño
- BuilderWorkflowPorts
- usage/usage.ts
- bootstrap/server.ts
- server/index.ts
- integrations/github.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- platformDb
- PostgresProjectsStore
- RunTaskLaneUseCase.ts
- Workspace.tsx
- domain/messages.ts
- ProjectSandbox
- GithubGateway
- IOrganizationRepository
- Account
- services
- projects/application/usecases.ts
- model-management/catalog.ts
- application/security.ts
- e2e.mjs
- builder/contracts.ts
- models/presentation/Models.tsx
- TEST_DATABASE_URL
- model-management/router.ts
- fusion.test.ts
- domain/score.ts
- AuthPorts
- app-services/analytics.ts
- FusionOrchestrator.ts
- app-runtime/infrastructure/browser.ts
- createCollaborationModule
- cli.ts
- infrastructure/projects.ts
- BootstrapService
- modules/projects/index.ts
- github.mjs
- agents.mjs
- executeRun
- BuilderWorkflow.ts
- Plan.ts
- ApplicationLifecycle
- IntegrationRepository
- infrastructure/repositories.ts
- studio.mjs
- ExecutionAudit.ts
- policies.test.ts
- createSecrets
- apiTypes.test.ts
- OrganizationSkillsService.ts
- PostgresApiTokenRepository
- Review Focus
- securityReview.ts
- ports.ts
- createGithubSyncService
- devDependencies
- domain/securityScan.ts
- ISettingsStore
- RouterAdministration.ts
- platform.ts
- http.test.ts
- format.ts
- { api, auth, storage, ai }
- SettingDefinition
- App.tsx
- infrastructure/anthropic.ts
- Plan
- ISessionRepository
- postgres
- healthcheck
- AppEnv
- app-runtime
- CheckAccessUseCase.ts
- build
- Changes.tsx
- PlatformSettingsService
- ports/storage.ts
- builder
- GithubAccountRepository
- application.test.ts
- forja
- FinishGateAdapter.ts
- InviteMemberUseCase.ts
- Memory.tsx
- policies.test.ts
- application/context.ts
- Tx
- forms.tsx
- vitest
- app-services/realtime.ts
- job-worker
- crypto.ts
- accounts.ts
- createAuth
- app-services/context.ts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- GithubAuthorization
- spring.ts
- GithubProjectPorts
- settingReactions.ts
- ProjectDbClient
- BuilderRunRegistry
- AppEnv
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- ServiceControlPanel.tsx
- Inventario de interfaz de Floot → Forja
- architecture.test.ts
- q
- Audit.tsx
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
1. `vitest` - 155 edges
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

## Communities (184 total, 31 thin omitted)

### Community 0 - "model-management/providers.ts"
Cohesion: 0.26
Nodes (14): speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), createPlatformProviderService(), deleteProvider() (+6 more)

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+8 more)

### Community 2 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (46): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+38 more)

### Community 7 - "http-client.ts"
Cohesion: 0.08
Nodes (22): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases(), createIdentityUseCases() (+14 more)

### Community 8 - "AgentExecution.ts"
Cohesion: 0.10
Nodes (20): GATE_FIXES, RunAgentUseCase, addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace (+12 more)

### Community 9 - "one"
Cohesion: 0.08
Nodes (7): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, one()

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "bundler.ts"
Cohesion: 0.17
Nodes (15): createProjectCheck(), ProjectCompilerPort, FileMap, EndpointInfo, exampleFiles(), JobInfo, PageInfo, readJobSettings() (+7 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (21): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), ownsFile(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+13 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.07
Nodes (15): Block, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput, EvaluationAccount (+7 more)

### Community 14 - "modules/builder/index.ts"
Cohesion: 0.08
Nodes (34): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), bindBuilderCoreModules(), readFile(), estTokens(), GATE_THRESHOLD (+26 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (50): 6. IA dentro de las apps, Pruebas de conexión, ScheduleTasksUseCase, rewardOf(), active, AgentResult, background(), BUILDER_FILES (+42 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "projectRows.ts"
Cohesion: 0.13
Nodes (12): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+4 more)

### Community 19 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (37): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+29 more)

### Community 20 - "adminApi.ts"
Cohesion: 0.11
Nodes (31): 6. API de administración, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+23 more)

### Community 21 - "app-services/projectDb.ts"
Cohesion: 0.15
Nodes (21): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+13 more)

### Community 22 - "modules/identity/index.ts"
Cohesion: 0.10
Nodes (7): RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, PlatformMailerService, IAccountRepository, ILoginCodeRepository, IMailerService

### Community 23 - "FusionOrchestrator.ts"
Cohesion: 0.25
Nodes (23): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+15 more)

### Community 24 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.16
Nodes (14): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+6 more)

### Community 25 - "react"
Cohesion: 0.06
Nodes (68): radix-ui@^1.8.1, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+60 more)

### Community 26 - "BuilderToolsAdapter.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (9): OrganizationNamesQuery, OrganizationQueries, PersonalOrganizationUseCase, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle, IOrganizationNameDirectory (+1 more)

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "ref_node_fs"
Cohesion: 0.09
Nodes (11): dir, monolith, seedLocal, dir, root, sources(), files(), scopes (+3 more)

### Community 30 - "config.ts"
Cohesion: 0.14
Nodes (13): vite, beginTransaction(), dispatch(), sandboxes, WORKER, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl() (+5 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (56): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+48 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (46): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, analyticsSummary, listEmails, receiveEmail, sendEmail (+38 more)

### Community 33 - "FileMap"
Cohesion: 0.11
Nodes (25): createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles(), ControlledService, RuntimeService (+17 more)

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
Cohesion: 0.09
Nodes (31): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+23 more)

### Community 40 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.15
Nodes (12): IMemberQueries, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord, collaboration, collaborationAccountRepository (+4 more)

### Community 41 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 42 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "builderService.ts"
Cohesion: 0.09
Nodes (14): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+6 more)

### Community 45 - "composition.ts"
Cohesion: 0.13
Nodes (25): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+17 more)

### Community 46 - "model-management/index.ts"
Cohesion: 0.11
Nodes (24): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService() (+16 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.06
Nodes (37): DEV_FIXTURE, Fixture, AdminMcpModules, CallResult, fail(), Job, jobs, jobStatus() (+29 more)

### Community 48 - "app-runtime/services.test.ts"
Cohesion: 0.20
Nodes (12): checkProject, getSandboxServices(), restartSandboxService(), stopAllSandboxes(), call(), readServiceRuntime(), restartServiceRuntime(), runtimeSnapshot (+4 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (17): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+9 more)

### Community 54 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 55 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (26): @hono/node-server@^2.1.5, @hono/node-server, withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith (+18 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "integrations/github.ts"
Cohesion: 0.12
Nodes (20): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+12 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.13
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "PostgresProjectFileRepository"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (38): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+30 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "platformDb"
Cohesion: 0.12
Nodes (26): startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle, monolith (+18 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (18): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries (+10 more)

### Community 68 - "Workspace.tsx"
Cohesion: 0.10
Nodes (33): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+25 more)

### Community 69 - "domain/messages.ts"
Cohesion: 0.09
Nodes (32): ClassificationPorts, createModelClassification(), importProviderModels(), createModelRouter(), analyzeRequest(), pick(), parseModelClassifications(), addUsage() (+24 more)

### Community 70 - "ProjectSandbox"
Cohesion: 0.14
Nodes (7): ServiceExecution, ProjectSandbox, RunInput, SandboxRunError, ServicePool, AppEnv, JobsApi

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (9): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, OrganizationProps, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository (+1 more)

### Community 74 - "Account"
Cohesion: 0.13
Nodes (7): Account, AccountProps, PlatformRole, Email, AccountRow, PostgresAccountRepository, SessionAccountRow

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (39): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+31 more)

### Community 77 - "model-management/catalog.ts"
Cohesion: 0.09
Nodes (36): Task 3: Proveedores y modelos en BD + seeders, `llm/catalog.ts`, tasks, evaluationBuilder(), admitPlayground(), execute(), InternalRun, listPlaygroundRuns() (+28 more)

### Community 78 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 79 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 80 - "builder/contracts.ts"
Cohesion: 0.16
Nodes (21): page(), summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS (+13 more)

### Community 81 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 83 - "model-management/router.ts"
Cohesion: 0.10
Nodes (27): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), Posterior (+19 more)

### Community 84 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 87 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 88 - "FusionOrchestrator.ts"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, ExecutionContextMetrics, FusionBudget, FusionEffort (+22 more)

### Community 89 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.17
Nodes (16): playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser(), inspectPreview() (+8 more)

### Community 90 - "createCollaborationModule"
Cohesion: 0.20
Nodes (4): ClaimInvitesUseCase, MemberQueries, createCollaborationModule(), fixture()

### Community 91 - "cli.ts"
Cohesion: 0.19
Nodes (12): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+4 more)

### Community 92 - "infrastructure/projects.ts"
Cohesion: 0.09
Nodes (25): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation(), observation() (+17 more)

### Community 93 - "BootstrapService"
Cohesion: 0.10
Nodes (12): BootstrapService, SetupError, AdminApiTokenError, COMMON_PASSWORDS, Password, IdentityModuleDependencies, NodeBootstrapCrypto, IdentityAccountsDependencies (+4 more)

### Community 94 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 95 - "github.mjs"
Cohesion: 0.10
Nodes (12): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+4 more)

### Community 96 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 97 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 98 - "BuilderWorkflow.ts"
Cohesion: 0.10
Nodes (18): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+10 more)

### Community 99 - "Plan.ts"
Cohesion: 0.09
Nodes (26): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, checkContract(), checkPlanDoc(), CONTRACT_FILE, contractRoutes(), covers(), criteriaOf() (+18 more)

### Community 100 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 101 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 102 - "infrastructure/repositories.ts"
Cohesion: 0.10
Nodes (16): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, projectDb(), SqlExecutionResult, TransactionAction (+8 more)

### Community 103 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 104 - "ExecutionAudit.ts"
Cohesion: 0.08
Nodes (36): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+28 more)

### Community 105 - "policies.test.ts"
Cohesion: 0.11
Nodes (13): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+5 more)

### Community 106 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "PostgresApiTokenRepository"
Cohesion: 0.08
Nodes (7): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom, PasswordResetRepository

### Community 110 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 111 - "securityReview.ts"
Cohesion: 0.17
Nodes (8): BuilderTool, toolByName, typed(), Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview()

### Community 112 - "ports.ts"
Cohesion: 0.11
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.27
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
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "http.test.ts"
Cohesion: 0.18
Nodes (9): account, app, collaboration, identity, mocks, models, projects, settings (+1 more)

### Community 120 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "App.tsx"
Cohesion: 0.10
Nodes (27): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+19 more)

### Community 124 - "infrastructure/anthropic.ts"
Cohesion: 0.39
Nodes (5): anthropicChat(), anthropicChat(), getClient(), resetAnthropicClient(), SERVER_FALLBACK

### Community 126 - "ISessionRepository"
Cohesion: 0.20
Nodes (3): LoginWithPasswordUseCase, IPasswordHasher, ISessionRepository

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "AppEnv"
Cohesion: 0.09
Nodes (18): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+10 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "CheckAccessUseCase.ts"
Cohesion: 0.17
Nodes (7): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess, Organization, PostgresCollaborationAccountRepository, CollaborationAccount

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "Changes.tsx"
Cohesion: 0.21
Nodes (14): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+6 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 138 - "application.test.ts"
Cohesion: 0.09
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+9 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.12
Nodes (15): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, FileMap (+7 more)

### Community 142 - "InviteMemberUseCase.ts"
Cohesion: 0.10
Nodes (10): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, ICollaborationMailerService (+2 more)

### Community 143 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 144 - "policies.test.ts"
Cohesion: 0.18
Nodes (9): AiUnavailableError, createAi(), appAiChat(), CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor (+1 more)

### Community 145 - "application/context.ts"
Cohesion: 0.09
Nodes (11): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 146 - "Tx"
Cohesion: 0.11
Nodes (15): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, contextMetrics(), recordFusionStep() (+7 more)

### Community 147 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 148 - "vitest"
Cohesion: 0.09
Nodes (25): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+17 more)

### Community 151 - "app-services/realtime.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "crypto.ts"
Cohesion: 0.14
Nodes (20): createCoreModules(), BcryptArgonPasswordHasher, encryptHeaders(), Input, postgresProviderRepository, burnPasswordCheck(), decrypt(), encrypt() (+12 more)

### Community 155 - "accounts.ts"
Cohesion: 0.43
Nodes (3): GithubError, Link, SyncResult

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 159 - "app-services/context.ts"
Cohesion: 0.09
Nodes (15): aiUsage, bindJobs, aiPorts, emailPorts, resetTransport(), jobPorts, configureAppServiceObserver(), log() (+7 more)

### Community 163 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 165 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 170 - "AppEnv"
Cohesion: 0.19
Nodes (8): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobPorts

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 177 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.09
Nodes (19): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+11 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "q"
Cohesion: 0.07
Nodes (10): PostgresMemberRepository, PostgresOrganizationRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, modelHealth(), recordModelHealth(), recordClassificationUsage() (+2 more)

### Community 180 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `model-management/providers.ts`, `ProjectsApplication.ts`, `Chat.tsx`, `ProviderService.ts`, `http-client.ts`, `AgentExecution.ts`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `modules/builder/index.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `projectRows.ts`, `adminApi.ts`, `modules/identity/index.ts`, `react`, `BuilderToolsAdapter.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `ref_node_fs`, `config.ts`, `FileMap`, `projectIndex.ts`, `models.ts`, `skills.test.ts`, `collaboration/postgresAdapters.test.ts`, `client/index.ts`, `builderService.ts`, `composition.ts`, `model-management/index.ts`, `mcp/server.ts`, `app-runtime/services.test.ts`, `package.json`, `usage/usage.ts`, `bootstrap/server.ts`, `integrations/github.ts`, `createIdentityModule`, `platformDb`, `RunTaskLaneUseCase.ts`, `domain/messages.ts`, `deps.test.ts`, `IOrganizationRepository`, `Account`, `projects/application/usecases.ts`, `application/security.ts`, `builder/contracts.ts`, `model-management/router.ts`, `fusion.test.ts`, `domain/score.ts`, `createCollaborationModule`, `infrastructure/projects.ts`, `BootstrapService`, `modules/projects/index.ts`, `BuilderWorkflow.ts`, `Plan.ts`, `ApplicationLifecycle`, `IntegrationRepository`, `infrastructure/repositories.ts`, `ExecutionAudit.ts`, `policies.test.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `devDependencies`, `ISettingsStore`, `RouterAdministration.ts`, `http.test.ts`, `SettingDefinition`, `infrastructure/anthropic.ts`, `CheckAccessUseCase.ts`, `Changes.tsx`, `PlatformSettingsService`, `GithubAccountRepository`, `application.test.ts`, `securityScan.test.ts`, `FinishGateAdapter.ts`, `InviteMemberUseCase.ts`, `policies.test.ts`, `application/context.ts`, `accounts.ts`, `app-services/context.ts`, `settingReactions.ts`, `BuilderRunRegistry`, `ServiceControlPanel.tsx`, `architecture.test.ts`, `Audit.tsx`?**
  _High betweenness centrality (0.302) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04784816893878642 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `Workspace.tsx`, `Changes.tsx`, `http-client.ts`, `client/index.ts`, `projects/application/usecases.ts`, `Memory.tsx`, `ServiceControlPanel.tsx`, `package.json`, `models/presentation/Models.tsx`, `forms.tsx`, `Audit.tsx`, `format.ts`, `App.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `appServer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09098639455782313 - nodes in this community are weakly interconnected._