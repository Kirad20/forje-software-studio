# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 612 files · ~266,994 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .css 4, .example 1)

## Summary
- 4159 nodes · 10676 edges · 194 communities (163 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 580 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c386ab4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sandbox.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- roles.ts
- ModelRouter.ts
- appServer.ts
- http-client.ts
- ISessionRepository
- bootstrap/server.ts
- with
- ContextPorts
- composition.ts
- evaluations/bindings.test.ts
- project-observability/security.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- modules/identity/index.ts
- model-management/catalog.ts
- model-management/index.ts
- bundler.ts
- executeRun
- domain/messages.ts
- ApplicationLifecycle
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- BuilderWorkflow.ts
- OrchestrationPolicy.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- ref_node_crypto
- createCollaborationModule
- infrastructure/playground.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- skills.test.ts
- domain/securityScan.ts
- projectIndex.ts
- server/index.ts
- AgentExecutionPorts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- securityReview.ts
- PostgresProjectsStore
- createJobs
- modules/builder/index.ts
- Workspace.tsx
- client.ts
- Dashboard.tsx
- IntegrationRepository
- IOrganizationRepository
- studio.mjs
- services
- createGithubSyncService
- collaboration/postgresAdapters.test.ts
- app-runtime/index.ts
- one
- urls.ts
- infrastructure/appDataService.ts
- TEST_DATABASE_URL
- ModelRouter.ts
- ref_node_path
- domain/score.ts
- Changes.tsx
- PostgresCatalogRepository.ts
- toolOutputs.test.ts
- RunAgentUseCase.ts
- createAnalytics
- GithubAuthorization
- builderService.ts
- BootstrapService
- app-services/context.ts
- app-runtime/index.ts
- ProjectsApplication.ts
- crypto.ts
- Review Focus
- app-services/payments.ts
- settingReactions.ts
- react
- usage/usage.ts
- Account
- Plan
- integrations/index.ts
- AgentExecutionResult
- appRuntimeServer.ts
- OrganizationSkillsService.ts
- guides.ts
- model-management/providers.ts
- BuilderWorkflowPorts
- ports.ts
- e2e.mjs
- mcp/jobs.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- PostgresMemberRepository
- { api, auth, storage, ai }
- ISettingsStore
- SqlAgentTaskRepository.ts
- ProjectServices
- http.test.ts
- app-services/context.ts
- postgres
- healthcheck
- models/presentation/Models.tsx
- app-runtime
- adminApi.ts
- build
- FastBuildPorts
- PlatformSettingsService
- apiTypes.test.ts
- builder
- ProjectEvent
- executeRun
- BuilderToolsAdapter.ts
- forja
- FinishGateAdapter.ts
- createSecrets
- ports/context.ts
- GithubAccountRepository
- IMailerService
- createProjectRows
- integrations/github.ts
- accountLifecycle.ts
- createHttp
- ProjectDbClient
- spring.ts
- CheckAccessUseCase.ts
- infrastructure/github.ts
- forms.tsx
- replaceVisibleText
- Desplegar Forja en Coolify
- createAuth
- app-services/realtime.ts
- format.ts
- Checkpoint
- AgentTaskView
- GithubProjectPorts
- OrgRole
- q
- GithubRepository
- createProblemService
- infrastructure/ai.ts
- ProjectPath
- database/index.ts
- BuilderRunRegistry
- Inventario de interfaz de Floot → Forja
- Cómo está hecho
- 1. Capa de datos
- RunTaskLaneUseCase
- motion.tsx
- AgentExecutionSpec
- architecture.test.ts
- settings/index.ts
- GithubGateway
- application/context.ts
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
4. `react` - 45 edges
5. `createIdentityModule()` - 42 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `PostgresProjectsStore` - 35 edges
10. `ProjectView()` - 35 edges

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

## Communities (194 total, 31 thin omitted)

### Community 0 - "sandbox.ts"
Cohesion: 0.16
Nodes (9): beginTransaction(), dispatch(), ProjectSandbox, runInSandbox(), SandboxError, sandboxes, SandboxRunError, WORKER (+1 more)

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+8 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.16
Nodes (26): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), EVAL_EMAIL, spentLast24h() (+18 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.06
Nodes (54): ChatStreamEvent, api, builderController, streamGet, streamPost, Lane, TeamTurn, Block (+46 more)

### Community 4 - "roles.ts"
Cohesion: 0.08
Nodes (22): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 5 - "ModelRouter.ts"
Cohesion: 0.13
Nodes (24): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, Usage (+16 more)

### Community 6 - "appServer.ts"
Cohesion: 0.12
Nodes (35): analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache, cookie() (+27 more)

### Community 7 - "http-client.ts"
Cohesion: 0.10
Nodes (16): appServicesController, createEvaluationUseCases(), filesController, transport, createController(), HttpOptions, HttpPort, ApiError (+8 more)

### Community 8 - "ISessionRepository"
Cohesion: 0.20
Nodes (3): LoginWithPasswordUseCase, IPasswordHasher, ISessionRepository

### Community 9 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (44): hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+36 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ContextPorts"
Cohesion: 0.09
Nodes (9): AppAiResult, AppUser, CheckoutInput, EmailInput, EmailResult, StoredObject, AuthPorts, ContextPorts (+1 more)

### Community 12 - "composition.ts"
Cohesion: 0.10
Nodes (31): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+23 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (20): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+12 more)

