# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 603 files · ~251,947 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4105 nodes · 10512 edges · 180 communities (148 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a289e48`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- crypto.ts
- composition.ts
- appServer.ts
- http-client.ts
- project-observability/security.ts
- ModelRouter.ts
- with
- model-management/index.ts
- createProjectRows
- evaluations/bindings.test.ts
- one
- BuilderTurnAdapter.ts
- memory/application/service.ts
- pg.mjs
- createCollaborationModule
- admission.ts
- roles.ts
- bundler.ts
- PostgresProviderRepository.ts
- infrastructure/repositories.ts
- BuilderWorkflowPorts
- administration/presentation/Models.tsx
- project-observability/events.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- http.test.ts
- ExecutionMetrics
- compilerOptions
- models.ts
- projects/application/usecases.ts
- IMemberRepository
- model-management/router.ts
- client/index.ts
- scripts
- ContextPorts
- models/presentation/Models.tsx
- builder/contracts.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- guides.ts
- ProjectDb
- securityReview.ts
- server/index.ts
- OrchestrationPolicy.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- modules/builder/index.ts
- PostgresProjectsStore
- createJobs
- app-runtime/index.ts
- infrastructure/playground.ts
- client.ts
- Workspace.tsx
- accounts.ts
- IOrganizationRepository
- policies.test.ts
- services
- createGithubSyncService
- app-services/realtime.ts
- infrastructure/probe.ts
- runBuilderTurn
- collaboration/postgresAdapters.test.ts
- ILoginCodeRepository
- TEST_DATABASE_URL
- Memory.tsx
- config.ts
- domain/score.ts
- Changes.tsx
- app-services/storage.ts
- builderServer.ts
- app-services/context.ts
- skills.test.ts
- GithubAuthorization
- AgentExecution.ts
- BootstrapService
- modules/identity/index.ts
- integrations/github.ts
- ProjectsApplication.ts
- Checkpoint
- database/index.ts
- appRuntimeHttp.ts
- infrastructure/secrets.ts
- react
- usage/usage.ts
- mcp/jobs.ts
- ProjectPath
- infrastructure/routing.ts
- SqlAgentTaskRepository.ts
- app-runtime/infrastructure/browser.ts
- OrganizationSkillsService.ts
- typecheck.ts
- model-management/providers.ts
- Plan
- ports.ts
- sandbox.ts
- BuilderWorkflow.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- IntegrationRepository
- { api, auth, storage, ai }
- ISettingsStore
- FinishGateAdapter.ts
- cli.ts
- PostgresApiTokenRepository
- SqlAgentTaskRepository.ts
- postgres
- healthcheck
- ref_node_crypto
- app-runtime
- ProjectSandbox
- build
- domain/securityScan.ts
- PlatformSettingsService
- AccountLifecycleRepository
- builder
- ProjectDbClient
- metrics.test.ts
- BuilderToolsAdapter.ts
- forja
- ApplicationLifecycle
- audit.ts
- GithubRepository
- PostgresSettingsRepository.ts
- integrations/index.ts
- bootstrap/server.ts
- exports.test.tsx
- settingReactions.ts
- createHttp
- forms.tsx
- replaceVisibleText
- FastBuildPorts
- PostgresProviderRepository.ts
- platformAllows
- safeFetch.ts
- transports/mcp.test.ts
- createAuth
- RunTaskLaneUseCase
- AgentExecutionPorts
- ProjectServices
- architecture.test.ts
- FinishGateAdapter.ts
- settings/index.ts
- GithubGateway
- application/context.ts
- GithubProjectPorts
- ICollaborationAccountRepository
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
1. `vitest` - 129 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 69 edges
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
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (180 total, 32 thin omitted)

### Community 0 - "q"
Cohesion: 0.07
Nodes (8): createCoreModules(), PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, PostgresLoginCodeRepository, PostgresPasswordResetRepository, q()

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (36): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+28 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (67): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+59 more)

### Community 4 - "crypto.ts"
Cohesion: 0.14
Nodes (14): BcryptArgonPasswordHasher, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newToken(), numericCode(), passwordNeedsRehash() (+6 more)

