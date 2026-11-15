# Graph Report - resilience-pr  (2026-11-14)

## Corpus Check
- 739 files · ~362,803 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4938 nodes · 13082 edges · 190 communities (163 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 682 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec570483`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Chat.tsx
- http-client.ts
- infrastructure/repositories.ts
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
- one
- server/index.ts
- App.tsx
- PostgresProviderRepository.ts
- composition.ts
- modules/builder/index.ts
- fusion.test.ts
- domain/routing.ts
- application/problems.ts
- FileMap
- q
- evaluations/bindings.test.ts
- Workspace.tsx
- model-management/index.ts
- vitest
- package.json
- modules/project-knowledge/index.ts
- sandbox.ts
- app-services/context.ts
- platformDb
- crypto.ts
- bundler.ts
- http.test.ts
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
- application/problems.ts
- studio.mjs
- infrastructure/runner.ts
- PostgresRouterAdministrationRepository.ts
- RunTaskLaneUseCase.ts
- domain/score.ts
- ExecutionMetrics
- agents.dbg.mjs
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
- adminServer.ts
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
- app-services/analytics.ts
- scripts
- AgentExecutionResult
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
- Evals.tsx
- projectLogSink.ts
- accountLifecycle.ts
- IntegrationRepository
- domain/securityScan.ts
- sandboxWorker.mjs
- OrgRole
- Account
- e2e.mjs
- BuilderWorkflowPorts
- createGithubSyncService
- createAdminMcpHandler
- ref_node_http
- client/index.ts
- PostgresProjectFileRepository
- architecture.test.ts
- devDependencies
- mcp/jobs.ts
- github.mjs
- AgentTaskView
- Audit.tsx
- format.ts
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
- Review Focus
- languages.ts
- app-services/realtime.ts
- forms.tsx
- vitest
- postgres
- healthcheck
- Desplegar Forja en Coolify
- shared/security.ts
- replaceVisibleText
- createJobQueue
- collaboration/postgresAdapters.test.ts
- BuilderRunRegistry
- args
- .execute
- execution.test.ts
- CheckAccessUseCase.ts
- classification.test.ts
- builder
- forja
- One project: orders API and durable invoice worker
- apiTypes.test.ts
- toolOutputs.test.ts
- job-worker
- motion.tsx
- accountLifecycle.ts
- GithubRepository
- infrastructure/judge.ts
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

## Communities (190 total, 27 thin omitted)

### Community 0 - "Chat.tsx"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 1 - "http-client.ts"
Cohesion: 0.06
Nodes (34): appServicesController, api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases() (+26 more)

### Community 2 - "infrastructure/repositories.ts"
Cohesion: 0.07
Nodes (14): emailPorts, resetTransport(), authRepository(), createAuthRepository(), createQueryRepository(), platformRepository, statement(), statements (+6 more)

### Community 3 - "studioApi.ts"
Cohesion: 0.05
Nodes (64): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, createAppUser, updateAppUserPassword (+56 more)

### Community 4 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 5 - "react"
Cohesion: 0.08
Nodes (55): radix-ui@^1.8.1, lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel() (+47 more)

### Community 6 - "domain/contracts.ts"
Cohesion: 0.05
Nodes (29): AiUnavailableError, createAi(), appAiChat(), ClaimedJob, bindJobs, AiBlock, AiContextMetrics, AiFusionTrace (+21 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 8 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (59): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+51 more)

### Community 9 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (56): Implementation plan document (`static/__dev/plan.md`), 6. IA dentro de las apps, Pruebas de conexión, describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf() (+48 more)

### Community 10 - "FusionOrchestrator.ts"
Cohesion: 0.24
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 11 - "roles.ts"
Cohesion: 0.06
Nodes (41): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+33 more)

### Community 12 - "ProjectsStore"
Cohesion: 0.07
Nodes (6): isDevFile(), ProjectsApplication, TurnChanges, createProjectsModule(), ProjectsStore, fixture()

### Community 13 - "FusionOrchestrator.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 14 - "adminServer.ts"
Cohesion: 0.18
Nodes (16): auditWindow(), ExecutionAudit, identifier(), AuditContext, AuditFilter, AuditReport, AuditStage, AuditStep (+8 more)

### Community 15 - "appServer.ts"
Cohesion: 0.10
Nodes (41): formatProblem(), resolveServiceExecution(), detectSpringProject(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint() (+33 more)

### Community 16 - "ProjectDb"
Cohesion: 0.05
Nodes (37): confirmPasswordReset, ensureOwnerAdmin, requestPasswordReset, setTemporaryPassword, signIn, signOut, signUp, userFromSession (+29 more)

### Community 17 - "models.ts"
Cohesion: 0.08
Nodes (32): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+24 more)

### Community 18 - "FileMap"
Cohesion: 0.12
Nodes (22): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+14 more)

### Community 19 - "domain/publication.ts"
Cohesion: 0.08
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 20 - "policies.test.ts"
Cohesion: 0.07
Nodes (21): @electric-sql/pglite, createEmail(), sendEmail(), sendPlatformEmail(), createSecrets(), projectSecretEnv(), secretEnv(), createStorage() (+13 more)

### Community 21 - "infrastructure/repositories.ts"
Cohesion: 0.10
Nodes (10): AppEnv, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, ProjectDbClient, SqlExecutionResult, TransactionAction (+2 more)

### Community 22 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 23 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (40): RuntimeProjectsPort, EndpointInfo, JobInfo, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget (+32 more)

### Community 24 - "one"
Cohesion: 0.08
Nodes (9): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountLifecycleRepository, AccountSecurity (+1 more)

### Community 25 - "server/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 26 - "App.tsx"
Cohesion: 0.07
Nodes (43): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+35 more)

### Community 27 - "PostgresProviderRepository.ts"
Cohesion: 0.10
Nodes (29): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), speedFor(), tierFor() (+21 more)

### Community 28 - "composition.ts"
Cohesion: 0.15
Nodes (22): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), sendPlatformEmail, configureJobRuntime(), configureSecretIntegrations(), initializeAppServices (+14 more)

### Community 29 - "modules/builder/index.ts"
Cohesion: 0.06
Nodes (41): app, lifecycle, monolith, stopRuntimeEventRelay(), AgentResult, calculateSpendUseCase, toolRegistry, accountSchema (+33 more)

### Community 30 - "fusion.test.ts"
Cohesion: 0.12
Nodes (19): createModelRouter(), pick(), maxTokensFor(), validateToolInput(), author, features, gemini, gpt (+11 more)

### Community 31 - "domain/routing.ts"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ROLES, Posterior, ExecutionContextMetrics, FusionBudget (+22 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.09
Nodes (33): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo (+25 more)

### Community 33 - "FileMap"
Cohesion: 0.10
Nodes (30): createProjectCheck(), ProjectCompilerPort, createServiceControl(), restart(), scale(), snapshot(), FileMap, endpointRoutes() (+22 more)

### Community 34 - "q"
Cohesion: 0.07
Nodes (12): createDevelopmentSeed(), DEV_FIXTURE, Fixture, PostgresMemberRepository, PostgresOrganizationSkillsRepository, IdentityModule, PostgresPasswordResetRepository, PasswordResetRepository (+4 more)

### Community 35 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (17): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+9 more)

### Community 36 - "Workspace.tsx"
Cohesion: 0.05
Nodes (59): ProjectEvent, ProjectLogLine, api, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine() (+51 more)

### Community 37 - "model-management/index.ts"
Cohesion: 0.11
Nodes (25): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), taskClassOf(), audit(), bindModelAudit() (+17 more)

### Community 38 - "vitest"
Cohesion: 0.10
Nodes (21): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, migrate(), drop(), freshDatabase(), TEST_DATABASE_URL, pool (+13 more)

### Community 39 - "package.json"
Cohesion: 0.07
Nodes (37): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, hono@^4.13.14, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+29 more)

### Community 40 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 41 - "sandbox.ts"
Cohesion: 0.07
Nodes (26): ServiceExecution, alive, beginTransaction(), dispatch(), getSandboxServices(), makeRoomForSandbox(), ProjectSandbox, restartSandboxService() (+18 more)

### Community 42 - "app-services/context.ts"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 43 - "platformDb"
Cohesion: 0.11
Nodes (13): McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AccountCreation, contextMetrics(), recordFusionStep(), recordFusionTrace(), platformDb (+5 more)

### Community 44 - "crypto.ts"
Cohesion: 0.10
Nodes (20): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PostgresLoginCodeRepository, PostgresSessionRepository, burnPasswordCheck(), hashPassword(), LEGACY (+12 more)

### Community 45 - "bundler.ts"
Cohesion: 0.14
Nodes (24): esbuild@^0.28.2, esbuild, Deps, packageName(), PageInfo, pageRoutes(), buildClient(), BuildError (+16 more)

### Community 46 - "http.test.ts"
Cohesion: 0.12
Nodes (11): BuilderServiceClient, account, app, collaboration, identity, knowledge, mocks, models (+3 more)

### Community 47 - "infrastructure/routing.ts"
Cohesion: 0.11
Nodes (26): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, textOf() (+18 more)

### Community 48 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (30): lifecycle, withDefaultHeaders(), lifecycle, monolith, server, app, handleAdminMcp, handleMcp (+22 more)

### Community 49 - "config.ts"
Cohesion: 0.13
Nodes (13): vite, DEFAULT_MODELS_ALLOW, env, resolvePublicUrl(), ROOT_DIR, MIGRATIONS_DIR, studioPwa(), here (+5 more)

### Community 50 - "createIdentityModule"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 51 - "model-management/router.ts"
Cohesion: 0.10
Nodes (26): analyzeHeuristic(), analyzeRequest(), useFastPath(), createTurnFeedback(), penalizeTurn(), posteriors, gamma(), gaussian() (+18 more)

### Community 52 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (4): FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 53 - "Plan.ts"
Cohesion: 0.11
Nodes (21): CheckPlanUseCase, checkContract(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT, MAX_GOAL, MAX_PLAN_DOC (+13 more)

### Community 54 - "modules/integrations/application/github.ts"
Cohesion: 0.15
Nodes (8): createGithubAccountService(), connectAccount(), GithubAccountRepository, RepoSelection, Link, SyncResult, PreparedImport, setup()

### Community 55 - "skills.test.ts"
Cohesion: 0.18
Nodes (20): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, emptyUsage(), ExecutionContext, applySummary(), blockTokens() (+12 more)

### Community 56 - "infrastructure/projectDb.ts"
Cohesion: 0.07
Nodes (60): app, monolith, runtimePorts, wss, createProjectData(), createProjectRows(), columnsFor(), createProjectRow() (+52 more)

### Community 57 - "OrgRole"
Cohesion: 0.12
Nodes (6): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, IOrganizationRepository

### Community 58 - "modules/projects/index.ts"
Cohesion: 0.12
Nodes (22): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+14 more)

### Community 59 - "createAuth"
Cohesion: 0.13
Nodes (17): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset(), setTemporaryPassword() (+9 more)

### Community 60 - "GithubError"
Cohesion: 0.22
Nodes (14): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+6 more)

### Community 61 - "appRuntimeHttp.ts"
Cohesion: 0.13
Nodes (10): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+2 more)

### Community 62 - "application/problems.ts"
Cohesion: 0.09
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 63 - "studio.mjs"
Cohesion: 0.12
Nodes (24): app, DATA, MODELS, ROOT, SEED, call(), log, reply() (+16 more)

### Community 64 - "infrastructure/runner.ts"
Cohesion: 0.08
Nodes (56): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+48 more)

### Community 65 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 66 - "RunTaskLaneUseCase.ts"
Cohesion: 0.17
Nodes (9): RunTaskLaneUseCase, AgentEvent, ExecutionModel, LaneTask, TaskLaneHooks, TaskLanePorts, fixture(), result (+1 more)

### Community 67 - "domain/score.ts"
Cohesion: 0.14
Nodes (25): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), judgeScore(), mean() (+17 more)

### Community 68 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 69 - "agents.dbg.mjs"
Cohesion: 0.09
Nodes (11): cookie(), app, DATA, MODELS, req(), ROOT, SEED, req() (+3 more)

### Community 70 - "index.tsx"
Cohesion: 0.19
Nodes (15): clsx@^2.1.1, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+7 more)

### Community 71 - "createJobs"
Cohesion: 0.15
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 72 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 73 - "ref_node_url"
Cohesion: 0.09
Nodes (19): playwright-core, root, server, types, worker, app, me, repoA (+11 more)

### Community 74 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 75 - "application/context.ts"
Cohesion: 0.09
Nodes (12): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+4 more)

### Community 76 - "InviteMemberUseCase.ts"
Cohesion: 0.12
Nodes (11): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, PostgresCollaborationAccountRepository, CollaborationAccount (+3 more)

### Community 77 - "adminApi.ts"
Cohesion: 0.11
Nodes (32): 6. API de administración, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+24 more)

### Community 78 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 79 - "integrations/index.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 80 - "adminServer.ts"
Cohesion: 0.10
Nodes (18): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, descriptions, fusionCapability, id, modelIds, modelPatch, schemas (+10 more)

### Community 81 - "springRuntime.ts"
Cohesion: 0.07
Nodes (30): APP_DIR, buildCommand(), CACHE_DIR, clip(), isSpringSource(), jarDirectory(), jvmCommand(), JvmOptions (+22 more)

### Community 82 - "AgentExecution.ts"
Cohesion: 0.13
Nodes (12): Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace, ContextAuditEvent, ExecutionTool, Message, ToolDefinition (+4 more)

### Community 83 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 84 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

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
Cohesion: 0.08
Nodes (25): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+17 more)

### Community 89 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 90 - "createCollaborationModule"
Cohesion: 0.11
Nodes (6): ClaimInvitesUseCase, MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), fixture()

### Community 91 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 92 - "ServiceControlPanel.tsx"
Cohesion: 0.10
Nodes (21): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+13 more)

### Community 93 - "app-services/analytics.ts"
Cohesion: 0.21
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 94 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 95 - "AgentExecutionResult"
Cohesion: 0.14
Nodes (8): TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTask, AgentTaskRepository, TaskCompletion, mocks

### Community 96 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 97 - "integrations/github.ts"
Cohesion: 0.13
Nodes (16): createGithubImportService(), apps, createRepo(), imports, legacy, ports(), sync, blobSha() (+8 more)

### Community 98 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 101 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "mcp/server.ts"
Cohesion: 0.09
Nodes (30): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+22 more)

### Community 104 - "infrastructure/cache.ts"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 105 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 106 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 107 - "Evals.tsx"
Cohesion: 0.23
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

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

### Community 113 - "OrgRole"
Cohesion: 0.12
Nodes (11): OrgRole, CollaborationModuleDependencies, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, IOrganizationQueries, MemberView (+3 more)

### Community 114 - "Account"
Cohesion: 0.12
Nodes (6): Account, AccountProps, Email, COMMON_PASSWORDS, Password, PostgresAccountRepository

### Community 115 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 116 - "BuilderWorkflowPorts"
Cohesion: 0.09
Nodes (6): [command, ...flags], main(), monolith, seedDev, seedLocal, BuilderWorkflowPorts

### Community 117 - "createGithubSyncService"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 118 - "createAdminMcpHandler"
Cohesion: 0.26
Nodes (11): createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists(), admin, call() (+3 more)

### Community 119 - "ref_node_http"
Cohesion: 0.13
Nodes (9): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge, assertPublic(), fetchPublicText() (+1 more)

### Community 120 - "client/index.ts"
Cohesion: 0.05
Nodes (56): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 7. Conectores e integraciones, 8. Seguridad (+48 more)

### Community 121 - "PostgresProjectFileRepository"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 122 - "architecture.test.ts"
Cohesion: 0.11
Nodes (16): @babel/parser@^7.28.0, @babel/parser, SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files() (+8 more)

### Community 123 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, vitest@^5.0.5 (+5 more)

### Community 124 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 125 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 126 - "AgentTaskView"
Cohesion: 0.38
Nodes (3): ListAgentTasksUseCase, AgentTaskQueries, AgentTaskView

### Community 127 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 128 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 129 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 130 - "ProjectServices"
Cohesion: 0.16
Nodes (4): CoreModulesDependencies, ProjectPatch, ProjectsModuleDependencies, ProjectServices

### Community 131 - "model-management/catalog.ts"
Cohesion: 0.13
Nodes (23): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Tablas (`002_admin.sql`), createLocalSeed(), readSeedFile(), SeedFile, tasks (+15 more)

### Community 132 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 133 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 134 - "Panel de administración del sistema — diseño"
Cohesion: 0.10
Nodes (20): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+12 more)

### Community 136 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 138 - "PostgresProjectFileRepository"
Cohesion: 0.16
Nodes (6): BeforeImage, ProjectProps, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 139 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 140 - "Review Focus"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 141 - "languages.ts"
Cohesion: 0.11
Nodes (24): platformMemoryReport(), remote(), checkProject, dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable() (+16 more)

### Community 142 - "app-services/realtime.ts"
Cohesion: 0.19
Nodes (6): startHttp(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, attachSocket, publish

### Community 143 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 144 - "vitest"
Cohesion: 0.08
Nodes (6): vitest, { KIT_BUILTIN }, root, sources(), files(), scopes

### Community 145 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 146 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 147 - "Desplegar Forja en Coolify"
Cohesion: 0.06
Nodes (32): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+24 more)

### Community 148 - "shared/security.ts"
Cohesion: 0.24
Nodes (8): clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, startRateLimitCleanup(), stopRateLimitCleanup(), STUDIO_HEADERS

### Community 149 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 150 - "createJobQueue"
Cohesion: 0.48
Nodes (6): createJobQueue(), poll(), processJob(), pump(), start(), stop()

### Community 151 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 153 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 154 - ".execute"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 155 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 156 - "CheckAccessUseCase.ts"
Cohesion: 0.27
Nodes (4): CheckAccessUseCase, ProjectIdentity, Access, MemberAccess

### Community 157 - "classification.test.ts"
Cohesion: 0.43
Nodes (6): createModelClassification(), answer(), model, prediction(), scope, setup()

### Community 158 - "builder"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 159 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 160 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 161 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 162 - "toolOutputs.test.ts"
Cohesion: 0.40
Nodes (3): BEFORE, conforms(), dir

### Community 165 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 167 - "motion.tsx"
Cohesion: 0.50
Nodes (3): motion@^14.9.0, motion, FadeIn()

### Community 169 - "accountLifecycle.ts"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 171 - "infrastructure/judge.ts"
Cohesion: 0.15
Nodes (12): JUDGE_DIMENSIONS, JudgeDimension, Judgement, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), billing (+4 more)

### Community 180 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1442 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `Chat.tsx`, `http-client.ts`, `bootstrap/server.ts`, `react`, `domain/contracts.ts`, `projects/application/usecases.ts`, `roles.ts`, `ProjectsStore`, `FusionOrchestrator.ts`, `adminServer.ts`, `ProjectDb`, `models.ts`, `FileMap`, `domain/publication.ts`, `policies.test.ts`, `infrastructure/repositories.ts`, `app-runtime/index.ts`, `server/index.ts`, `PostgresProviderRepository.ts`, `composition.ts`, `modules/builder/index.ts`, `fusion.test.ts`, `FileMap`, `evaluations/bindings.test.ts`, `Workspace.tsx`, `model-management/index.ts`, `vitest`, `package.json`, `modules/project-knowledge/index.ts`, `sandbox.ts`, `crypto.ts`, `bundler.ts`, `http.test.ts`, `infrastructure/routing.ts`, `bootstrap/server.ts`, `config.ts`, `createIdentityModule`, `model-management/router.ts`, `Plan.ts`, `modules/integrations/application/github.ts`, `skills.test.ts`, `infrastructure/projectDb.ts`, `OrgRole`, `modules/projects/index.ts`, `GithubError`, `application/problems.ts`, `PostgresRouterAdministrationRepository.ts`, `RunTaskLaneUseCase.ts`, `domain/score.ts`, `ExecutionMetrics`, `agents.dbg.mjs`, `projectIndex.ts`, `ref_node_url`, `memory/application/service.ts`, `application/context.ts`, `InviteMemberUseCase.ts`, `adminApi.ts`, `adminServer.ts`, `AgentExecution.ts`, `OrganizationSkillsService.ts`, `project-observability/security.ts`, `FinishGatePolicy.ts`, `createCollaborationModule`, `PlatformSettingsService`, `ServiceControlPanel.tsx`, `AgentExecutionResult`, `BootstrapService`, `integrations/github.ts`, `Changes.tsx`, `usage/usage.ts`, `mcp/server.ts`, `infrastructure/cache.ts`, `IntegrationRepository`, `SettingDefinition`, `projectLogSink.ts`, `accountLifecycle.ts`, `Account`, `createGithubSyncService`, `createAdminMcpHandler`, `client/index.ts`, `PostgresProjectFileRepository`, `architecture.test.ts`, `devDependencies`, `mcp/jobs.ts`, `AgentTaskView`, `Audit.tsx`, `infrastructure/apps.ts`, `settingReactions.ts`, `shared/security.ts`, `replaceVisibleText`, `collaboration/postgresAdapters.test.ts`, `BuilderRunRegistry`, `execution.test.ts`, `CheckAccessUseCase.ts`, `classification.test.ts`, `apiTypes.test.ts`, `toolOutputs.test.ts`, `infrastructure/judge.ts`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chat.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04677893611333868 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `format.ts`, `Chat.tsx`, `http-client.ts`, `ProjectKnowledge.tsx`, `Changes.tsx`, `index.tsx`, `motion.tsx`, `package.json`, `ProjectView.tsx`, `Workspace.tsx`, `Evals.tsx`, `forms.tsx`, `integrations/index.ts`, `client/index.ts`, `App.tsx`, `ServiceControlPanel.tsx`, `Audit.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `http-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._