### Community 14 - "project-observability/security.ts"
Cohesion: 0.14
Nodes (9): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+1 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (47): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+39 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (14): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+6 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 18 - "modules/identity/index.ts"
Cohesion: 0.16
Nodes (4): UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IAccountRepository, ILoginCodeRepository

### Community 19 - "model-management/catalog.ts"
Cohesion: 0.17
Nodes (17): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), listTasks(), tasks, availableModels(), catalog() (+9 more)

### Community 20 - "model-management/index.ts"
Cohesion: 0.15
Nodes (16): bindModelAudit(), bindCatalogService(), bindCatalogSync(), ModelSpendView, ProjectModelPatch, ProjectModelSettings, RouterDecisionView, Mode (+8 more)

### Community 21 - "bundler.ts"
Cohesion: 0.13
Nodes (29): createProjectCheck(), Deps, packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo (+21 more)

### Community 22 - "executeRun"
Cohesion: 0.10
Nodes (15): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+7 more)

### Community 23 - "domain/messages.ts"
Cohesion: 0.10
Nodes (25): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError, anthropicChat() (+17 more)

### Community 24 - "ApplicationLifecycle"
Cohesion: 0.11
Nodes (15): @hono/node-server@^2.1.5, @hono/node-server, ApplicationLifecycle, LifecycleService, shutdown(), app, lifecycle, monolith (+7 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.07
Nodes (59): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+51 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.16
Nodes (10): createLogService(), LogEntry, LogRepository, BuildProblem, locate(), Problem, ProblemKind, ProblemRepository (+2 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.16
Nodes (13): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario (+5 more)

### Community 30 - "agents.mjs"
Cohesion: 0.08
Nodes (22): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+14 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (57): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+49 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (43): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, StoredObject, listEmails, receiveEmail, sendEmail (+35 more)

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 36 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.09
Nodes (20): createCatalogService(), allowedModels(), deleteModel(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), updateProjectModels() (+12 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.12
Nodes (19): createIdentityUseCases(), ProjectEvent, ProjectLogLine, projectsController, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+11 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (12): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ManageOrgMemberUseCase, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository (+4 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.15
Nodes (17): ROLES, createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback, routingPorts (+9 more)

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+10 more)

### Community 44 - "ref_node_crypto"
Cohesion: 0.13
Nodes (15): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, createTestCoreModules(), drop(), freshDatabase(), TEST_DATABASE_URL, dataDir (+7 more)

### Community 45 - "createCollaborationModule"
Cohesion: 0.19
Nodes (5): ClaimInvitesUseCase, MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 46 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (28): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), judgeDesign() (+20 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+7 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, nodemailer@^10.3.1 (+30 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.09
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 54 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "AgentExecutionPorts"
Cohesion: 0.13
Nodes (5): RunAgentUseCase, AgentExecutionPorts, fixture(), model, usage

### Community 58 - "createIdentityModule"
Cohesion: 0.13
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

### Community 65 - "securityReview.ts"
Cohesion: 0.24
Nodes (7): toolByName, getProject(), Reported, running, runSecurityReview(), SEVERITIES, startSecurityReview()

### Community 67 - "createJobs"
Cohesion: 0.25
Nodes (14): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+6 more)

### Community 68 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (29): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), readFile(), estTokens(), GATE_THRESHOLD, metricsReport (+21 more)

### Community 69 - "Workspace.tsx"
Cohesion: 0.06
Nodes (31): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+23 more)

### Community 70 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 71 - "Dashboard.tsx"
Cohesion: 0.11
Nodes (31): AgentLanes(), LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL, tokens() (+23 more)

### Community 72 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 73 - "IOrganizationRepository"
Cohesion: 0.15
Nodes (3): CreateOrgUseCase, OrgPolicy, IOrganizationRepository

### Community 74 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.15
Nodes (9): vitest, PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (22): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, stopAppRuntime(), suggestSlug, AppTarget, loadFiles() (+14 more)

### Community 79 - "one"
Cohesion: 0.07
Nodes (8): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, IdentityRandom, one()

### Community 80 - "urls.ts"
Cohesion: 0.17
Nodes (12): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+4 more)

### Community 81 - "infrastructure/appDataService.ts"
Cohesion: 0.13
Nodes (8): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, isInternalServiceRequest()

### Community 83 - "ModelRouter.ts"
Cohesion: 0.17
Nodes (18): Catalog, createModelManagementQueries(), routerAudit(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+10 more)

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (19): vite, appPublicUrl(), storagePorts, browserAvailable, CONFIG_DEFAULTS, DEFAULT_MODELS_ALLOW, env, paths (+11 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "PostgresCatalogRepository.ts"
Cohesion: 0.29
Nodes (6): audit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 88 - "toolOutputs.test.ts"
Cohesion: 0.17
Nodes (5): out(), dir, BEFORE, conforms(), dir

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.20
Nodes (20): GATE_FIXES, summarize(), addUsage(), emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+12 more)

### Community 90 - "createAnalytics"
Cohesion: 0.19
Nodes (10): analyticsSummary, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays() (+2 more)

### Community 92 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.12
Nodes (11): BootstrapService, SetupError, COMMON_PASSWORDS, Password, IdentityModuleDependencies, NodeBootstrapCrypto, IdentityAccountsDependencies, BootstrapAccounts (+3 more)

### Community 94 - "app-services/context.ts"
Cohesion: 0.14
Nodes (11): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, JOB_LIMITS (+3 more)

### Community 95 - "app-runtime/index.ts"
Cohesion: 0.16
Nodes (17): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+9 more)

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.16
Nodes (17): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+9 more)

