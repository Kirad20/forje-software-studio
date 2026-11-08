# Graph Report - repository-runtime-tdd  (2026-11-08)

## Corpus Check
- 741 files · ~358,680 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .css 7, (none) 6, .example 1)

## Summary
- 4918 nodes · 13101 edges · 200 communities (169 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 665 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `975c736e`
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
- ref_node_crypto
- FileMap
- appServer.ts
- ServicePanels.tsx
- createJobQueue
- model-management/providers.ts
- ports/context.ts
- modules/builder/index.ts
- server/index.ts
- domain/routing.ts
- BuilderToolsAdapter.ts
- fusion.ts
- FinishGateAdapter.ts
- projects/postgres.test.ts
- DockerRepositoryRunner
- application/problems.ts
- evaluations/bindings.test.ts
- infrastructure/runner.ts
- BuilderWorkflowPorts
- JobRuntimePorts
- model-management/catalog.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- skills.test.ts
- RepositoryRuntimeError
- domain/contracts.ts
- RunTaskLaneUseCase.ts
- vitest
- adminApi.ts
- PostgresAccountRepository
- domain/services.ts
- domain/score.ts
- ProjectDb
- PostgresRepositoryStore
- app-runtime/index.ts
- dependencies
- bootstrap/coreModules.ts
- skills.test.ts
- infrastructure/github.ts
- appRuntimeServer.ts
- config.ts
- AgentExecution.ts
- SqlAgentTaskRepository.ts
- agents.mjs
- project-observability/security.ts
- OrchestrationPolicy.ts
- composition.ts
- OrganizationSkillsService.ts
- GithubProjectPorts
- createAuth
- ProviderService.ts
- projectIndex.ts
- FusionOrchestrator.ts
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
- bundler.ts
- AppEnv
- infrastructure/apps.ts
- app-services/storage.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- modules/identity/index.ts
- q
- BuilderWorkflowPorts
- app-runtime/services.test.ts
- fusion.test.ts
- one
- Desplegar Forja en Coolify
- docker.ts
- internal/router.ts
- format.ts
- builder/contracts.ts
- index.tsx
- InviteMemberUseCase.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- devDependencies
- Changes.tsx
- repositoryApi.ts
- accounts.ts
- GithubAuthorization
- createSecrets
- Desplegar Forja en Coolify
- GithubError
- ProjectServices
- PostgresProjectsStore.ts
- model-management/router.ts
- modules/integrations/application/github.ts
- Audit.tsx
- AuthPorts
- infrastructure/cache.ts
- bootstrap/server.ts
- projectMicroservices.test.ts
- ModelClassification.ts
- ProjectKnowledge.tsx
- AppStore
- app-services/realtime.ts
- services
- createJobs
- createAdminMcpHandler
- app-services/analytics.ts
- model-management/audit.ts
- Author
- Panel de administración del sistema — diseño
- services
- Review Focus
- collaboration/ports/repositories.ts
- ContextPorts
- model-management/providers.ts
- forms.tsx
- domain/messages.ts
- app-services/payments.ts
- ProjectSandbox
- http.test.ts
- Estado del trabajo: repositorios originales y Forja autoalojada
- apiTypes.test.ts
- settingReactions.ts
- BuilderRunRegistry
- infrastructure/repositories.ts
- .execute
- projects/postgres.test.ts
- e2e.mjs
- { SHARE_COOKIE, RESERVED_SLUG, previewOrigin, appUrl, parseAppHost }
- app-runtime/infrastructure/browser.ts
- GithubRepository
- app-runtime
- One project: orders API and durable invoice worker
- settingReactions.ts
- deps.test.ts
- recheckBuild
- modules/collaboration/index.ts
- GithubProjectPorts
- cli.ts
- Cómo está hecho
- createProjectRows
- RepositoryRuntimePorts
- replaceVisibleText
- GithubRepository
- forja
- execution.test.ts
- IdentityRandom
- motion.tsx
- RealtimeTransport
- RunTaskLaneUseCase
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- judgeRouting.test.ts
- Workspace.tsx
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- TEST_DATABASE_URL
- { parseCookies, cookie }
- AgentExecutionSpec
- unit/catalog.test.ts
- GitHub integration
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- PostgresPlatformSettingsStoreAdapter
- PlatformSettingsRegistryAdapter
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

## Communities (200 total, 31 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (55): radix-ui@^1.8.1, lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel() (+47 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 2 - "Plan.ts"
Cohesion: 0.09
Nodes (25): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, checkContract(), checkPlanDoc(), CONTRACT_FILE, contractRoutes(), covers(), criteriaOf() (+17 more)

### Community 3 - "models.ts"
Cohesion: 0.09
Nodes (29): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+21 more)

