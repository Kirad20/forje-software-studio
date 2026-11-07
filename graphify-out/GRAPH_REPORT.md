# Graph Report - anemone-microservices-pr  (2026-11-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 4612 nodes · 12037 edges · 198 communities (161 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 626 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d2bc2de3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- q
- BuilderTurnAdapter.ts
- react
- bootstrap/server.ts
- studioApi.ts
- AgentExecution.ts
- projects/application/usecases.ts
- ProjectView.tsx
- ProjectsStore
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
- sandbox.ts
- models.ts
- builderServer.ts
- domain/contracts.ts
- modules/collaboration/index.ts
- server/index.ts
- App.tsx
- modules/builder/index.ts
- ServicePanels.tsx
- deps.ts
- modules/identity/index.ts
- infrastructure/runner.ts
- application/problems.ts
- modules/project-knowledge/index.ts
- BuilderToolsAdapter.ts
- with
- projects/postgres.test.ts
- builderService.ts
- domain/score.ts
- composition.ts
- policies.test.ts
- builder/contracts.ts
- app-services/context.ts
- createIdentityModule
- model-management/router.ts
- modules/projects/index.ts
- domain/services.ts
- domain/messages.ts
- model-management/index.ts
- infrastructure/routing.ts
- PostgresProjectsStore
- IOrganizationRepository
- application/context.ts
- dependencies
- SqlAgentTaskRepository.ts
- skills.test.ts
- Plan.ts
- ref_node_fs
- app-services/auth.ts
- execution-audit/index.ts
- Project
- projectIndex.ts
- appRuntimeServer.ts
- BootstrapService
- bundler.ts
- OrganizationSkillsService.ts
- package.json
- IPersonalOrganizationRepository
- ProviderService.ts
- github.mjs
- model-management/catalog.ts
- createJobs
- FinishGatePolicy.ts
- Account
- FusionPolicy.ts
- settings/index.ts
- platform.ts
- Panel de administración del sistema — diseño
- index.tsx
- createCollaborationModule
- OrgRole
- PlatformSettingsService
- adminApi.ts
- memory/application/service.ts
- agents.mjs
- client.ts
- urls.ts
- BuilderWorkflow.ts
- scripts
- client/index.ts
- createProjectRows
- IPasswordHasher
- model-management/providers.ts
- starterTemplate.test.ts
- mcp/server.ts
- AppEnv
- BuilderWorkflowPorts
- PostgresRouterAdministrationRepository.ts
- SettingDefinition
- Changes.tsx
- Desplegar Forja en Coolify
- infrastructure/probe.ts
- internal/router.ts
- ISettingsStore
- integrations/index.ts
- compilerOptions
- domain/securityScan.ts
- sandboxWorker.mjs
- OrchestrationPolicy.ts
- accountLifecycle.ts
- IntegrationRepository
- Inventario de funciones de Lovable → Forja
- unit/catalog.test.ts
- architecture.test.ts
- Tx
- mcp/jobs.ts
- createSecrets
- AuthPorts
- integrations/github.ts
- studio.mjs
- http.test.ts
- PostgresProjectFileRepository
- usage/usage.ts
- Audit.tsx
- Evals.tsx
- Memory.tsx
- models/presentation/Models.tsx
- projectMicroservices.test.ts
- vitest
- adminServer.ts
- collaboration/postgresAdapters.test.ts
- AccountLifecycleRepository
- services
- GithubGateway
- createAdminMcpHandler
- deps.test.ts
- app-services/payments.ts
- GithubAccountRepository
- createGithubSyncService
- services
- Review Focus
- e2e.mjs
- cli.ts
- unit/mcp.test.ts
- spring.ts
- ProjectDbClient
- accounts.ts
- PostgresCatalogRepository.ts
- fusion.test.ts
- postgres
- healthcheck
- settingReactions.ts
- BuilderRunRegistry
- Plan
- .execute
- ref_node_path
- guides.ts
- ProjectPath
- Plan.tsx
- args
- app-runtime
- One project: orders API and durable invoice worker
- forms.tsx
- apiTypes.test.ts
- transports/mcp.test.ts
- GithubAuthorization
- GithubProjectPorts
- ProjectEvent
- builder
- job-worker
- ports/storage.ts
- FastBuildPorts
- GithubRepository
- forja
- Cómo está hecho
- JobCron
- IdentityRandom
- motion.tsx
- RealtimeTransport
- ApiError
- CLAUDE.md
- Durable jobs worker
- CoreModulesDependencies
- { api, auth, storage, ai }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- { getSecurity, saveScan, startDeepScan, setIgnored }
- TEST_DATABASE_URL