### Community 5 - "composition.ts"
Cohesion: 0.17
Nodes (20): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+12 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (44): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+36 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (26): appServicesController, api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), money() (+18 more)

### Community 8 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 9 - "ModelRouter.ts"
Cohesion: 0.14
Nodes (24): AgentSpec, TurnState, KEYWORDS, LAMBDA, maxTokensFor(), RoleProfile, ROLES, Effort (+16 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "model-management/index.ts"
Cohesion: 0.12
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), createModelRouter(), analyzeRequest(), callModel(), pick(), taskClassOf() (+17 more)

### Community 12 - "createProjectRows"
Cohesion: 0.16
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectRowsPort (+1 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (20): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+12 more)

### Community 14 - "one"
Cohesion: 0.07
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+3 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (52): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+44 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "pg.mjs"
Cohesion: 0.09
Nodes (15): pg, vitest, out(), freshDatabase(), TEST_DATABASE_URL, dir, monolith, seedLocal (+7 more)

### Community 18 - "createCollaborationModule"
Cohesion: 0.12
Nodes (8): MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationNameDirectory, IOrganizationQueries, fixture()

### Community 19 - "admission.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 20 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 21 - "bundler.ts"
Cohesion: 0.13
Nodes (26): createProjectCheck(), ProjectCompilerPort, packageName(), FileMap, EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles() (+18 more)

### Community 22 - "PostgresProviderRepository.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 23 - "infrastructure/repositories.ts"
Cohesion: 0.14
Nodes (19): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), get(), metricsFor(), metricSnapshots, Open (+11 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (35): administrationController, api, TABS, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel() (+27 more)

### Community 26 - "project-observability/events.ts"
Cohesion: 0.08
Nodes (19): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+11 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (41): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+33 more)

### Community 30 - "agents.mjs"
Cohesion: 0.08
Nodes (30): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+22 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+46 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (54): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, ProjectDataError, listEmails (+46 more)

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "http.test.ts"
Cohesion: 0.15
Nodes (15): DEV_FIXTURE, Fixture, builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app (+7 more)

### Community 36 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (15): createCatalogService(), deleteModel(), saveModel(), updateProjectModels(), CompatEndpoint, creditsAtRate(), globToRegex(), matchesModelPolicy() (+7 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+15 more)

### Community 40 - "IMemberRepository"
Cohesion: 0.13
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 41 - "model-management/router.ts"
Cohesion: 0.11
Nodes (21): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), Posterior (+13 more)

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "ContextPorts"
Cohesion: 0.06
Nodes (17): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+9 more)

### Community 45 - "models/presentation/Models.tsx"
Cohesion: 0.15
Nodes (16): api, billingController, Meter(), Plan(), Usage, api, modelsController, ModelChecklist() (+8 more)

### Community 46 - "builder/contracts.ts"
Cohesion: 0.19
Nodes (19): summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+11 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+8 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "guides.ts"
Cohesion: 0.18
Nodes (12): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug() (+4 more)

### Community 54 - "ProjectDb"
Cohesion: 0.13
Nodes (9): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, createProjectRowsRepository(), projectRowsRepository (+1 more)

### Community 55 - "securityReview.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.12
Nodes (24): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+16 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (44): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), accountSchema, ActiveBuilderStream, BuilderServicePorts (+36 more)

### Community 67 - "createJobs"
Cohesion: 0.25
Nodes (14): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+6 more)

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (25): RuntimeObservationPorts, RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, bindRuntimeObservation() (+17 more)

### Community 69 - "infrastructure/playground.ts"
Cohesion: 0.11
Nodes (31): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+23 more)

### Community 70 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.08
Nodes (43): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+35 more)

### Community 72 - "accounts.ts"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 73 - "IOrganizationRepository"
Cohesion: 0.11
Nodes (11): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, InviteView, MemberView (+3 more)

### Community 74 - "policies.test.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket (+1 more)

### Community 78 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 80 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 81 - "ILoginCodeRepository"
Cohesion: 0.09
Nodes (6): IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, ILoginCodeRepository, IMailerService, IPasswordHasher