### Community 4 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (54): 6. IA dentro de las apps, Pruebas de conexión, describeSchema, ScheduleTasksUseCase, rewardOf(), BuilderTool, typed(), active (+46 more)

### Community 5 - "infrastructure/playground.ts"
Cohesion: 0.16
Nodes (22): removeProjectData, removeProjectData(), ensureEvalAccount(), spentLast24h(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), admitPlayground() (+14 more)

### Community 6 - "studioApi.ts"
Cohesion: 0.06
Nodes (48): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, previewUrl(), shareToken(), aiUsage, analyticsSummary (+40 more)

### Community 7 - "bundler.ts"
Cohesion: 0.09
Nodes (31): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+23 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 9 - "accountLifecycle.ts"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 10 - "integrations/github.ts"
Cohesion: 0.15
Nodes (10): apps, imports, legacy, ports(), sync, githubAccountRepository, githubAuthorization, githubGateway (+2 more)

### Community 11 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (38): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, isProjectLogLine(), isProjectProblem(), isRecord() (+30 more)

### Community 12 - "application/problems.ts"
Cohesion: 0.07
Nodes (25): startAppRuntimeEventRelay(), createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, Problem, ProblemEffects (+17 more)

### Community 13 - "ExecutionMetrics"
Cohesion: 0.05
Nodes (31): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentToolRole (+23 more)

### Community 14 - "projectRows.ts"
Cohesion: 0.20
Nodes (3): createProjectData(), ProjectRowsPort, ProjectSchemaPort

### Community 15 - "execution-audit/index.ts"
Cohesion: 0.08
Nodes (36): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+28 more)

### Community 16 - "ProjectDb"
Cohesion: 0.10
Nodes (41): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+33 more)

### Community 17 - "ref_node_crypto"
Cohesion: 0.12
Nodes (19): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, createTestCoreModules(), drop(), freshDatabase(), TEST_DATABASE_URL, call(), cookiesFor() (+11 more)

### Community 18 - "FileMap"
Cohesion: 0.06
Nodes (33): api, evaluationsController, createEvaluationUseCases(), Agg, EvalCfg, Evals(), Metric(), money() (+25 more)

### Community 19 - "appServer.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 20 - "ServicePanels.tsx"
Cohesion: 0.10
Nodes (52): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+44 more)

### Community 21 - "createJobQueue"
Cohesion: 0.23
Nodes (9): 2. Ajustes globales, Almacén, Registro, createJobQueue(), poll(), processJob(), pump(), start() (+1 more)

### Community 22 - "model-management/providers.ts"
Cohesion: 0.12
Nodes (31): 6. API de administración, providerOf(), providers(), ProviderModel, speedFor(), tierFor(), createCatalogSync(), lastSync() (+23 more)

### Community 23 - "ports/context.ts"
Cohesion: 0.11
Nodes (9): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), EmailPorts, AppServiceEvent, ObserverPorts, QueryRepository (+1 more)

### Community 24 - "modules/builder/index.ts"
Cohesion: 0.05
Nodes (41): app, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), accountSchema, ActiveBuilderStream, BuilderServicePorts (+33 more)

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+9 more)

