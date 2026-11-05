# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 643 files · ~285,272 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4324 nodes · 11174 edges · 187 communities (155 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 601 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `584da9fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Account
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- vitest
- ProviderService.ts
- appServer.ts
- http-client.ts
- infrastructure/playground.ts
- model-management/index.ts
- with
- infrastructure/projectDb.ts
- bundler.ts
- evaluations/bindings.test.ts
- Workspace.tsx
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- skills.test.ts
- roles.ts
- QueryRepository
- sandbox.ts
- Account
- domain/messages.ts
- urls.ts
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- Dashboard.tsx
- ProjectView.tsx
- studioApi.ts
- bundler.ts
- appRuntimeHttp.ts
- policies.test.ts
- modules/projects/index.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- createCollaborationModule
- jobWorkerServer.ts
- client.ts
- scripts
- model-management/providers.ts
- adminApi.ts
- RunAgentUseCase.ts
- mcp/server.ts
- ISessionRepository
- package.json
- ProjectsStore
- Project
- Panel de administración del sistema — diseño
- BuilderWorkflow.ts
- BuilderWorkflowPorts
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
- IntegrationRepository
- createProjectRows
- GithubGateway
- SqlAgentTaskRepository.ts
- IOrganizationRepository
- app-services/jobs.ts
- services
- q
- OrchestrationPolicy.ts
- app-runtime/index.ts
- ApplicationLifecycle
- config.ts
- ProjectServices
- TEST_DATABASE_URL
- TurnFeedbackPorts.ts
- app-services/realtime.ts
- domain/score.ts
- Changes.tsx
- ISettingsStore
- model-management/index.ts
- RunAgentUseCase.ts
- crypto.ts
- Inventario de funciones de Lovable → Forja
- infrastructure/repositories.ts
- BootstrapService
- e2e.mjs
- createJobs
- starterTemplate.test.ts
- Inventario de interfaz de Floot → Forja
- BuilderToolsAdapter.ts
- app-services/payments.ts
- format.ts
- timeAgo
- usage/usage.ts
- shared/security.ts
- PostgresApiTokenRepository
- integrations/index.ts
- ProjectDbClient
- apiTypes.test.ts
- OrganizationSkillsService.ts
- domain/securityScan.ts
- Memory.tsx
- Desplegar Forja en Coolify
- ports.ts
- createGithubSyncService
- integrations/github.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- AgentExecutionResult
- ApiError
- { api, auth, storage, ai }
- SettingDefinition
- createAppDataService
- builderServer.ts
- modules/builder/index.ts
- studio.mjs
- postgres
- healthcheck
- policies.ts
- app-runtime
- IMemberRepository
- build
- RunTaskLaneUseCase
- PlatformSettingsService
- AccountLifecycleRepository
- builder
- ProjectDb
- application.test.ts
- RealtimeTransport
- forja
- FinishGateAdapter.ts
- Plan
- createProblemService
- accounts.ts
- app-services/context.ts
- replaceVisibleText
- one
- agents.mjs
- ports/context.ts
- execution.test.ts
- spring.ts
- collaboration/postgresAdapters.test.ts
- job-worker
- createJobQueue
- bootstrap/server.ts
- createProjectRows
- createAuth
- application.test.ts
- PostgresPlatformSettingsStoreAdapter
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- FastBuildPorts
- platformAllows
- collaboration/ports/repositories.ts
- forms.tsx
- database/index.ts
- runtimeClient.ts
- GithubAuthorization
- GithubProjectPorts
- Durable jobs worker
- One project: orders API and durable invoice worker
- GithubRepository
- ServiceControlPanel.tsx
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
1. `vitest` - 142 edges
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
- `Cómo está hecho` --references--> `ctx()`  [INFERRED]
  README.md → test/unit/gate.test.ts
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts

## Import Cycles
- None detected.

## Communities (187 total, 32 thin omitted)

### Community 0 - "Account"
Cohesion: 0.11
Nodes (9): Account, AccountProps, PlatformRole, Email, COMMON_PASSWORDS, Password, AccountRow, PostgresAccountRepository (+1 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (26): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+18 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (68): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+60 more)

### Community 4 - "vitest"
Cohesion: 0.09
Nodes (17): pg, vitest, freshDatabase(), TEST_DATABASE_URL, dir, pool, pool, ports (+9 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.10
Nodes (23): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+15 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (42): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+34 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (28): api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), Metric(), money() (+20 more)