## God Nodes (most connected - your core abstractions)
1. `vitest` - 157 edges
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
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (198 total, 37 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+63 more)

### Community 1 - "q"
Cohesion: 0.04
Nodes (21): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresAccountLifecycleRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, AdminApiTokenInfo (+13 more)

### Community 2 - "BuilderTurnAdapter.ts"
Cohesion: 0.06
Nodes (64): Implementation plan document (`static/__dev/plan.md`), describeSchema, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard(), toolByName (+56 more)

### Community 3 - "react"
Cohesion: 0.08
Nodes (56): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+48 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (44): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+36 more)

### Community 5 - "studioApi.ts"
Cohesion: 0.05
Nodes (50): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+42 more)

### Community 6 - "AgentExecution.ts"
Cohesion: 0.06
Nodes (30): RunAgentUseCase, RunTaskLaneUseCase, ScheduleTasksUseCase, addUsage(), AgentEvent, AgentExecutionResult, AgentExecutionSpec, Block (+22 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.06
Nodes (40): createIdentityUseCases(), ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine() (+32 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.07
Nodes (54): api, Dashboard(), DeleteDialog(), IDEAS, Sort, SORT_LABEL, Status, STATUS_LABEL (+46 more)

### Community 9 - "ProjectsStore"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 10 - "database/index.ts"
Cohesion: 0.08
Nodes (31): createCoreModules(), authRepository(), platformRepository, statements, NodeBootstrapCrypto, tokenFor(), encryptHeaders(), Input (+23 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.05
Nodes (33): admission, evaluationBuilder(), admitPlayground(), execute(), InternalRun, PLAYGROUND_ROLES, PlaygroundError, PlaygroundRole (+25 more)

### Community 12 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (36): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, allowedRequest(), BrowserStep (+28 more)

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.09
Nodes (35): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, ExecutionContextMetrics, FUSION_BUDGETS, FusionBudget (+27 more)

### Community 14 - "http-client.ts"
Cohesion: 0.07
Nodes (29): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases(), api (+21 more)

### Community 15 - "roles.ts"
Cohesion: 0.05
Nodes (32): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentToolRole (+24 more)

### Community 16 - "ProjectDb"
Cohesion: 0.07
Nodes (17): @electric-sql/pglite, CACHE_LIMITS, PROJECT_CACHE_SCHEMA, ProjectCache, AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult (+9 more)

### Community 17 - "admission.ts"
Cohesion: 0.07
Nodes (20): ActiveRun, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+12 more)

### Community 18 - "FileMap"
Cohesion: 0.09
Nodes (21): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createProjectCheck(), ProjectCompilerPort, createPublication() (+13 more)

### Community 19 - "appServer.ts"
Cohesion: 0.09
Nodes (44): formatProblem(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+36 more)

### Community 20 - "sandbox.ts"
Cohesion: 0.07
Nodes (27): ServiceExecution, checkProject, beginTransaction(), dispatch(), getSandboxServices(), ProjectSandbox, restartSandboxService(), Run (+19 more)

### Community 21 - "models.ts"
Cohesion: 0.09
Nodes (27): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+19 more)

### Community 22 - "builderServer.ts"
Cohesion: 0.08
Nodes (29): ApplicationLifecycle, LifecycleService, startAppRuntimeEventRelay(), lifecycle, shutdown(), app, lifecycle, monolith (+21 more)

### Community 23 - "domain/contracts.ts"
Cohesion: 0.08
Nodes (21): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+13 more)

### Community 24 - "modules/collaboration/index.ts"
Cohesion: 0.10
Nodes (17): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, OrganizationNamesQuery, RemoveMemberUseCase (+9 more)

### Community 25 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 26 - "App.tsx"
Cohesion: 0.10
Nodes (29): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+21 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (32): GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), readFile(), estTokens(), GATE_THRESHOLD (+24 more)

### Community 28 - "ServicePanels.tsx"
Cohesion: 0.15
Nodes (36): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+28 more)

### Community 29 - "deps.ts"
Cohesion: 0.09
Nodes (31): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST (+23 more)

### Community 30 - "modules/identity/index.ts"
Cohesion: 0.11
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+3 more)

### Community 31 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (35): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+27 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.07
Nodes (20): createLogService(), LogEntry, LogRepository, BuildProblem, locate(), Problem, ProblemKind, ProblemPorts (+12 more)

### Community 33 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 34 - "BuilderToolsAdapter.ts"
Cohesion: 0.08
Nodes (20): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized() (+12 more)