### Community 83 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 84 - "config.ts"
Cohesion: 0.09
Nodes (15): appPublicUrl(), browserAvailable, CONFIG_DEFAULTS, DEFAULT_MODELS_ALLOW, env, resolveAppRuntimePublicUrl(), resolvePublicUrl(), ROOT_DIR (+7 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.22
Nodes (13): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+5 more)

### Community 87 - "app-services/storage.ts"
Cohesion: 0.06
Nodes (26): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+18 more)

### Community 88 - "builderServer.ts"
Cohesion: 0.22
Nodes (11): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), runBuilderTurn(), stopBuilder(), metricsIdle() (+3 more)

### Community 89 - "app-services/context.ts"
Cohesion: 0.08
Nodes (17): Run, RunInput, bindJobs, AppEnv, JOB_LIMITS, jobPorts, log(), platformRepository (+9 more)

### Community 90 - "skills.test.ts"
Cohesion: 0.11
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 92 - "AgentExecution.ts"
Cohesion: 0.15
Nodes (11): AgentEvent, AgentExecutionResult, Block, ExecutionModel, ExecutionTool, Message, ToolDefinition, Usage (+3 more)

### Community 93 - "BootstrapService"
Cohesion: 0.12
Nodes (9): BootstrapService, SetupError, COMMON_PASSWORDS, Password, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy (+1 more)

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (10): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, PostgresAccountRepository (+2 more)

### Community 95 - "integrations/github.ts"
Cohesion: 0.11
Nodes (23): GithubError, Link, SyncResult, accountStatus, connectAccount, createRepo, disconnectAccount, getLink (+15 more)

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.16
Nodes (17): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+9 more)

### Community 97 - "Checkpoint"
Cohesion: 0.24
Nodes (3): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint

### Community 98 - "database/index.ts"
Cohesion: 0.11
Nodes (18): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+10 more)

### Community 99 - "appRuntimeHttp.ts"
Cohesion: 0.08
Nodes (24): hono@^4.13.14, @hono/node-server@^2.1.5, hono, @hono/node-server, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts (+16 more)

### Community 100 - "infrastructure/secrets.ts"
Cohesion: 0.15
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), secretPorts, SecretPorts

### Community 101 - "react"
Cohesion: 0.14
Nodes (24): react, App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners (+16 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 105 - "infrastructure/routing.ts"
Cohesion: 0.09
Nodes (26): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, anthropicChat() (+18 more)

### Community 106 - "SqlAgentTaskRepository.ts"
Cohesion: 0.17
Nodes (6): TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 107 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.10
Nodes (27): createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts(), allowedRequest() (+19 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "typecheck.ts"
Cohesion: 0.20
Nodes (12): checkProject, IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 110 - "model-management/providers.ts"
Cohesion: 0.11
Nodes (28): createLocalSeed(), readSeedFile(), SeedFile, lastSync(), providers(), saveModel(), startCatalogSync(), sync() (+20 more)

### Community 111 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 112 - "ports.ts"
Cohesion: 0.10
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, SharePorts, createPublication(), assertPublishable(), Author (+8 more)

### Community 113 - "sandbox.ts"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.14
Nodes (6): PlatformSettingType, SettingDef, SettingGroup, SettingView, SettingsDependencies, ISecretCipher

### Community 120 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 122 - "ISettingsStore"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 123 - "FinishGateAdapter.ts"
Cohesion: 0.16
Nodes (18): contractRoutes(), FileMap, formatStandard(), isUiSource(), lineOf(), standardsScan(), createProblemService(), changed() (+10 more)

### Community 124 - "cli.ts"
Cohesion: 0.19
Nodes (10): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), sendPlatformEmail, emailPorts (+2 more)

### Community 125 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 126 - "SqlAgentTaskRepository.ts"
Cohesion: 0.29
Nodes (6): ListAgentTasksUseCase, tasks, AgentTaskQueries, AgentTaskView, availableModels(), listCatalog()

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "ref_node_crypto"
Cohesion: 0.23
Nodes (7): createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder, dir, seedLocal

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
Cohesion: 0.15
Nodes (6): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingsError, PostgresPlatformSettingsStoreAdapter, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 138 - "metrics.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (25): requestSecret, assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+17 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 142 - "audit.ts"
Cohesion: 0.52
Nodes (4): audit(), bindModelAudit(), postgresModelAudit(), ModelAudit

### Community 144 - "PostgresSettingsRepository.ts"
Cohesion: 0.27
Nodes (5): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting

### Community 145 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 146 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (26): withDefaultHeaders(), app, handleMcp, lifecycle, listening(), monolith, reactions, resolveApp() (+18 more)

### Community 148 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 149 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 150 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 151 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 153 - "PostgresProviderRepository.ts"
Cohesion: 0.38
Nodes (6): encryptHeaders(), Input, postgresProviderRepository, decrypt(), encrypt(), key()

### Community 154 - "platformAllows"
Cohesion: 0.33
Nodes (6): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), allowedModels(), platformAllows()

