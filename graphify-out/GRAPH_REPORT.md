# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 607 files · ~260,383 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4131 nodes · 10603 edges · 179 communities (147 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f0cf16b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- database/index.ts
- ModelRouter.ts
- appServer.ts
- http-client.ts
- crypto.ts
- appRuntimeHttp.ts
- with
- infrastructure/jobs.ts
- composition.ts
- evaluations/bindings.test.ts
- project-observability/security.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- createCollaborationModule
- admission.ts
- model-management/index.ts
- bundler.ts
- Desplegar Forja en Coolify
- infrastructure/routing.ts
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
- http.test.ts
- executeRun
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- roles.ts
- app-services/analytics.ts
- RunAgentUseCase.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- skills.test.ts
- infrastructure/repositories.ts
- projectIndex.ts
- server/index.ts
- model-management/catalog.ts
- createIdentityModule
- CLAUDE.md
- database/index.ts
- deps.ts
- sandboxWorker.mjs
- postgres
- infrastructure/probe.ts
- PostgresProjectsStore
- createJobs
- domain/securityScan.ts
- infrastructure/playground.ts
- client.ts
- Workspace.tsx
- integrations/github.ts
- IOrganizationRepository
- studio.mjs
- services
- createGithubSyncService
- guides.ts
- integrations/index.ts
- one
- securityReview.ts
- ILoginCodeRepository
- TEST_DATABASE_URL
- ModelRouter.ts
- ref_node_path
- domain/score.ts
- Changes.tsx
- BuilderWorkflow.ts
- AgentExecutionAdapter.ts
- AgentExecutionPorts
- mcp/jobs.ts
- GithubAuthorization
- builderService.ts
- BootstrapService
- app-services/context.ts
- app-runtime/index.ts
- ProjectsApplication.ts
- Memory.tsx
- Review Focus
- app-services/payments.ts
- AuthPorts
- react
- usage/usage.ts
- runBuilderTurn
- FastBuildPorts
- OrchestrationPolicy.ts
- RunTaskLaneUseCase.ts
- urls.ts
- OrganizationSkillsService.ts
- shared/security.ts
- model-management/providers.ts
- BuilderWorkflowPorts
- ports.ts
- sandbox.ts
- PostgresProjectFileRepository
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- toolOutputs.test.ts
- { api, auth, storage, ai }
- ISettingsStore
- typecheck.ts
- ProjectSnapshot
- transports/mcp.test.ts
- IntegrationRepository
- postgres
- healthcheck
- Plan.tsx
- app-runtime
- ProjectPath
- build
- policies.test.ts
- PlatformSettingsService
- ProjectDbClient
- builder
- PostgresOrganizationRepository
- metrics.test.ts
- BuilderToolsAdapter.ts
- forja
- FinishGateAdapter.ts
- TaskQueriesAdapter.ts
- Plan
- GithubAccountRepository
- PostgresPlatformSettingsStoreAdapter
- bootstrap/server.ts
- createProblemService
- replaceVisibleText
- ApiError
- collaboration/ports/repositories.ts
- spring.ts
- execution.test.ts
- accounts.ts
- forms.tsx
- model-management/router.test.ts
- Cómo está hecho
- createAuth
- IPasswordHasher
- exports.test.tsx
- AgentExecutionSpec
- GithubProjectPorts
- GithubRepository
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
4. `react` - 42 edges
5. `createIdentityModule()` - 42 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
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

## Communities (179 total, 32 thin omitted)

### Community 0 - "q"
Cohesion: 0.06
Nodes (8): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, q()

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (37): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+29 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (68): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+60 more)

### Community 4 - "database/index.ts"
Cohesion: 0.14
Nodes (14): pg, vitest, createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, pool, state (+6 more)