### Community 8 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (30): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+22 more)

### Community 9 - "model-management/index.ts"
Cohesion: 0.13
Nodes (21): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), taskClassOf(), bindModelAudit(), bindCatalogService(), bindCatalogSync() (+13 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/projectDb.ts"
Cohesion: 0.33
Nodes (11): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), get(), metricsFor(), metricSnapshots, Open (+3 more)

### Community 12 - "bundler.ts"
Cohesion: 0.14
Nodes (22): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, BuildError, bundleBrowser(), compileCache (+14 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "Workspace.tsx"
Cohesion: 0.09
Nodes (29): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, DeleteDialog() (+21 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (52): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), runAgent() (+44 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 18 - "skills.test.ts"
Cohesion: 0.08
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 19 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 20 - "QueryRepository"
Cohesion: 0.09
Nodes (4): AuthPorts, AuthRepository, QueryRepository, StoragePorts

### Community 21 - "sandbox.ts"
Cohesion: 0.08
Nodes (25): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+17 more)

### Community 22 - "Account"
Cohesion: 0.09
Nodes (10): RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, BcryptArgonPasswordHasher, PlatformMailerService, IAccountRepository, ILoginCodeRepository (+2 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.14
Nodes (17): anthropicChat(), ModelCallError, textOf(), CompatEndpoint, anthropicChat(), getClient(), resetAnthropicClient(), SERVER_FALLBACK (+9 more)

### Community 24 - "urls.ts"
Cohesion: 0.09
Nodes (28): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+20 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (47): radix-ui@^1.8.1, radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent (+39 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.08
Nodes (20): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+12 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Plan.ts"
Cohesion: 0.11
Nodes (19): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+11 more)

### Community 30 - "Dashboard.tsx"
Cohesion: 0.11
Nodes (32): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners (+24 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (50): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+42 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (54): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+46 more)

### Community 33 - "bundler.ts"
Cohesion: 0.11
Nodes (28): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles(), jobFiles() (+20 more)

### Community 34 - "appRuntimeHttp.ts"
Cohesion: 0.10
Nodes (16): hono@^4.13.14, hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+8 more)

### Community 35 - "policies.test.ts"
Cohesion: 0.08
Nodes (20): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail(), sendPlatformEmail() (+12 more)

### Community 36 - "modules/projects/index.ts"
Cohesion: 0.12
Nodes (24): ResolvedApp, AppTarget, CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry (+16 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (20): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), classifyProviderModel() (+12 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.08
Nodes (27): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+19 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 41 - "jobWorkerServer.ts"
Cohesion: 0.18
Nodes (18): lifecycle, lifecycle, monolith, server, lifecycle, seedLocal, stopRuntimeEventRelay(), stopAppRuntime() (+10 more)

### Community 42 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (22): lastSync(), providers(), startCatalogSync(), sync(), syncOpenRouter(), speedFor(), tierFor(), createCatalogSync() (+14 more)

### Community 45 - "adminApi.ts"
Cohesion: 0.11
Nodes (30): 6. API de administración, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+22 more)

### Community 46 - "RunAgentUseCase.ts"
Cohesion: 0.12
Nodes (13): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext, ExecutionModel (+5 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.04
Nodes (58): DEV_FIXTURE, Fixture, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS (+50 more)

### Community 48 - "ISessionRepository"
Cohesion: 0.17
Nodes (4): LoginWithPasswordUseCase, IdentityAccountsDependencies, IPasswordHasher, ISessionRepository

### Community 49 - "package.json"
Cohesion: 0.08
Nodes (36): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0, nodemailer@^10.3.1 (+28 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (15): 10. Documentación, 1. Capa de datos, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Conexión, Decisiones tomadas con el usuario, `.env` resultante (+7 more)

### Community 53 - "BuilderWorkflow.ts"
Cohesion: 0.19
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath() (+2 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "cli.ts"
Cohesion: 0.19
Nodes (12): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+4 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (31): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+23 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "project-observability/security.ts"
Cohesion: 0.08
Nodes (31): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+23 more)

### Community 67 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 68 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 69 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 70 - "createProjectRows"
Cohesion: 0.15
Nodes (5): createProjectData(), createProjectRowsRepository(), projectRowsRepository, ProjectRowsPort, ProjectSchemaPort

### Community 71 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 72 - "SqlAgentTaskRepository.ts"
Cohesion: 0.18
Nodes (7): ListAgentTasksUseCase, SqlAgentTaskRepository, tasks, AgentTaskQueries, AgentTaskView, listCatalog(), mocks

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "app-services/jobs.ts"
Cohesion: 0.10
Nodes (10): ClaimedJob, jobPorts, log(), addTimer, enqueueJob, EmailPorts, JobPorts, JobRuntimePorts (+2 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "q"
Cohesion: 0.07
Nodes (7): PostgresMemberRepository, PostgresOrganizationRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, q()

### Community 77 - "OrchestrationPolicy.ts"
Cohesion: 0.29
Nodes (8): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (20): RuntimeObservationPorts, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, bindRuntimeObservation(), observation() (+12 more)

### Community 79 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 80 - "config.ts"
Cohesion: 0.11
Nodes (17): vite, config, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), ROOT_DIR, MIGRATIONS_DIR (+9 more)

### Community 81 - "ProjectServices"
Cohesion: 0.20
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 83 - "TurnFeedbackPorts.ts"
Cohesion: 0.10
Nodes (29): analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), ROLES, useFastPath(), createTurnFeedback() (+21 more)

### Community 84 - "app-services/realtime.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 85 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (13): DiffLine, diffLines(), hunks(), baseName(), cache, diffStats(), FileChange, FileDiff() (+5 more)

### Community 87 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 88 - "model-management/index.ts"
Cohesion: 0.08
Nodes (39): AgentSpec, TurnState, KEYWORDS, LAMBDA, maxTokensFor(), RoleProfile, Posterior, Block (+31 more)

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.25
Nodes (15): applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS, pruneToolResults() (+7 more)

### Community 90 - "crypto.ts"
Cohesion: 0.17
Nodes (16): createCoreModules(), NodeBootstrapCrypto, burnPasswordCheck(), hashPassword(), LEGACY, newId(), newToken(), numericCode() (+8 more)

### Community 91 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 92 - "infrastructure/repositories.ts"
Cohesion: 0.19
Nodes (10): sendPlatformEmail, emailPorts, resetTransport(), projectDb(), authRepository(), createQueryRepository(), schemaRows(), statement() (+2 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 95 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 96 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (7): CreateCheckpointUseCase, CreateProjectUseCase, Author, Checkpoint, CheckpointProps, creation(), load()

### Community 97 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.13
Nodes (12): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto, 4. Playground de agentes, Arranque, Cómo está hecho (+4 more)

### Community 98 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (26): requestSecret, assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+18 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 101 - "timeAgo"
Cohesion: 0.10
Nodes (23): InstallEvent, Pwa(), PwaBoundary, Account(), DeleteAccount(), PasswordSection(), Row(), Token (+15 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "shared/security.ts"
Cohesion: 0.21
Nodes (10): appHeaders(), clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup() (+2 more)

### Community 104 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 105 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

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

### Community 111 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 112 - "ports.ts"
Cohesion: 0.10
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, ProjectCompilerPort, createPublication(), assertPublishable(), Author (+9 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 114 - "integrations/github.ts"
Cohesion: 0.12
Nodes (21): connectAccount(), GithubError, accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook (+13 more)

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.09
Nodes (14): playwright-core@1.64.1, playwright-core, blobId(), sha1(), startFakeGithub(), app, DATA, jar (+6 more)

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.27
Nodes (9): createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "AgentExecutionResult"
Cohesion: 0.13
Nodes (10): TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, TaskCompletion, LaneTask (+2 more)

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 124 - "builderServer.ts"
Cohesion: 0.18
Nodes (11): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder() (+3 more)

### Community 125 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (35): AgentResult, calculateSpendUseCase, toolRegistry, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult (+27 more)

### Community 126 - "studio.mjs"
Cohesion: 0.16
Nodes (17): assertPublic(), fetchPublicText(), isPrivate(), ADMIN, assert(), cleanup(), freePort(), get() (+9 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "policies.ts"
Cohesion: 0.15
Nodes (7): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, secretPorts, SecretPorts, secretEnv

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "IMemberRepository"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "RunTaskLaneUseCase"
Cohesion: 0.40
Nodes (4): RunTaskLaneUseCase, fixture(), result, task

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "ProjectDb"
Cohesion: 0.15
Nodes (8): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, TransactionSession, SqlExecutionResult, TransactionAction, createAuthRepository(), ProjectDb, isInternalServiceRequest()

### Community 138 - "application.test.ts"
Cohesion: 0.09
Nodes (14): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), RunConfiguration (+6 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (20): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+12 more)

### Community 143 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 144 - "accounts.ts"
Cohesion: 0.18
Nodes (5): createGithubAccountService(), GithubAccountRepository, Link, SyncResult, setup()

### Community 145 - "app-services/context.ts"
Cohesion: 0.08
Nodes (20): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+12 more)

### Community 146 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 147 - "one"
Cohesion: 0.09
Nodes (8): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity, IdentityRandom, one(), Tx

### Community 148 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 149 - "ports/context.ts"
Cohesion: 0.10
Nodes (16): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+8 more)

### Community 150 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 155 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (16): withDefaultHeaders(), app, handleMcp, listening(), monolith, reactions, resolveApp(), runtimeAccessPorts (+8 more)

### Community 156 - "createProjectRows"
Cohesion: 0.46
Nodes (7): createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "application.test.ts"
Cohesion: 0.20
Nodes (7): ActiveRun, executeRun(), Ledger, Outcome, recoverRuns(), RunPorts, CaseResult

### Community 163 - "platformAllows"
Cohesion: 0.33
Nodes (6): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), allowedModels(), platformAllows()

### Community 164 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 165 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 166 - "database/index.ts"
Cohesion: 0.10
Nodes (19): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+11 more)

### Community 167 - "runtimeClient.ts"
Cohesion: 0.50
Nodes (3): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall

### Community 172 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 176 - "ServiceControlPanel.tsx"
Cohesion: 0.15
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.21
Nodes (15): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+7 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1268 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Account`, `ProviderService.ts`, `http-client.ts`, `model-management/index.ts`, `evaluations/bindings.test.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `skills.test.ts`, `sandbox.ts`, `Account`, `domain/messages.ts`, `project-observability/problems.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `Plan.ts`, `studioApi.ts`, `bundler.ts`, `policies.test.ts`, `modules/projects/index.ts`, `models.ts`, `projects/application/usecases.ts`, `createCollaborationModule`, `model-management/providers.ts`, `adminApi.ts`, `RunAgentUseCase.ts`, `mcp/server.ts`, `ISessionRepository`, `package.json`, `ProjectsStore`, `BuilderWorkflow.ts`, `projectIndex.ts`, `createIdentityModule`, `deps.ts`, `project-observability/security.ts`, `IntegrationRepository`, `createProjectRows`, `SqlAgentTaskRepository.ts`, `IOrganizationRepository`, `app-services/jobs.ts`, `app-runtime/index.ts`, `ApplicationLifecycle`, `config.ts`, `TurnFeedbackPorts.ts`, `domain/score.ts`, `Changes.tsx`, `ISettingsStore`, `model-management/index.ts`, `RunAgentUseCase.ts`, `crypto.ts`, `BootstrapService`, `starterTemplate.test.ts`, `BuilderToolsAdapter.ts`, `usage/usage.ts`, `shared/security.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `createGithubSyncService`, `integrations/github.ts`, `devDependencies`, `RouterAdministration.ts`, `AgentExecutionResult`, `ApiError`, `SettingDefinition`, `builderServer.ts`, `modules/builder/index.ts`, `IMemberRepository`, `RunTaskLaneUseCase`, `PlatformSettingsService`, `ProjectDb`, `FinishGateAdapter.ts`, `accounts.ts`, `app-services/context.ts`, `replaceVisibleText`, `execution.test.ts`, `collaboration/postgresAdapters.test.ts`, `bootstrap/server.ts`, `application.test.ts`, `collaboration/ports/repositories.ts`, `database/index.ts`, `runtimeClient.ts`, `ServiceControlPanel.tsx`, `architecture.test.ts`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Account` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `client/index.ts`, `internal/router.ts`, `forms.tsx`, `timeAgo`, `format.ts`, `Chat.tsx`, `http-client.ts`, `integrations/index.ts`, `projects/application/usecases.ts`, `Workspace.tsx`, `Memory.tsx`, `ServiceControlPanel.tsx`, `package.json`, `Changes.tsx`, `Dashboard.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14919354838709678 - nodes in this community are weakly interconnected._