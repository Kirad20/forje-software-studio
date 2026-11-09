# Graph Report - github-app-repository-list  (2026-11-09)

## Corpus Check
- 719 files · ~341,984 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4760 nodes · 12567 edges · 204 communities (167 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 645 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5397401`
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
- infrastructure/routing.ts
- infrastructure/playground.ts
- app-runtime/index.ts
- FusionOrchestrator.ts
- infrastructure/auth.ts
- execution-audit/index.ts
- ProjectDb
- BuilderServiceClient
- FileMap
- appServer.ts
- app-runtime/index.ts
- roles.ts
- model-management/catalog.ts
- models/presentation/Models.tsx
- Plan.ts
- server/index.ts
- model-management/index.ts
- modules/builder/index.ts
- PostgresCatalogRepository.ts
- deps.ts
- modules/identity/index.ts
- modules/builder/index.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- config.ts
- one
- domain/score.ts
- composition.ts
- policies.test.ts
- bootstrap/server.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- modules/projects/index.ts
- domain/services.ts
- AgentExecution.ts
- model-management/index.ts
- PostgresApiTokenRepository
- PostgresProjectsStore
- ProjectView.tsx
- domain/contracts.ts
- dependencies
- q
- skills.test.ts
- OrgRole
- ref_node_fs
- app-services/auth.ts
- evaluations/runner.ts
- infrastructure/playground.ts
- agents.mjs
- studio.mjs
- BootstrapService
- vitest
- OrganizationSkillsService.ts
- builder/contracts.ts
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- Account
- createJobs
- FinishGatePolicy.ts
- application/security.ts
- composition.ts
- settings/index.ts
- SqlAgentTaskRepository.ts
- Panel de administración del sistema — diseño
- executeRun
- AccountLifecycleRepository
- CheckAccessUseCase.ts
- ref_node_url
- admission.ts
- memory/application/service.ts
- AppEnv
- mcp/server.ts
- ICollaborationAccountRepository
- ProjectsApplication.ts
- scripts
- app-services/context.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- modules/integrations/application/github.ts
- createHttp
- BuilderWorkflowPorts
- createJobs
- ProjectPath
- Review Focus
- Desplegar Forja en Coolify
- SettingDefinition
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- infrastructure/runner.ts
- BuilderWorkflowPorts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- devDependencies
- unit/catalog.test.ts
- architecture.test.ts
- AuthPorts
- replaceVisibleText
- createSecrets
- execution.test.ts
- policies.test.ts
- integrations/github.ts
- Panel de administración del sistema — diseño
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- infrastructure/routing.ts
- sandbox.ts
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- app-services/payments.ts
- adminServer.ts
- Evals.tsx
- AccountLifecycleRepository
- services
- mcp/jobs.ts
- createAdminMcpHandler
- deps.test.ts
- IdentityRandom
- PasswordResetRepository
- adminApi.ts
- services
- Review Focus
- deps.test.ts
- ports/context.ts
- AgentExecutionSpec
- oauth.ts
- e2e.mjs
- projectRows.ts
- crypto.ts
- ApplicationLifecycle
- Desplegar Forja en Coolify
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- Memory.tsx
- .execute
- http.test.ts
- guides.ts
- infrastructure/judge.ts
- infrastructure/apps.ts
- mcp-oauth.md
- app-runtime
- One project: orders API and durable invoice worker
- createCollaborationModule
- createAdminMcpHandler
- BuilderRunRegistry
- AppStore
- GithubProjectPorts
- cli.ts
- Plan.tsx
- ref_node_path
- createSecrets
- Cómo está hecho
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
- Inventario de interfaz de Floot → Forja
- GithubAuthorization
- GithubProjectPorts
- PostgresPlatformSettingsStoreAdapter
- GithubRepository
- RealtimeTransport
- GitHub integration
- 1. Capa de datos
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- agentCompact.test.ts
- motion.tsx
- Objetivo
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 163 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 73 edges
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
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts

## Import Cycles
- None detected.

## Communities (204 total, 37 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+48 more)

### Community 1 - "q"
Cohesion: 0.05
Nodes (69): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+61 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (10): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IAccountRepository, ILoginCodeRepository (+2 more)

### Community 3 - "react"
Cohesion: 0.10
Nodes (26): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+18 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (54): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background() (+46 more)

### Community 5 - "Changes.tsx"
Cohesion: 0.19
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (54): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, suggestSlug, aiUsage, analyticsSummary, listEmails (+46 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (46): createDependencyResolution(), PackageRegistryPort, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST, packageInfo, packageName() (+38 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 9 - "skills.test.ts"
Cohesion: 0.13
Nodes (18): BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO (+10 more)

### Community 10 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (18): analyzeHeuristic(), analyzeRequest(), useFastPath(), posteriors, gamma(), gaussian(), prior(), sampleBeta() (+10 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.08
Nodes (35): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, isProjectLogLine(), isProjectProblem(), isRecord() (+27 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 14 - "infrastructure/auth.ts"
Cohesion: 0.18
Nodes (8): BcryptArgonPasswordHasher, IPasswordHasher, burnPasswordCheck(), hashPassword(), passwordNeedsRehash(), scryptKey(), verifyPassword(), withSlot()

### Community 15 - "execution-audit/index.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (45): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+37 more)

### Community 18 - "FileMap"
Cohesion: 0.05
Nodes (37): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases(), createIdentityUseCases() (+29 more)

### Community 19 - "appServer.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 20 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (21): RuntimeProjectsPort, KIT_BUILTIN, KitEntry, EndpointInfo, PageInfo, bindRuntimeObservation(), configureRuntimeProjects(), CompiledModule (+13 more)

### Community 21 - "roles.ts"
Cohesion: 0.09
Nodes (22): AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN (+14 more)

### Community 22 - "model-management/catalog.ts"
Cohesion: 0.08
Nodes (46): 3. Proveedores y modelos, 6. API de administración, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels() (+38 more)

### Community 23 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 24 - "Plan.ts"
Cohesion: 0.06
Nodes (34): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, ReviewAndFixUseCase, TeamBuildUseCase, Review, reviewFixTasks(), checkContract(), checkPlanDoc() (+26 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (16): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+8 more)

### Community 26 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createModelRouter(), routerStats(), bindModelAudit() (+17 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (28): assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange(), objectName(), redactSqlData(), isMigrationPath() (+20 more)

### Community 28 - "PostgresCatalogRepository.ts"
Cohesion: 0.23
Nodes (11): audit(), persistCapabilityProfile(), validateCapabilityProfile(), validateReasoningEffort(), columns, postgresCatalogRepository, profileValues(), Row (+3 more)

### Community 29 - "deps.ts"
Cohesion: 0.15
Nodes (15): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+7 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 31 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (37): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber (+29 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.20
Nodes (12): createRouterAdministration(), FusionEffort, FusionPattern, FusionPhase, FusionStep, RouterPosteriorRow, RouterStats, listFusionTraces() (+4 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, lucide-react@^1.66.0 (+31 more)

### Community 35 - "with"
Cohesion: 0.09
Nodes (30): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+22 more)

### Community 36 - "config.ts"
Cohesion: 0.08
Nodes (21): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+13 more)

### Community 37 - "one"
Cohesion: 0.10
Nodes (11): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+3 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 39 - "composition.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 41 - "bootstrap/server.ts"
Cohesion: 0.05
Nodes (47): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay() (+39 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.13
Nodes (26): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), judgeScore(), mean() (+18 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.11
Nodes (21): AgentSpec, TurnState, KEYWORDS, RoleProfile, Posterior, FusionBudget, FusionTrace, Effort (+13 more)

### Community 44 - "model-management/router.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 45 - "modules/projects/index.ts"
Cohesion: 0.12
Nodes (20): AppTarget, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ProjectProps, ChangeEntry, normalizeProjectProfile() (+12 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.11
Nodes (18): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, contractRoutes() (+10 more)

### Community 47 - "AgentExecution.ts"
Cohesion: 0.13
Nodes (15): GATE_FIXES, addUsage(), Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, emptyUsage() (+7 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.10
Nodes (31): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), FileMap, endpointRoutes() (+23 more)

### Community 49 - "PostgresApiTokenRepository"
Cohesion: 0.14
Nodes (5): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository

### Community 50 - "PostgresProjectsStore"
Cohesion: 0.10
Nodes (14): @electric-sql/pglite, CACHE_LIMITS, AppDataPorts, createAppDataService(), TransactionSession, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, ProjectMigration (+6 more)

### Community 51 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (75): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+67 more)

### Community 52 - "domain/contracts.ts"
Cohesion: 0.17
Nodes (13): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+5 more)

### Community 53 - "dependencies"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 54 - "q"
Cohesion: 0.07
Nodes (16): createCoreModules(), PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountRepository, PostgresLoginCodeRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant (+8 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.07
Nodes (3): FileMap, PostgresProjectsStore, ProjectOrganizations

### Community 56 - "OrgRole"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, LaneTask (+5 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.13
Nodes (9): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+1 more)

### Community 59 - "evaluations/runner.ts"
Cohesion: 0.22
Nodes (12): EvalError, RunRequest, EVAL_EMAIL, activeRunId(), cancelRun(), exportRun(), forjaVersion(), getRun() (+4 more)

### Community 60 - "infrastructure/playground.ts"
Cohesion: 0.14
Nodes (25): spentLast24h(), evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole (+17 more)

### Community 61 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 62 - "studio.mjs"
Cohesion: 0.16
Nodes (17): assertPublic(), fetchPublicText(), isPrivate(), ADMIN, assert(), cleanup(), freePort(), get() (+9 more)

### Community 63 - "BootstrapService"
Cohesion: 0.13
Nodes (35): app, monolith, runtimePorts, startHttp(), wss, publication, applyProjectMigrations(), applyProjectMigrationsLocal() (+27 more)

### Community 64 - "vitest"
Cohesion: 0.07
Nodes (28): Task 3: Proveedores y modelos en BD + seeders, pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, ANTHROPIC_MODELS, PROVIDERS (+20 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 66 - "builder/contracts.ts"
Cohesion: 0.23
Nodes (16): summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS (+8 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.24
Nodes (12): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+4 more)

### Community 68 - "ProviderService.ts"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 69 - "github.mjs"
Cohesion: 0.11
Nodes (15): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf(), ProjectIndex (+7 more)

### Community 70 - "Account"
Cohesion: 0.12
Nodes (5): Account, AccountProps, Email, COMMON_PASSWORDS, Password

### Community 71 - "createJobs"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 73 - "application/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 74 - "composition.ts"
Cohesion: 0.13
Nodes (24): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+16 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 76 - "SqlAgentTaskRepository.ts"
Cohesion: 0.26
Nodes (5): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 78 - "executeRun"
Cohesion: 0.21
Nodes (6): ActiveRun, executeRun(), Ledger, Outcome, RunPorts, CaseResult

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

### Community 84 - "AppEnv"
Cohesion: 0.10
Nodes (6): ProjectCache, AppEnv, ProjectDbClient, CacheRepository, JobsApi, ProjectRowsPort

### Community 85 - "mcp/server.ts"
Cohesion: 0.10
Nodes (28): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+20 more)

### Community 86 - "ICollaborationAccountRepository"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 87 - "ProjectsApplication.ts"
Cohesion: 0.10
Nodes (14): CoreModulesDependencies, CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Checkpoint, parseStarterTemplate(), starterFiles(), StarterTemplate (+6 more)

### Community 88 - "scripts"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 89 - "app-services/context.ts"
Cohesion: 0.15
Nodes (8): bindJobs, jobPorts, configureAppServiceObserver(), log(), secretPorts, JobRuntimePorts, requestSecret, secretEnv

### Community 90 - "createProjectRows"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.24
Nodes (5): PlatformSettingsService, SettingsError, SettingsDependencies, fixture(), fixture()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (14): react-dom@^19.3.1, react-dom, serviceControlController, transport, Actions, failed(), Filter, KIND_LABEL (+6 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/integrations/application/github.ts"
Cohesion: 0.15
Nodes (8): createGithubAccountService(), connectAccount(), GithubAccountRepository, RepoSelection, Link, SyncResult, PreparedImport, setup()

### Community 95 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 96 - "BuilderWorkflowPorts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 97 - "createJobs"
Cohesion: 0.12
Nodes (25): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+17 more)

### Community 99 - "Review Focus"
Cohesion: 0.15
Nodes (11): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+3 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 101 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 102 - "internal/router.ts"
Cohesion: 0.19
Nodes (20): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+12 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 104 - "integrations/index.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 105 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (28): removeProjectData, removeProjectData(), sessionCookie(), confirmPasswordReset, endSession, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword (+20 more)

### Community 106 - "BuilderWorkflowPorts"
Cohesion: 0.07
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), BuilderWorkflowPorts (+2 more)

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
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 114 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 115 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 116 - "createSecrets"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 117 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 118 - "policies.test.ts"
Cohesion: 0.10
Nodes (15): createEmail(), sendEmail(), sendPlatformEmail(), createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject (+7 more)

### Community 119 - "integrations/github.ts"
Cohesion: 0.18
Nodes (14): createGithubImportService(), apps, imports, legacy, ports(), sync, blobSha(), gh() (+6 more)

### Community 120 - "Panel de administración del sistema — diseño"
Cohesion: 0.22
Nodes (10): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Panel de administración del sistema — diseño (+2 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.15
Nodes (17): pick(), maxTokensFor(), ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback (+9 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "infrastructure/routing.ts"
Cohesion: 0.07
Nodes (56): anthropicChat(), createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass() (+48 more)

### Community 125 - "sandbox.ts"
Cohesion: 0.08
Nodes (26): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), RunInput (+18 more)

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 128 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

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
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 138 - "adminApi.ts"
Cohesion: 0.19
Nodes (15): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+7 more)

### Community 139 - "services"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 142 - "ports/context.ts"
Cohesion: 0.07
Nodes (11): ClaimedJob, CheckoutInput, EmailResult, StoredObject, ContextPorts, EmailPorts, JobPorts, AppServiceEvent (+3 more)

### Community 144 - "oauth.ts"
Cohesion: 0.08
Nodes (32): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+24 more)

### Community 145 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 146 - "projectRows.ts"
Cohesion: 0.19
Nodes (11): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+3 more)

### Community 147 - "crypto.ts"
Cohesion: 0.18
Nodes (10): LEGACY, SCRYPT, waiting, createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder (+2 more)

### Community 148 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 149 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

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

### Community 155 - "http.test.ts"
Cohesion: 0.11
Nodes (21): AdminMcpModules, builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, ProjectsModule, account, app (+13 more)

### Community 156 - "guides.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 157 - "infrastructure/judge.ts"
Cohesion: 0.08
Nodes (25): JUDGE_DIMENSIONS, JudgeDimension, Judgement, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), createModelClassification() (+17 more)

### Community 158 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 160 - "app-runtime"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 162 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 163 - "createAdminMcpHandler"
Cohesion: 0.12
Nodes (20): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+12 more)

### Community 166 - "GithubProjectPorts"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 167 - "cli.ts"
Cohesion: 0.17
Nodes (14): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+6 more)

### Community 168 - "Plan.tsx"
Cohesion: 0.42
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 169 - "ref_node_path"
Cohesion: 0.21
Nodes (7): vite, studioPwa(), here, root, sources(), files(), scopes

### Community 170 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 171 - "Cómo está hecho"
Cohesion: 0.29
Nodes (7): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 190 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 196 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 197 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 200 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): calls, model, recordContextEvent, usage

### Community 201 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 202 - "Objetivo"
Cohesion: 0.67
Nodes (3): Decisiones tomadas con el usuario, Fuera de alcance, Objetivo

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `BuilderTurnAdapter.ts`, `react`, `bootstrap/server.ts`, `Changes.tsx`, `ProjectView.tsx`, `skills.test.ts`, `infrastructure/routing.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `execution-audit/index.ts`, `BuilderServiceClient`, `FileMap`, `app-runtime/index.ts`, `model-management/catalog.ts`, `Plan.ts`, `server/index.ts`, `model-management/index.ts`, `modules/builder/index.ts`, `deps.ts`, `modules/identity/index.ts`, `modules/builder/index.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `config.ts`, `one`, `composition.ts`, `policies.test.ts`, `bootstrap/server.ts`, `app-services/context.ts`, `model-management/router.ts`, `modules/projects/index.ts`, `domain/services.ts`, `AgentExecution.ts`, `model-management/index.ts`, `PostgresProjectsStore`, `dependencies`, `ref_node_fs`, `builder/contracts.ts`, `github.mjs`, `Account`, `createJobs`, `FinishGatePolicy.ts`, `application/security.ts`, `composition.ts`, `SqlAgentTaskRepository.ts`, `Panel de administración del sistema — diseño`, `CheckAccessUseCase.ts`, `ref_node_url`, `admission.ts`, `mcp/server.ts`, `ICollaborationAccountRepository`, `ProjectsApplication.ts`, `app-services/context.ts`, `IPasswordHasher`, `model-management/providers.ts`, `starterTemplate.test.ts`, `modules/integrations/application/github.ts`, `createHttp`, `ProjectPath`, `Desplegar Forja en Coolify`, `SettingDefinition`, `BuilderWorkflowPorts`, `sandboxWorker.mjs`, `devDependencies`, `replaceVisibleText`, `createSecrets`, `execution.test.ts`, `policies.test.ts`, `integrations/github.ts`, `PostgresProjectFileRepository`, `usage/usage.ts`, `Audit.tsx`, `infrastructure/routing.ts`, `sandbox.ts`, `models/presentation/Models.tsx`, `adminServer.ts`, `AccountLifecycleRepository`, `mcp/jobs.ts`, `adminApi.ts`, `deps.test.ts`, `oauth.ts`, `projectRows.ts`, `crypto.ts`, `ApplicationLifecycle`, `http.test.ts`, `guides.ts`, `infrastructure/judge.ts`, `infrastructure/apps.ts`, `createCollaborationModule`, `createAdminMcpHandler`, `BuilderRunRegistry`, `ref_node_path`, `agentCompact.test.ts`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07589781562384303 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `application/problems.ts`, `q`, `BuilderToolsAdapter.ts`, `Evals.tsx`, `Changes.tsx`, `internal/router.ts`, `ISettingsStore`, `integrations/index.ts`, `motion.tsx`, `Plan.tsx`, `infrastructure/playground.ts`, `FileMap`, `ProjectView.tsx`, `models/presentation/Models.tsx`, `scripts`, `Memory.tsx`, `Audit.tsx`, `model-management/providers.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.04938271604938271 - nodes in this community are weakly interconnected._