### Community 26 - "domain/routing.ts"
Cohesion: 0.08
Nodes (34): AgentSpec, TurnState, Catalog, KEYWORDS, RoleProfile, ROLES, Posterior, FusionBudget (+26 more)

### Community 27 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (29): requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+21 more)

### Community 28 - "fusion.ts"
Cohesion: 0.13
Nodes (19): createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createRouterAdministration(), routerStats(), meanOf(), FUSION_BUDGETS (+11 more)

### Community 29 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (18): CreateFinishGateUseCase, BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey() (+10 more)

### Community 30 - "projects/postgres.test.ts"
Cohesion: 0.13
Nodes (11): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, normalizeProjectProfile(), ProjectProfile, ProjectRuntime, SeoSettings (+3 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 33 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 34 - "infrastructure/runner.ts"
Cohesion: 0.09
Nodes (40): sessionCookie(), confirmPasswordReset, endSession, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut (+32 more)

### Community 37 - "model-management/catalog.ts"
Cohesion: 0.12
Nodes (26): 3. Proveedores y modelos, `llm/catalog.ts`, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels(), bindCatalogService(), bindCatalogSync() (+18 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (39): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+31 more)

### Community 39 - "composition.ts"
Cohesion: 0.09
Nodes (20): ProjectRuntime, createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph (+12 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.10
Nodes (7): AdminApiTokenError, IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "skills.test.ts"
Cohesion: 0.13
Nodes (21): BUILDER_SYSTEM_PROMPT, systemPromptForRuntime(), AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED (+13 more)

### Community 42 - "RepositoryRuntimeError"
Cohesion: 0.25
Nodes (23): createRepositoryEngine(), available(), build(), buildLocked(), configure(), deploy(), deployment(), errorMessage() (+15 more)

### Community 43 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 44 - "RunTaskLaneUseCase.ts"
Cohesion: 0.14
Nodes (9): TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask, TaskLaneHooks (+1 more)

### Community 45 - "vitest"
Cohesion: 0.11
Nodes (16): pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, pool, root, sources() (+8 more)

### Community 46 - "adminApi.ts"
Cohesion: 0.17
Nodes (17): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+9 more)

### Community 47 - "PostgresAccountRepository"
Cohesion: 0.13
Nodes (7): Account, AccountProps, PlatformRole, Email, AccountRow, PostgresAccountRepository, SessionAccountRow

### Community 48 - "domain/services.ts"
Cohesion: 0.09
Nodes (29): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles() (+21 more)

### Community 49 - "domain/score.ts"
Cohesion: 0.09
Nodes (34): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+26 more)

### Community 50 - "ProjectDb"
Cohesion: 0.11
Nodes (11): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, createProjectRowsRepository() (+3 more)

### Community 51 - "PostgresRepositoryStore"
Cohesion: 0.10
Nodes (9): API and lifecycle, Operator setup, Real-daemon verification, Repository runtime (Docker / Node), Running Forja itself, RepositoryState, PostgresRepositoryStore, RepositoryStore (+1 more)

### Community 52 - "app-runtime/index.ts"
Cohesion: 0.10
Nodes (24): RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRepositoryRuntime(), configureRuntimeProjects(), publishProject(), repositories(), RuntimeShareScope (+16 more)

### Community 53 - "dependencies"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 54 - "bootstrap/coreModules.ts"
Cohesion: 0.15
Nodes (17): CoreModulesDependencies, createCoreModules(), BcryptArgonPasswordHasher, createProjectKnowledgeModule(), burnPasswordCheck(), hashPassword(), LEGACY, newId() (+9 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "infrastructure/github.ts"
Cohesion: 0.44
Nodes (8): assertEditableRepositoryPath(), assertSafeRepositoryContent(), assertSafeRepositoryPath(), repositoryPathExclusion(), createGithubImportService(), blobSha(), setup(), setup()

### Community 57 - "appRuntimeServer.ts"
Cohesion: 0.07
Nodes (23): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), REPOSITORY_SHARE_COOKIE, RequestPorts (+15 more)