### Community 35 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 36 - "projects/postgres.test.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 37 - "builderService.ts"
Cohesion: 0.10
Nodes (14): ChatMode, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService() (+6 more)

### Community 38 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 39 - "composition.ts"
Cohesion: 0.11
Nodes (29): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+21 more)

### Community 40 - "policies.test.ts"
Cohesion: 0.10
Nodes (19): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail(), sendPlatformEmail() (+11 more)

### Community 41 - "builder/contracts.ts"
Cohesion: 0.12
Nodes (27): page(), summarize(), applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS (+19 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.08
Nodes (15): DEFAULT_LIMITS, RealtimeLimits, bindJobs, jobPorts, log(), storagePorts, JobRuntimePorts, RealtimeSocket (+7 more)

### Community 43 - "createIdentityModule"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 44 - "model-management/router.ts"
Cohesion: 0.10
Nodes (24): useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), Posterior, prior() (+16 more)

### Community 45 - "modules/projects/index.ts"
Cohesion: 0.15
Nodes (21): CreateProjectInput, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch (+13 more)

### Community 46 - "domain/services.ts"
Cohesion: 0.11
Nodes (25): createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles(), ControlledService, RuntimeService (+17 more)

### Community 47 - "domain/messages.ts"
Cohesion: 0.10
Nodes (28): ClassificationPorts, createModelClassification(), importProviderModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), parseModelClassifications() (+20 more)

### Community 48 - "model-management/index.ts"
Cohesion: 0.12
Nodes (22): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), routerStats(), bindCatalogService(), bindCatalogSync() (+14 more)

### Community 49 - "infrastructure/routing.ts"
Cohesion: 0.12
Nodes (24): anthropicChat(), Block, LlmMessage, LlmRequest, ModelCallError, CompatEndpoint, anthropicChat(), getClient() (+16 more)

### Community 51 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 52 - "application/context.ts"
Cohesion: 0.09
Nodes (11): AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 53 - "dependencies"
Cohesion: 0.07
Nodes (30): dependencies, @anthropic-ai/sdk@^1.3.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+22 more)

### Community 54 - "SqlAgentTaskRepository.ts"
Cohesion: 0.13
Nodes (9): ListAgentTasksUseCase, TaskLifecycleUseCase, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, AgentTaskRepository (+1 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.13
Nodes (19): builderTools, BUILDER_SYSTEM_PROMPT, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED (+11 more)

### Community 56 - "Plan.ts"
Cohesion: 0.11
Nodes (19): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+11 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.14
Nodes (16): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, migrate(), MIGRATIONS_DIR, drop(), freshDatabase(), TEST_DATABASE_URL (+8 more)

### Community 58 - "app-services/auth.ts"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 59 - "execution-audit/index.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 60 - "Project"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 61 - "projectIndex.ts"
Cohesion: 0.13
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 62 - "appRuntimeServer.ts"
Cohesion: 0.17
Nodes (21): app, monolith, runtimePorts, wss, cloneDatabase(), closeAll(), closeProject(), dumpDatabase() (+13 more)

### Community 63 - "BootstrapService"
Cohesion: 0.14
Nodes (8): BootstrapService, SetupError, COMMON_PASSWORDS, Password, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 64 - "bundler.ts"
Cohesion: 0.14
Nodes (22): packageName(), EndpointInfo, JobInfo, PageInfo, pageRoutes(), buildClient(), BuildError, bundleBrowser() (+14 more)

### Community 65 - "OrganizationSkillsService.ts"
Cohesion: 0.18
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 66 - "package.json"
Cohesion: 0.10
Nodes (24): croner@^11.0.0, zod@^4.6.7, devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2 (+16 more)

### Community 67 - "IPersonalOrganizationRepository"
Cohesion: 0.14
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 68 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 69 - "github.mjs"
Cohesion: 0.10
Nodes (14): playwright-core@1.64.1, playwright-core, blobId(), sha1(), startFakeGithub(), app, DATA, jar (+6 more)

### Community 70 - "model-management/catalog.ts"
Cohesion: 0.16
Nodes (20): createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels(), availableModels(), catalog(), creditsForUsd() (+12 more)

### Community 71 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 72 - "FinishGatePolicy.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 73 - "Account"
Cohesion: 0.11
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 74 - "FusionPolicy.ts"
Cohesion: 0.23
Nodes (21): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+13 more)

### Community 75 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 76 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 77 - "Panel de administración del sistema — diseño"
Cohesion: 0.09
Nodes (20): 10. Documentación, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Decisiones tomadas con el usuario, Fuera de alcance (+12 more)

