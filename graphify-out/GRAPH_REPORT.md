# Graph Report - anemone  (2026-11-06)

## Corpus Check
- 693 files · ~316,664 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4587 nodes · 12017 edges · 181 communities (150 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 627 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `763bf56d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- bootstrap/server.ts
- OrchestrationPolicy.ts
- ProjectServices
- BuilderToolsAdapter.ts
- builderService.ts
- AgentExecution.ts
- appServer.ts
- q
- composition.ts
- one
- with
- bootstrap/server.ts
- BuilderToolsAdapter.ts
- evaluations/bindings.test.ts
- FileMap
- RunTaskLaneUseCase.ts
- memory/application/service.ts
- ExecutionMetrics
- createProjectRows
- modules/identity/index.ts
- adminApi.ts
- app-runtime/services.test.ts
- modules/identity/index.ts
- FusionOrchestrator.ts
- app-runtime/infrastructure/browser.ts
- react
- composition.ts
- model-management/catalog.ts
- builderServer.ts
- modules/builder/index.ts
- database/index.ts
- ProjectView.tsx
- infrastructure/repositories.ts
- Account
- appRuntimeServer.ts
- projectIndex.ts
- createJobs
- compilerOptions
- models.ts
- skills.test.ts
- createCollaborationModule
- appRuntimeServer.ts
- client/index.ts
- scripts
- modules/projects/index.ts
- modules/builder/index.ts
- domain/contracts.ts
- mcp/server.ts
- app-runtime/services.test.ts
- package.json
- ProjectsStore
- Project
- fusion.test.ts
- Panel de administración del sistema — diseño
- ProjectsApplication.ts
- policies.ts
- database/index.ts
- integrations/github.ts
- createIdentityModule
- infrastructure/routing.ts
- PostgresProjectFileRepository
- deps.ts
- Dashboard.tsx
- postgres
- vite-env.d.ts
- one
- PostgresProjectsStore
- roles.ts
- Workspace.tsx
- infrastructure/routing.ts
- CheckAccessUseCase.ts
- Panel de administración del sistema — diseño
- domain/contracts.ts
- IOrganizationRepository
- Desplegar Forja en Coolify
- services
- sandbox.ts
- infrastructure/playground.ts
- application/security.ts
- ref_node_path
- RunAgentUseCase.ts
- validatePlan
- TEST_DATABASE_URL
- model-management/router.ts
- projectMicroservices.test.ts
- domain/score.ts
- AuthPorts
- policies.test.ts
- Memory.tsx
- AppEnv
- RunTaskLaneUseCase.ts
- adminServer.ts
- app-runtime/index.ts
- GithubAccountRepository
- infrastructure/playground.ts
- github.mjs
- SqlAgentTaskRepository.ts
- Memory.tsx
- projectIndex.ts
- Plan.ts
- internal/router.ts
- guides.ts
- Evals.tsx
- studio.mjs
- ExecutionAudit.ts
- AdmissionState
- adminServer.ts
- Changes.tsx
- OrganizationSkillsService.ts
- infrastructure/repositories.ts
- Review Focus
- PostgresPasswordResetRepository
- ProjectServices
- createGithubSyncService
- PostgresPlatformSettingsStoreAdapter
- domain/securityScan.ts
- cli.ts
- PostgresRouterAdministrationRepository.ts
- appRuntimeServer.ts
- model-management/providers.ts
- admission.ts
- { api, auth, storage, ai }
- IPasswordHasher
- App.tsx
- studio.mjs
- PlatformMailerService
- config.ts
- app-services/analytics.ts
- app-runtime
- collaboration/ports/repositories.ts
- transports/mcp.test.ts
- runtime.test.ts
- PlatformSettingsService
- modules/projects/index.ts
- builder
- forms.tsx
- shared/security.ts
- forja
- collaboration/ports/repositories.ts
- SettingDefinition
- policies.test.ts
- application/context.ts
- e2e.mjs
- app-services/analytics.ts
- ContextPorts
- JobRuntimePorts
- job-worker
- crypto.ts
- AgentTaskView
- createAuth
- RealtimeTransport
- app-services/context.ts
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- apiTypes.test.ts
- service-worker.js
- ref_node_crypto
- JobRuntimePorts
- PostgresPlatformSettingsStoreAdapter
- createRealtime
- application/graph.ts
- AppEnv
- Durable jobs worker
- One project: orders API and durable invoice worker
- IdentityRandom
- ProjectPath
- replaceVisibleText
- ServiceControlPanel.tsx
- Panel de administración del sistema — diseño
- architecture.test.ts
- IPasswordHasher
- Audit.tsx
- AgentExecutionSpec
- TEST_DATABASE_URL
- http.test.ts
- policies.test.ts
- agents.mjs
- GithubAuthorization
- IdentityRandom
- createHttp

## God Nodes (most connected - your core abstractions)
1. `vitest` - 155 edges
2. `q()` - 110 edges
3. `createStudioApi()` - 73 edges
4. `react` - 50 edges
5. `createIdentityModule()` - 46 edges
6. `one()` - 42 edges
7. `ProjectsStore` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 37 edges
10. `config` - 36 edges

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

## Communities (181 total, 31 thin omitted)

### Community 0 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (57): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+49 more)

### Community 1 - "OrchestrationPolicy.ts"
Cohesion: 0.06
Nodes (22): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+14 more)

### Community 2 - "ProjectServices"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 3 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (21): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), ownsFile(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+13 more)

### Community 4 - "builderService.ts"
Cohesion: 0.09
Nodes (44): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), active (+36 more)

### Community 5 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (40): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep (+32 more)

### Community 6 - "appServer.ts"
Cohesion: 0.07
Nodes (43): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, sendEmail, addTimer (+35 more)

### Community 7 - "q"
Cohesion: 0.09
Nodes (5): PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, OrganizationRecord, q()

### Community 8 - "composition.ts"
Cohesion: 0.11
Nodes (47): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+39 more)

### Community 9 - "one"
Cohesion: 0.06
Nodes (10): isDevFile(), ProjectsApplication, beforeImages(), restoredFiles(), turnFileChange(), ProjectSnapshot, TurnChanges, createProjectsModule() (+2 more)

### Community 10 - "with"
Cohesion: 0.08
Nodes (26): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+18 more)

### Community 11 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (17): ActiveRun, admission, AdmissionPorts, JudgeModel, MAX_JOBS, MAX_REPEATS, RunConfiguration, executeRun() (+9 more)

### Community 12 - "BuilderToolsAdapter.ts"
Cohesion: 0.04
Nodes (41): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+33 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.08
Nodes (22): api, billingController, Meter(), Plan(), Usage, createEvaluationUseCases(), createIdentityUseCases(), api (+14 more)

### Community 14 - "FileMap"
Cohesion: 0.10
Nodes (28): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles() (+20 more)

### Community 15 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (19): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), TurnState, SqlAgentTaskRepository (+11 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.10
Nodes (29): StepRecord, KEYWORDS, RoleProfile, ROLES, Posterior, ExecutionContextMetrics, FusionBudget, FusionEffort (+21 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.19
Nodes (15): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+7 more)

### Community 18 - "createProjectRows"
Cohesion: 0.06
Nodes (40): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+32 more)

### Community 19 - "modules/identity/index.ts"
Cohesion: 0.07
Nodes (13): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, Email, IdentityModuleDependencies (+5 more)

### Community 20 - "adminApi.ts"
Cohesion: 0.10
Nodes (18): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, RuntimeProjectsPort, createPublication(), assertPublishable() (+10 more)

### Community 21 - "app-runtime/services.test.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 22 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (37): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, modelsController (+29 more)

### Community 23 - "FusionOrchestrator.ts"
Cohesion: 0.07
Nodes (45): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+37 more)

### Community 24 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (44): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+36 more)

### Community 25 - "react"
Cohesion: 0.16
Nodes (24): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+16 more)

### Community 26 - "composition.ts"
Cohesion: 0.07
Nodes (40): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+32 more)

### Community 27 - "model-management/catalog.ts"
Cohesion: 0.15
Nodes (20): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels(), catalog() (+12 more)

### Community 28 - "builderServer.ts"
Cohesion: 0.07
Nodes (34): startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle, monolith (+26 more)

### Community 29 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (29): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+21 more)

### Community 30 - "database/index.ts"
Cohesion: 0.15
Nodes (19): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+11 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.06
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+31 more)

### Community 32 - "infrastructure/repositories.ts"
Cohesion: 0.08
Nodes (12): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, ProjectDbClient, SqlExecutionResult, TransactionAction, createProjectRowsRepository() (+4 more)

### Community 33 - "Account"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 34 - "appRuntimeServer.ts"
Cohesion: 0.09
Nodes (29): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+21 more)

### Community 35 - "projectIndex.ts"
Cohesion: 0.10
Nodes (33): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+25 more)

### Community 36 - "createJobs"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 37 - "compilerOptions"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 38 - "models.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 39 - "skills.test.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 40 - "createCollaborationModule"
Cohesion: 0.06
Nodes (40): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+32 more)

### Community 41 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 42 - "client/index.ts"
Cohesion: 0.08
Nodes (29): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR (+21 more)

### Community 43 - "scripts"
Cohesion: 0.09
Nodes (23): CoreModulesDependencies, createCoreModules(), serverHash(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresLoginCodeRepository, PostgresSessionRepository, SessionAccountRow (+15 more)

### Community 44 - "modules/projects/index.ts"
Cohesion: 0.18
Nodes (12): BeforeImage, ProjectProps, ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange (+4 more)

### Community 45 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (41): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, AgentSpec, runAgent(), toolByName, bindBuilderCoreModules() (+33 more)

### Community 46 - "domain/contracts.ts"
Cohesion: 0.09
Nodes (19): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+11 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.13
Nodes (7): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), EmailPorts, QueryRepository, StoragePorts

### Community 48 - "app-runtime/services.test.ts"
Cohesion: 0.14
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), AppEnv (+2 more)

### Community 49 - "package.json"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 50 - "ProjectsStore"
Cohesion: 0.09
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 51 - "Project"
Cohesion: 0.07
Nodes (3): FileMap, PostgresProjectsStore, ProjectOrganizations

### Community 52 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 53 - "Panel de administración del sistema — diseño"
Cohesion: 0.10
Nodes (19): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+11 more)

### Community 54 - "ProjectsApplication.ts"
Cohesion: 0.15
Nodes (13): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, Checkpoint, CheckpointProps, parseStarterTemplate(), starterFiles() (+5 more)

### Community 55 - "policies.ts"
Cohesion: 0.12
Nodes (19): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+11 more)

### Community 56 - "database/index.ts"
Cohesion: 0.12
Nodes (11): recordClassificationUsage(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), dir, monolith, seedLocal, dir (+3 more)

### Community 57 - "integrations/github.ts"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.10
Nodes (28): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), pick(), routerStats() (+20 more)

### Community 59 - "infrastructure/routing.ts"
Cohesion: 0.09
Nodes (27): anthropicChat(), FUSION_BUDGETS, Block, LlmRequest, LlmResponse, LlmTool, CompatEndpoint, anthropicChat() (+19 more)

### Community 60 - "PostgresProjectFileRepository"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 61 - "deps.ts"
Cohesion: 0.25
Nodes (9): createRouterAdministration(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 62 - "Dashboard.tsx"
Cohesion: 0.17
Nodes (19): Dashboard(), IDEAS, Sort, SORT_LABEL, Status, STATUS_LABEL, statusOf(), StatusPill() (+11 more)

### Community 63 - "postgres"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 64 - "vite-env.d.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 65 - "one"
Cohesion: 0.07
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity (+3 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 67 - "roles.ts"
Cohesion: 0.11
Nodes (24): analyzeHeuristic(), analyzeRequest(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian() (+16 more)

### Community 68 - "Workspace.tsx"
Cohesion: 0.10
Nodes (30): createMonolith(), startBindings(), stopBindings(), bindJobs, configureJobRuntime(), jobPorts, configureAppServiceObserver(), log() (+22 more)

### Community 69 - "infrastructure/routing.ts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 70 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 71 - "Panel de administración del sistema — diseño"
Cohesion: 0.05
Nodes (41): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+33 more)

### Community 72 - "domain/contracts.ts"
Cohesion: 0.11
Nodes (10): Run, AppUser, createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, publish() (+2 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 74 - "Desplegar Forja en Coolify"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 75 - "services"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 76 - "sandbox.ts"
Cohesion: 0.08
Nodes (26): ServiceExecution, checkProject, log(), beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService() (+18 more)

### Community 77 - "infrastructure/playground.ts"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 78 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 79 - "ref_node_path"
Cohesion: 0.23
Nodes (12): createPlatformSettings(), byKey, Def, defs, getPath(), GROUPS, schemaOf(), setPath() (+4 more)

### Community 80 - "RunAgentUseCase.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 81 - "validatePlan"
Cohesion: 0.11
Nodes (20): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+12 more)

### Community 82 - "TEST_DATABASE_URL"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 83 - "model-management/router.ts"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 84 - "projectMicroservices.test.ts"
Cohesion: 0.09
Nodes (13): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.11
Nodes (25): createGithubAccountService(), connectAccount(), GithubError, Link, SyncResult, accountStatus, connectAccount, createRepo (+17 more)

### Community 86 - "AuthPorts"
Cohesion: 0.18
Nodes (9): PlatformSettingsService, PlatformSettingType, SettingDef, SettingGroup, SettingsError, SettingView, SettingsDependencies, fixture() (+1 more)

### Community 87 - "policies.test.ts"
Cohesion: 0.17
Nodes (16): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+8 more)

### Community 88 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 89 - "AppEnv"
Cohesion: 0.09
Nodes (28): guideList(), readGuides(), CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS (+20 more)

### Community 90 - "RunTaskLaneUseCase.ts"
Cohesion: 0.14
Nodes (8): BootstrapService, SetupError, COMMON_PASSWORDS, Password, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 91 - "adminServer.ts"
Cohesion: 0.18
Nodes (12): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+4 more)

### Community 92 - "app-runtime/index.ts"
Cohesion: 0.18
Nodes (13): serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL, observed(), ServiceCard() (+5 more)

### Community 94 - "infrastructure/playground.ts"
Cohesion: 0.14
Nodes (26): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+18 more)

### Community 95 - "github.mjs"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 96 - "SqlAgentTaskRepository.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 97 - "Memory.tsx"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 98 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 99 - "Plan.ts"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 100 - "internal/router.ts"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 101 - "guides.ts"
Cohesion: 0.21
Nodes (11): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug() (+3 more)

### Community 102 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 103 - "studio.mjs"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 104 - "ExecutionAudit.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 105 - "AdmissionState"
Cohesion: 0.25
Nodes (4): AdmissionState, planRun(), startEvaluation(), fixture()

### Community 106 - "adminServer.ts"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 107 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.22
Nodes (8): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), MOVED_ENV, SettingsModuleDependencies, warnMovedEnv(), ISettingsRegistry, ISettingsStore

### Community 109 - "infrastructure/repositories.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 110 - "Review Focus"
Cohesion: 0.17
Nodes (13): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+5 more)

### Community 112 - "ProjectServices"
Cohesion: 0.25
Nodes (3): ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 113 - "createGithubSyncService"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 115 - "domain/securityScan.ts"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 116 - "cli.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 117 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 118 - "appRuntimeServer.ts"
Cohesion: 0.09
Nodes (34): @hono/node-server, app, monolith, runtimePorts, wss, cloneDatabase(), closeAll(), closeProject() (+26 more)

### Community 119 - "model-management/providers.ts"
Cohesion: 0.12
Nodes (31): 6. API de administración, providerOf(), providers(), speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync() (+23 more)

### Community 120 - "admission.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 121 - "{ api, auth, storage, ai }"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 123 - "App.tsx"
Cohesion: 0.09
Nodes (13): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED (+5 more)

### Community 124 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 126 - "config.ts"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 129 - "app-services/analytics.ts"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 130 - "app-runtime"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 132 - "transports/mcp.test.ts"
Cohesion: 0.29
Nodes (5): account, collaboration, handleMcp, identity, projects

### Community 134 - "PlatformSettingsService"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 136 - "builder"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 137 - "forms.tsx"
Cohesion: 0.20
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+1 more)

### Community 139 - "shared/security.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 140 - "forja"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

### Community 142 - "collaboration/ports/repositories.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 143 - "SettingDefinition"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 144 - "policies.test.ts"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 145 - "application/context.ts"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 146 - "e2e.mjs"
Cohesion: 0.10
Nodes (11): playwright-core@1.64.1, playwright-core, assertPublic(), fetchPublicText(), isPrivate(), DATA, jar, req() (+3 more)

### Community 149 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 151 - "ContextPorts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "JobRuntimePorts"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "job-worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 154 - "crypto.ts"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 155 - "AgentTaskView"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 158 - "RealtimeTransport"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 159 - "app-services/context.ts"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 161 - "apiTypes.test.ts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 163 - "ref_node_crypto"
Cohesion: 0.20
Nodes (8): vite, studioPwa(), here, createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder

### Community 166 - "PostgresPlatformSettingsStoreAdapter"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 186 - "http.test.ts"
Cohesion: 0.15
Nodes (13): builderCoreModules, CollaborationModule, ProjectKnowledgeModule, account, app, collaboration, identity, knowledge (+5 more)

### Community 187 - "policies.test.ts"
Cohesion: 0.08
Nodes (14): createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+6 more)

### Community 188 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 197 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1340 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `client/index.ts` to `bootstrap/server.ts`, `OrchestrationPolicy.ts`, `ProjectServices`, `BuilderToolsAdapter.ts`, `AgentExecution.ts`, `one`, `with`, `bootstrap/server.ts`, `BuilderToolsAdapter.ts`, `evaluations/bindings.test.ts`, `FileMap`, `RunTaskLaneUseCase.ts`, `ExecutionMetrics`, `createProjectRows`, `modules/identity/index.ts`, `adminApi.ts`, `app-runtime/services.test.ts`, `composition.ts`, `builderServer.ts`, `database/index.ts`, `ProjectView.tsx`, `infrastructure/repositories.ts`, `projectIndex.ts`, `createJobs`, `compilerOptions`, `models.ts`, `createCollaborationModule`, `appRuntimeServer.ts`, `scripts`, `modules/builder/index.ts`, `package.json`, `ProjectsStore`, `fusion.test.ts`, `Panel de administración del sistema — diseño`, `ProjectsApplication.ts`, `policies.ts`, `database/index.ts`, `integrations/github.ts`, `createIdentityModule`, `infrastructure/routing.ts`, `deps.ts`, `one`, `PostgresProjectsStore`, `roles.ts`, `Workspace.tsx`, `CheckAccessUseCase.ts`, `Desplegar Forja en Coolify`, `sandbox.ts`, `application/security.ts`, `validatePlan`, `model-management/router.ts`, `projectMicroservices.test.ts`, `domain/score.ts`, `AuthPorts`, `AppEnv`, `RunTaskLaneUseCase.ts`, `app-runtime/index.ts`, `Memory.tsx`, `projectIndex.ts`, `internal/router.ts`, `guides.ts`, `studio.mjs`, `adminServer.ts`, `OrganizationSkillsService.ts`, `domain/securityScan.ts`, `PostgresRouterAdministrationRepository.ts`, `model-management/providers.ts`, `admission.ts`, `{ api, auth, storage, ai }`, `App.tsx`, `config.ts`, `app-services/analytics.ts`, `transports/mcp.test.ts`, `runtime.test.ts`, `collaboration/ports/repositories.ts`, `e2e.mjs`, `AgentTaskView`, `ref_node_crypto`, `http.test.ts`, `policies.test.ts`, `createHttp`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `bootstrap/server.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0745945945945946 - nodes in this community are weakly interconnected._
- **Why does `react` connect `bootstrap/server.ts` to `ProjectServices`, `composition.ts`, `with`, `evaluations/bindings.test.ts`, `SettingDefinition`, `modules/identity/index.ts`, `crypto.ts`, `modules/builder/index.ts`, `ProjectView.tsx`, `PostgresPlatformSettingsStoreAdapter`, `Dashboard.tsx`, `policies.test.ts`, `Memory.tsx`, `app-runtime/index.ts`, `SqlAgentTaskRepository.ts`, `Evals.tsx`, `ExecutionAudit.ts`, `Changes.tsx`, `domain/securityScan.ts`, `config.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `OrchestrationPolicy.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05627545353572751 - nodes in this community are weakly interconnected._