### Community 58 - "config.ts"
Cohesion: 0.11
Nodes (14): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall, beginTransaction(), dispatch(), sandboxes, WORKER, platformRepository (+6 more)

### Community 59 - "AgentExecution.ts"
Cohesion: 0.13
Nodes (15): GATE_FIXES, addUsage(), Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, emptyUsage() (+7 more)

### Community 60 - "SqlAgentTaskRepository.ts"
Cohesion: 0.23
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion

### Community 61 - "agents.mjs"
Cohesion: 0.08
Nodes (33): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+25 more)

### Community 62 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 63 - "OrchestrationPolicy.ts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 64 - "composition.ts"
Cohesion: 0.13
Nodes (26): createMonolith(), startBindings(), stopBindings(), bindJobs, configureJobRuntime(), jobPorts, configureAppServiceObserver(), log() (+18 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 67 - "createAuth"
Cohesion: 0.24
Nodes (12): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+4 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "FusionOrchestrator.ts"
Cohesion: 0.24
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 71 - "createJobs"
Cohesion: 0.10
Nodes (11): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+3 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 74 - "infrastructure/projectDb.ts"
Cohesion: 0.11
Nodes (36): publication, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeAll(), closeProject() (+28 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "admission.ts"
Cohesion: 0.08
Nodes (18): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+10 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 78 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 79 - "modules/repository-runtime/index.ts"
Cohesion: 0.14
Nodes (18): createRepositoryRuntime(), checkRepositoryShareToken(), RepositoryAccessScope, repositoryShareToken(), sign(), dockerCommand, childCookies(), childSetCookie() (+10 more)

### Community 80 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 81 - "ref_node_path"
Cohesion: 0.09
Nodes (22): playwright-core, vite, studioPwa(), here, root, server, types, worker (+14 more)

### Community 82 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "createGithubSyncService"
Cohesion: 0.26
Nodes (13): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+5 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.07
Nodes (40): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+32 more)

### Community 86 - "bundler.ts"
Cohesion: 0.14
Nodes (20): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, BuildError, bundleBrowser(), compileCache (+12 more)

### Community 87 - "AppEnv"
Cohesion: 0.15
Nodes (5): ClaimedJob, AppEnv, ProjectDbClient, JobsApi, JobPorts

### Community 88 - "infrastructure/apps.ts"
Cohesion: 0.14
Nodes (15): appJwt(), cache, credentials(), generations, githubAppStore, pending, gh(), tokenFor() (+7 more)

### Community 89 - "app-services/storage.ts"
Cohesion: 0.08
Nodes (14): createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+6 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.22
Nodes (6): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingsError, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 95 - "q"
Cohesion: 0.06
Nodes (10): PostgresMemberRepository, PostgresOrganizationRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, modelHealth(), recordModelHealth() (+2 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.09
Nodes (22): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+14 more)

### Community 97 - "app-runtime/services.test.ts"
Cohesion: 0.15
Nodes (16): checkProject, getSandboxServices(), restartSandboxService(), runInSandbox(), stopAllSandboxes(), call(), readServiceRuntime(), restartServiceRuntime() (+8 more)

### Community 98 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 99 - "one"
Cohesion: 0.08
Nodes (8): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, one(), Tx

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.14
Nodes (8): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository, mocks

### Community 101 - "docker.ts"
Cohesion: 0.17
Nodes (12): RepositoryConfig, RepositoryDeployment, RepositoryEnvironment, RepositoryRevision, RepositorySnapshot, safeRepositoryPath(), ContainerInspect, DockerRepositoryOptions (+4 more)

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 103 - "format.ts"
Cohesion: 0.15
Nodes (17): api, billingController, Meter(), Plan(), Usage, api, modelsController, AccountModels() (+9 more)

### Community 104 - "builder/contracts.ts"
Cohesion: 0.25
Nodes (15): summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS (+7 more)

### Community 105 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 106 - "InviteMemberUseCase.ts"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.12
Nodes (10): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies (+2 more)

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

### Community 112 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 113 - "repositoryApi.ts"
Cohesion: 0.43
Nodes (5): configPatch, registerRepositoryApi(), RepositoryApiEnv, RepositoryRuntime, app()

### Community 114 - "accounts.ts"
Cohesion: 0.19
Nodes (5): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, setup()

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 118 - "GithubError"
Cohesion: 0.17
Nodes (17): AppCredentials, branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation (+9 more)

### Community 119 - "ProjectServices"
Cohesion: 0.13
Nodes (12): CreateProjectInput, CreateProjectUseCase, parseStarterTemplate(), starterFiles(), StarterTemplate, ProjectsModuleDependencies, starterFiles(), ProjectServices (+4 more)

### Community 120 - "PostgresProjectsStore.ts"
Cohesion: 0.13
Nodes (7): BeforeImage, ChangeEntry, ProjectPatch, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 121 - "model-management/router.ts"
Cohesion: 0.11
Nodes (25): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), prior() (+17 more)

