# Graph Report - github-pwa-validation  (2026-11-07)

## Corpus Check
- 712 files · ~336,430 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 4718 nodes · 12407 edges · 205 communities (170 shown, 35 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 632 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Chat.tsx
- q
- BuilderTurnAdapter.ts
- react
- bootstrap/server.ts
- ProjectView.tsx
- AgentExecution.ts
- projects/application/usecases.ts
- ProjectView.tsx
- builderServer.ts
- database/index.ts
- infrastructure/playground.ts
- app-runtime/index.ts
- FusionOrchestrator.ts
- http-client.ts
- roles.ts
- ProjectDb
- admission.ts
- FileMap
- appServer.ts
- app-runtime/index.ts
- models.ts
- ProjectSandbox
- Memory.tsx
- modules/collaboration/index.ts
- server/index.ts
- model-management/index.ts
- BuilderToolsAdapter.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- OrgRole
- one
- domain/score.ts
- composition.ts
- policies.test.ts
- builder/contracts.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- CreateProjectUseCase.ts
- domain/services.ts
- domain/messages.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- Workspace.tsx
- application/context.ts
- dependencies
- q
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- infrastructure/playground.ts
- agents.mjs
- jobWorkerServer.ts
- infrastructure/projectDb.ts
- vitest
- OrganizationSkillsService.ts
- package.json
- IPersonalOrganizationRepository
- Project
- github.mjs
- model-management/catalog.ts
- createJobs
- FinishGatePolicy.ts
- Account
- composition.ts
- settings/index.ts
- model-management/catalog.ts
- Panel de administración del sistema — diseño
- adminApi.ts
- bundler.ts
- collaboration/ports/repositories.ts
- ref_node_url
- adminApi.ts
- memory/application/service.ts
- model-management/providers.ts
- mcp/server.ts
- InviteMemberUseCase.ts
- ProjectsApplication.ts
- scripts
- infrastructure/repositories.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- integrations/github.ts
- fusion.test.ts
- BuilderWorkflowPorts
- createJobs
- SettingDefinition
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- platformDb
- domain/securityScan.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- Changes.tsx
- unit/catalog.test.ts
- client.ts
- Tx
- OrchestrationPolicy.ts
- createSecrets
- AuthPorts
- app-services/storage.ts
- infrastructure/probe.ts
- Panel de administración del sistema — diseño
- model-management/router.ts
- usage/usage.ts
- Audit.tsx
- domain/messages.ts
- sandbox.ts
- collaboration/postgresAdapters.test.ts
- projectMicroservices.test.ts
- vitest
- GithubError
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- mcp/jobs.ts
- createAdminMcpHandler
- deps.test.ts
- adminServer.ts
- settingReactions.ts
- createGithubSyncService
- services
- Review Focus
- Desplegar Forja en Coolify
- cli.ts
- infrastructure/jobs.ts
- shared/security.ts
- e2e.mjs
- executeRun
- http.test.ts
- guides.ts
- deps.test.ts
- PostgresProjectsStore.ts
- settingReactions.ts
- BuilderRunRegistry
- createAdminMcpHandler
- .execute
- projectMicroservices.test.ts
- guides.ts
- ProjectPath
- Plan.tsx
- Plan
- app-runtime
- One project: orders API and durable invoice worker
- createCollaborationModule
- Evals.tsx
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- config.ts
- AuthPorts
- AppStore
- infrastructure/apps.ts
- SqlAgentTaskRepository.ts
- GithubRepository
- forja
- Cómo está hecho
- IdentityRandom
- motion.tsx
- RealtimeTransport
- ApiError
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- service-worker.js
- { api, auth, storage, ai }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- TEST_DATABASE_URL
- FastBuildPorts
- replaceVisibleText
- execution.test.ts
- judgeRouting.test.ts
- forms.tsx
- RealtimeTransport
- GitHub integration
- IPasswordHasher
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- 1. Capa de datos
- ProjectPatch
- identity/boundaries.test.ts
- integrations/boundaries.test.ts
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 162 edges
2. `q()` - 111 edges
3. `createStudioApi()` - 73 edges
4. `react` - 51 edges
5. `AppEnv` - 47 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `ProjectsStore` - 40 edges
9. `createProjectsModule()` - 39 edges
10. `config` - 38 edges

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

## Communities (205 total, 35 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (58): lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel(), usableModel() (+50 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (70): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+62 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, IdentityModuleDependencies (+4 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (31): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+23 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (61): Implementation plan document (`static/__dev/plan.md`), 6. IA dentro de las apps, Pruebas de conexión, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), CONTRACT_FILE, criteriaOf() (+53 more)

### Community 5 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (49): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+41 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (53): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+45 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (32): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+24 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 9 - "builderServer.ts"
Cohesion: 0.21
Nodes (10): @hono/node-server, startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder(), reloadLangfuse() (+2 more)

### Community 10 - "database/index.ts"
Cohesion: 0.22
Nodes (26): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), createModelClassification() (+18 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.07
Nodes (40): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+32 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.05
Nodes (32): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentToolRole (+24 more)

### Community 14 - "http-client.ts"
Cohesion: 0.11
Nodes (19): createCoreModules(), BcryptArgonPasswordHasher, PlatformMailerService, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+11 more)

