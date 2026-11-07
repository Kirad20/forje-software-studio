# Graph Report - repository-runtime-tdd  (2026-11-07)

## Corpus Check
- 740 files · ~357,151 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .css 7, (none) 6, .example 1)

## Summary
- 4905 nodes · 13087 edges · 198 communities (165 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 665 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21cd9c76`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- q
- Plan.ts
- models.ts
- BuilderTurnAdapter.ts
- infrastructure/playground.ts
- studioApi.ts
- bundler.ts
- ProjectView.tsx
- accountLifecycle.ts
- integrations/github.ts
- ProjectView.tsx
- application/problems.ts
- ExecutionMetrics
- projectRows.ts
- execution-audit/index.ts
- ProjectDb
- vitest
- FileMap
- appServer.ts
- ServicePanels.tsx
- createJobQueue
- infrastructure/probe.ts
- ports/context.ts
- builderService.ts
- server/index.ts
- domain/routing.ts
- BuilderToolsAdapter.ts
- model-management/index.ts
- OrgRole
- projects/postgres.test.ts
- DockerRepositoryRunner
- application/problems.ts
- evaluations/bindings.test.ts
- infrastructure/runner.ts
- BuilderWorkflowPorts
- app-services/context.ts
- model-management/catalog.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- skills.test.ts
- RepositoryRuntimeError
- domain/contracts.ts
- app-services/auth.ts
- fusion-persistence.test.ts
- adminApi.ts
- PostgresAccountRepository
- domain/services.ts
- domain/score.ts
- AppEnv
- PostgresRepositoryStore
- app-runtime/index.ts
- dependencies
- bootstrap/coreModules.ts
- skills.test.ts
- infrastructure/github.ts
- appRuntimeServer.ts
- builderService.ts
- AgentExecution.ts
- SqlAgentTaskRepository.ts
- agents.mjs
- project-observability/security.ts
- BuilderWorkflow.ts
- composition.ts
- OrganizationSkillsService.ts
- GithubProjectPorts
- createAuth
- ProviderService.ts
- projectIndex.ts
- Review Focus
- createJobs
- FinishGatePolicy.ts
- collaboration/postgresAdapters.test.ts
- infrastructure/projectDb.ts
- settings/index.ts
- admission.ts
- Panel de administración del sistema — diseño
- usage/usage.ts
- modules/repository-runtime/index.ts
- executeRun
- ref_node_path
- client/index.ts
- memory/application/service.ts
- createGithubSyncService
- mcp/server.ts
- internal/router.ts
- roles.ts
- infrastructure/apps.ts
- app-services/storage.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- modules/identity/index.ts
- q
- BuilderWorkflowPorts
- ProjectSandbox
- Inventario de funciones de Lovable → Forja
- one
- Desplegar Forja en Coolify
- domain/repository.ts
- internal/router.ts
- Plan.tsx
- mcp/jobs.ts
- index.tsx
- InviteMemberUseCase.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- devDependencies
- client.ts
- repositoryApi.ts
- accounts.ts
- GithubAuthorization
- createSecrets
- Panel de administración del sistema — diseño
- GithubError
- ProjectServices
- PostgresProjectFileRepository
- model-management/router.ts
- modules/integrations/application/github.ts
- Audit.tsx
- AuthPorts
- OrchestrationPolicy.ts
- bootstrap/server.ts
- projectMicroservices.test.ts
- model-management/providers.ts
- ProjectKnowledge.tsx
- AppStore
- CatalogRepository
- services
- createJobs
- createAdminMcpHandler
- app-services/analytics.ts
- PostgresCatalogRepository.ts
- Author
- createSecrets
- services
- Review Focus
- CheckAccessUseCase.ts
- ContextPorts
- model-management/providers.ts
- forms.tsx
- infrastructure/routing.ts
- app-services/payments.ts
- ref_node_child_process
- http.test.ts
- identity/boundaries.test.ts
- apiTypes.test.ts
- settingReactions.ts
- BuilderRunRegistry
- repository-docker.mjs
- .execute
- FastBuildPorts
- e2e.mjs
- { SHARE_COOKIE, RESERVED_SLUG, previewOrigin, appUrl, parseAppHost }
- app-runtime/infrastructure/browser.ts
- GithubRepository
- app-runtime
- One project: orders API and durable invoice worker
- deps.test.ts
- modules/projects/index.ts
- createCollaborationModule
- GithubProjectPorts
- cli.ts
- GithubRepository
- forja
- Plan
- IdentityRandom
- motion.tsx
- RealtimeTransport
- guides.ts
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- RealtimeTransport
- Workspace.tsx
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- TEST_DATABASE_URL
- { parseCookies, cookie }
- database/index.ts
- Evals.tsx
- repository-runtime-docker.mjs
- GitHub integration
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- createHttp
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- motion.tsx
- PostgresPlatformSettingsStoreAdapter
- SettingDefinition
- package.json

## God Nodes (most connected - your core abstractions)
1. `vitest` - 171 edges
2. `q()` - 111 edges
3. `createStudioApi()` - 79 edges
4. `react` - 52 edges
5. `AppEnv` - 47 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `createProjectsModule()` - 41 edges
9. `ProjectsStore` - 40 edges
10. `config` - 39 edges

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

## Communities (198 total, 33 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.06
Nodes (72): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+64 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 2 - "Plan.ts"
Cohesion: 0.11
Nodes (19): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+11 more)

### Community 3 - "models.ts"
Cohesion: 0.13
Nodes (30): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+22 more)

### Community 4 - "BuilderTurnAdapter.ts"
Cohesion: 0.06
Nodes (72): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), runAgent() (+64 more)

### Community 5 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (28): removeProjectData, removeProjectData(), admission, designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+20 more)

### Community 6 - "studioApi.ts"
Cohesion: 0.06
Nodes (52): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, previewUrl(), shareToken(), aiUsage, analyticsSummary (+44 more)

### Community 7 - "bundler.ts"
Cohesion: 0.07
Nodes (46): createDependencyResolution(), KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST, packageInfo (+38 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.08
Nodes (4): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore

### Community 9 - "accountLifecycle.ts"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 10 - "integrations/github.ts"
Cohesion: 0.20
Nodes (9): apps, createRepo(), imports, legacy, ports(), sync, githubAccountRepository, githubAuthorization (+1 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (42): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+34 more)

### Community 12 - "application/problems.ts"
Cohesion: 0.08
Nodes (18): startAppRuntimeEventRelay(), createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, Problem, ProblemEffects (+10 more)

### Community 13 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 14 - "projectRows.ts"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 15 - "execution-audit/index.ts"
Cohesion: 0.08
Nodes (37): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+29 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (46): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+38 more)

### Community 17 - "vitest"
Cohesion: 0.11
Nodes (23): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, createTestCoreModules() (+15 more)

### Community 18 - "FileMap"
Cohesion: 0.08
Nodes (23): api, collaborationController, createEvaluationUseCases(), createIdentityUseCases(), api, observabilityController, api, RepositoryConfig (+15 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "ServicePanels.tsx"
Cohesion: 0.07
Nodes (66): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+58 more)

### Community 21 - "createJobQueue"
Cohesion: 0.23
Nodes (9): 2. Ajustes globales, Almacén, Registro, createJobQueue(), poll(), processJob(), pump(), start() (+1 more)

### Community 22 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 23 - "ports/context.ts"
Cohesion: 0.09
Nodes (8): ClaimedJob, JobsApi, EmailPorts, JobPorts, AppServiceEvent, ObserverPorts, QueryRepository, StoragePorts

### Community 24 - "builderService.ts"
Cohesion: 0.08
Nodes (19): ChatMode, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService() (+11 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, RuntimeProjectsPort, createPublication() (+11 more)

### Community 26 - "domain/routing.ts"
Cohesion: 0.06
Nodes (48): AgentSpec, TurnState, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), pick(), KEYWORDS (+40 more)

### Community 27 - "BuilderToolsAdapter.ts"
Cohesion: 0.04
Nodes (44): requestSecret, CreateFinishGateUseCase, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName() (+36 more)

### Community 28 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), analyzeRequest(), bindModelAudit() (+17 more)

### Community 29 - "OrgRole"
Cohesion: 0.10
Nodes (12): CreateOrgResult, OrganizationNamesQuery, ORG_ROLES, OrgRole, PostgresOrganizationRepository, InviteView, IOrganizationNameDirectory, IOrganizationQueries (+4 more)

### Community 30 - "projects/postgres.test.ts"
Cohesion: 0.10
Nodes (16): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectProps, ProjectPath, ProjectRuntime, IProjectFileRepository, app (+8 more)

### Community 31 - "DockerRepositoryRunner"
Cohesion: 0.24
Nodes (4): RepositoryEnvironment, DockerRepositoryRunner, label(), pause()

### Community 32 - "application/problems.ts"
Cohesion: 0.09
Nodes (31): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+23 more)

### Community 33 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 34 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (25): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), EVAL_EMAIL, spentLast24h() (+17 more)

### Community 36 - "app-services/context.ts"
Cohesion: 0.08
Nodes (20): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), jobPorts (+12 more)

### Community 37 - "model-management/catalog.ts"
Cohesion: 0.13
Nodes (22): `llm/catalog.ts`, createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels(), availableModels(), catalog() (+14 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (39): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+31 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (20): ProjectRuntime, createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph (+12 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.10
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 42 - "RepositoryRuntimeError"
Cohesion: 0.25
Nodes (23): createRepositoryEngine(), available(), build(), buildLocked(), configure(), deploy(), deployment(), errorMessage() (+15 more)

### Community 43 - "domain/contracts.ts"
Cohesion: 0.16
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 44 - "app-services/auth.ts"
Cohesion: 0.20
Nodes (9): confirmPasswordReset, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut, signUp, userFromSession (+1 more)

### Community 45 - "fusion-persistence.test.ts"
Cohesion: 0.19
Nodes (11): creditsForUsd(), ExecutionContextMetrics, contextFields, contextMetrics(), listFusionTraces(), recordFusionStep(), recordFusionTrace(), billing (+3 more)

### Community 46 - "adminApi.ts"
Cohesion: 0.20
Nodes (15): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+7 more)

### Community 48 - "domain/services.ts"
Cohesion: 0.12
Nodes (26): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes() (+18 more)

### Community 49 - "domain/score.ts"
Cohesion: 0.11
Nodes (29): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+21 more)

### Community 50 - "AppEnv"
Cohesion: 0.08
Nodes (15): @electric-sql/pglite, CACHE_LIMITS, ProjectCache, AppEnv, AppDataPorts, createAppDataService(), TransactionSession, createProjectCacheRepository() (+7 more)

### Community 51 - "PostgresRepositoryStore"
Cohesion: 0.15
Nodes (6): API and lifecycle, Operator setup, Real-daemon verification, Repository runtime (Docker / Node), Running Forja itself, PostgresRepositoryStore

### Community 52 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (33): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, bindRuntimeObservation(), configureRepositoryRuntime() (+25 more)

### Community 53 - "dependencies"
Cohesion: 0.14
Nodes (3): CreateOrgUseCase, OrgPolicy, IOrganizationRepository

### Community 54 - "bootstrap/coreModules.ts"
Cohesion: 0.10
Nodes (20): createCoreModules(), depsKey(), PostgresCollaborationAccountRepository, BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresSessionRepository, config, burnPasswordCheck() (+12 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.07
Nodes (3): FileMap, PostgresProjectsStore, ProjectOrganizations

### Community 56 - "infrastructure/github.ts"
Cohesion: 0.48
Nodes (7): assertEditableRepositoryPath(), assertSafeRepositoryContent(), assertSafeRepositoryPath(), repositoryPathExclusion(), blobSha(), setup(), setup()

### Community 57 - "appRuntimeServer.ts"
Cohesion: 0.12
Nodes (11): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), REPOSITORY_SHARE_COOKIE, RequestPorts (+3 more)

### Community 58 - "builderService.ts"
Cohesion: 0.06
Nodes (39): app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, GATE_FIXES, AgentResult, calculateSpendUseCase (+31 more)

### Community 59 - "AgentExecution.ts"
Cohesion: 0.05
Nodes (47): RunAgentUseCase, summarize(), RunTaskLaneUseCase, addUsage(), AgentEvent, AgentExecutionResult, AgentExecutionSpec, Block (+39 more)

### Community 60 - "SqlAgentTaskRepository.ts"
Cohesion: 0.13
Nodes (8): ListAgentTasksUseCase, TaskLifecycleUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, AgentTaskRepository, TaskCompletion

### Community 61 - "agents.mjs"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 62 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 63 - "BuilderWorkflow.ts"
Cohesion: 0.19
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, requiresFinishGate(), useFastPath() (+2 more)

### Community 64 - "composition.ts"
Cohesion: 0.12
Nodes (31): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+23 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 67 - "createAuth"
Cohesion: 0.24
Nodes (12): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+4 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (7): CreateProjectInput, Project, Visibility, StarterTemplate, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "projectIndex.ts"
Cohesion: 0.11
Nodes (19): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+11 more)

### Community 70 - "Review Focus"
Cohesion: 0.25
Nodes (7): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 74 - "infrastructure/projectDb.ts"
Cohesion: 0.10
Nodes (39): app, monolith, runtimePorts, wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum() (+31 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "admission.ts"
Cohesion: 0.10
Nodes (15): AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget(), RunConfiguration (+7 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 78 - "usage/usage.ts"
Cohesion: 0.20
Nodes (5): createUsageService(), DAILY_ACTIONS, UsageRepository, actionsToday, countAction

### Community 79 - "modules/repository-runtime/index.ts"
Cohesion: 0.17
Nodes (14): checkShareToken(), createRepositoryRuntime(), checkRepositoryShareToken(), RepositoryAccessScope, repositoryShareToken(), sign(), childCookies(), childSetCookie() (+6 more)

### Community 80 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

### Community 81 - "ref_node_path"
Cohesion: 0.08
Nodes (23): vite, studioPwa(), here, root, server, types, worker, app (+15 more)

### Community 82 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "createGithubSyncService"
Cohesion: 0.24
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.15
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 86 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 87 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 88 - "infrastructure/apps.ts"
Cohesion: 0.14
Nodes (14): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, gh() (+6 more)

### Community 89 - "app-services/storage.ts"
Cohesion: 0.10
Nodes (14): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+6 more)

### Community 90 - "createProjectRows"
Cohesion: 0.21
Nodes (15): PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs, getPath() (+7 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.07
Nodes (16): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, COMMON_PASSWORDS, Password (+8 more)

### Community 95 - "q"
Cohesion: 0.08
Nodes (11): PostgresMemberRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, modelHealth(), recordModelHealth(), recordClassificationUsage(), countAction() (+3 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.09
Nodes (22): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+14 more)

### Community 97 - "ProjectSandbox"
Cohesion: 0.08
Nodes (26): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+18 more)

### Community 98 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 99 - "one"
Cohesion: 0.08
Nodes (10): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+2 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.13
Nodes (9): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository, githubRepository (+1 more)

### Community 101 - "domain/repository.ts"
Cohesion: 0.10
Nodes (8): RepositoryConfig, RepositoryDeployment, RepositoryRevision, RepositorySnapshot, RepositoryState, RepositoryRunner, RepositoryRuntimePorts, RepositoryStore

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (20): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+12 more)

### Community 103 - "Plan.tsx"
Cohesion: 0.42
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 104 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 105 - "index.tsx"
Cohesion: 0.19
Nodes (15): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 106 - "InviteMemberUseCase.ts"
Cohesion: 0.11
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ManageOrgMemberUseCase, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, CollaborationAccount (+3 more)

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 108 - "OrchestrationPolicy.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 111 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 112 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 113 - "repositoryApi.ts"
Cohesion: 0.47
Nodes (4): configPatch, registerRepositoryApi(), RepositoryApiEnv, app()

### Community 114 - "accounts.ts"
Cohesion: 0.19
Nodes (5): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, setup()

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "Panel de administración del sistema — diseño"
Cohesion: 0.04
Nodes (42): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+34 more)

### Community 118 - "GithubError"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 119 - "ProjectServices"
Cohesion: 0.11
Nodes (8): CoreModulesDependencies, CreateProjectUseCase, ProjectsModuleDependencies, ProjectServices, fixture(), creation(), load(), endpoint()

### Community 121 - "model-management/router.ts"
Cohesion: 0.11
Nodes (22): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), prior() (+14 more)

### Community 122 - "modules/integrations/application/github.ts"
Cohesion: 0.16
Nodes (6): GithubGateway, ProjectRuntime, SyncResult, createGithubImportService(), PreparedImport, decodeRepositoryBlob()

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 125 - "OrchestrationPolicy.ts"
Cohesion: 0.29
Nodes (8): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 126 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (45): ApplicationLifecycle, LifecycleService, lifecycle, shutdown(), startHttp(), shutdown(), withDefaultHeaders(), lifecycle (+37 more)

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "model-management/providers.ts"
Cohesion: 0.28
Nodes (13): speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), deleteProvider(), ensureProviders() (+5 more)

### Community 129 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 136 - "PostgresCatalogRepository.ts"
Cohesion: 0.26
Nodes (10): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, profileValues(), Row, toModel() (+2 more)

### Community 137 - "Author"
Cohesion: 0.27
Nodes (4): CreateCheckpointUseCase, Author, Checkpoint, CheckpointProps

### Community 138 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 142 - "ContextPorts"
Cohesion: 0.18
Nodes (4): CheckoutInput, EmailResult, StoredObject, ContextPorts

### Community 143 - "model-management/providers.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 144 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 145 - "infrastructure/routing.ts"
Cohesion: 0.06
Nodes (63): anthropicChat(), createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass() (+55 more)

### Community 146 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 147 - "ref_node_child_process"
Cohesion: 0.22
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 148 - "http.test.ts"
Cohesion: 0.18
Nodes (10): account, app, collaboration, identity, knowledge, mocks, models, projects (+2 more)

### Community 150 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "repository-docker.mjs"
Cohesion: 0.32
Nodes (7): call(), cookiesFor(), gateway, jars, root, scratch, runtimePorts()

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 156 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 158 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (29): playwright-core, SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+21 more)

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 164 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (20): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+12 more)

### Community 165 - "createCollaborationModule"
Cohesion: 0.14
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "cli.ts"
Cohesion: 0.13
Nodes (12): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+4 more)

### Community 179 - "guides.ts"
Cohesion: 0.17
Nodes (14): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+6 more)

### Community 184 - "Workspace.tsx"
Cohesion: 0.09
Nodes (32): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+24 more)

### Community 192 - "database/index.ts"
Cohesion: 0.09
Nodes (15): Task 3: Proveedores y modelos en BD + seeders, platformDb, Tx, wrap(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), dir (+7 more)

### Community 194 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 195 - "repository-runtime-docker.mjs"
Cohesion: 0.18
Nodes (11): safeRepositoryPath(), ContainerInspect, dockerCommand, DockerRepositoryOptions, excluded, selectBuildFiles(), contextRoot, files (+3 more)

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 200 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 208 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 213 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 309 - "package.json"
Cohesion: 0.06
Nodes (42): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5 (+34 more)

## Knowledge Gaps
- **19 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1431 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `Plan.ts`, `models.ts`, `BuilderTurnAdapter.ts`, `studioApi.ts`, `bundler.ts`, `ProjectView.tsx`, `application/problems.ts`, `ExecutionMetrics`, `execution-audit/index.ts`, `FileMap`, `ServicePanels.tsx`, `infrastructure/probe.ts`, `builderService.ts`, `server/index.ts`, `domain/routing.ts`, `BuilderToolsAdapter.ts`, `model-management/index.ts`, `projects/postgres.test.ts`, `evaluations/bindings.test.ts`, `app-services/context.ts`, `composition.ts`, `policies.test.ts`, `skills.test.ts`, `domain/contracts.ts`, `fusion-persistence.test.ts`, `adminApi.ts`, `domain/services.ts`, `domain/score.ts`, `AppEnv`, `app-runtime/index.ts`, `dependencies`, `bootstrap/coreModules.ts`, `infrastructure/github.ts`, `builderService.ts`, `AgentExecution.ts`, `SqlAgentTaskRepository.ts`, `project-observability/security.ts`, `BuilderWorkflow.ts`, `composition.ts`, `ProviderService.ts`, `projectIndex.ts`, `createJobs`, `FinishGatePolicy.ts`, `collaboration/postgresAdapters.test.ts`, `infrastructure/projectDb.ts`, `admission.ts`, `Panel de administración del sistema — diseño`, `usage/usage.ts`, `modules/repository-runtime/index.ts`, `ref_node_path`, `infrastructure/apps.ts`, `app-services/storage.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `modules/identity/index.ts`, `q`, `ProjectSandbox`, `Desplegar Forja en Coolify`, `mcp/jobs.ts`, `InviteMemberUseCase.ts`, `sandboxWorker.mjs`, `devDependencies`, `repositoryApi.ts`, `accounts.ts`, `createSecrets`, `GithubError`, `ProjectServices`, `model-management/router.ts`, `Audit.tsx`, `bootstrap/server.ts`, `model-management/providers.ts`, `Author`, `CheckAccessUseCase.ts`, `model-management/providers.ts`, `infrastructure/routing.ts`, `ref_node_child_process`, `http.test.ts`, `identity/boundaries.test.ts`, `apiTypes.test.ts`, `deps.test.ts`, `modules/projects/index.ts`, `createCollaborationModule`, `guides.ts`, `database/index.ts`, `createHttp`, `SettingDefinition`, `package.json`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05576707726763718 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `Evals.tsx`, `ProjectKnowledge.tsx`, `internal/router.ts`, `Plan.tsx`, `index.tsx`, `ProjectView.tsx`, `forms.tsx`, `motion.tsx`, `client/index.ts`, `FileMap`, `ServicePanels.tsx`, `package.json`, `internal/router.ts`, `Workspace.tsx`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._