### Community 5 - "ModelRouter.ts"
Cohesion: 0.15
Nodes (23): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Effort, LlmResponse, Usage (+15 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (43): formatProblem(), analyticsBeacon(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache, cookie() (+35 more)

### Community 7 - "http-client.ts"
Cohesion: 0.06
Nodes (31): appServicesController, api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api (+23 more)

### Community 8 - "crypto.ts"
Cohesion: 0.10
Nodes (19): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresSessionRepository, config, burnPasswordCheck(), hashPassword() (+11 more)

### Community 9 - "appRuntimeHttp.ts"
Cohesion: 0.10
Nodes (18): hono@^4.13.14, hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+10 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/jobs.ts"
Cohesion: 0.06
Nodes (20): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+12 more)

### Community 12 - "composition.ts"
Cohesion: 0.10
Nodes (28): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), cloneDatabase(), initializeAppServices, bindEvaluationBuilder() (+20 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (49): ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background(), BUILDER_FILES (+41 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.08
Nodes (21): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentResult (+13 more)

### Community 18 - "createCollaborationModule"
Cohesion: 0.11
Nodes (14): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView (+6 more)

### Community 19 - "admission.ts"
Cohesion: 0.10
Nodes (15): AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget(), RunConfiguration (+7 more)

### Community 20 - "model-management/index.ts"
Cohesion: 0.14
Nodes (18): Catalog, bindModelAudit(), bindCatalogService(), bindCatalogSync(), ModelSpendView, ProjectModelPatch, ProjectModelSettings, RouterDecisionView (+10 more)

### Community 21 - "bundler.ts"
Cohesion: 0.16
Nodes (25): createProjectCheck(), packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo, PageInfo (+17 more)

### Community 22 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 23 - "infrastructure/routing.ts"
Cohesion: 0.14
Nodes (19): anthropicChat(), Block, LlmMessage, LlmRequest, LlmTool, ModelCallError, CompatEndpoint, anthropicChat() (+11 more)

### Community 24 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (46): react, administrationController, api, Admin(), TABS, AgentEvent, Agents(), ROLE_LABEL (+38 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.09
Nodes (17): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+9 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (17): CreateCheckpointUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, Checkpoint, CheckpointProps, IProjectFileRepository (+9 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.09
Nodes (23): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad (+15 more)

### Community 30 - "agents.mjs"
Cohesion: 0.10
Nodes (18): here, app, DATA, app, DATA, MODELS, req(), ROOT (+10 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (54): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+46 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (43): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, dumpDatabase(), execSql() (+35 more)

### Community 33 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "http.test.ts"
Cohesion: 0.11
Nodes (17): listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), stopEmailTransport, SettingsModule (+9 more)

### Community 36 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (14): createCatalogService(), allowedModels(), deleteModel(), saveModel(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (24): createIdentityUseCases(), ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+16 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.08
Nodes (17): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount (+9 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.15
Nodes (14): ROLES, createTurnFeedback(), penalizeTurn(), Posterior, feedbackModel(), TurnModelDecision, postgresTurnFeedback, ModelRouterPorts (+6 more)

### Community 42 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "roles.ts"
Cohesion: 0.08
Nodes (23): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+15 more)

### Community 45 - "app-services/analytics.ts"
Cohesion: 0.18
Nodes (11): recordPageView, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays() (+3 more)

### Community 46 - "RunAgentUseCase.ts"
Cohesion: 0.21
Nodes (19): GATE_FIXES, summarize(), addUsage(), emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+11 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.13
Nodes (19): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+11 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.10
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.09
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 54 - "infrastructure/repositories.ts"
Cohesion: 0.08
Nodes (24): AppDataPorts, createAppDataService(), TransactionSession, closeProject(), get(), metricsFor(), metricSnapshots, Open (+16 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "model-management/catalog.ts"
Cohesion: 0.24
Nodes (13): `llm/catalog.ts`, tasks, availableModels(), catalog(), createPlatformCatalogService(), deleteModel(), lastSync(), listCatalog() (+5 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (6): IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), PublicAccount, fixture()

### Community 60 - "database/index.ts"
Cohesion: 0.13
Nodes (16): Task 3: Proveedores y modelos en BD + seeders, [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile() (+8 more)

### Community 61 - "deps.ts"
Cohesion: 0.14
Nodes (20): createDependencyResolution(), KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion(), Deps (+12 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): FileMap, PostgresProjectsStore, ProjectOrganizations

### Community 67 - "createJobs"
Cohesion: 0.06
Nodes (33): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+25 more)

### Community 68 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 69 - "infrastructure/playground.ts"
Cohesion: 0.10
Nodes (32): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+24 more)

### Community 70 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.10
Nodes (33): api, Dashboard(), DeleteDialog(), IDEAS, Sort, SORT_LABEL, Status, STATUS_LABEL (+25 more)

### Community 72 - "integrations/github.ts"
Cohesion: 0.13
Nodes (19): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+11 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 74 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "guides.ts"
Cohesion: 0.28
Nodes (8): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug()

### Community 78 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 79 - "one"
Cohesion: 0.05
Nodes (13): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+5 more)

### Community 80 - "securityReview.ts"
Cohesion: 0.16
Nodes (9): describeSchema, BuilderTool, toolByName, typed(), Reported, running, runSecurityReview(), SEVERITIES (+1 more)

### Community 81 - "ILoginCodeRepository"
Cohesion: 0.08
Nodes (13): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, IdentityModuleDependencies (+5 more)

### Community 83 - "ModelRouter.ts"
Cohesion: 0.15
Nodes (18): createModelManagementQueries(), routerAudit(), updateProjectModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+10 more)

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (18): createDevelopmentSeed(), DEV_FIXTURE, Fixture, storagePorts, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+10 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 88 - "AgentExecutionAdapter.ts"
Cohesion: 0.13
Nodes (19): runAgent(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId(), pending, quiet(), recordStep() (+11 more)

### Community 89 - "AgentExecutionPorts"
Cohesion: 0.16
Nodes (6): Block, ExecutionTool, Message, ToolDefinition, Usage, AgentExecutionPorts

### Community 90 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 92 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "app-services/context.ts"
Cohesion: 0.16
Nodes (8): bindJobs, jobPorts, log(), configureSecretIntegrations(), secretPorts, JobRuntimePorts, requestSecret, secretEnv

### Community 95 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (26): bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult (+18 more)

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.18
Nodes (14): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+6 more)

### Community 97 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 98 - "Review Focus"
Cohesion: 0.17
Nodes (10): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+2 more)

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 101 - "react"
Cohesion: 0.10
Nodes (33): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners (+25 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "runBuilderTurn"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 105 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 106 - "RunTaskLaneUseCase.ts"
Cohesion: 0.13
Nodes (11): RunTaskLaneUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), LaneTask, TaskLaneHooks, TaskLanePorts (+3 more)