### Community 15 - "roles.ts"
Cohesion: 0.19
Nodes (15): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+7 more)

### Community 16 - "ProjectDb"
Cohesion: 0.07
Nodes (51): RuntimeEvent, analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache (+43 more)

### Community 17 - "admission.ts"
Cohesion: 0.10
Nodes (14): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+6 more)

### Community 18 - "FileMap"
Cohesion: 0.07
Nodes (27): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+19 more)

### Community 19 - "appServer.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (35): RuntimeProjectsPort, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), suggestSlug, AppTarget, loadFiles(), allowedRequest() (+27 more)

### Community 21 - "models.ts"
Cohesion: 0.09
Nodes (17): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+9 more)

### Community 22 - "ProjectSandbox"
Cohesion: 0.20
Nodes (3): ProjectSandbox, SandboxRunError, ServicePool

### Community 23 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 24 - "modules/collaboration/index.ts"
Cohesion: 0.24
Nodes (9): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture() (+1 more)

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (17): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeObservationPorts, createPublication(), assertPublishable(), Author, BuildProblem (+9 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.11
Nodes (24): Catalog, createModelManagementQueries(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService(), bindCatalogSync() (+16 more)

### Community 27 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (28): requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData() (+20 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.10
Nodes (13): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+5 more)

### Community 29 - "deps.ts"
Cohesion: 0.15
Nodes (15): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+7 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (32): describeSchema, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), toolByName, bindBuilderCoreModules(), estTokens() (+24 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (37): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+29 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.12
Nodes (22): createRouterAdministration(), routerStats(), meanOf(), ExecutionContextMetrics, FusionEffort, FusionPattern, FusionStep, RouterPosteriorRow (+14 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+31 more)

### Community 35 - "with"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 36 - "OrgRole"
Cohesion: 0.15
Nodes (7): OrgRole, PostgresOrganizationRepository, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 37 - "one"
Cohesion: 0.09
Nodes (10): PlatformRole, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity (+2 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "builder/contracts.ts"
Cohesion: 0.10
Nodes (18): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+10 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (29): EvalSize, aggregate, clamp01(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension, Judgement (+21 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.10
Nodes (29): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, FusionBudget, FusionTrace, Effort (+21 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 45 - "CreateProjectUseCase.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.09
Nodes (16): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+8 more)

### Community 47 - "domain/messages.ts"
Cohesion: 0.17
Nodes (21): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary(), blockTokens() (+13 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.07
Nodes (35): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles() (+27 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, state

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.12
Nodes (9): AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult, TransactionAction (+1 more)

### Community 51 - "Workspace.tsx"
Cohesion: 0.09
Nodes (31): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+23 more)

### Community 52 - "application/context.ts"
Cohesion: 0.14
Nodes (11): Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionModel, ExecutionTool, Message (+3 more)

### Community 53 - "dependencies"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.06
Nodes (9): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountLifecycleRepository, PostgresAccountRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository, one() (+1 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "Plan.ts"
Cohesion: 0.20
Nodes (9): CheckPlanUseCase, checkContract(), covers(), order(), overlap(), strings(), validatePlan(), PlanCompilerPort (+1 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.10
Nodes (17): hono, ws, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+9 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.14
Nodes (27): sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), counted(), renderReport() (+19 more)

### Community 60 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (28): removeProjectData, removeProjectData(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources(), admitPlayground() (+20 more)

### Community 61 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 62 - "jobWorkerServer.ts"
Cohesion: 0.20
Nodes (13): lifecycle, lifecycle, monolith, server, stopAppRuntime(), sendPlatformEmail, emailPorts, resetTransport() (+5 more)

### Community 63 - "infrastructure/projectDb.ts"
Cohesion: 0.18
Nodes (24): publication, applyProjectMigrations(), applyProjectMigrationsLocal(), checksum(), cloneDatabase(), closeAll(), closeProject(), databasePath() (+16 more)

### Community 64 - "vitest"
Cohesion: 0.08
Nodes (28): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, react-dom, vitest, out(), recordClassificationUsage(), migrate() (+20 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "package.json"
Cohesion: 0.17
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 68 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "model-management/catalog.ts"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 71 - "createJobs"
Cohesion: 0.10
Nodes (10): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), publish() (+2 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "Account"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 74 - "composition.ts"
Cohesion: 0.12
Nodes (26): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+18 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.14
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "model-management/catalog.ts"
Cohesion: 0.22
Nodes (13): Task 3: Proveedores y modelos en BD + seeders, allowedModels(), allowedModels(), catalog(), createPlatformCatalogService(), deleteModel(), lastSync(), modelReadiness() (+5 more)

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "adminApi.ts"
Cohesion: 0.18
Nodes (15): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+7 more)

### Community 79 - "bundler.ts"
Cohesion: 0.13
Nodes (24): Deps, EndpointInfo, exampleFiles(), JobInfo, PageInfo, pageRoutes(), readJobSettings(), buildClient() (+16 more)

### Community 80 - "collaboration/ports/repositories.ts"
Cohesion: 0.10
Nodes (17): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, OrganizationNamesQuery, RemoveMemberUseCase (+9 more)

### Community 81 - "ref_node_url"
Cohesion: 0.08
Nodes (23): playwright-core@1.64.1, playwright-core, vite, studioPwa(), here, root, server, types (+15 more)

### Community 82 - "adminApi.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "model-management/providers.ts"
Cohesion: 0.17
Nodes (20): createLocalSeed(), readSeedFile(), SeedFile, saveModel(), speedFor(), tierFor(), createCatalogSync(), lastSync() (+12 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 87 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 89 - "infrastructure/repositories.ts"
Cohesion: 0.14
Nodes (12): @electric-sql/pglite, assertRuntimeSql(), projectDb(), createProjectRowsRepository(), projectRowsRepository, authRepository(), createAuthRepository(), createQueryRepository() (+4 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.19
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.12
Nodes (9): BootstrapService, SetupError, COMMON_PASSWORDS, Password, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy (+1 more)

### Community 94 - "integrations/github.ts"
Cohesion: 0.17
Nodes (14): createGithubImportService(), apps, imports, legacy, ports(), sync, integrationRepository, blobSha() (+6 more)

### Community 95 - "fusion.test.ts"
Cohesion: 0.16
Nodes (12): ClassificationPorts, createModelRouter(), pick(), author, features, gemini, gpt, reply() (+4 more)

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.07
Nodes (35): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+27 more)

### Community 98 - "SettingDefinition"
Cohesion: 0.19
Nodes (10): recordPageView, visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays() (+2 more)

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "platformDb"
Cohesion: 0.12
Nodes (14): Conexión, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), closePlatformDb() (+6 more)

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

### Community 111 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.14
Nodes (14): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+6 more)

### Community 113 - "client.ts"
Cohesion: 0.18
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), createStorage(), ApiError (+3 more)

### Community 114 - "Tx"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 115 - "OrchestrationPolicy.ts"
Cohesion: 0.25
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "AuthPorts"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 118 - "app-services/storage.ts"
Cohesion: 0.06
Nodes (19): createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject() (+11 more)

### Community 119 - "infrastructure/probe.ts"
Cohesion: 0.22
Nodes (16): listCatalog(), providerOf(), providers(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe (+8 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.09
Nodes (20): 10. Documentación, 2. Ajustes globales, 3. Proveedores y modelos, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad, Almacén (+12 more)

### Community 121 - "model-management/router.ts"
Cohesion: 0.10
Nodes (26): analyzeHeuristic(), analyzeRequest(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian() (+18 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "domain/messages.ts"
Cohesion: 0.10
Nodes (31): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, ModelCallError (+23 more)

### Community 125 - "sandbox.ts"
Cohesion: 0.22
Nodes (10): beginTransaction(), dispatch(), getSandboxServices(), restartSandboxService(), sandboxes, WORKER, call(), readServiceRuntime() (+2 more)

### Community 126 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "vitest"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 129 - "GithubError"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.15
Nodes (8): createGithubAccountService(), connectAccount(), GithubAccountRepository, RepoSelection, Link, SyncResult, PreparedImport, setup()

### Community 131 - "AccountLifecycleRepository"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 132 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 133 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 135 - "deps.test.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 136 - "adminServer.ts"
Cohesion: 0.18
Nodes (11): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+3 more)

### Community 137 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 138 - "createGithubSyncService"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 141 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 143 - "infrastructure/jobs.ts"
Cohesion: 0.07
Nodes (10): ClaimedJob, bindJobs, aiPorts, jobPorts, log(), platformRepository, JobsApi, JobCron (+2 more)

### Community 144 - "shared/security.ts"
Cohesion: 0.21
Nodes (10): appHeaders(), clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup() (+2 more)

### Community 145 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 146 - "executeRun"
Cohesion: 0.18
Nodes (8): ActiveRun, executeRun(), Job, Ledger, Outcome, RunPorts, EvalCase, CaseResult

### Community 147 - "http.test.ts"
Cohesion: 0.10
Nodes (19): builderCoreModules, CollaborationModule, ProjectKnowledgeModule, ProjectsModule, account, app, collaboration, identity (+11 more)

### Community 148 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 150 - "PostgresProjectsStore.ts"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 155 - "projectMicroservices.test.ts"
Cohesion: 0.22
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 159 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 163 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "config.ts"
Cohesion: 0.11
Nodes (13): DEV_FIXTURE, Fixture, callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall, config, DEFAULT_MODELS_ALLOW, env (+5 more)

### Community 168 - "AuthPorts"
Cohesion: 0.10
Nodes (5): EmailInput, secretPorts, AuthPorts, AuthRepository, SecretPorts

### Community 170 - "infrastructure/apps.ts"
Cohesion: 0.15
Nodes (14): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, gh() (+6 more)

### Community 171 - "SqlAgentTaskRepository.ts"
Cohesion: 0.19
Nodes (8): ListAgentTasksUseCase, SqlAgentTaskRepository, listTasks(), tasks, AgentTaskQueries, AgentTaskView, TaskCompletion, availableModels()

### Community 174 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 191 - "replaceVisibleText"
Cohesion: 0.40
Nodes (4): escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 192 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 193 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 194 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 200 - "1. Capa de datos"
Cohesion: 0.40
Nodes (5): 1. Capa de datos, `.env` resultante, Infraestructura, Migraciones, Seeders

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1391 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `bootstrap/server.ts`, `projects/application/usecases.ts`, `builderServer.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `admission.ts`, `FileMap`, `appServer.ts`, `app-runtime/index.ts`, `modules/collaboration/index.ts`, `server/index.ts`, `model-management/index.ts`, `BuilderToolsAdapter.ts`, `ServicePanels.tsx`, `deps.ts`, `modules/identity/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `composition.ts`, `policies.test.ts`, `builder/contracts.ts`, `app-services/context.ts`, `createIdentityModule`, `model-management/router.ts`, `CreateProjectUseCase.ts`, `domain/services.ts`, `domain/messages.ts`, `model-management/index.ts`, `infrastructure/routing.ts`, `PostgresProjectsStore`, `application/context.ts`, `dependencies`, `Plan.ts`, `ref_node_fs`, `package.json`, `github.mjs`, `FinishGatePolicy.ts`, `Account`, `composition.ts`, `Panel de administración del sistema — diseño`, `adminApi.ts`, `collaboration/ports/repositories.ts`, `ref_node_url`, `adminApi.ts`, `model-management/providers.ts`, `ProjectsApplication.ts`, `infrastructure/repositories.ts`, `IPasswordHasher`, `starterTemplate.test.ts`, `integrations/github.ts`, `fusion.test.ts`, `Desplegar Forja en Coolify`, `SettingDefinition`, `sandboxWorker.mjs`, `Changes.tsx`, `client.ts`, `Tx`, `createSecrets`, `AuthPorts`, `app-services/storage.ts`, `infrastructure/probe.ts`, `Panel de administración del sistema — diseño`, `model-management/router.ts`, `usage/usage.ts`, `Audit.tsx`, `domain/messages.ts`, `sandbox.ts`, `collaboration/postgresAdapters.test.ts`, `GithubError`, `collaboration/postgresAdapters.test.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `settingReactions.ts`, `shared/security.ts`, `http.test.ts`, `guides.ts`, `deps.test.ts`, `createAdminMcpHandler`, `projectMicroservices.test.ts`, `guides.ts`, `createCollaborationModule`, `transports/mcp.test.ts`, `config.ts`, `infrastructure/apps.ts`, `SqlAgentTaskRepository.ts`, `replaceVisibleText`, `execution.test.ts`, `judgeRouting.test.ts`, `identity/boundaries.test.ts`, `integrations/boundaries.test.ts`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07543859649122807 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `q`, `ProjectView.tsx`, `createGithubSyncService`, `infrastructure/playground.ts`, `FileMap`, `Memory.tsx`, `application/problems.ts`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `Workspace.tsx`, `vitest`, `forms.tsx`, `scripts`, `model-management/providers.ts`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `Changes.tsx`, `Audit.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04968383017163505 - nodes in this community are weakly interconnected._