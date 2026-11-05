# Graph Report - anemone  (2026-11-05)

## Corpus Check
- 646 files · ~287,102 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 4339 nodes · 11239 edges · 184 communities (156 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 604 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7eebf44f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- one
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
- infrastructure/repositories.ts
- createModelRouter
- evaluations/bindings.test.ts
- ProjectView.tsx
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- skills.test.ts
- bundler.ts
- infrastructure/appDataService.ts
- sandbox.ts
- Account
- domain/messages.ts
- urls.ts
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Plan.ts
- createJobQueue
- ProjectView.tsx
- studioApi.ts
- domain/services.ts
- appRuntimeServer.ts
- guides.ts
- modules/projects/index.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- createCollaborationModule
- policies.test.ts
- client.ts
- scripts
- infrastructure/probe.ts
- model-management/catalog.ts
- RunAgentUseCase.ts
- mcp/server.ts
- integrations/index.ts
- package.json
- ProjectsStore
- Project
- Panel de administración del sistema — diseño
- OrchestrationPolicy.ts
- usage/usage.ts
- projectIndex.ts
- server/index.ts
- developmentSeed.ts
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
- shared/security.ts
- createJobs
- GithubGateway
- mcp/jobs.ts
- IOrganizationRepository
- infrastructure/jobs.ts
- services
- q
- infrastructure/github.ts
- app-runtime/index.ts
- toolOutputs.test.ts
- ref_node_path
- modules/builder/index.ts
- TEST_DATABASE_URL
- TurnFeedbackPorts.ts
- Tx
- domain/score.ts
- Changes.tsx
- ISettingsStore
- ModelRouter.ts
- cli.ts
- crypto.ts
- Inventario de funciones de Lovable → Forja
- app-services/realtime.ts
- BootstrapService
- e2e.mjs
- Account
- ProjectsApplication.ts
- Cómo está hecho
- BuilderToolsAdapter.ts
- app-services/payments.ts
- ports/jobs.ts
- Dashboard.tsx
- ApplicationLifecycle
- http.test.ts
- IdentityRandom
- projectMicroservices.test.ts
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
- CheckAccessUseCase.ts
- { api, auth, storage, ai }
- SettingDefinition
- timeAgo
- PostgresCatalogRepository.ts
- modules/builder/index.ts
- studio.mjs
- postgres
- healthcheck
- policies.ts
- app-runtime
- collaboration/ports/repositories.ts
- build
- settingReactions.ts
- PlatformSettingsService
- AccountLifecycleRepository
- builder
- ProjectServices
- application.test.ts
- RealtimeTransport
- forja
- FinishGateAdapter.ts
- createProblemService
- composition.ts
- accounts.ts
- application/context.ts
- format.ts
- PostgresOrganizationRepository
- agents.mjs
- AppEnv
- classification.test.ts
- motion.tsx
- collaboration/postgresAdapters.test.ts
- job-worker
- BuilderRunRegistry
- bootstrap/server.ts
- ApiError
- createAuth
- application.test.ts
- model-management/providers.ts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- identity/boundaries.test.ts
- forms.tsx
- Review Focus
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
1. `vitest` - 143 edges
2. `q()` - 102 edges
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

## Communities (184 total, 28 thin omitted)

### Community 0 - "one"
Cohesion: 0.09
Nodes (13): createDevelopmentSeed(), PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation (+5 more)

### Community 1 - "index.tsx"
Cohesion: 0.19
Nodes (15): clsx@^2.1.1, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (35): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+27 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (68): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+60 more)

### Community 4 - "vitest"
Cohesion: 0.12
Nodes (20): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+12 more)

### Community 5 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (47): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+39 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (28): api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), Metric(), money() (+20 more)

### Community 8 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (26): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+18 more)