### Community 107 - "urls.ts"
Cohesion: 0.14
Nodes (16): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+8 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "shared/security.ts"
Cohesion: 0.19
Nodes (10): appHeaders(), clientIp(), createRateLimiter(), isHttps(), RateLimitError, RateLimitQuery, RateLimitStoreError, requestOrigin() (+2 more)

### Community 110 - "model-management/providers.ts"
Cohesion: 0.07
Nodes (40): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), providers() (+32 more)

### Community 112 - "ports.ts"
Cohesion: 0.08
Nodes (20): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, RuntimeProjectsPort, ProjectCompilerPort (+12 more)

### Community 113 - "sandbox.ts"
Cohesion: 0.18
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

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
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "toolOutputs.test.ts"
Cohesion: 0.18
Nodes (5): out(), dir, BEFORE, conforms(), dir

### Community 122 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 123 - "typecheck.ts"
Cohesion: 0.17
Nodes (15): readDeps(), checkProject, depsDir(), depsKey(), IGNORED, isSource(), MODULES, parseDiagnostics() (+7 more)

### Community 124 - "ProjectSnapshot"
Cohesion: 0.11
Nodes (7): CoreModulesDependencies, AppTarget, CreateProjectUseCase, ProjectSnapshot, ProjectsModuleDependencies, ProjectServices, project