### Community 78 - "index.tsx"
Cohesion: 0.17
Nodes (16): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+8 more)

### Community 79 - "createCollaborationModule"
Cohesion: 0.15
Nodes (6): MemberQueries, OrganizationQueries, createCollaborationModule(), IMemberQueries, IOrganizationQueries, fixture()

### Community 80 - "OrgRole"
Cohesion: 0.15
Nodes (7): OrgRole, PostgresOrganizationRepository, InviteView, MemberView, Org, OrgMemberView, OrganizationRecord

### Community 81 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 82 - "adminApi.ts"
Cohesion: 0.18
Nodes (16): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+8 more)

### Community 83 - "memory/application/service.ts"
Cohesion: 0.11
Nodes (10): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MemoryKind, MemoryRepository, MemoryScope (+2 more)

### Community 84 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 85 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 86 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 87 - "BuilderWorkflow.ts"
Cohesion: 0.20
Nodes (9): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, useFastPath(), fixture() (+1 more)

### Community 88 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+12 more)

### Community 89 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 90 - "createProjectRows"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 91 - "IPasswordHasher"
Cohesion: 0.13
Nodes (3): BcryptArgonPasswordHasher, IPasswordHasher, passwordNeedsRehash()

### Community 92 - "model-management/providers.ts"
Cohesion: 0.22
Nodes (16): providers(), speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), postgresProviderRepository (+8 more)

### Community 93 - "starterTemplate.test.ts"
Cohesion: 0.13
Nodes (8): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint, starterFiles(), starterFiles(), ordersInvoicesFiles(), creation(), load()

### Community 94 - "mcp/server.ts"
Cohesion: 0.11
Nodes (11): CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, McpModules, projectIdProp, READ (+3 more)

### Community 95 - "AppEnv"
Cohesion: 0.15
Nodes (10): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), AppEnv (+2 more)

### Community 97 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.25
Nodes (9): createRouterAdministration(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter() (+1 more)

### Community 98 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 99 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 101 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 102 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 103 - "ISettingsStore"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 104 - "integrations/index.ts"
Cohesion: 0.24
Nodes (14): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+6 more)

### Community 105 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 106 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 108 - "OrchestrationPolicy.ts"
Cohesion: 0.29
Nodes (8): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.26
Nodes (7): PlatformRole, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity

### Community 110 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 111 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 112 - "unit/catalog.test.ts"
Cohesion: 0.13
Nodes (9): out(), recordClassificationUsage(), dir, monolith, seedLocal, dir, BEFORE, conforms() (+1 more)

### Community 113 - "architecture.test.ts"
Cohesion: 0.16
Nodes (11): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+3 more)

### Community 114 - "Tx"
Cohesion: 0.14
Nodes (11): Task 3: Proveedores y modelos en BD + seeders, 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, Tx (+3 more)

### Community 115 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 116 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 117 - "AuthPorts"
Cohesion: 0.15
Nodes (3): EmailInput, AuthPorts, AuthRepository

### Community 118 - "integrations/github.ts"
Cohesion: 0.14
Nodes (14): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+6 more)

### Community 119 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 120 - "http.test.ts"
Cohesion: 0.15
Nodes (13): builderCoreModules, CollaborationModule, ProjectKnowledgeModule, account, app, collaboration, identity, knowledge (+5 more)

### Community 122 - "usage/usage.ts"
Cohesion: 0.20
Nodes (5): createUsageService(), DAILY_ACTIONS, UsageRepository, actionsToday, countAction

### Community 123 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 124 - "Evals.tsx"
Cohesion: 0.23
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 125 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 126 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 127 - "projectMicroservices.test.ts"
Cohesion: 0.18
Nodes (4): assertPublic(), fetchPublicText(), isPrivate(), endpoint()

### Community 128 - "vitest"
Cohesion: 0.17
Nodes (6): react-dom, vitest, root, sources(), files(), scopes

### Community 129 - "adminServer.ts"
Cohesion: 0.18
Nodes (12): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+4 more)

### Community 130 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 132 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 133 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 134 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 136 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 137 - "GithubAccountRepository"
Cohesion: 0.20
Nodes (3): createGithubAccountService(), GithubAccountRepository, setup()

### Community 138 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 139 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 141 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 142 - "cli.ts"
Cohesion: 0.24
Nodes (9): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+1 more)

### Community 143 - "unit/mcp.test.ts"
Cohesion: 0.24
Nodes (8): guideList(), readGuides(), buildServer(), hintsOf(), projectContext(), projectInTokenScope(), SERVER_INSTRUCTIONS, TOOL_HINTS

