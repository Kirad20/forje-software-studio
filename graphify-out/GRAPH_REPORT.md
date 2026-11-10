# Graph Report - github-app-repository-list  (2026-11-09)

## Corpus Check
- 719 files · ~344,778 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4769 nodes · 12621 edges · 192 communities (160 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 654 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11a255e2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- q
- BuilderTurnAdapter.ts
- react
- bootstrap/server.ts
- Changes.tsx
- AgentExecution.ts
- projects/application/usecases.ts
- ProjectView.tsx
- skills.test.ts
- FusionOrchestrator.ts
- infrastructure/playground.ts
- composition.ts
- FusionOrchestrator.ts
- crypto.ts
- adminApi.ts
- ProjectDb
- domain/contracts.ts
- FileMap
- appServer.ts
- app-runtime/index.ts
- SqlAgentTaskRepository.ts
- model-management/catalog.ts
- models/presentation/Models.tsx
- Plan.ts
- server/index.ts
- model-management/index.ts
- modules/builder/index.ts
- builderServer.ts
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- fusion.test.ts
- ILoginCodeRepository
- domain/score.ts
- composition.ts
- policies.test.ts
- bootstrap/server.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- ProjectsApplication.ts
- domain/services.ts
- AgentExecution.ts
- model-management/index.ts
- PostgresApiTokenRepository
- AppEnv
- ProjectView.tsx
- application/security.ts
- dependencies
- q
- skills.test.ts
- OrgRole
- ref_node_fs
- app-services/auth.ts
- infrastructure/runner.ts
- infrastructure/playground.ts
- agents.dbg.mjs
- studio.mjs
- infrastructure/projectDb.ts
- vitest
- OrganizationSkillsService.ts
- builder/contracts.ts
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- infrastructure/cache.ts
- createJobs
- FinishGatePolicy.ts
- BuilderWorkflowPorts
- platformDb
- settings/index.ts
- SqlAgentTaskRepository.ts
- Panel de administración del sistema — diseño
- executeRun
- one
- CheckAccessUseCase.ts
- ref_node_url
- admission.ts
- memory/application/service.ts
- ModelClassification.ts
- mcp/server.ts
- ICollaborationAccountRepository
- ProjectsApplication.ts
- scripts
- infrastructure/repositories.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- modules/integrations/application/github.ts
- ProjectKnowledge.tsx
- BuilderWorkflowPorts
- createJobs
- guides.ts
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- OrchestrationPolicy.ts
- BuilderWorkflow.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- devDependencies
- unit/catalog.test.ts
- architecture.test.ts
- app-services/analytics.ts
- application/jobs.ts
- createSecrets
- execution.test.ts
- policies.test.ts
- integrations/github.ts
- Panel de administración del sistema — diseño
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- domain/messages.ts
- sandbox.ts
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- settingReactions.ts
- adminServer.ts
- Evals.tsx
- AccountLifecycleRepository
- services
- mcp/jobs.ts
- createAdminMcpHandler
- deps.test.ts
- Plan
- safeFetch.ts
- cli.ts
- services
- Review Focus
- deps.test.ts
- ports/context.ts
- ProjectPatch
- oauth.ts
- e2e.mjs
- FastBuildPorts
- unit/catalog.test.ts
- ApplicationLifecycle
- Desplegar Forja en Coolify
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- Memory.tsx
- .execute
- guides.ts
- infrastructure/apps.ts
- mcp-oauth.md
- app-runtime
- One project: orders API and durable invoice worker
- createCollaborationModule
- AppStore
- GithubProjectPorts
- platformDb
- config.ts
- GithubRepository
- forja
- GithubGateway
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
- GithubAuthorization
- GithubProjectPorts
- GithubRepository
- RealtimeTransport
- GitHub integration
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- motion.tsx
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 51 edges
6. `createIdentityModule()` - 46 edges
7. `one()` - 43 edges
8. `ProjectsStore` - 40 edges
9. `createProjectsModule()` - 39 edges
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

## Communities (192 total, 32 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+48 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (69): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+61 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (9): LoginWithPasswordUseCase, UpdateAccountNameUseCase, Account, AccountProps, Email, PostgresAccountRepository, IAccountRepository, IPasswordHasher (+1 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (29): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+21 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.07
Nodes (57): Implementation plan document (`static/__dev/plan.md`), describeSchema, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard(), active (+49 more)

### Community 5 - "Changes.tsx"
Cohesion: 0.19
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.04
Nodes (66): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, confirmPasswordReset, createAppUser (+58 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (49): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+41 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 9 - "skills.test.ts"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.23
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.08
Nodes (36): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, isProjectLogLine(), isProjectProblem(), isRecord() (+28 more)

### Community 12 - "composition.ts"
Cohesion: 0.06
Nodes (49): createMonolith(), startBindings(), stopBindings(), sendPlatformEmail, configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices (+41 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.04
Nodes (56): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentResult (+48 more)

### Community 14 - "crypto.ts"
Cohesion: 0.14
Nodes (18): @electric-sql/pglite, createCoreModules(), BcryptArgonPasswordHasher, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+10 more)

### Community 15 - "adminApi.ts"
Cohesion: 0.06
Nodes (55): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), ADMIN_MCP_INSTRUCTIONS, AdminMcpModules (+47 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (47): RuntimeEvent, formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+39 more)

### Community 17 - "domain/contracts.ts"
Cohesion: 0.10
Nodes (23): AiUnavailableError, createAi(), appAiChat(), createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows() (+15 more)

### Community 18 - "FileMap"
Cohesion: 0.06
Nodes (30): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+22 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.07
Nodes (34): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), suggestSlug, AppTarget, allowedRequest(), BrowserStep, BrowserTestInput (+26 more)