### Community 122 - "modules/integrations/application/github.ts"
Cohesion: 0.16
Nodes (6): RepoSelection, GithubGateway, ProjectRuntime, SyncResult, PreparedImport, decodeRepositoryBlob()

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 125 - "infrastructure/cache.ts"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 126 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (51): @hono/node-server@^2.1.5, @hono/node-server, ApplicationLifecycle, LifecycleService, app, lifecycle, monolith, runtimePorts (+43 more)

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "ModelClassification.ts"
Cohesion: 0.21
Nodes (15): ClassificationPorts, createModelClassification(), importProviderModels(), createModelRouter(), analyzeRequest(), pick(), maxTokensFor(), parseModelClassifications() (+7 more)

### Community 129 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 131 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish (+1 more)

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "createJobs"
Cohesion: 0.22
Nodes (15): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+7 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 136 - "model-management/audit.ts"
Cohesion: 0.52
Nodes (4): audit(), bindModelAudit(), postgresModelAudit(), ModelAudit

### Community 137 - "Author"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 138 - "Panel de administración del sistema — diseño"
Cohesion: 0.13
Nodes (15): 10. Documentación, 1. Capa de datos, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Conexión, Decisiones tomadas con el usuario, `.env` resultante (+7 more)

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 142 - "ContextPorts"
Cohesion: 0.17
Nodes (4): CheckoutInput, EmailResult, StoredObject, ContextPorts

### Community 143 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 144 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 145 - "domain/messages.ts"
Cohesion: 0.13
Nodes (20): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint, anthropicChat() (+12 more)

### Community 146 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 147 - "ProjectSandbox"
Cohesion: 0.20
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 148 - "http.test.ts"
Cohesion: 0.10
Nodes (21): AdminMcpModules, createMcpHandler(), builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app (+13 more)

### Community 149 - "Estado del trabajo: repositorios originales y Forja autoalojada"
Cohesion: 0.14
Nodes (12): Ejecución aislada, Estado del trabajo: repositorios originales y Forja autoalojada, Fallo actual y corrección local pendiente, Forja ejecutándose dentro de Forja, Implementado en esta funcionalidad, Importación, archivos y contexto, Lo que falta para cerrar la entrega, Límites conocidos y requisitos operativos (+4 more)

### Community 150 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "infrastructure/repositories.ts"
Cohesion: 0.24
Nodes (7): createQueryRepository(), statement(), statements, DatabasePorts, pool, ports, repository

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "projects/postgres.test.ts"
Cohesion: 0.18
Nodes (9): app, database, pool, projectOrganizations, remove, rename, services, store (+1 more)

### Community 156 - "e2e.mjs"
Cohesion: 0.09
Nodes (10): DATA, jar, req(), ROOT, server, signInAs(), dir, BEFORE (+2 more)

### Community 158 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (28): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+20 more)

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 164 - "recheckBuild"
Cohesion: 0.42
Nodes (10): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+2 more)

