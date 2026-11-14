# Graph Report - code-folder-pr  (2026-11-14)

## Corpus Check
- 731 files · ~359,950 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4910 nodes · 12983 edges · 194 communities (167 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 675 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a437e525`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- http-client.ts
- Workspace.tsx
- studioApi.ts
- bootstrap/server.ts
- react
- domain/contracts.ts
- projects/application/usecases.ts
- ProjectView.tsx
- BuilderTurnAdapter.ts
- FusionOrchestrator.ts
- infrastructure/playground.ts
- ProjectsStore
- FusionOrchestrator.ts
- execution-audit/index.ts
- appServer.ts
- ProjectDb
- models.ts
- FileMap
- FileMap
- policies.test.ts
- AppEnv
- server/index.ts
- app-runtime/index.ts
- one
- server/index.ts
- App.tsx
- ProviderService.ts
- app-services/context.ts
- modules/builder/index.ts
- infrastructure/probe.ts
- domain/routing.ts
- application/problems.ts
- domain/services.ts
- q
- evaluations/bindings.test.ts
- Dashboard.tsx
- model-management/index.ts
- vitest
- package.json
- modules/project-knowledge/index.ts
- ProjectSandbox
- app-services/context.ts
- appRuntimeServer.ts
- IPasswordHasher
- bundler.ts
- builderService.ts
- infrastructure/anthropic.ts
- bootstrap/server.ts
- config.ts
- createIdentityModule
- model-management/router.ts
- PostgresProjectsStore
- Plan.ts
- infrastructure/repositories.ts
- skills.test.ts
- infrastructure/projectDb.ts
- IOrganizationRepository
- modules/projects/index.ts
- createAuth
- PostgresRouterAdministrationRepository.ts
- appRuntimeHttp.ts
- application/problems.ts
- composition.ts
- infrastructure/runner.ts
- infrastructure/playground.ts
- serviceControlRuntime.ts
- domain/score.ts
- ExecutionMetrics
- studio.mjs
- index.tsx
- createJobs
- projectIndex.ts
- ref_node_path
- memory/application/service.ts
- application/context.ts
- collaboration/ports/repositories.ts
- adminApi.ts
- Project
- integrations/index.ts
- http.test.ts
- springRuntime.ts
- AgentExecution.ts
- OrganizationSkillsService.ts
- createJobs
- project-observability/security.ts
- SettingRegistry.ts
- platform.ts
- FinishGatePolicy.ts
- urls.ts
- createCollaborationModule
- PlatformSettingsService
- contracts/index.ts
- SqlAgentTaskRepository.ts
- scripts
- RunTaskLaneUseCase.ts
- BootstrapService
- integrations/github.ts
- adminServer.ts
- fusion.test.ts
- AppStore
- Changes.tsx
- usage/usage.ts
- mcp/server.ts
- infrastructure/cache.ts
- IntegrationRepository
- SettingDefinition
- sandboxWorker.mjs
- internal/router.ts
- accountLifecycle.ts
- IntegrationRepository
- domain/securityScan.ts
- sandboxWorker.mjs
- OrgRole
- Account
- model-management/catalog.ts
- BuilderWorkflowPorts
- createGithubSyncService
- Inventario de funciones de Lovable → Forja
- springRuntime.test.ts
- client.ts
- PostgresProjectFileRepository
- architecture.test.ts
- devDependencies
- mcp/jobs.ts
- github.mjs
- ProjectsApplication.ts
- Audit.tsx
- platformDb
- crypto.ts
- app-services/analytics.ts
- model-management/providers.ts
- ProjectKnowledge.tsx
- services
- Panel de administración del sistema — diseño
- infrastructure/routing.ts
- settingReactions.ts
- app-runtime/infrastructure/browser.ts
- PostgresProjectsStore.ts
- services
- Review Focus
- languages.ts
- app-services/realtime.ts
- forms.tsx
- runtime.test.ts
- postgres
- healthcheck
- Desplegar Forja en Coolify
- shared/security.ts
- createProjectRows
- localMemoryReport
- collaboration/postgresAdapters.test.ts
- Evals.tsx
- args
- .execute
- Standards.ts
- CheckAccessUseCase.ts
- AdmissionState
- builder
- forja
- One project: orders API and durable invoice worker
- One project: orders API and durable invoice worker
- guides.ts
- Inventario de interfaz de Floot → Forja
- ProjectPatch
- job-worker
- Cómo está hecho
- createJobQueue
- accountLifecycle.ts
- GithubRepository
- domain/messages.ts
- IdentityRandom
- CLAUDE.md
- Durable jobs worker
- service-worker.js
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { quickScan, findSecret, formatFinding }
- TEST_DATABASE_URL
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- { getSecurity, saveScan, startDeepScan, setIgnored }
- TEST_DATABASE_URL

## God Nodes (most connected - your core abstractions)
1. `vitest` - 165 edges
2. `q()` - 117 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 46 edges
7. `config` - 44 edges
8. `one()` - 43 edges
9. `ProjectsStore` - 40 edges
10. `createProjectsModule()` - 39 edges

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

## Communities (194 total, 27 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 1 - "http-client.ts"
Cohesion: 0.07
Nodes (28): api, billingController, Meter(), Plan(), Usage, api, collaborationController, EMPTY (+20 more)

### Community 2 - "Workspace.tsx"
Cohesion: 0.07
Nodes (39): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+31 more)

### Community 3 - "studioApi.ts"
Cohesion: 0.06
Nodes (55): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+47 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.10
Nodes (19): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+11 more)

### Community 5 - "react"
Cohesion: 0.07
Nodes (60): lucide-react@^1.66.0, radix-ui@^1.8.1, lucide-react, radix-ui, react, administrationController, api, modelBlockers() (+52 more)

### Community 6 - "domain/contracts.ts"
Cohesion: 0.06
Nodes (21): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+13 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (10): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, IdentityAccountsDependencies, IAccountRepository, ILoginCodeRepository (+2 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (62): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+54 more)

### Community 9 - "BuilderTurnAdapter.ts"
Cohesion: 0.08
Nodes (53): Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview(), formatStandard() (+45 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.23
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.05
Nodes (45): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+37 more)

### Community 12 - "ProjectsStore"
Cohesion: 0.07
Nodes (7): isDevFile(), ProjectsApplication, FileMap, ProjectSnapshot, TurnChanges, createProjectsModule(), ProjectsStore

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.09
Nodes (18): ActiveRun, admission, AdmissionPorts, JudgeModel, MAX_JOBS, MAX_REPEATS, RunConfiguration, executeRun() (+10 more)

### Community 14 - "execution-audit/index.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 15 - "appServer.ts"
Cohesion: 0.08
Nodes (48): formatProblem(), pageRoutes(), resolveServiceExecution(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+40 more)

### Community 16 - "ProjectDb"
Cohesion: 0.05
Nodes (37): confirmPasswordReset, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut, signUp, userFromSession (+29 more)

### Community 17 - "models.ts"
Cohesion: 0.09
Nodes (30): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassifiedProviderModel (+22 more)

### Community 18 - "FileMap"
Cohesion: 0.11
Nodes (25): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+17 more)

### Community 19 - "FileMap"
Cohesion: 0.09
Nodes (19): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, ProjectCompilerPort, createPublication(), assertPublishable() (+11 more)

### Community 20 - "policies.test.ts"
Cohesion: 0.06
Nodes (21): CheckoutInput, createPayments(), paymentsFor(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage(), putObject() (+13 more)

### Community 21 - "AppEnv"
Cohesion: 0.08
Nodes (14): AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult, TransactionAction (+6 more)

### Community 22 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 23 - "app-runtime/index.ts"
Cohesion: 0.08
Nodes (23): RuntimeProjectsPort, ProjectService, ProjectServices, ServiceExecution, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug (+15 more)

### Community 24 - "one"
Cohesion: 0.09
Nodes (10): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+2 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 26 - "App.tsx"
Cohesion: 0.09
Nodes (31): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+23 more)

### Community 27 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 28 - "app-services/context.ts"
Cohesion: 0.10
Nodes (15): AiUnavailableError, createAi(), appAiChat(), bindJobs, sendEmail, sendPlatformEmail, aiPorts, emailPorts (+7 more)

### Community 29 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (31): app, monolith, BuilderRunRegistry, AgentResult, calculateSpendUseCase, toolRegistry, builderTools, toolByName (+23 more)

### Community 30 - "infrastructure/probe.ts"
Cohesion: 0.24
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 31 - "domain/routing.ts"
Cohesion: 0.10
Nodes (28): AgentSpec, TurnState, Catalog, KEYWORDS, RoleProfile, Posterior, FusionBudget, FusionEffort (+20 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.09
Nodes (31): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+23 more)

### Community 33 - "domain/services.ts"
Cohesion: 0.22
Nodes (19): createProjectCheck(), createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), exampleFiles(), jobFiles() (+11 more)

### Community 34 - "q"
Cohesion: 0.07
Nodes (15): createCoreModules(), PostgresMemberRepository, PostgresOrganizationSkillsRepository, PlatformMailerService, PostgresAccountRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository (+7 more)

### Community 35 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 36 - "Dashboard.tsx"
Cohesion: 0.08
Nodes (31): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+23 more)

### Community 37 - "model-management/index.ts"
Cohesion: 0.13
Nodes (16): audit(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), ModelSpendView, ProjectModelSettings, RouterDecisionView, Provider (+8 more)

### Community 38 - "vitest"
Cohesion: 0.07
Nodes (33): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+25 more)

### Community 39 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, hono@^4.13.14, @hono/node-server@^2.1.5, @modelcontextprotocol/sdk@^1.32.2 (+28 more)

### Community 40 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 41 - "ProjectSandbox"
Cohesion: 0.16
Nodes (4): makeRoomForSandbox(), ProjectSandbox, SandboxRunError, ServicePool

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 43 - "appRuntimeServer.ts"
Cohesion: 0.16
Nodes (20): app, lifecycle, monolith, runtimePorts, wss, lifecycle, stopRuntimeEventRelay(), lifecycle (+12 more)

### Community 44 - "IPasswordHasher"
Cohesion: 0.19
Nodes (8): BcryptArgonPasswordHasher, IPasswordHasher, burnPasswordCheck(), hashPassword(), passwordNeedsRehash(), scryptKey(), verifyPassword(), withSlot()

### Community 45 - "bundler.ts"
Cohesion: 0.10
Nodes (28): Deps, packageName(), EndpointInfo, JobInfo, PageInfo, BuildError, bundleBrowser(), checkProject (+20 more)

### Community 46 - "builderService.ts"
Cohesion: 0.09
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 47 - "infrastructure/anthropic.ts"
Cohesion: 0.09
Nodes (23): anthropicChat(), Block, LlmMessage, LlmRequest, LlmResponse, CompatEndpoint, anthropicChat(), getClient() (+15 more)

### Community 48 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (19): startHttp(), withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions (+11 more)

### Community 49 - "config.ts"
Cohesion: 0.07
Nodes (29): zod@^4.6.7, zod, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed() (+21 more)

### Community 50 - "createIdentityModule"
Cohesion: 0.12
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 51 - "model-management/router.ts"
Cohesion: 0.13
Nodes (21): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), maxTokensFor(), ROLES, createTurnFeedback(), penalizeTurn() (+13 more)

### Community 52 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 53 - "Plan.ts"
Cohesion: 0.09
Nodes (21): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC, MAX_TASKS (+13 more)

### Community 54 - "infrastructure/repositories.ts"
Cohesion: 0.14
Nodes (15): @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), assertRuntimeSql(), projectDb(), authRepository() (+7 more)

### Community 55 - "skills.test.ts"
Cohesion: 0.14
Nodes (24): page(), GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), applySummary(), blockTokens() (+16 more)

### Community 56 - "infrastructure/projectDb.ts"
Cohesion: 0.19
Nodes (23): applyProjectMigrationsLocal(), checksum(), cloneDatabase(), closeEntry(), closeProject(), closing, databasePath(), dbKey() (+15 more)

### Community 57 - "IOrganizationRepository"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 58 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (19): CoreModulesDependencies, CreateProjectInput, CreateProjectUseCase, ChangeEntry, normalizeProjectProfile(), ProjectProfile, SeoSettings, TurnFileChange (+11 more)

### Community 59 - "createAuth"
Cohesion: 0.22
Nodes (16): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+8 more)

### Community 60 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.16
Nodes (15): createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createRouterAdministration(), routerStats(), meanOf(), FusionPattern (+7 more)

### Community 61 - "appRuntimeHttp.ts"
Cohesion: 0.09
Nodes (12): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+4 more)

### Community 62 - "application/problems.ts"
Cohesion: 0.11
Nodes (20): createLogService(), LogEntry, LogRepository, BuildProblem, createProblemService(), changed(), clearProblems(), fromLog() (+12 more)

### Community 63 - "composition.ts"
Cohesion: 0.12
Nodes (29): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), applyProjectMigrations(), configureSecretIntegrations() (+21 more)

### Community 64 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (26): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+18 more)

### Community 65 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (31): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+23 more)

### Community 66 - "serviceControlRuntime.ts"
Cohesion: 0.14
Nodes (13): ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry, ServiceReplica, ServiceRuntimeSnapshot, getSandboxServices(), restartSandboxService() (+5 more)

### Community 67 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+25 more)

### Community 68 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 69 - "studio.mjs"
Cohesion: 0.09
Nodes (29): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+21 more)

### Community 70 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 71 - "createJobs"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 72 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 73 - "ref_node_path"
Cohesion: 0.05
Nodes (33): playwright-core@1.64.1, playwright-core, vite, studioPwa(), here, DATA, jar, req() (+25 more)

### Community 74 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 75 - "application/context.ts"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 76 - "collaboration/ports/repositories.ts"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 77 - "adminApi.ts"
Cohesion: 0.18
Nodes (16): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+8 more)

### Community 78 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 79 - "integrations/index.ts"
Cohesion: 0.19
Nodes (20): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+12 more)

### Community 80 - "http.test.ts"
Cohesion: 0.10
Nodes (25): AdminMcpModules, createMcpHandler(), bindBuilderCoreModules(), builderCoreModules, readFile(), CollaborationModule, IdentityModule, ProjectKnowledgeModule (+17 more)

### Community 81 - "springRuntime.ts"
Cohesion: 0.07
Nodes (31): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+23 more)

### Community 82 - "AgentExecution.ts"
Cohesion: 0.10
Nodes (17): RunAgentUseCase, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionContext, ExecutionTool (+9 more)

### Community 83 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 84 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 85 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 86 - "SettingRegistry.ts"
Cohesion: 0.19
Nodes (16): PlatformSettingType, SettingDef, SettingGroup, SettingView, createPlatformSettings(), byKey, Def, defs (+8 more)

### Community 87 - "platform.ts"
Cohesion: 0.13
Nodes (5): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting

### Community 88 - "FinishGatePolicy.ts"
Cohesion: 0.16
Nodes (9): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+1 more)

### Community 89 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 90 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 91 - "PlatformSettingsService"
Cohesion: 0.14
Nodes (6): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, ISecretCipher, fixture(), fixture()

### Community 92 - "contracts/index.ts"
Cohesion: 0.08
Nodes (28): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+20 more)

### Community 93 - "SqlAgentTaskRepository.ts"
Cohesion: 0.18
Nodes (7): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, AgentTask, TaskCompletion, mocks

### Community 94 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 95 - "RunTaskLaneUseCase.ts"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), AgentTaskRepository, LaneTask (+5 more)

### Community 96 - "BootstrapService"
Cohesion: 0.15
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 97 - "integrations/github.ts"
Cohesion: 0.05
Nodes (42): Registro, createGithubAccountService(), connectAccount(), GithubAccountRepository, AppCredentials, branchName(), createGithubAppService(), installation() (+34 more)

### Community 98 - "adminServer.ts"
Cohesion: 0.12
Nodes (20): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+12 more)

### Community 99 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 101 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "mcp/server.ts"
Cohesion: 0.14
Nodes (19): guideList(), readGuides(), buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints (+11 more)

### Community 104 - "infrastructure/cache.ts"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 105 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 106 - "SettingDefinition"
Cohesion: 0.22
Nodes (4): SettingDefinition, SettingDefinitionProps, SettingType, PlatformSettingsRegistryAdapter

### Community 107 - "sandboxWorker.mjs"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 108 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.17
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingValue, createSettingsModule(), MOVED_ENV, SettingsModuleDependencies, warnMovedEnv(), ISettingsRegistry (+1 more)

### Community 110 - "IntegrationRepository"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 111 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 112 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 113 - "OrgRole"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 114 - "Account"
Cohesion: 0.12
Nodes (5): Account, AccountProps, Email, COMMON_PASSWORDS, Password

### Community 115 - "model-management/catalog.ts"
Cohesion: 0.17
Nodes (17): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), availableModels() (+9 more)

### Community 117 - "createGithubSyncService"
Cohesion: 0.22
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 118 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 119 - "springRuntime.test.ts"
Cohesion: 0.16
Nodes (6): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge

### Community 120 - "client.ts"
Cohesion: 0.18
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), createStorage(), ApiError (+3 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 122 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 123 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 124 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 125 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 126 - "ProjectsApplication.ts"
Cohesion: 0.22
Nodes (7): CreateCheckpointUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint, CheckpointProps

### Community 127 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 128 - "platformDb"
Cohesion: 0.12
Nodes (12): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders, platformDb, Tx (+4 more)

### Community 129 - "crypto.ts"
Cohesion: 0.15
Nodes (15): appJwt(), cache, credentials(), generations, githubAppStore, pending, encryptHeaders(), Input (+7 more)

### Community 130 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 131 - "model-management/providers.ts"
Cohesion: 0.22
Nodes (16): providers(), speedFor(), tierFor(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), postgresProviderRepository (+8 more)

### Community 132 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 133 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 134 - "Panel de administración del sistema — diseño"
Cohesion: 0.15
Nodes (14): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario (+6 more)

### Community 135 - "infrastructure/routing.ts"
Cohesion: 0.17
Nodes (14): useFastPath(), posteriors, gamma(), gaussian(), prior(), sampleBeta(), FUSION_BUDGETS, contextFields (+6 more)

### Community 136 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 137 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.18
Nodes (15): allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser(), inspectPreview(), launch() (+7 more)

### Community 138 - "PostgresProjectsStore.ts"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 139 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 141 - "languages.ts"
Cohesion: 0.18
Nodes (15): dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable(), BASE_ENV, bwrapUnavailable(), escape() (+7 more)

### Community 142 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 143 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 145 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 146 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 147 - "Desplegar Forja en Coolify"
Cohesion: 0.09
Nodes (21): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+13 more)

### Community 148 - "shared/security.ts"
Cohesion: 0.20
Nodes (9): resolvePublicUrl(), clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup() (+1 more)

### Community 149 - "createProjectRows"
Cohesion: 0.33
Nodes (8): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError

### Community 150 - "localMemoryReport"
Cohesion: 0.27
Nodes (9): platformMemoryReport(), remote(), localMemoryReport(), MemoryReport, sandboxStats(), projectDbStats(), mb(), processMemory() (+1 more)

### Community 151 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 152 - "Evals.tsx"
Cohesion: 0.22
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 153 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 154 - ".execute"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 155 - "Standards.ts"
Cohesion: 0.27
Nodes (10): contractRoutes(), FileMap, isClientSource(), isHelperSource(), isListSelect(), isUiSource(), KIT_UTILITIES, lineOf() (+2 more)

### Community 156 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 157 - "AdmissionState"
Cohesion: 0.25
Nodes (4): AdmissionState, planRun(), startEvaluation(), fixture()

### Community 158 - "builder"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 159 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 160 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 161 - "One project: orders API and durable invoice worker"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 162 - "guides.ts"
Cohesion: 0.24
Nodes (9): build(), Guide, guideById, GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES, SECTION_IDS (+1 more)

### Community 163 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 165 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 166 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 168 - "createJobQueue"
Cohesion: 0.19
Nodes (8): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobPorts

### Community 169 - "accountLifecycle.ts"
Cohesion: 0.07
Nodes (10): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+2 more)

### Community 171 - "domain/messages.ts"
Cohesion: 0.16
Nodes (17): ClassificationPorts, createModelClassification(), importProviderModels(), parseModelClassifications(), addUsage(), emptyUsage(), LlmTool, billing (+9 more)

### Community 180 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `http-client.ts`, `bootstrap/server.ts`, `react`, `projects/application/usecases.ts`, `infrastructure/playground.ts`, `FusionOrchestrator.ts`, `execution-audit/index.ts`, `ProjectDb`, `models.ts`, `FileMap`, `FileMap`, `policies.test.ts`, `AppEnv`, `app-runtime/index.ts`, `server/index.ts`, `ProviderService.ts`, `app-services/context.ts`, `modules/builder/index.ts`, `infrastructure/probe.ts`, `domain/services.ts`, `evaluations/bindings.test.ts`, `Dashboard.tsx`, `model-management/index.ts`, `package.json`, `modules/project-knowledge/index.ts`, `bundler.ts`, `builderService.ts`, `infrastructure/anthropic.ts`, `bootstrap/server.ts`, `config.ts`, `createIdentityModule`, `model-management/router.ts`, `Plan.ts`, `infrastructure/repositories.ts`, `skills.test.ts`, `IOrganizationRepository`, `modules/projects/index.ts`, `PostgresRouterAdministrationRepository.ts`, `application/problems.ts`, `composition.ts`, `serviceControlRuntime.ts`, `domain/score.ts`, `ExecutionMetrics`, `projectIndex.ts`, `ref_node_path`, `memory/application/service.ts`, `application/context.ts`, `collaboration/ports/repositories.ts`, `adminApi.ts`, `http.test.ts`, `AgentExecution.ts`, `OrganizationSkillsService.ts`, `project-observability/security.ts`, `FinishGatePolicy.ts`, `createCollaborationModule`, `PlatformSettingsService`, `contracts/index.ts`, `SqlAgentTaskRepository.ts`, `RunTaskLaneUseCase.ts`, `BootstrapService`, `integrations/github.ts`, `adminServer.ts`, `fusion.test.ts`, `Changes.tsx`, `usage/usage.ts`, `mcp/server.ts`, `infrastructure/cache.ts`, `IntegrationRepository`, `SettingDefinition`, `accountLifecycle.ts`, `Account`, `springRuntime.test.ts`, `client.ts`, `PostgresProjectFileRepository`, `architecture.test.ts`, `devDependencies`, `mcp/jobs.ts`, `ProjectsApplication.ts`, `Audit.tsx`, `crypto.ts`, `model-management/providers.ts`, `infrastructure/routing.ts`, `settingReactions.ts`, `runtime.test.ts`, `shared/security.ts`, `collaboration/postgresAdapters.test.ts`, `Standards.ts`, `CheckAccessUseCase.ts`, `One project: orders API and durable invoice worker`, `domain/messages.ts`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04677893611333868 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Chat.tsx`, `http-client.ts`, `Workspace.tsx`, `ProjectKnowledge.tsx`, `Changes.tsx`, `index.tsx`, `package.json`, `ProjectView.tsx`, `Dashboard.tsx`, `sandboxWorker.mjs`, `internal/router.ts`, `forms.tsx`, `integrations/index.ts`, `Evals.tsx`, `App.tsx`, `contracts/index.ts`, `Audit.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `http-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06957047791893527 - nodes in this community are weakly interconnected._