### Community 21 - "SqlAgentTaskRepository.ts"
Cohesion: 0.18
Nodes (5): TaskLifecycleUseCase, SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.07
Nodes (49): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels() (+41 more)

### Community 23 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 24 - "Plan.ts"
Cohesion: 0.11
Nodes (19): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+11 more)

### Community 25 - "server/index.ts"
Cohesion: 0.10
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeObservationPorts, createPublication(), assertPublishable(), Author, BuildProblem (+8 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService() (+17 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (28): assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData(), isMigrationPath() (+20 more)

### Community 28 - "builderServer.ts"
Cohesion: 0.12
Nodes (19): startAppRuntimeEventRelay(), app, lifecycle, monolith, stopRuntimeEventRelay(), stopBuilder(), metricsIdle(), StepRecord (+11 more)

### Community 29 - "deps.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (31): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+23 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5 (+31 more)

### Community 35 - "with"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 36 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 37 - "ILoginCodeRepository"
Cohesion: 0.15
Nodes (5): RequestLoginCodeUseCase, VerifyLoginCodeUseCase, PlatformMailerService, ILoginCodeRepository, IMailerService

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (20): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+12 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, ExecutionContextMetrics, FusionBudget, FusionEffort (+22 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 45 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 46 - "domain/services.ts"
Cohesion: 0.12
Nodes (14): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+6 more)

### Community 47 - "AgentExecution.ts"
Cohesion: 0.15
Nodes (10): Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionTool, Message, ToolDefinition (+2 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.08
Nodes (33): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), EndpointInfo, endpointRoutes() (+25 more)

### Community 49 - "PostgresApiTokenRepository"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 50 - "AppEnv"
Cohesion: 0.08
Nodes (12): AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult, TransactionAction (+4 more)

### Community 51 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (77): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+69 more)

### Community 52 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 53 - "dependencies"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.08
Nodes (9): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, PostgresPasswordResetRepository, PasswordResetRepository (+1 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 56 - "OrgRole"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.14
Nodes (11): RunTaskLaneUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), LaneTask, TaskLaneHooks, TaskLanePorts (+3 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.09
Nodes (18): ws, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+10 more)

### Community 59 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (30): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, recoverRuns(), designSignals (+22 more)

### Community 60 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (26): ensureEvalAccount(), spentLast24h(), evaluationBuilder(), evaluationResources(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES (+18 more)

### Community 61 - "agents.dbg.mjs"
Cohesion: 0.25
Nodes (5): app, DATA, MODELS, ROOT, SEED

### Community 62 - "studio.mjs"
Cohesion: 0.12
Nodes (24): app, DATA, MODELS, ROOT, SEED, call(), log, reply() (+16 more)

### Community 63 - "infrastructure/projectDb.ts"
Cohesion: 0.19
Nodes (22): publication, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), closeProject(), databasePath(), dbKey() (+14 more)

### Community 64 - "vitest"
Cohesion: 0.09
Nodes (24): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+16 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "builder/contracts.ts"
Cohesion: 0.13
Nodes (25): page(), GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary() (+17 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.22
Nodes (16): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+8 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 70 - "infrastructure/cache.ts"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 74 - "platformDb"
Cohesion: 0.12
Nodes (12): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, platformDb, Tx (+4 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "SqlAgentTaskRepository.ts"
Cohesion: 0.44
Nodes (3): ListAgentTasksUseCase, AgentTaskQueries, AgentTaskView

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "executeRun"
Cohesion: 0.18
Nodes (8): ActiveRun, executeRun(), Job, Ledger, Outcome, RunPorts, EvalCase, CaseResult

### Community 79 - "one"
Cohesion: 0.08
Nodes (11): createDevelopmentSeed(), PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation (+3 more)

### Community 80 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 81 - "ref_node_url"
Cohesion: 0.09
Nodes (20): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+12 more)

### Community 82 - "admission.ts"
Cohesion: 0.09
Nodes (15): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+7 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 84 - "ModelClassification.ts"
Cohesion: 0.23
Nodes (14): ClassificationPorts, createModelClassification(), importProviderModels(), createModelRouter(), analyzeRequest(), pick(), parseModelClassifications(), addUsage() (+6 more)

### Community 85 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 86 - "ICollaborationAccountRepository"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 87 - "ProjectsApplication.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 89 - "infrastructure/repositories.ts"
Cohesion: 0.12
Nodes (10): jobPorts, log(), createQueryRepository(), platformRepository, schemaRows(), statement(), statements, secretPorts (+2 more)

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.14
Nodes (15): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+7 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.12
Nodes (11): BootstrapService, SetupError, COMMON_PASSWORDS, Password, IdentityModuleDependencies, NodeBootstrapCrypto, IdentityAccountsDependencies, BootstrapAccounts (+3 more)

### Community 94 - "modules/integrations/application/github.ts"
Cohesion: 0.18
Nodes (6): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, SyncResult, setup()

### Community 95 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 98 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 99 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.16
Nodes (15): ChatMessage, AppUser, realtime, { apiUrl }, Contract, createApi(), RouteInput, RouteOutput (+7 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "OrchestrationPolicy.ts"
Cohesion: 0.29
Nodes (8): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 106 - "BuilderWorkflow.ts"
Cohesion: 0.19
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath() (+2 more)

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

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.19
Nodes (10): createClient(), createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), ApiError, createHttp() (+2 more)

### Community 114 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 115 - "application/jobs.ts"
Cohesion: 0.12
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JOB_LIMITS (+2 more)

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "execution.test.ts"
Cohesion: 0.24
Nodes (5): RunAgentUseCase, ScheduleTasksUseCase, fixture(), model, usage

### Community 118 - "policies.test.ts"
Cohesion: 0.06
Nodes (29): createEmail(), sendEmail(), sendPlatformEmail(), CheckoutInput, createPayments(), paymentsFor(), createSecrets(), projectSecretEnv() (+21 more)

### Community 119 - "integrations/github.ts"
Cohesion: 0.16
Nodes (15): RepoSelection, createGithubImportService(), PreparedImport, apps, imports, legacy, ports(), sync (+7 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.10
Nodes (19): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad, Almacén (+11 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.10
Nodes (23): analyzeHeuristic(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), Posterior (+15 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "domain/messages.ts"
Cohesion: 0.11
Nodes (25): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint, anthropicChat() (+17 more)

### Community 125 - "sandbox.ts"
Cohesion: 0.08
Nodes (23): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+15 more)

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 129 - "adminServer.ts"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 130 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

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
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 137 - "safeFetch.ts"
Cohesion: 0.22
Nodes (3): assertPublic(), fetchPublicText(), isPrivate()

### Community 138 - "cli.ts"
Cohesion: 0.21
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 142 - "ports/context.ts"
Cohesion: 0.06
Nodes (13): AppAiResult, CheckoutInput, EmailInput, EmailResult, StoredObject, AuthPorts, ContextPorts, EmailPorts (+5 more)

### Community 144 - "oauth.ts"
Cohesion: 0.08
Nodes (34): @hono/node-server, accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json() (+26 more)

### Community 145 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 147 - "unit/catalog.test.ts"
Cohesion: 0.40
Nodes (4): recordClassificationUsage(), dir, monolith, seedLocal

### Community 148 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 149 - "Desplegar Forja en Coolify"
Cohesion: 0.08
Nodes (21): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+13 more)

### Community 150 - "healthcheck"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 151 - "settingReactions.ts"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 153 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 154 - ".execute"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 156 - "guides.ts"
Cohesion: 0.22
Nodes (7): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs(), dir

### Community 158 - "infrastructure/apps.ts"
Cohesion: 0.14
Nodes (15): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+7 more)

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "platformDb"
Cohesion: 0.21
Nodes (13): lifecycle, lifecycle, monolith, server, stopAppRuntime(), emailPorts, resetTransport(), stopEmailTransport (+5 more)

### Community 169 - "config.ts"
Cohesion: 0.12
Nodes (16): vite, DEV_FIXTURE, Fixture, storagePorts, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl() (+8 more)

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 201 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1397 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `bootstrap/server.ts`, `Changes.tsx`, `AgentExecution.ts`, `skills.test.ts`, `infrastructure/playground.ts`, `composition.ts`, `FusionOrchestrator.ts`, `crypto.ts`, `adminApi.ts`, `domain/contracts.ts`, `FileMap`, `app-runtime/index.ts`, `model-management/catalog.ts`, `Plan.ts`, `server/index.ts`, `model-management/index.ts`, `modules/builder/index.ts`, `builderServer.ts`, `deps.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `fusion.test.ts`, `ILoginCodeRepository`, `composition.ts`, `policies.test.ts`, `bootstrap/server.ts`, `app-services/context.ts`, `model-management/router.ts`, `ProjectsApplication.ts`, `domain/services.ts`, `AgentExecution.ts`, `model-management/index.ts`, `AppEnv`, `application/security.ts`, `dependencies`, `ref_node_fs`, `app-services/auth.ts`, `builder/contracts.ts`, `github.mjs`, `infrastructure/cache.ts`, `createJobs`, `FinishGatePolicy.ts`, `SqlAgentTaskRepository.ts`, `Panel de administración del sistema — diseño`, `CheckAccessUseCase.ts`, `ref_node_url`, `admission.ts`, `ModelClassification.ts`, `ICollaborationAccountRepository`, `ProjectsApplication.ts`, `infrastructure/repositories.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `modules/integrations/application/github.ts`, `guides.ts`, `Desplegar Forja en Coolify`, `SettingDefinition`, `BuilderWorkflow.ts`, `sandboxWorker.mjs`, `devDependencies`, `architecture.test.ts`, `createSecrets`, `execution.test.ts`, `policies.test.ts`, `integrations/github.ts`, `Panel de administración del sistema — diseño`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `domain/messages.ts`, `sandbox.ts`, `models/presentation/Models.tsx`, `settingReactions.ts`, `adminServer.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `safeFetch.ts`, `deps.test.ts`, `oauth.ts`, `unit/catalog.test.ts`, `ApplicationLifecycle`, `guides.ts`, `infrastructure/apps.ts`, `createCollaborationModule`, `config.ts`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07589781562384303 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `Changes.tsx`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `motion.tsx`, `infrastructure/playground.ts`, `FileMap`, `ProjectView.tsx`, `models/presentation/Models.tsx`, `scripts`, `Memory.tsx`, `Audit.tsx`, `model-management/providers.ts`, `ProjectKnowledge.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04938271604938271 - nodes in this community are weakly interconnected._