### Community 165 - "modules/collaboration/index.ts"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "cli.ts"
Cohesion: 0.17
Nodes (14): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+6 more)

### Community 168 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 169 - "createProjectRows"
Cohesion: 0.46
Nodes (7): createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 171 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 174 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 179 - "RunTaskLaneUseCase"
Cohesion: 0.40
Nodes (4): RunTaskLaneUseCase, fixture(), result, task

### Community 183 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 184 - "Workspace.tsx"
Cohesion: 0.07
Nodes (36): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+28 more)

### Community 192 - "unit/catalog.test.ts"
Cohesion: 0.11
Nodes (15): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+7 more)

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 309 - "package.json"
Cohesion: 0.06
Nodes (40): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+32 more)

## Knowledge Gaps
- **19 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1441 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `Plan.ts`, `models.ts`, `BuilderTurnAdapter.ts`, `studioApi.ts`, `bundler.ts`, `ProjectView.tsx`, `integrations/github.ts`, `application/problems.ts`, `ExecutionMetrics`, `execution-audit/index.ts`, `ref_node_crypto`, `FileMap`, `appServer.ts`, `model-management/providers.ts`, `modules/builder/index.ts`, `server/index.ts`, `domain/routing.ts`, `BuilderToolsAdapter.ts`, `fusion.ts`, `FinishGateAdapter.ts`, `projects/postgres.test.ts`, `evaluations/bindings.test.ts`, `composition.ts`, `policies.test.ts`, `skills.test.ts`, `RunTaskLaneUseCase.ts`, `adminApi.ts`, `PostgresAccountRepository`, `domain/services.ts`, `domain/score.ts`, `ProjectDb`, `PostgresRepositoryStore`, `app-runtime/index.ts`, `dependencies`, `bootstrap/coreModules.ts`, `infrastructure/github.ts`, `appRuntimeServer.ts`, `config.ts`, `AgentExecution.ts`, `SqlAgentTaskRepository.ts`, `project-observability/security.ts`, `OrchestrationPolicy.ts`, `composition.ts`, `ProviderService.ts`, `projectIndex.ts`, `FinishGatePolicy.ts`, `collaboration/postgresAdapters.test.ts`, `infrastructure/projectDb.ts`, `settings/index.ts`, `admission.ts`, `Panel de administración del sistema — diseño`, `usage/usage.ts`, `modules/repository-runtime/index.ts`, `ref_node_path`, `client/index.ts`, `mcp/server.ts`, `infrastructure/apps.ts`, `app-services/storage.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `modules/identity/index.ts`, `app-runtime/services.test.ts`, `fusion.test.ts`, `Desplegar Forja en Coolify`, `builder/contracts.ts`, `InviteMemberUseCase.ts`, `sandboxWorker.mjs`, `devDependencies`, `Changes.tsx`, `repositoryApi.ts`, `accounts.ts`, `createSecrets`, `GithubError`, `ProjectServices`, `model-management/router.ts`, `Audit.tsx`, `infrastructure/cache.ts`, `bootstrap/server.ts`, `ModelClassification.ts`, `Author`, `collaboration/ports/repositories.ts`, `model-management/providers.ts`, `domain/messages.ts`, `http.test.ts`, `apiTypes.test.ts`, `infrastructure/repositories.ts`, `projects/postgres.test.ts`, `e2e.mjs`, `settingReactions.ts`, `deps.test.ts`, `modules/collaboration/index.ts`, `replaceVisibleText`, `execution.test.ts`, `RunTaskLaneUseCase`, `judgeRouting.test.ts`, `unit/catalog.test.ts`, `package.json`?**
  _High betweenness centrality (0.301) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07746478873239436 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `ProjectKnowledge.tsx`, `internal/router.ts`, `format.ts`, `index.tsx`, `ProjectView.tsx`, `forms.tsx`, `Changes.tsx`, `client/index.ts`, `FileMap`, `ServicePanels.tsx`, `package.json`, `Workspace.tsx`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._