### Community 144 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 146 - "accounts.ts"
Cohesion: 0.27
Nodes (6): connectAccount(), GithubError, Link, SyncResult, gh(), setup()

### Community 147 - "PostgresCatalogRepository.ts"
Cohesion: 0.29
Nodes (7): audit(), bindModelAudit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 148 - "fusion.test.ts"
Cohesion: 0.22
Nodes (9): author, features, gemini, gpt, reply(), req, review(), scope (+1 more)

### Community 149 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 150 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 151 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 152 - "BuilderRunRegistry"
Cohesion: 0.24
Nodes (3): BuilderRunRegistry, isBuilding(), stopBuilding()

### Community 155 - "ref_node_path"
Cohesion: 0.33
Nodes (4): vite, studioPwa(), here, database

### Community 156 - "guides.ts"
Cohesion: 0.28
Nodes (8): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), SECTION_IDS, slug()

### Community 158 - "Plan.tsx"
Cohesion: 0.42
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 159 - "args"
Cohesion: 0.46
Nodes (8): build, BROWSER, args, context, dockerfile, build, build, build

### Community 160 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 162 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 163 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 164 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 168 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 169 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 173 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 174 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 177 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

## Knowledge Gaps
- **14 isolated node(s):** `{ KIT_BUILTIN }`, `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }`, `{ BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }`, `{ publishProject, unpublishProject }` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `q`, `react`, `bootstrap/server.ts`, `AgentExecution.ts`, `projects/application/usecases.ts`, `ProjectsStore`, `database/index.ts`, `infrastructure/playground.ts`, `app-runtime/index.ts`, `FusionOrchestrator.ts`, `http-client.ts`, `roles.ts`, `ProjectDb`, `admission.ts`, `FileMap`, `sandbox.ts`, `models.ts`, `builderServer.ts`, `modules/collaboration/index.ts`, `modules/builder/index.ts`, `deps.ts`, `modules/identity/index.ts`, `application/problems.ts`, `modules/project-knowledge/index.ts`, `BuilderToolsAdapter.ts`, `projects/postgres.test.ts`, `builderService.ts`, `domain/score.ts`, `composition.ts`, `policies.test.ts`, `builder/contracts.ts`, `app-services/context.ts`, `createIdentityModule`, `model-management/router.ts`, `domain/services.ts`, `domain/messages.ts`, `model-management/index.ts`, `infrastructure/routing.ts`, `IOrganizationRepository`, `application/context.ts`, `SqlAgentTaskRepository.ts`, `skills.test.ts`, `Plan.ts`, `ref_node_fs`, `execution-audit/index.ts`, `projectIndex.ts`, `BootstrapService`, `OrganizationSkillsService.ts`, `package.json`, `ProviderService.ts`, `FinishGatePolicy.ts`, `Panel de administración del sistema — diseño`, `createCollaborationModule`, `PlatformSettingsService`, `adminApi.ts`, `memory/application/service.ts`, `BuilderWorkflow.ts`, `model-management/providers.ts`, `starterTemplate.test.ts`, `PostgresRouterAdministrationRepository.ts`, `SettingDefinition`, `Changes.tsx`, `infrastructure/probe.ts`, `ISettingsStore`, `IntegrationRepository`, `unit/catalog.test.ts`, `architecture.test.ts`, `mcp/jobs.ts`, `http.test.ts`, `usage/usage.ts`, `Audit.tsx`, `projectMicroservices.test.ts`, `collaboration/postgresAdapters.test.ts`, `createAdminMcpHandler`, `deps.test.ts`, `GithubAccountRepository`, `unit/mcp.test.ts`, `accounts.ts`, `fusion.test.ts`, `settingReactions.ts`, `BuilderRunRegistry`, `ref_node_path`, `ProjectPath`, `apiTypes.test.ts`, `transports/mcp.test.ts`, `ApiError`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ KIT_BUILTIN }`, `{ api, auth, storage, ai }`, `{ BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.047058823529411764 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Chat.tsx`, `vitest`, `projects/application/usecases.ts`, `ProjectView.tsx`, `http-client.ts`, `App.tsx`, `ServicePanels.tsx`, `Plan.tsx`, `forms.tsx`, `motion.tsx`, `dependencies`, `package.json`, `index.tsx`, `client/index.ts`, `Changes.tsx`, `internal/router.ts`, `integrations/index.ts`, `Audit.tsx`, `Evals.tsx`, `Memory.tsx`, `models/presentation/Models.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.03820158683514546 - nodes in this community are weakly interconnected._