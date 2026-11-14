# Graph Report - resilience-pr  (2026-11-14)

## Corpus Check
- 739 files · ~362,779 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4939 nodes · 13083 edges · 196 communities (159 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 682 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aee0f91c`
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
- roles.ts
- ProjectsStore
- FusionOrchestrator.ts
- adminServer.ts
- appServer.ts
- ProjectDb
- models.ts
- FileMap
- domain/publication.ts
- policies.test.ts
- infrastructure/repositories.ts
- server/index.ts
- app-runtime/index.ts
- AccountLifecycleRepository
- server/index.ts
- App.tsx
- PostgresProviderRepository.ts
- composition.ts
- modules/builder/index.ts
- skills.test.ts
- domain/routing.ts
- application/problems.ts
- FileMap
- q
- evaluations/bindings.test.ts
- projects/application/usecases.ts
- model-management/index.ts
- vitest
- package.json
- modules/project-knowledge/index.ts
- sandbox.ts
- app-services/context.ts
- platformDb
- crypto.ts
- bundler.ts
- builderService.ts
- infrastructure/routing.ts
- bootstrap/server.ts
- config.ts
- createIdentityModule
- model-management/router.ts
- PostgresProjectsStore
- Plan.ts
- modules/integrations/application/github.ts
- skills.test.ts
- infrastructure/projectDb.ts
- OrgRole
- modules/projects/index.ts
- createAuth
- GithubError
- appRuntimeHttp.ts
- project-observability/events.ts
- studio.mjs
- infrastructure/runner.ts
- infrastructure/playground.ts
- Memory.tsx
- domain/score.ts
- ExecutionMetrics
- agents.mjs
- index.tsx
- createJobs
- projectIndex.ts
- ref_node_url
- memory/application/service.ts
- application/context.ts
- InviteMemberUseCase.ts
- adminApi.ts
- Project
- integrations/index.ts
- http.test.ts
- springRuntime.ts
- AgentExecution.ts
- OrganizationSkillsService.ts
- createJobs
- project-observability/security.ts
- settings/index.ts
- platform.ts
- FinishGatePolicy.ts
- urls.ts
- createCollaborationModule
- PlatformSettingsService
- ServiceControlPanel.tsx
- models/presentation/Models.tsx
- scripts
- RunTaskLaneUseCase.ts
- BootstrapService
- integrations/github.ts
- app-services/payments.ts
- GithubGateway
- AppStore
- Changes.tsx
- usage/usage.ts
- mcp/server.ts
- infrastructure/cache.ts
- IntegrationRepository
- SettingDefinition
- JobRuntimePorts
- projectLogSink.ts
- accountLifecycle.ts
- IntegrationRepository
- domain/securityScan.ts
- sandboxWorker.mjs
- PostgresOrganizationRepository.ts
- Account
- e2e.mjs
- BuilderWorkflowPorts
- createGithubSyncService
- ProjectPath
- ref_node_http
- client/index.ts
- PostgresProjectFileRepository
- architecture.test.ts
- devDependencies
- mcp/jobs.ts
- github.mjs
- Checkpoint
- Audit.tsx
- 1. Capa de datos
- infrastructure/apps.ts
- ProjectServices
- model-management/catalog.ts
- ProjectKnowledge.tsx
- services
- Panel de administración del sistema — diseño
- GithubAuthorization
- settingReactions.ts
- GithubProjectPorts
- PostgresProjectFileRepository
- services
- unit/catalog.test.ts
- languages.ts
- app-services/realtime.ts
- PostgresPlatformSettingsStoreAdapter
- runtime.test.ts
- postgres
- healthcheck
- Desplegar Forja en Coolify
- shared/security.ts
- application/projectData.ts
- Backends en otros lenguajes (Java / Spring Boot)
- collaboration/postgresAdapters.test.ts
- cli.ts
- args
- .execute
- Memoria de los servicios
- collaboration/ports/repositories.ts
- AdmissionState
- builder
- forja
- One project: orders API and durable invoice worker
- springRuntime.test.ts
- guides.ts
- Inventario de interfaz de Floot → Forja
- job-worker
- Cómo está hecho
- motion.tsx
- AppEnv
- accountLifecycle.ts
- GithubRepository
- judgeRouting.test.ts
- Objetivo
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
1. `vitest` - 169 edges
2. `q()` - 123 edges
3. `createStudioApi()` - 76 edges
4. `AppEnv` - 59 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 46 edges
7. `config` - 44 edges
8. `one()` - 43 edges
9. `ProjectsStore` - 40 edges
10. `createProjectsModule()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 2: Registro y almacén de ajustes` --references--> `SettingsError`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → server/modules/settings/domain/PlatformSetting.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx
- `Cómo está hecho` --references--> `useApi()`  [INFERRED]
  README.md → sdk/client/internal/hooks.ts
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts

## Import Cycles
- None detected.

## Communities (196 total, 37 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.05
Nodes (74): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+66 more)

### Community 1 - "http-client.ts"
Cohesion: 0.07
Nodes (32): api, billingController, Meter(), Plan(), Usage, api, evaluationsController, createEvaluationUseCases() (+24 more)

### Community 2 - "Workspace.tsx"
Cohesion: 0.07
Nodes (42): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+34 more)

### Community 3 - "studioApi.ts"
Cohesion: 0.06
Nodes (56): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+48 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.10
Nodes (19): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+11 more)

### Community 5 - "react"
Cohesion: 0.07
Nodes (58): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+50 more)

### Community 6 - "domain/contracts.ts"
Cohesion: 0.06
Nodes (24): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput (+16 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.08
Nodes (14): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, AccountProps, Email, COMMON_PASSWORDS, IdentityModuleDependencies (+6 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+43 more)

### Community 9 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (57): 6. IA dentro de las apps, Pruebas de conexión, describeSchema, criteriaOf(), planOverview(), AgentSpec, runAgent(), BuilderTool (+49 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.25
Nodes (25): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+17 more)

### Community 11 - "roles.ts"
Cohesion: 0.09
Nodes (20): AgentToolRole, BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FIRST_BUILD, FRONTEND (+12 more)

### Community 12 - "ProjectsStore"
Cohesion: 0.06
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.09
Nodes (17): ActiveRun, admission, AdmissionPorts, JudgeModel, MAX_JOBS, MAX_REPEATS, RunConfiguration, executeRun() (+9 more)

### Community 14 - "adminServer.ts"
Cohesion: 0.08
Nodes (36): ADMIN_MCP_INSTRUCTIONS, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), descriptions (+28 more)

### Community 15 - "appServer.ts"
Cohesion: 0.10
Nodes (41): formatProblem(), resolveServiceExecution(), detectSpringProject(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+33 more)

### Community 16 - "ProjectDb"
Cohesion: 0.05
Nodes (36): confirmPasswordReset, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut, signUp, userFromSession (+28 more)

### Community 17 - "models.ts"
Cohesion: 0.08
Nodes (36): track(), createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel() (+28 more)

### Community 18 - "FileMap"
Cohesion: 0.12
Nodes (22): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+14 more)

### Community 19 - "domain/publication.ts"
Cohesion: 0.08
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 20 - "policies.test.ts"
Cohesion: 0.05
Nodes (29): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail() (+21 more)

### Community 21 - "infrastructure/repositories.ts"
Cohesion: 0.10
Nodes (14): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, authRepository() (+6 more)

### Community 22 - "server/index.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 23 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (40): RuntimeProjectsPort, EndpointInfo, JobInfo, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget (+32 more)

### Community 25 - "server/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, IProjectFileRepository, LogChangeInput, app, database (+7 more)

### Community 26 - "App.tsx"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 27 - "PostgresProviderRepository.ts"
Cohesion: 0.11
Nodes (19): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+11 more)

### Community 28 - "composition.ts"
Cohesion: 0.15
Nodes (25): createMonolith(), startBindings(), stopBindings(), bindJobs, sendPlatformEmail, emailPorts, resetTransport(), configureJobRuntime() (+17 more)

### Community 29 - "modules/builder/index.ts"
Cohesion: 0.07
Nodes (32): app, lifecycle, monolith, stopRuntimeEventRelay(), BuilderRunRegistry, AgentResult, calculateSpendUseCase, toolRegistry (+24 more)

### Community 30 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 31 - "domain/routing.ts"
Cohesion: 0.05
Nodes (58): TurnState, analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), KEYWORDS, maxTokensFor(), RoleProfile (+50 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+25 more)

### Community 33 - "FileMap"
Cohesion: 0.10
Nodes (30): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), FileMap, endpointRoutes() (+22 more)

### Community 34 - "q"
Cohesion: 0.05
Nodes (12): createDevelopmentSeed(), PostgresMemberRepository, PostgresOrganizationRepository, PostgresOrganizationSkillsRepository, PostgresAccountLifecycleRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PasswordResetRepository (+4 more)

### Community 35 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 36 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+15 more)

### Community 37 - "model-management/index.ts"
Cohesion: 0.08
Nodes (30): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), createRouterAdministration(), routerStats(), bindModelAudit() (+22 more)

### Community 38 - "vitest"
Cohesion: 0.07
Nodes (31): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), createTestCoreModules(), drop(), freshDatabase() (+23 more)

### Community 39 - "package.json"
Cohesion: 0.07
Nodes (39): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0 (+31 more)

### Community 40 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 41 - "sandbox.ts"
Cohesion: 0.07
Nodes (26): ServiceExecution, alive, beginTransaction(), dispatch(), getSandboxServices(), makeRoomForSandbox(), ProjectSandbox, restartSandboxService() (+18 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 43 - "platformDb"
Cohesion: 0.14
Nodes (19): lifecycle, lifecycle, monolith, server, lifecycle, seedLocal, stopRuntimeEventRelay(), stopAppRuntime() (+11 more)

### Community 44 - "crypto.ts"
Cohesion: 0.11
Nodes (19): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresSessionRepository, createProjectKnowledgeModule(), burnPasswordCheck(), hashPassword() (+11 more)

### Community 45 - "bundler.ts"
Cohesion: 0.14
Nodes (24): esbuild@^0.28.2, esbuild, Deps, packageName(), PageInfo, pageRoutes(), buildClient(), BuildError (+16 more)

### Community 46 - "builderService.ts"
Cohesion: 0.09
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 47 - "infrastructure/routing.ts"
Cohesion: 0.11
Nodes (19): anthropicChat(), creditsForUsd(), FUSION_BUDGETS, CompatEndpoint, anthropicChat(), getClient(), SERVER_FALLBACK, contextMetrics() (+11 more)

### Community 48 - "bootstrap/server.ts"
Cohesion: 0.11
Nodes (14): withDefaultHeaders(), app, handleAdminMcp, handleMcp, listening(), monolith, reactions, resolveApp() (+6 more)

### Community 49 - "config.ts"
Cohesion: 0.14
Nodes (14): vite, DEV_FIXTURE, Fixture, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR, MIGRATIONS_DIR (+6 more)

### Community 50 - "createIdentityModule"
Cohesion: 0.08
Nodes (14): AdminApiTokenError, IdentityAccountsService, PlatformRole, Password, createIdentityModule(), AccountRow, SessionAccountRow, AccountAccessUpdate (+6 more)

### Community 51 - "model-management/router.ts"
Cohesion: 0.11
Nodes (24): useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian(), prior(), sampleBeta() (+16 more)

### Community 53 - "Plan.ts"
Cohesion: 0.08
Nodes (25): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, checkContract(), checkPlanDoc(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT (+17 more)

### Community 54 - "modules/integrations/application/github.ts"
Cohesion: 0.16
Nodes (7): createGithubAccountService(), connectAccount(), GithubAccountRepository, Link, SyncResult, PreparedImport, setup()

### Community 55 - "skills.test.ts"
Cohesion: 0.10
Nodes (30): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), applySummary(), blockTokens(), callLabel() (+22 more)

### Community 56 - "infrastructure/projectDb.ts"
Cohesion: 0.08
Nodes (53): app, monolith, runtimePorts, wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql(), checksum() (+45 more)

### Community 57 - "OrgRole"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 58 - "modules/projects/index.ts"
Cohesion: 0.13
Nodes (24): CreateProjectInput, CreateProjectUseCase, BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, FileMap (+16 more)

### Community 59 - "createAuth"
Cohesion: 0.22
Nodes (16): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+8 more)

### Community 60 - "GithubError"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 61 - "appRuntimeHttp.ts"
Cohesion: 0.09
Nodes (13): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+5 more)

### Community 62 - "project-observability/events.ts"
Cohesion: 0.06
Nodes (35): startAppRuntimeEventRelay(), formatStandard(), githubGateway, createLogService(), LogEntry, LogRepository, BuildProblem, createProblemService() (+27 more)

### Community 63 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 64 - "infrastructure/runner.ts"
Cohesion: 0.15
Nodes (25): sessionCookie(), endSession, testSession, EvalError, RunRequest, EVAL_EMAIL, spentLast24h(), defaultJudge() (+17 more)

### Community 65 - "infrastructure/playground.ts"
Cohesion: 0.14
Nodes (27): removeProjectData, removeProjectData(), runBudget(), designSignals, ensureEvalAccount(), sweepEvalProjects(), evaluationBuilder(), evaluationResources() (+19 more)

### Community 66 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 67 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 68 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 69 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 70 - "index.tsx"
Cohesion: 0.16
Nodes (20): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+12 more)

### Community 71 - "createJobs"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 72 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 73 - "ref_node_url"
Cohesion: 0.09
Nodes (20): playwright-core@1.64.1, playwright-core, root, server, types, worker, app, me (+12 more)

### Community 74 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 75 - "application/context.ts"
Cohesion: 0.10
Nodes (11): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+3 more)

### Community 76 - "InviteMemberUseCase.ts"
Cohesion: 0.17
Nodes (6): InviteMemberResult, InviteMemberUseCase, ProjectTarget, ProjectInvite, ProjectInviteProps, ICollaborationMailerService

### Community 77 - "adminApi.ts"
Cohesion: 0.15
Nodes (18): hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups (+10 more)

### Community 78 - "Project"
Cohesion: 0.10
Nodes (6): Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 79 - "integrations/index.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 80 - "http.test.ts"
Cohesion: 0.10
Nodes (22): AdminMcpModules, builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, ProjectsModule, SettingsModule, account (+14 more)

### Community 81 - "springRuntime.ts"
Cohesion: 0.07
Nodes (30): APP_DIR, buildCommand(), CACHE_DIR, clip(), isSpringSource(), jarDirectory(), jvmCommand(), JvmOptions (+22 more)

### Community 82 - "AgentExecution.ts"
Cohesion: 0.09
Nodes (18): RunAgentUseCase, ScheduleTasksUseCase, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionContext (+10 more)

### Community 83 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 84 - "createJobs"
Cohesion: 0.12
Nodes (25): createJobQueue(), poll(), processJob(), pump(), start(), stop(), createJobs(), addTimer() (+17 more)

### Community 85 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 86 - "settings/index.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 87 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 88 - "FinishGatePolicy.ts"
Cohesion: 0.11
Nodes (17): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, FileMap (+9 more)

### Community 89 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 90 - "createCollaborationModule"
Cohesion: 0.26
Nodes (4): MemberQueries, createCollaborationModule(), IMemberQueries, fixture()

### Community 91 - "PlatformSettingsService"
Cohesion: 0.24
Nodes (5): PlatformSettingsService, SettingsError, SettingsDependencies, fixture(), fixture()

### Community 92 - "ServiceControlPanel.tsx"
Cohesion: 0.10
Nodes (21): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+13 more)

### Community 93 - "models/presentation/Models.tsx"
Cohesion: 0.24
Nodes (10): api, modelsController, ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+2 more)

### Community 94 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 95 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (19): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, ExecutionModel, requiresFinishGate(), SqlAgentTaskRepository (+11 more)

### Community 96 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 97 - "integrations/github.ts"
Cohesion: 0.17
Nodes (14): RepoSelection, createGithubImportService(), apps, imports, legacy, ports(), sync, blobSha() (+6 more)

### Community 98 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 101 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "mcp/server.ts"
Cohesion: 0.13
Nodes (17): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+9 more)

### Community 104 - "infrastructure/cache.ts"
Cohesion: 0.15
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 105 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 106 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 108 - "projectLogSink.ts"
Cohesion: 0.33
Nodes (8): flushProjectLogs(), flushProjectLogsForShutdown(), ProjectLogMetadata, queue, QueuedLog, recordProjectLog(), schedule(), q

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 110 - "IntegrationRepository"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 111 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 112 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 113 - "PostgresOrganizationRepository.ts"
Cohesion: 0.12
Nodes (9): OrganizationNamesQuery, OrganizationQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView, Org, OrgMemberView (+1 more)

### Community 115 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 117 - "createGithubSyncService"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 119 - "ref_node_http"
Cohesion: 0.17
Nodes (6): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge

### Community 120 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

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

### Community 126 - "Checkpoint"
Cohesion: 0.29
Nodes (3): CreateCheckpointUseCase, Checkpoint, CheckpointProps

### Community 127 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 128 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 129 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 130 - "ProjectServices"
Cohesion: 0.25
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 131 - "model-management/catalog.ts"
Cohesion: 0.08
Nodes (49): 3. Proveedores y modelos, `llm/catalog.ts`, Tablas (`002_admin.sql`), createLocalSeed(), readSeedFile(), SeedFile, tasks, allowedModels() (+41 more)

### Community 132 - "ProjectKnowledge.tsx"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 133 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 134 - "Panel de administración del sistema — diseño"
Cohesion: 0.18
Nodes (12): 10. Documentación, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad, Almacén (+4 more)

### Community 136 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 139 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 140 - "unit/catalog.test.ts"
Cohesion: 0.11
Nodes (16): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+8 more)

### Community 141 - "languages.ts"
Cohesion: 0.11
Nodes (24): platformMemoryReport(), remote(), checkProject, dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable() (+16 more)

### Community 142 - "app-services/realtime.ts"
Cohesion: 0.24
Nodes (4): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish

### Community 145 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 146 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 147 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 148 - "shared/security.ts"
Cohesion: 0.24
Nodes (8): clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup(), STUDIO_HEADERS

### Community 149 - "application/projectData.ts"
Cohesion: 0.27
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+1 more)

### Community 150 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 151 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.14
Nodes (10): PlatformCollaborationMailerService, PostgresCollaborationAccountRepository, CollaborationAccount, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository (+2 more)

### Community 152 - "cli.ts"
Cohesion: 0.47
Nodes (5): [command, ...flags], main(), monolith, seedDev, seedLocal

### Community 153 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 154 - ".execute"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 155 - "Memoria de los servicios"
Cohesion: 0.40
Nodes (5): Cómo consultarla, Dónde se va la memoria, Límites, Memoria de los servicios, ¿Reescribir algo en Go o Rust?

### Community 156 - "collaboration/ports/repositories.ts"
Cohesion: 0.15
Nodes (7): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, RemoveMemberUseCase, Access, MemberAccess, IMemberRepository

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

### Community 161 - "springRuntime.test.ts"
Cohesion: 0.20
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 162 - "guides.ts"
Cohesion: 0.17
Nodes (14): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+6 more)

### Community 163 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 165 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 166 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 167 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 168 - "AppEnv"
Cohesion: 0.09
Nodes (7): ClaimedJob, AppEnv, ProjectDbClient, JobsApi, JobCron, JobPorts, ProjectRowsPort

### Community 169 - "accountLifecycle.ts"
Cohesion: 0.08
Nodes (9): PostgresApiTokenRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository (+1 more)

### Community 171 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 172 - "Objetivo"
Cohesion: 0.67
Nodes (3): Decisiones tomadas con el usuario, Fuera de alcance, Objetivo

### Community 180 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1443 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `http-client.ts`, `bootstrap/server.ts`, `react`, `projects/application/usecases.ts`, `BuilderTurnAdapter.ts`, `ProjectsStore`, `FusionOrchestrator.ts`, `adminServer.ts`, `ProjectDb`, `models.ts`, `FileMap`, `domain/publication.ts`, `policies.test.ts`, `infrastructure/repositories.ts`, `server/index.ts`, `app-runtime/index.ts`, `server/index.ts`, `PostgresProviderRepository.ts`, `composition.ts`, `modules/builder/index.ts`, `skills.test.ts`, `domain/routing.ts`, `FileMap`, `evaluations/bindings.test.ts`, `projects/application/usecases.ts`, `model-management/index.ts`, `package.json`, `modules/project-knowledge/index.ts`, `sandbox.ts`, `bundler.ts`, `builderService.ts`, `infrastructure/routing.ts`, `bootstrap/server.ts`, `config.ts`, `createIdentityModule`, `model-management/router.ts`, `Plan.ts`, `modules/integrations/application/github.ts`, `skills.test.ts`, `infrastructure/projectDb.ts`, `OrgRole`, `modules/projects/index.ts`, `GithubError`, `project-observability/events.ts`, `domain/score.ts`, `ExecutionMetrics`, `projectIndex.ts`, `ref_node_url`, `memory/application/service.ts`, `InviteMemberUseCase.ts`, `adminApi.ts`, `http.test.ts`, `AgentExecution.ts`, `OrganizationSkillsService.ts`, `project-observability/security.ts`, `FinishGatePolicy.ts`, `createCollaborationModule`, `PlatformSettingsService`, `ServiceControlPanel.tsx`, `RunTaskLaneUseCase.ts`, `BootstrapService`, `integrations/github.ts`, `Changes.tsx`, `usage/usage.ts`, `infrastructure/cache.ts`, `IntegrationRepository`, `SettingDefinition`, `projectLogSink.ts`, `accountLifecycle.ts`, `createGithubSyncService`, `ProjectPath`, `client/index.ts`, `PostgresProjectFileRepository`, `architecture.test.ts`, `devDependencies`, `mcp/jobs.ts`, `Checkpoint`, `Audit.tsx`, `infrastructure/apps.ts`, `model-management/catalog.ts`, `settingReactions.ts`, `unit/catalog.test.ts`, `runtime.test.ts`, `shared/security.ts`, `collaboration/postgresAdapters.test.ts`, `collaboration/ports/repositories.ts`, `springRuntime.test.ts`, `guides.ts`, `judgeRouting.test.ts`, `securityScan.test.ts`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.045715778474399164 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Chat.tsx`, `http-client.ts`, `Workspace.tsx`, `Memory.tsx`, `ProjectKnowledge.tsx`, `Changes.tsx`, `index.tsx`, `motion.tsx`, `package.json`, `ProjectView.tsx`, `projects/application/usecases.ts`, `integrations/index.ts`, `client/index.ts`, `App.tsx`, `ServiceControlPanel.tsx`, `models/presentation/Models.tsx`, `Audit.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `http-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06502732240437159 - nodes in this community are weakly interconnected._