### Community 97 - "crypto.ts"
Cohesion: 0.19
Nodes (13): BcryptArgonPasswordHasher, burnPasswordCheck(), decrypt(), encrypt(), hashPassword(), key(), LEGACY, passwordNeedsRehash() (+5 more)

### Community 98 - "Review Focus"
Cohesion: 0.25
Nodes (7): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 99 - "app-services/payments.ts"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 101 - "react"
Cohesion: 0.08
Nodes (30): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+22 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.14
Nodes (9): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, usageSummary (+1 more)

### Community 103 - "Account"
Cohesion: 0.15
Nodes (7): RequestLoginCodeUseCase, Account, AccountProps, PlatformRole, Email, AccountRow, SessionAccountRow

### Community 104 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 105 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 106 - "AgentExecutionResult"
Cohesion: 0.15
Nodes (11): AgentEvent, AgentExecutionResult, Block, ExecutionModel, ExecutionTool, Message, ToolDefinition, Usage (+3 more)

### Community 107 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (30): app, monolith, runtimePorts, wss, authPorts, cloneDatabase(), closeAll(), closeProject() (+22 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.12
Nodes (13): createCoreModules(), OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository (+5 more)

### Community 109 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+5 more)

### Community 110 - "model-management/providers.ts"
Cohesion: 0.13
Nodes (17): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+9 more)

### Community 112 - "ports.ts"
Cohesion: 0.09
Nodes (18): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, ProjectCompilerPort, createPublication(), assertPublishable() (+10 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.10
Nodes (11): PlatformSettingType, SettingDef, SettingGroup, SettingView, PostgresSettingsRepository, SettingsRepository, AuditAction, SettingsDependencies (+3 more)

### Community 120 - "PostgresMemberRepository"
Cohesion: 0.20
Nodes (3): PostgresMemberRepository, InviteView, MemberView

### Community 122 - "ISettingsStore"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 123 - "SqlAgentTaskRepository.ts"
Cohesion: 0.18
Nodes (6): TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 124 - "ProjectServices"
Cohesion: 0.22
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 125 - "http.test.ts"
Cohesion: 0.11
Nodes (19): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, SettingsModule, account, app, collaboration (+11 more)

### Community 126 - "app-services/context.ts"
Cohesion: 0.10
Nodes (16): bindJobs, sendPlatformEmail, emailPorts, resetTransport(), jobPorts, configureAppServiceObserver(), log(), platformRepository (+8 more)

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "models/presentation/Models.tsx"
Cohesion: 0.24
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "adminApi.ts"
Cohesion: 0.09
Nodes (43): 6. API de administración, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+35 more)

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 134 - "PlatformSettingsService"
Cohesion: 0.15
Nodes (6): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingsError, PostgresPlatformSettingsStoreAdapter, fixture(), fixture()

### Community 135 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "ProjectEvent"
Cohesion: 0.17
Nodes (3): ProjectEvent, ProblemEffects, ProblemPorts

### Community 138 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (22): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+14 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (18): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+10 more)

### Community 142 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 143 - "ports/context.ts"
Cohesion: 0.10
Nodes (7): EmailPorts, JobCron, JobPorts, AppServiceEvent, ObserverPorts, QueryRepository, StoragePorts