### Community 9 - "model-management/index.ts"
Cohesion: 0.11
Nodes (24): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), taskClassOf(), bindModelAudit(), bindCatalogService(), bindCatalogSync() (+16 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/repositories.ts"
Cohesion: 0.12
Nodes (21): @electric-sql/pglite, closeProject(), get(), metricsFor(), metricSnapshots, Open, openDb(), projectDb() (+13 more)

### Community 12 - "createModelRouter"
Cohesion: 0.16
Nodes (14): createModelRouter(), analyzeRequest(), callModel(), pick(), maxTokensFor(), estimateRequestTokens(), costUsd(), NoModelError (+6 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 14 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (29): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, DeleteDialog() (+21 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (59): Implementation plan document (`static/__dev/plan.md`), describeSchema, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard(), active (+51 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.06
Nodes (19): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, createMemoryService(), labels (+11 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 18 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 19 - "bundler.ts"
Cohesion: 0.15
Nodes (20): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, BuildError, bundleBrowser(), compileCache (+12 more)

### Community 20 - "infrastructure/appDataService.ts"
Cohesion: 0.17
Nodes (5): AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, isInternalServiceRequest()

### Community 21 - "sandbox.ts"
Cohesion: 0.08
Nodes (25): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+17 more)

### Community 22 - "Account"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.12
Nodes (25): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, textOf() (+17 more)

### Community 24 - "urls.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (46): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+38 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Plan.ts"
Cohesion: 0.09
Nodes (26): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+18 more)

### Community 30 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (51): lucide-react, api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col (+43 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (47): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, dumpDatabase(), execSql() (+39 more)

### Community 33 - "domain/services.ts"
Cohesion: 0.11
Nodes (25): createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles(), ControlledService, RuntimeService (+17 more)

### Community 34 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (17): hono@^4.13.14, hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+9 more)

### Community 35 - "guides.ts"
Cohesion: 0.17
Nodes (14): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+6 more)

### Community 36 - "modules/projects/index.ts"
Cohesion: 0.17
Nodes (11): ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange, starterFiles(), starterFiles() (+3 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (25): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+17 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.08
Nodes (27): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+19 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 41 - "policies.test.ts"
Cohesion: 0.09
Nodes (22): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+14 more)

### Community 42 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 43 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 44 - "infrastructure/probe.ts"
Cohesion: 0.22
Nodes (16): 6. API de administración, providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+8 more)

### Community 45 - "model-management/catalog.ts"
Cohesion: 0.16
Nodes (21): Task 3: Proveedores y modelos en BD + seeders, `llm/catalog.ts`, tasks, admitPlayground(), execute(), allowedModels(), allowedModels(), availableModels() (+13 more)

### Community 46 - "RunAgentUseCase.ts"
Cohesion: 0.07
Nodes (36): RunAgentUseCase, summarize(), ScheduleTasksUseCase, addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext (+28 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 48 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1 (+28 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (16): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+8 more)

### Community 53 - "OrchestrationPolicy.ts"
Cohesion: 0.06
Nodes (22): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+14 more)

### Community 54 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "developmentSeed.ts"
Cohesion: 0.22
Nodes (9): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, collaboration, handleMcp, identity (+1 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.14
Nodes (3): IdentityAccountsService, createIdentityModule(), fixture()

### Community 60 - "PostgresProjectFileRepository"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 61 - "deps.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+25 more)

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
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 68 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 69 - "shared/security.ts"
Cohesion: 0.18
Nodes (11): clientIp(), createRateLimiter(), isHttps(), RateLimitError, RateLimitQuery, RateLimitStoreError, requestOrigin(), startRateLimitCleanup() (+3 more)

### Community 70 - "createJobs"
Cohesion: 0.08
Nodes (29): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+21 more)

### Community 72 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 74 - "infrastructure/jobs.ts"
Cohesion: 0.11
Nodes (14): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), jobPorts (+6 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "q"
Cohesion: 0.07
Nodes (13): createCoreModules(), PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository (+5 more)

### Community 77 - "infrastructure/github.ts"
Cohesion: 0.25
Nodes (8): GithubError, Link, SyncResult, gh(), githubAccountRepository, githubAuthorization, tokenFor(), setup()

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (20): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation(), configureRuntimeProjects() (+12 more)

### Community 79 - "toolOutputs.test.ts"
Cohesion: 0.40
Nodes (3): BEFORE, conforms(), dir

### Community 80 - "ref_node_path"
Cohesion: 0.10
Nodes (19): vite, DEV_FIXTURE, Fixture, storagePorts, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+11 more)

### Community 81 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (48): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, bindBuilderCoreModules(), estTokens() (+40 more)

### Community 83 - "TurnFeedbackPorts.ts"
Cohesion: 0.12
Nodes (20): analyzeHeuristic(), ROLES, useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian() (+12 more)

### Community 84 - "Tx"
Cohesion: 0.17
Nodes (10): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, Tx, ANTHROPIC_MODELS (+2 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (13): DiffLine, diffLines(), hunks(), baseName(), cache, diffStats(), FileChange, FileDiff() (+5 more)

### Community 87 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 88 - "ModelRouter.ts"
Cohesion: 0.14
Nodes (21): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, Usage (+13 more)

### Community 89 - "cli.ts"
Cohesion: 0.23
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 90 - "crypto.ts"
Cohesion: 0.16
Nodes (15): BcryptArgonPasswordHasher, encryptHeaders(), Input, burnPasswordCheck(), decrypt(), encrypt(), hashPassword(), key() (+7 more)

### Community 91 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 92 - "app-services/realtime.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

### Community 93 - "BootstrapService"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "e2e.mjs"
Cohesion: 0.13
Nodes (7): DATA, jar, req(), ROOT, server, signInAs(), dir

### Community 95 - "Account"
Cohesion: 0.12
Nodes (5): Account, AccountProps, Email, COMMON_PASSWORDS, Password

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.19
Nodes (11): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+3 more)

### Community 97 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 98 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (21): page(), assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+13 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "ports/jobs.ts"
Cohesion: 0.08
Nodes (14): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, aiPorts, AiModel, AiPorts (+6 more)

### Community 101 - "Dashboard.tsx"
Cohesion: 0.11
Nodes (32): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners (+24 more)

### Community 102 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 103 - "http.test.ts"
Cohesion: 0.18
Nodes (9): account, app, collaboration, identity, mocks, models, projects, settings (+1 more)

