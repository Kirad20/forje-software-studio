# Graph Report - forje-software-studio  (2026-11-14)

## Corpus Check
- 742 files · ~366,899 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 4983 nodes · 13129 edges · 206 communities (171 shown, 35 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 683 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a437e525`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BuilderTurnAdapter.ts
- index.tsx
- ports.ts
- Chat.tsx
- app-services/context.ts
- config.ts
- domain/score.ts
- projects/application/usecases.ts
- infrastructure/projectDb.ts
- builderServer.ts
- with
- infrastructure/playground.ts
- http.test.ts
- modules/builder/index.ts
- FusionOrchestrator.ts
- AppEnv
- ProjectDb
- sandbox.ts
- model-management/catalog.ts
- domain/contracts.ts
- appServer.ts
- infrastructure/runner.ts
- Project
- bundler.ts
- vitest
- server/index.ts
- AgentExecution.ts
- modules/builder/index.ts
- appRuntimeServer.ts
- app-runtime/infrastructure/browser.ts
- models.ts
- ProjectView.tsx
- application/problems.ts
- infrastructure/judge.ts
- IOrganizationRepository
- projectIndex.ts
- model-management/index.ts
- platform/security.ts
- ProviderService.ts
- projects/application/usecases.ts
- composition.ts
- model-management/catalog.ts
- project-observability/security.ts
- ProjectsApplication.ts
- springRuntime.ts
- admission.ts
- application/context.ts
- platform.ts
- roles.ts
- package.json
- ProjectsStore
- database/index.ts
- execution-audit/index.ts
- OrchestrationPolicy.ts
- studioApi.ts
- oauth.ts
- server/index.ts
- q
- modules/project-knowledge/index.ts
- Inventario de funciones de Lovable → Forja
- Workspace.tsx
- bundler.ts
- sandboxWorker.mjs
- services
- mcp/server.ts
- PostgresProjectsStore
- agents.mjs
- e2e.mjs
- Desplegar Forja en Coolify
- modules/builder/index.ts
- client/index.ts
- projectRows.ts
- internal/router.ts
- ProjectDb
- PlatformSettingsService
- builderService.ts
- modules/collaboration/index.ts
- collaboration/ports/repositories.ts
- BuilderWorkflowPorts
- devDependencies
- one
- package.json
- ref_node_url
- Inventario de funciones de Lovable → Forja
- collaboration/postgresAdapters.test.ts
- Changes.tsx
- ApplicationLifecycle
- FileMap
- createGithubSyncService
- PostgresProjectFileRepository
- Account
- application/email.ts
- GithubError
- modules/identity/index.ts
- Memory.tsx
- Plan.ts
- infrastructure/apps.ts
- runtimeDataBridge.ts
- fusion.test.ts
- FinishGateAdapter.ts
- Account.tsx
- crypto.ts
- SqlAgentTaskRepository.ts
- application/jobs.ts
- ports/ai.ts
- settingReactions.ts
- languages.ts
- OrganizationSkillsService.ts
- accountLifecycle.ts
- model-management/index.ts
- app-services/realtime.ts
- PostgresRouterAdministrationRepository.ts
- github.mjs
- BuilderToolsAdapter.ts
- guides.ts
- model-management/router.ts
- AccountLifecycleRepository
- domain/securityScan.ts
- ProjectKnowledge.tsx
- app-services/payments.ts
- PostgresProjectFileRepository
- adminApi.ts
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- mcp/jobs.ts
- Fases y dependencias
- Fases de implementacion
- Cómo está hecho
- app-services/auth.ts
- ProjectPath
- studio.mjs
- IdentityRandom
- AppStore
- evaluations/bindings.test.ts
- modules/projects/index.ts
- policies.test.ts
- models/presentation/Models.tsx
- RealtimeTransport
- Audit.tsx
- bootstrap/server.ts
- ProjectServices
- integrations/github.ts
- SettingDefinition
- GithubGateway
- projectLogSink.ts
- integrations/index.ts
- postgres
- healthcheck
- infrastructure/repositories.ts
- args
- createHttp
- app-runtime
- README.md
- builder
- forja
- database/index.ts
- One project: orders API and durable invoice worker
- ServiceControlPanel.tsx
- projects/postgres.test.ts
- IMemberRepository
- job-worker
- transports/mcp.test.ts
- Backends en otros lenguajes (Java / Spring Boot)
- GithubAuthorization
- GithubProjectPorts
- localSeed.ts
- agentCompact.test.ts
- GitHub integration
- Durable jobs worker
- judgeRouting.test.ts
- forms.tsx
- mcp-oauth.md
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- apiTypes.test.ts
- architecture.test.ts
- createJobs
- app-runtime/index.ts
- createAuth
- scripts
- createIdentityModule
- usage/usage.ts
- IntegrationRepository
- Panel de administración del sistema — diseño
- client.ts
- SettingDefinition
- Plan de escalado a microservicios
- PlatformSettingsService
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }
- forja-consola
- SettingRegistry.ts
- ApiTokenRepository
- accounts.ts

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

## Communities (206 total, 35 thin omitted)

### Community 0 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (51): BuilderRunRegistry, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), formatStandard(), active, AgentResult (+43 more)

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): clsx@^2.1.1, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+8 more)

### Community 2 - "ports.ts"
Cohesion: 0.07
Nodes (22): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeObservationPorts, RuntimeProjectsPort, createProjectCheck(), ProjectCompilerPort (+14 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (74): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+66 more)

### Community 4 - "app-services/context.ts"
Cohesion: 0.08
Nodes (22): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), jobPorts (+14 more)

### Community 5 - "config.ts"
Cohesion: 0.09
Nodes (18): vite, DEV_FIXTURE, Fixture, storagePorts, recordClassificationUsage(), DEFAULT_MODELS_ALLOW, env, paths (+10 more)

### Community 6 - "domain/score.ts"
Cohesion: 0.09
Nodes (35): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+27 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.07
Nodes (32): api, billingController, Meter(), Plan(), Usage, api, evaluationsController, createEvaluationUseCases() (+24 more)

### Community 8 - "infrastructure/projectDb.ts"
Cohesion: 0.14
Nodes (34): applyProjectMigrationsLocal(), assertRuntimeSql(), checksum(), cloneDatabase(), closeEntry(), closeProject(), closeProjectUnlocked(), closing (+26 more)

### Community 9 - "builderServer.ts"
Cohesion: 0.12
Nodes (20): app, lifecycle, monolith, stopRuntimeEventRelay(), platformMemoryReport(), remote(), localMemoryReport(), stopBuilder() (+12 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (9): BootstrapService, SetupError, COMMON_PASSWORDS, Password, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy (+1 more)

### Community 12 - "http.test.ts"
Cohesion: 0.15
Nodes (14): builderCoreModules, CollaborationModule, IdentityModule, ProjectKnowledgeModule, account, app, collaboration, identity (+6 more)

### Community 13 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (32): describeSchema, GATE_FIXES, AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), BuilderTool, toolByName (+24 more)

### Community 14 - "FusionOrchestrator.ts"
Cohesion: 0.24
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 15 - "AppEnv"
Cohesion: 0.13
Nodes (4): AppEnv, ProjectDbClient, JobsApi, ProjectRowsPort

### Community 16 - "ProjectDb"
Cohesion: 0.08
Nodes (17): createMemoryService(), listMemories(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind (+9 more)

### Community 17 - "sandbox.ts"
Cohesion: 0.06
Nodes (33): ServiceExecution, MemoryReport, alive, beginTransaction(), dispatch(), getSandboxServices(), makeRoomForSandbox(), ProjectSandbox (+25 more)

### Community 18 - "model-management/catalog.ts"
Cohesion: 0.10
Nodes (36): 6. API de administración, providerOf(), providers(), ProviderModel, speedFor(), tierFor(), createCatalogSync(), lastSync() (+28 more)

### Community 19 - "domain/contracts.ts"
Cohesion: 0.09
Nodes (13): CACHE_LIMITS, ProjectCache, AiContextMetrics, AppAiResult, AppUser, CheckoutInput, EmailInput, EmailResult (+5 more)

### Community 20 - "appServer.ts"
Cohesion: 0.07
Nodes (47): RuntimeEvent, analyticsBeacon(), appOrigin(), AppTarget, baasRoute(), badge(), callEndpoint(), clientBundle() (+39 more)

### Community 21 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (32): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, designSignals (+24 more)

### Community 22 - "Project"
Cohesion: 0.10
Nodes (10): BeforeImage, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, PATCHABLE, ProjectEventPort (+2 more)

### Community 23 - "bundler.ts"
Cohesion: 0.09
Nodes (30): createDependencyResolution(), KIT_BUILTIN, KitEntry, BUILTIN_PACKAGES, isValidPackageName(), MANIFEST, packageInfo, readDeps() (+22 more)

### Community 24 - "vitest"
Cohesion: 0.07
Nodes (29): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, out(), ROOT_DIR, migrate(), MIGRATIONS_DIR (+21 more)

### Community 25 - "server/index.ts"
Cohesion: 0.07
Nodes (58): lucide-react, radix-ui, react, administrationController, api, modelBlockers(), ModelReadiness, playgroundModel() (+50 more)

### Community 26 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (37): RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics, BuilderFusionStep, BuilderFusionTrace (+29 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (16): ws, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts (+8 more)

### Community 29 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.09
Nodes (29): playwright-core, SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+21 more)

### Community 30 - "models.ts"
Cohesion: 0.07
Nodes (39): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+31 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (51): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+43 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 33 - "infrastructure/judge.ts"
Cohesion: 0.12
Nodes (22): anthropicChat(), FUSION_BUDGETS, Block, LlmMessage, LlmRequest, LlmResponse, LlmTool, CompatEndpoint (+14 more)

### Community 34 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 35 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 36 - "model-management/index.ts"
Cohesion: 0.10
Nodes (26): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService() (+18 more)

### Community 37 - "platform/security.ts"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "ProviderService.ts"
Cohesion: 0.15
Nodes (14): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.10
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine(), isProjectProblem() (+15 more)

### Community 40 - "composition.ts"
Cohesion: 0.12
Nodes (24): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), applyProjectMigrations(), configureSecretIntegrations(), initializeAppServices (+16 more)

### Community 41 - "model-management/catalog.ts"
Cohesion: 0.09
Nodes (36): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, spentLast24h(), evaluationBuilder() (+28 more)

### Community 42 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 43 - "ProjectsApplication.ts"
Cohesion: 0.18
Nodes (12): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+4 more)

### Community 44 - "springRuntime.ts"
Cohesion: 0.07
Nodes (32): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+24 more)

### Community 45 - "admission.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 46 - "application/context.ts"
Cohesion: 0.10
Nodes (11): AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError, JobContext (+3 more)

### Community 47 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 48 - "roles.ts"
Cohesion: 0.07
Nodes (40): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+32 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (37): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+29 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (4): ProjectsApplication, TurnChanges, ProjectsStore, fixture()

### Community 51 - "database/index.ts"
Cohesion: 0.11
Nodes (25): Conexión, lifecycle, [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed() (+17 more)

### Community 52 - "execution-audit/index.ts"
Cohesion: 0.07
Nodes (43): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+35 more)

### Community 53 - "OrchestrationPolicy.ts"
Cohesion: 0.08
Nodes (21): BuilderWorkflowUseCase, FastBuildUseCase, ReviewAndFixUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode (+13 more)

### Community 54 - "studioApi.ts"
Cohesion: 0.09
Nodes (34): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, ProjectDbEnv, addTimer (+26 more)

### Community 55 - "oauth.ts"
Cohesion: 0.10
Nodes (26): @hono/node-server, accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json() (+18 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+7 more)

### Community 57 - "q"
Cohesion: 0.07
Nodes (8): PostgresMemberRepository, PostgresOrganizationRepository, PostgresApiTokenRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, ApiTokenPurpose, PasswordResetRepository, q()

### Community 58 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (19): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+11 more)

### Community 60 - "Workspace.tsx"
Cohesion: 0.07
Nodes (42): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard() (+34 more)

### Community 61 - "bundler.ts"
Cohesion: 0.12
Nodes (29): esbuild@^0.28.2, esbuild, Deps, packageName(), EndpointInfo, exampleFiles(), JobInfo, PageInfo (+21 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf(), McpModules (+7 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "agents.mjs"
Cohesion: 0.10
Nodes (19): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+11 more)

### Community 68 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 71 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 72 - "projectRows.ts"
Cohesion: 0.27
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+1 more)

### Community 73 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 74 - "ProjectDb"
Cohesion: 0.12
Nodes (11): @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, createProjectRowsRepository() (+3 more)

### Community 75 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "builderService.ts"
Cohesion: 0.09
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 77 - "modules/collaboration/index.ts"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 78 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 80 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 81 - "one"
Cohesion: 0.10
Nodes (14): PlatformRole, PostgresAccountLifecycleRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, AccountAccessUpdate, AccountAdminView, AccountCreation (+6 more)

### Community 83 - "ref_node_url"
Cohesion: 0.09
Nodes (18): root, server, types, worker, app, me, repoA, repoB (+10 more)

### Community 84 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 85 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "ApplicationLifecycle"
Cohesion: 0.17
Nodes (6): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown(), shutdown()

### Community 89 - "createGithubSyncService"
Cohesion: 0.19
Nodes (14): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+6 more)

### Community 91 - "Account"
Cohesion: 0.09
Nodes (7): Account, AccountProps, Email, AccountRow, PostgresAccountRepository, PostgresSessionRepository, SessionAccountRow

### Community 92 - "application/email.ts"
Cohesion: 0.07
Nodes (11): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender(), AuthPorts, EmailPorts, AppServiceEvent, ObserverPorts (+3 more)

### Community 93 - "GithubError"
Cohesion: 0.20
Nodes (15): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+7 more)

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (11): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IAccountRepository, ILoginCodeRepository (+3 more)

### Community 95 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 96 - "Plan.ts"
Cohesion: 0.08
Nodes (31): Implementation plan document (`static/__dev/plan.md`), CheckPlanUseCase, checkContract(), checkPlanDoc(), CONTRACT_FILE, contractRoutes(), covers(), MAX_CONTRACT (+23 more)

### Community 97 - "infrastructure/apps.ts"
Cohesion: 0.15
Nodes (14): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+6 more)

### Community 98 - "runtimeDataBridge.ts"
Cohesion: 0.12
Nodes (9): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge, assertPublic(), fetchPublicText() (+1 more)

### Community 99 - "fusion.test.ts"
Cohesion: 0.12
Nodes (16): validateToolInput(), author, features, gemini, gpt, reply(), req, review() (+8 more)

### Community 100 - "FinishGateAdapter.ts"
Cohesion: 0.16
Nodes (8): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, problemKey(), RuntimeProblem, FinishGatePorts

### Community 101 - "Account.tsx"
Cohesion: 0.07
Nodes (36): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+28 more)

### Community 102 - "crypto.ts"
Cohesion: 0.15
Nodes (18): createCoreModules(), createQueryRepository(), DatabasePorts, BcryptArgonPasswordHasher, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+10 more)

### Community 103 - "SqlAgentTaskRepository.ts"
Cohesion: 0.08
Nodes (18): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries (+10 more)

### Community 104 - "application/jobs.ts"
Cohesion: 0.13
Nodes (9): ClaimedJob, createJobQueue(), poll(), processJob(), pump(), start(), stop(), JobCron (+1 more)

### Community 105 - "ports/ai.ts"
Cohesion: 0.21
Nodes (10): AiUnavailableError, createAi(), appAiChat(), AiBlock, AiFusionTrace, AiUsage, AppAiInput, aiPorts (+2 more)

### Community 106 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 107 - "languages.ts"
Cohesion: 0.18
Nodes (15): dataBridge, springRuntime, toolChecks, toolUnavailable(), unavailable(), BASE_ENV, bwrapUnavailable(), escape() (+7 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 110 - "model-management/index.ts"
Cohesion: 0.10
Nodes (30): AgentSpec, TurnState, KEYWORDS, RoleProfile, ExecutionContextMetrics, FusionBudget, FusionEffort, FusionStep (+22 more)

### Community 111 - "app-services/realtime.ts"
Cohesion: 0.27
Nodes (3): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket

### Community 112 - "PostgresRouterAdministrationRepository.ts"
Cohesion: 0.23
Nodes (10): createRouterAdministration(), routerStats(), FusionPattern, RouterPosteriorRow, RouterStats, listFusionTraces(), postgresRouterAdministrationRepository, RouterAdministrationRepository (+2 more)

### Community 113 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 114 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (28): page(), { KIT_BUILTIN }, requestSecret, assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsSchemaChange() (+20 more)

### Community 115 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), PRODUCT_GUIDES (+5 more)

### Community 116 - "model-management/router.ts"
Cohesion: 0.09
Nodes (30): analyzeHeuristic(), createModelRouter(), analyzeRequest(), pick(), maxTokensFor(), ROLES, useFastPath(), createTurnFeedback() (+22 more)

### Community 118 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 119 - "ProjectKnowledge.tsx"
Cohesion: 0.26
Nodes (9): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge() (+1 more)

### Community 120 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 122 - "adminApi.ts"
Cohesion: 0.14
Nodes (19): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+11 more)

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.13
Nodes (15): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+7 more)

### Community 124 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 125 - "Fases y dependencias"
Cohesion: 0.33
Nodes (6): Fase 0. Medir y fijar contratos, Fase 1. Infraestructura distribuida dentro del monolito, Fase 2. Extraer runner y workloads pesados, Fase 3. Gateways horizontales y datos de apps, Fase 4. Extraer otros contextos solo con justificacion, Fases y dependencias

### Community 126 - "Fases de implementacion"
Cohesion: 0.33
Nodes (6): Fase 0. Contratos y aislamiento, Fase 1. Piloto FastAPI + React, Fase 2. Go + React, Fase 3. Spring Boot + React, Fase 4. Producto y operaciones multi-stack, Fases de implementacion

### Community 127 - "Cómo está hecho"
Cohesion: 0.25
Nodes (8): 4. Playground de agentes, Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx(), usage()

### Community 128 - "app-services/auth.ts"
Cohesion: 0.13
Nodes (14): publication, confirmPasswordReset, createAppUser, createTestUser, ensureOwnerAdmin, ensureProjectOwner, requestPasswordReset, setTemporaryPassword (+6 more)

### Community 130 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 133 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 134 - "modules/projects/index.ts"
Cohesion: 0.16
Nodes (11): ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile, SeoSettings, TurnFileChange, starterFiles(), starterFiles() (+3 more)

### Community 135 - "policies.test.ts"
Cohesion: 0.07
Nodes (22): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createSecrets(), projectSecretEnv() (+14 more)

### Community 136 - "models/presentation/Models.tsx"
Cohesion: 0.24
Nodes (10): api, modelsController, ModelChecklist(), ModelRow, MODES, price(), ProjectModels(), PROVIDER (+2 more)

### Community 138 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 139 - "bootstrap/server.ts"
Cohesion: 0.08
Nodes (26): withDefaultHeaders(), app, handleAdminMcp, handleMcp, lifecycle, listening(), monolith, reactions (+18 more)

### Community 140 - "ProjectServices"
Cohesion: 0.18
Nodes (4): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 141 - "integrations/github.ts"
Cohesion: 0.16
Nodes (16): RepoSelection, createGithubImportService(), PreparedImport, apps, imports, legacy, ports(), sync (+8 more)

### Community 142 - "SettingDefinition"
Cohesion: 0.15
Nodes (5): SettingDefinition, SettingDefinitionProps, SettingType, SettingValue, PlatformSettingsRegistryAdapter

### Community 144 - "projectLogSink.ts"
Cohesion: 0.18
Nodes (14): startAppRuntimeEventRelay(), adapters, emitProject(), listeners, onProjectEvent(), cleanupOperationalEvents(), flushProjectLogs(), flushProjectLogsForShutdown() (+6 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 146 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 147 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 148 - "infrastructure/repositories.ts"
Cohesion: 0.31
Nodes (6): projectDb(), authRepository(), createAuthRepository(), schemaRows(), statement(), statements

### Community 149 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 150 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 151 - "app-runtime"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 152 - "README.md"
Cohesion: 0.28
Nodes (5): Cómo consultarla, Dónde se va la memoria, Límites, Memoria de los servicios, ¿Reescribir algo en Go o Rust?

### Community 153 - "builder"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 154 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 155 - "database/index.ts"
Cohesion: 0.18
Nodes (9): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final (+1 more)

### Community 156 - "One project: orders API and durable invoice worker"
Cohesion: 0.25
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 157 - "ServiceControlPanel.tsx"
Cohesion: 0.10
Nodes (21): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+13 more)

### Community 158 - "projects/postgres.test.ts"
Cohesion: 0.11
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, createProjectsModule(), IProjectFileRepository, app, database, pool (+6 more)

### Community 159 - "IMemberRepository"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 160 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 161 - "transports/mcp.test.ts"
Cohesion: 0.25
Nodes (6): createMcpHandler(), account, collaboration, handleMcp, identity, projects

### Community 162 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 165 - "localSeed.ts"
Cohesion: 0.53
Nodes (5): createLocalSeed(), readSeedFile(), SeedFile, saveModel(), saveProvider()

### Community 166 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): calls, model, recordContextEvent, usage

### Community 167 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 169 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 170 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 177 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 184 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 191 - "app-runtime/index.ts"
Cohesion: 0.09
Nodes (34): createServiceControl(), restart(), scale(), snapshot(), endpointRoutes(), jobFiles(), ControlledService, RuntimeService (+26 more)

### Community 194 - "createAuth"
Cohesion: 0.21
Nodes (17): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), createTestUser(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset() (+9 more)

### Community 200 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+13 more)

### Community 202 - "createIdentityModule"
Cohesion: 0.12
Nodes (4): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), fixture()

### Community 210 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 212 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 237 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (16): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén, Decisiones tomadas con el usuario (+8 more)

### Community 248 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 319 - "SettingDefinition"
Cohesion: 0.24
Nodes (6): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry, ISettingsStore

### Community 346 - "Plan de escalado a microservicios"
Cohesion: 0.14
Nodes (12): Arquitectura objetivo inicial, Cache y estado distribuido, Decisiones propuestas, Estado actual verificado, Eventos, colas y transacciones, Objetivo y alcance, Operacion, despliegue y rollback, Plan de escalado a microservicios (+4 more)

### Community 359 - "PlatformSettingsService"
Cohesion: 0.17
Nodes (5): PlatformSettingsService, PostgresPlatformSettingsStoreAdapter, SettingsDependencies, fixture(), fixture()

### Community 416 - "SettingRegistry.ts"
Cohesion: 0.20
Nodes (17): PlatformSettingType, SettingDef, SettingGroup, SettingView, MOVED_ENV, createPlatformSettings(), byKey, Def (+9 more)

### Community 469 - "accounts.ts"
Cohesion: 0.11
Nodes (7): createGithubAccountService(), connectAccount(), GithubAccountRepository, GithubRepository, Link, SyncResult, setup()

## Knowledge Gaps
- **21 isolated node(s):** `forja-consola`, `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1476 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `BuilderTurnAdapter.ts`, `ports.ts`, `Chat.tsx`, `app-services/context.ts`, `config.ts`, `domain/score.ts`, `projects/application/usecases.ts`, `builderServer.ts`, `infrastructure/playground.ts`, `http.test.ts`, `modules/builder/index.ts`, `ProjectDb`, `sandbox.ts`, `model-management/catalog.ts`, `domain/contracts.ts`, `appServer.ts`, `Project`, `bundler.ts`, `server/index.ts`, `AgentExecution.ts`, `modules/builder/index.ts`, `models.ts`, `application/problems.ts`, `infrastructure/judge.ts`, `IOrganizationRepository`, `projectIndex.ts`, `model-management/index.ts`, `ProviderService.ts`, `projects/application/usecases.ts`, `composition.ts`, `project-observability/security.ts`, `ProjectsApplication.ts`, `admission.ts`, `roles.ts`, `package.json`, `execution-audit/index.ts`, `OrchestrationPolicy.ts`, `oauth.ts`, `server/index.ts`, `modules/project-knowledge/index.ts`, `bundler.ts`, `modules/builder/index.ts`, `ProjectDb`, `builderService.ts`, `modules/collaboration/index.ts`, `collaboration/ports/repositories.ts`, `devDependencies`, `one`, `ref_node_url`, `collaboration/postgresAdapters.test.ts`, `Changes.tsx`, `ApplicationLifecycle`, `createGithubSyncService`, `Account`, `GithubError`, `modules/identity/index.ts`, `Plan.ts`, `infrastructure/apps.ts`, `fusion.test.ts`, `FinishGateAdapter.ts`, `crypto.ts`, `SqlAgentTaskRepository.ts`, `settingReactions.ts`, `OrganizationSkillsService.ts`, `PostgresRouterAdministrationRepository.ts`, `BuilderToolsAdapter.ts`, `guides.ts`, `model-management/router.ts`, `adminApi.ts`, `mcp/jobs.ts`, `ProjectPath`, `evaluations/bindings.test.ts`, `modules/projects/index.ts`, `policies.test.ts`, `Audit.tsx`, `bootstrap/server.ts`, `integrations/github.ts`, `SettingDefinition`, `projectLogSink.ts`, `createHttp`, `ServiceControlPanel.tsx`, `projects/postgres.test.ts`, `IMemberRepository`, `transports/mcp.test.ts`, `agentCompact.test.ts`, `judgeRouting.test.ts`, `apiTypes.test.ts`, `architecture.test.ts`, `securityScan.test.ts`, `app-runtime/index.ts`, `createIdentityModule`, `usage/usage.ts`, `IntegrationRepository`, `SettingDefinition`, `PlatformSettingsService`, `accounts.ts`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `forja-consola`, `./dynamic.js`, `./inlineType.js` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BuilderTurnAdapter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06760316066725197 - nodes in this community are weakly interconnected._
- **Why does `react` connect `server/index.ts` to `index.tsx`, `Chat.tsx`, `Account.tsx`, `client/index.ts`, `projects/application/usecases.ts`, `internal/router.ts`, `forms.tsx`, `Audit.tsx`, `models/presentation/Models.tsx`, `projects/application/usecases.ts`, `package.json`, `integrations/index.ts`, `Changes.tsx`, `ProjectKnowledge.tsx`, `Workspace.tsx`, `ServiceControlPanel.tsx`, `Memory.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `ports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07268170426065163 - nodes in this community are weakly interconnected._