### Community 144 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 146 - "createProjectRows"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 147 - "integrations/github.ts"
Cohesion: 0.13
Nodes (16): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+8 more)

### Community 148 - "accountLifecycle.ts"
Cohesion: 0.15
Nodes (4): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository, state

### Community 149 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 153 - "infrastructure/github.ts"
Cohesion: 0.25
Nodes (8): GithubError, Link, SyncResult, gh(), githubAccountRepository, githubAuthorization, tokenFor(), setup()

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 155 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 156 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (20): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+12 more)

### Community 158 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (8): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 159 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 160 - "Checkpoint"
Cohesion: 0.24
Nodes (3): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint

### Community 161 - "AgentTaskView"
Cohesion: 0.38
Nodes (3): ListAgentTasksUseCase, AgentTaskQueries, AgentTaskView

### Community 164 - "OrgRole"
Cohesion: 0.15
Nodes (9): CreateOrgResult, OrganizationNamesQuery, OrganizationQueries, ORG_ROLES, OrgRole, IOrganizationNameDirectory, IOrganizationQueries, Org (+1 more)

### Community 165 - "q"
Cohesion: 0.07
Nodes (9): PostgresOrganizationRepository, OrganizationRecord, PostgresAccountRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, sha256() (+1 more)

### Community 167 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 168 - "infrastructure/ai.ts"
Cohesion: 0.22
Nodes (9): aiUsage, AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, aiPorts, AiModel (+1 more)

### Community 170 - "database/index.ts"
Cohesion: 0.09
Nodes (23): Task 3: Proveedores y modelos en BD + seeders, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE (+15 more)

### Community 171 - "BuilderRunRegistry"
Cohesion: 0.22
Nodes (4): BuilderRunRegistry, isBuilding(), runBuilderTurn(), stopBuilding()

### Community 172 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 173 - "Cómo está hecho"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 174 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 175 - "RunTaskLaneUseCase"
Cohesion: 0.40
Nodes (4): RunTaskLaneUseCase, fixture(), result, task

### Community 176 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.31
Nodes (11): MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath(), GROUPS, schemaOf() (+3 more)

### Community 344 - "application/context.ts"
Cohesion: 0.10
Nodes (12): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, publish() (+4 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1210 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `collaboration/postgresAdapters.test.ts` to `http-client.ts`, `bootstrap/server.ts`, `composition.ts`, `evaluations/bindings.test.ts`, `project-observability/security.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `modules/identity/index.ts`, `model-management/index.ts`, `executeRun`, `domain/messages.ts`, `ApplicationLifecycle`, `project-observability/problems.ts`, `modules/projects/index.ts`, `agents.mjs`, `Plan.ts`, `BuilderWorkflow.ts`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `ref_node_crypto`, `createCollaborationModule`, `package.json`, `ProjectsStore`, `skills.test.ts`, `projectIndex.ts`, `server/index.ts`, `AgentExecutionPorts`, `createIdentityModule`, `deps.ts`, `modules/builder/index.ts`, `IntegrationRepository`, `app-runtime/index.ts`, `infrastructure/appDataService.ts`, `ModelRouter.ts`, `ref_node_path`, `domain/score.ts`, `Changes.tsx`, `toolOutputs.test.ts`, `RunAgentUseCase.ts`, `builderService.ts`, `BootstrapService`, `app-services/context.ts`, `crypto.ts`, `app-services/payments.ts`, `settingReactions.ts`, `usage/usage.ts`, `Account`, `AgentExecutionResult`, `appRuntimeServer.ts`, `OrganizationSkillsService.ts`, `guides.ts`, `model-management/providers.ts`, `ports.ts`, `mcp/jobs.ts`, `devDependencies`, `RouterAdministration.ts`, `platform.ts`, `ISettingsStore`, `SqlAgentTaskRepository.ts`, `http.test.ts`, `app-services/context.ts`, `adminApi.ts`, `apiTypes.test.ts`, `BuilderToolsAdapter.ts`, `FinishGateAdapter.ts`, `GithubAccountRepository`, `integrations/github.ts`, `accountLifecycle.ts`, `createHttp`, `CheckAccessUseCase.ts`, `infrastructure/github.ts`, `replaceVisibleText`, `Checkpoint`, `AgentTaskView`, `ProjectPath`, `database/index.ts`, `BuilderRunRegistry`, `RunTaskLaneUseCase`, `architecture.test.ts`?**
  _High betweenness centrality (0.272) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `format.ts`, `index.tsx`, `models/presentation/Models.tsx`, `Chat.tsx`, `react`, `Workspace.tsx`, `Dashboard.tsx`, `projects/application/usecases.ts`, `integrations/index.ts`, `client/index.ts`, `internal/router.ts`, `package.json`, `motion.tsx`, `Changes.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `roles.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08307692307692308 - nodes in this community are weakly interconnected._