### Community 105 - "projectMicroservices.test.ts"
Cohesion: 0.16
Nodes (6): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate(), endpoint()

### Community 107 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 111 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 112 - "ports.ts"
Cohesion: 0.07
Nodes (26): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createProjectCheck(), ProjectCompilerPort, createPublication() (+18 more)

### Community 113 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 114 - "integrations/github.ts"
Cohesion: 0.17
Nodes (12): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+4 more)

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.27
Nodes (9): createRouterAdministration(), routerStats(), meanOf(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 119 - "AgentExecutionResult"
Cohesion: 0.08
Nodes (18): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries (+10 more)

### Community 120 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 122 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 123 - "timeAgo"
Cohesion: 0.10
Nodes (23): InstallEvent, Pwa(), PwaBoundary, Account(), DeleteAccount(), PasswordSection(), Row(), Token (+15 more)

### Community 124 - "PostgresCatalogRepository.ts"
Cohesion: 0.67
Nodes (3): audit(), postgresModelAudit(), ModelAudit

### Community 125 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 126 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 127 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 129 - "policies.ts"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "collaboration/ports/repositories.ts"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 132 - "build"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 133 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 134 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "ProjectServices"
Cohesion: 0.22
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 138 - "application.test.ts"
Cohesion: 0.08
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+9 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 142 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 143 - "composition.ts"
Cohesion: 0.10
Nodes (31): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), cloneDatabase(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+23 more)

### Community 144 - "accounts.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 145 - "application/context.ts"
Cohesion: 0.11
Nodes (10): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, publish() (+2 more)

### Community 146 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 147 - "PostgresOrganizationRepository"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 148 - "agents.mjs"
Cohesion: 0.09
Nodes (19): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+11 more)

### Community 149 - "AppEnv"
Cohesion: 0.07
Nodes (13): ClaimedJob, AppAiResult, AppEnv, AppUser, CheckoutInput, EmailInput, EmailResult, StoredObject (+5 more)

### Community 150 - "classification.test.ts"
Cohesion: 0.47
Nodes (5): answer(), model, prediction(), scope, setup()

### Community 151 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 152 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 153 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 154 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 155 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (48): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay() (+40 more)

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "application.test.ts"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 159 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (17): speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), columns, postgresCatalogRepository (+9 more)

### Community 165 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 166 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

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
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1270 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `ProviderService.ts`, `http-client.ts`, `model-management/index.ts`, `infrastructure/repositories.ts`, `createModelRouter`, `evaluations/bindings.test.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `skills.test.ts`, `infrastructure/appDataService.ts`, `sandbox.ts`, `Account`, `domain/messages.ts`, `project-observability/problems.ts`, `modules/projects/index.ts`, `Plan.ts`, `domain/services.ts`, `guides.ts`, `modules/projects/index.ts`, `models.ts`, `projects/application/usecases.ts`, `createCollaborationModule`, `policies.test.ts`, `infrastructure/probe.ts`, `RunAgentUseCase.ts`, `package.json`, `ProjectsStore`, `OrchestrationPolicy.ts`, `usage/usage.ts`, `projectIndex.ts`, `server/index.ts`, `developmentSeed.ts`, `createIdentityModule`, `deps.ts`, `project-observability/security.ts`, `shared/security.ts`, `mcp/jobs.ts`, `IOrganizationRepository`, `infrastructure/jobs.ts`, `infrastructure/github.ts`, `app-runtime/index.ts`, `toolOutputs.test.ts`, `ref_node_path`, `modules/builder/index.ts`, `TurnFeedbackPorts.ts`, `domain/score.ts`, `Changes.tsx`, `ISettingsStore`, `BootstrapService`, `e2e.mjs`, `Account`, `ProjectsApplication.ts`, `BuilderToolsAdapter.ts`, `ApplicationLifecycle`, `http.test.ts`, `projectMicroservices.test.ts`, `apiTypes.test.ts`, `OrganizationSkillsService.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `AgentExecutionResult`, `CheckAccessUseCase.ts`, `SettingDefinition`, `modules/builder/index.ts`, `collaboration/ports/repositories.ts`, `settingReactions.ts`, `PlatformSettingsService`, `application.test.ts`, `FinishGateAdapter.ts`, `composition.ts`, `accounts.ts`, `classification.test.ts`, `collaboration/postgresAdapters.test.ts`, `BuilderRunRegistry`, `bootstrap/server.ts`, `ApiError`, `model-management/providers.ts`, `identity/boundaries.test.ts`, `ServiceControlPanel.tsx`, `architecture.test.ts`?**
  _High betweenness centrality (0.264) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `one` be split into smaller, more focused modules?**
  _Cohesion score 0.09487179487179487 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `client/index.ts`, `internal/router.ts`, `forms.tsx`, `Dashboard.tsx`, `Chat.tsx`, `http-client.ts`, `projects/application/usecases.ts`, `ProjectView.tsx`, `Memory.tsx`, `integrations/index.ts`, `package.json`, `format.ts`, `ServiceControlPanel.tsx`, `Changes.tsx`, `motion.tsx`, `timeAgo`, `ProjectView.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13048780487804879 - nodes in this community are weakly interconnected._