### Community 155 - "safeFetch.ts"
Cohesion: 0.47
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 156 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "RunTaskLaneUseCase"
Cohesion: 0.40
Nodes (4): RunTaskLaneUseCase, fixture(), result, task

### Community 159 - "AgentExecutionPorts"
Cohesion: 0.13
Nodes (5): RunAgentUseCase, AgentExecutionPorts, fixture(), model, usage

### Community 161 - "ProjectServices"
Cohesion: 0.22
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.31
Nodes (11): MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath(), GROUPS, schemaOf() (+3 more)

### Community 344 - "application/context.ts"
Cohesion: 0.10
Nodes (9): AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext, publish(), ServiceContext (+1 more)

### Community 361 - "ICollaborationAccountRepository"
Cohesion: 0.15
Nodes (9): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount, ICollaborationAccountRepository (+1 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1188 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `pg.mjs` to `q`, `crypto.ts`, `composition.ts`, `http-client.ts`, `project-observability/security.ts`, `model-management/index.ts`, `evaluations/bindings.test.ts`, `one`, `memory/application/service.ts`, `createCollaborationModule`, `admission.ts`, `PostgresProviderRepository.ts`, `project-observability/events.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `Plan.ts`, `http.test.ts`, `ExecutionMetrics`, `models.ts`, `projects/application/usecases.ts`, `IMemberRepository`, `model-management/router.ts`, `builder/contracts.ts`, `package.json`, `ProjectsStore`, `guides.ts`, `ProjectDb`, `securityReview.ts`, `createIdentityModule`, `deps.ts`, `modules/builder/index.ts`, `app-runtime/index.ts`, `accounts.ts`, `IOrganizationRepository`, `runBuilderTurn`, `collaboration/postgresAdapters.test.ts`, `config.ts`, `domain/score.ts`, `Changes.tsx`, `app-services/storage.ts`, `builderServer.ts`, `app-services/context.ts`, `skills.test.ts`, `AgentExecution.ts`, `BootstrapService`, `modules/identity/index.ts`, `integrations/github.ts`, `Checkpoint`, `appRuntimeHttp.ts`, `usage/usage.ts`, `mcp/jobs.ts`, `ProjectPath`, `infrastructure/routing.ts`, `OrganizationSkillsService.ts`, `model-management/providers.ts`, `ports.ts`, `BuilderWorkflow.ts`, `devDependencies`, `RouterAdministration.ts`, `platform.ts`, `IntegrationRepository`, `ISettingsStore`, `FinishGateAdapter.ts`, `SqlAgentTaskRepository.ts`, `ref_node_crypto`, `metrics.test.ts`, `BuilderToolsAdapter.ts`, `ApplicationLifecycle`, `bootstrap/server.ts`, `exports.test.tsx`, `settingReactions.ts`, `createHttp`, `replaceVisibleText`, `transports/mcp.test.ts`, `RunTaskLaneUseCase`, `AgentExecutionPorts`, `architecture.test.ts`, `FinishGateAdapter.ts`, `application/context.ts`, `ICollaborationAccountRepository`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.07188160676532769 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `index.tsx`, `Chat.tsx`, `Workspace.tsx`, `http-client.ts`, `client/index.ts`, `models/presentation/Models.tsx`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Memory.tsx`, `exports.test.tsx`, `forms.tsx`, `Changes.tsx`, `administration/presentation/Models.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12292358803986711 - nodes in this community are weakly interconnected._