### Community 125 - "transports/mcp.test.ts"
Cohesion: 0.20
Nodes (10): createMcpHandler(), builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, collaboration, handleMcp (+2 more)

### Community 126 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "Plan.tsx"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "policies.test.ts"
Cohesion: 0.07
Nodes (19): @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage() (+11 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 138 - "metrics.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (21): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), ownsFile(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+13 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (19): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+11 more)

### Community 142 - "TaskQueriesAdapter.ts"
Cohesion: 0.15
Nodes (8): ListAgentTasksUseCase, TaskLifecycleUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, AgentTaskRepository, TaskCompletion

### Community 143 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 144 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 146 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (39): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay() (+31 more)

### Community 147 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 148 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 150 - "collaboration/ports/repositories.ts"
Cohesion: 0.17
Nodes (6): CheckAccessUseCase, ProjectIdentity, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 152 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 153 - "accounts.ts"
Cohesion: 0.27
Nodes (6): connectAccount(), GithubError, Link, SyncResult, gh(), setup()

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 155 - "model-management/router.test.ts"
Cohesion: 0.25
Nodes (6): a, b, features, response, scope, setup()

### Community 156 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.21
Nodes (15): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+7 more)

### Community 344 - "application/context.ts"
Cohesion: 0.07
Nodes (21): beginTransaction(), dispatch(), ProjectSandbox, Run, RunInput, runInSandbox(), SandboxError, sandboxes (+13 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1198 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `database/index.ts` to `appServer.ts`, `http-client.ts`, `crypto.ts`, `composition.ts`, `evaluations/bindings.test.ts`, `project-observability/security.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `createCollaborationModule`, `admission.ts`, `model-management/index.ts`, `infrastructure/routing.ts`, `ApplicationLifecycle`, `project-observability/problems.ts`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `SettingDefinition`, `Plan.ts`, `http.test.ts`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `RunAgentUseCase.ts`, `mcp/server.ts`, `package.json`, `ProjectsStore`, `skills.test.ts`, `infrastructure/repositories.ts`, `projectIndex.ts`, `server/index.ts`, `createIdentityModule`, `deps.ts`, `integrations/github.ts`, `IOrganizationRepository`, `ILoginCodeRepository`, `ModelRouter.ts`, `ref_node_path`, `domain/score.ts`, `Changes.tsx`, `BuilderWorkflow.ts`, `AgentExecutionAdapter.ts`, `AgentExecutionPorts`, `mcp/jobs.ts`, `builderService.ts`, `BootstrapService`, `app-services/context.ts`, `app-runtime/index.ts`, `usage/usage.ts`, `runBuilderTurn`, `RunTaskLaneUseCase.ts`, `OrganizationSkillsService.ts`, `shared/security.ts`, `model-management/providers.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `toolOutputs.test.ts`, `ISettingsStore`, `ProjectSnapshot`, `transports/mcp.test.ts`, `IntegrationRepository`, `ProjectPath`, `policies.test.ts`, `PlatformSettingsService`, `metrics.test.ts`, `BuilderToolsAdapter.ts`, `FinishGateAdapter.ts`, `TaskQueriesAdapter.ts`, `GithubAccountRepository`, `bootstrap/server.ts`, `replaceVisibleText`, `ApiError`, `collaboration/ports/repositories.ts`, `execution.test.ts`, `accounts.ts`, `model-management/router.test.ts`, `exports.test.tsx`, `architecture.test.ts`?**
  _High betweenness centrality (0.267) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `exports.test.tsx`, `index.tsx`, `Plan.tsx`, `Chat.tsx`, `Memory.tsx`, `react`, `http-client.ts`, `Workspace.tsx`, `client/index.ts`, `integrations/index.ts`, `internal/router.ts`, `package.json`, `Changes.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11818181818181818 - nodes in this community are weakly interconnected._