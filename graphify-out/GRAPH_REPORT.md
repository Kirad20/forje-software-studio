# Graph Report - forja-project-migration-e70262  (2026-11-23)

## Corpus Check
- 770 files · ~420,081 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 5379 nodes · 14382 edges · 203 communities (171 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 728 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42dbb079`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BuilderTurnAdapter.ts
- index.tsx
- FileMap
- Chat.tsx
- app-services/context.ts
- ref_node_path
- domain/score.ts
- projects/application/usecases.ts
- infrastructure/projectDb.ts
- database/index.ts
- with
- infrastructure/playground.ts
- app-runtime/infrastructure/browser.ts
- Account
- FusionOrchestrator.ts
- oauthProviders.ts
- ProjectDb
- config.ts
- model-management/catalog.ts
- app-runtime/index.ts
- appServer.ts
- infrastructure/runner.ts
- Project
- deps.ts
- vitest
- server/index.ts
- components.test.ts
- modules/builder/index.ts
- appRuntimeHttp.ts
- urls.ts
- models.ts
- ProjectView.tsx
- application/problems.ts
- infrastructure/routing.ts
- OrgRole
- projectIndex.ts
- model-management/index.ts
- compilerOptions
- model-management/providers.ts
- Workspace.tsx
- composition.ts
- ProjectSandbox
- project-observability/security.ts
- projectLayout.ts
- springRuntime.ts
- admission.ts
- application/context.ts
- platform.ts
- roles.ts
- package.json
- createProjectsModule
- AppEnv
- http.test.ts
- BuilderWorkflowPorts
- studioApi.ts
- mcp/oauth.ts
- server/index.ts
- q
- modules/project-knowledge/index.ts
- CLAUDE.md
- oauth.test.ts
- bundler.ts
- sandboxWorker.mjs
- services
- mcp/server.ts
- PostgresProjectsStore
- appOAuth.ts
- adminApi.ts
- Desplegar Forja en Coolify
- ExecutionMetrics
- client/index.ts
- application/projectData.ts
- internal/router.ts
- ProjectDb
- services
- builderService.ts
- createCollaborationModule
- ProjectServices
- PostgresOrganizationRepository
- devDependencies
- accountLifecycle.ts
- TEST_DATABASE_URL
- ref_node_url
- Inventario de funciones de Lovable → Forja
- collaboration/postgresAdapters.test.ts
- Changes.tsx
- bootstrap/server.ts
- infrastructure/cache.ts
- createGithubSyncService
- PostgresProjectsStore.ts
- shared/oauth.ts
- domain/contracts.ts
- GithubError
- modules/identity/index.ts
- cli.ts
- Plan.ts
- infrastructure/apps.ts
- springRuntime.test.ts
- En una app: `forja.auth.json`
- FinishGatePolicy.ts
- App.tsx
- crypto.ts
- RunTaskLaneUseCase.ts
- infrastructure/probe.ts
- server.mjs
- AgentExecution.ts
- studio.mjs
- OrganizationSkillsService.ts
- accountLifecycle.ts
- domain/routing.ts
- app-services/realtime.ts
- fusion.ts
- github.mjs
- BuilderToolsAdapter.ts
- mcp/jobs.ts
- model-management/router.ts
- one
- domain/securityScan.ts
- ProjectKnowledge.tsx
- app-services/payments.ts
- PostgresProjectFileRepository
- AuthPorts
- Plan de runtime multi-stack: FastAPI, Go y Spring Boot
- Registro de implementación
- Evals.tsx
- e2e.mjs
- Cómo está hecho
- format.ts
- e2e-oauth.mjs
- ref_node_child_process
- BuilderRunRegistry
- AppStore
- evaluations/bindings.test.ts
- ProjectsApplication.ts
- policies.test.ts
- PostgresPlatformSettingsStoreAdapter
- RealtimeTransport
- Audit.tsx
- recordOperationalEvent
- starterFiles
- integrations/github.ts
- SettingDefinition
- GithubGateway
- classification.test.ts
- integrations/index.ts
- postgres
- healthcheck
- migrate.mjs
- args
- ApiError
- app-runtime
- README.md
- builder
- forja
- Review Focus
- Memoria de los servicios
- ServiceControlPanel.tsx
- modules/projects/index.ts
- collaboration/ports/repositories.ts
- job-worker
- judgeRouting.test.ts
- Backends en otros lenguajes (Java / Spring Boot)
- GithubAuthorization
- GithubProjectPorts
- GitHub integration
- Durable jobs worker
- Fases
- mcp-oauth.md
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes, getSandboxServices, restartSandboxService }
- { connectAccount, oauthStart, oauthFinish, getLink, unlink }
- { prepare: prepareImport, attach: attachImport }
- { start: appStart, finish: appFinish, installStart: appInstallStart, installFinish: appInstallFinish, repositories: listRepositories, branches: listBranches }
- apiTypes.test.ts
- architecture.test.ts
- modules/integrations/application/github.ts
- modules/builder/index.ts
- GithubRepository
- createJobs
- domain/services.ts
- app-services/auth.ts
- scripts
- createIdentityModule
- usage/usage.ts
- IntegrationRepository
- Panel de administración del sistema — diseño
- client.ts
- ISettingsStore
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
- settings/index.ts

## God Nodes (most connected - your core abstractions)
1. `vitest` - 177 edges
2. `q()` - 125 edges
3. `createStudioApi()` - 79 edges
4. `AppEnv` - 61 edges
5. `react` - 52 edges
6. `createIdentityModule()` - 48 edges
7. `config` - 46 edges
8. `one()` - 44 edges
9. `createProjectsModule()` - 41 edges
10. `ProjectsStore` - 40 edges

## Surprising Connections (you probably didn't know these)
- `Constructor` --references--> `roleCanWrite()`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/builder/domain/Plan.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Diagnóstico` --references--> `ProjectPath`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/projects/domain/ProjectPath.ts
- `Fase 0 — Layout como fuente de verdad (sin cambio de comportamiento)` --references--> `ProjectPath`  [INFERRED]
  docs/plan-arquitecturas-reales.md → server/modules/projects/domain/ProjectPath.ts

## Import Cycles
- None detected.

## Communities (203 total, 32 thin omitted)

### Community 0 - "BuilderTurnAdapter.ts"
Cohesion: 0.06
Nodes (66): writableRoots(), Implementation plan document (`static/__dev/plan.md`), describeSchema, ScheduleTasksUseCase, rewardOf(), checkPlanDoc(), criteriaOf(), planOverview() (+58 more)

### Community 1 - "index.tsx"
Cohesion: 0.14
Nodes (21): clsx, Button, ButtonProps, Badge(), Card(), EmptyState(), ErrorState(), Skeleton() (+13 more)

### Community 2 - "FileMap"
Cohesion: 0.07
Nodes (19): createBuildVerification(), PackageRegistryPort, BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createProjectCheck(), ProjectCompilerPort (+11 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (73): ChatStreamEvent, api, builderController, streamGet, streamPost, fusionDisplay(), FusionEvent, PHASES (+65 more)

### Community 4 - "app-services/context.ts"
Cohesion: 0.05
Nodes (26): aiUsage, appAiChat, createSecrets(), projectSecretEnv(), secretEnv(), bindJobs, aiPorts, emailPorts (+18 more)

### Community 5 - "ref_node_path"
Cohesion: 0.12
Nodes (14): vite, studioPwa(), here, createTestCoreModules(), dataDir, root, sources(), files() (+6 more)

### Community 6 - "domain/score.ts"
Cohesion: 0.10
Nodes (33): PageInspection, EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS (+25 more)

### Community 7 - "projects/application/usecases.ts"
Cohesion: 0.06
Nodes (34): appServicesController, api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, createEvaluationUseCases() (+26 more)

### Community 8 - "infrastructure/projectDb.ts"
Cohesion: 0.07
Nodes (63): @electric-sql/pglite, app, monolith, runtimePorts, wss, applyProjectMigrations(), applyProjectMigrationsLocal(), assertRuntimeSql() (+55 more)

### Community 9 - "database/index.ts"
Cohesion: 0.10
Nodes (14): Task 3: Proveedores y modelos en BD + seeders, recordClassificationUsage(), Tx, ANTHROPIC_MODELS, PROVIDERS, seedDefaults(), dir, monolith (+6 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "infrastructure/playground.ts"
Cohesion: 0.13
Nodes (8): BootstrapService, SetupError, COMMON_PASSWORDS, Password, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 12 - "app-runtime/infrastructure/browser.ts"
Cohesion: 0.15
Nodes (18): playwright-core@1.64.1, playwright-core, allowedRequest(), BrowserStep, BrowserTestInput, BrowserTestResult, describe(), getBrowser() (+10 more)

### Community 13 - "Account"
Cohesion: 0.11
Nodes (4): Account, AccountProps, Email, PostgresAccountRepository

### Community 14 - "FusionOrchestrator.ts"
Cohesion: 0.24
Nodes (24): createFusionOrchestrator(), callModel(), invoke(), proposal(), rank(), targetFor(), taskClass(), contextMetrics() (+16 more)

### Community 15 - "oauthProviders.ts"
Cohesion: 0.14
Nodes (20): AUTH_MANIFEST, BUILTIN, BuiltinOAuthProvider, defaultSecretPrefix(), httpsUrl(), isBuiltinOAuthProvider(), isRecord(), LABELS (+12 more)

### Community 16 - "ProjectDb"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "config.ts"
Cohesion: 0.07
Nodes (32): zod, platformMemoryReport(), remote(), ServiceExecution, localMemoryReport(), MemoryReport, removeProjectData(), callRuntimeEndpoint() (+24 more)

### Community 18 - "model-management/catalog.ts"
Cohesion: 0.11
Nodes (31): `llm/catalog.ts`, tasks, allowedModels(), availableModels(), catalog(), createPlatformCatalogService(), deleteModel(), lastSync() (+23 more)

### Community 19 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (32): RuntimeProjectsPort, KIT_BUILTIN, KitEntry, suggestSlug(), ControlledService, RuntimeService, ServiceControlSnapshot, ServiceQueueEntry (+24 more)

### Community 20 - "appServer.ts"
Cohesion: 0.09
Nodes (45): componentForUrl(), dataScopeOf(), resolveServiceExecution(), isOAuthCallback(), analyticsBeacon(), appOrigin(), baasRoute(), badge() (+37 more)

### Community 21 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (36): removeProjectData, sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns(), designSignals (+28 more)

### Community 22 - "Project"
Cohesion: 0.11
Nodes (5): Project, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 23 - "deps.ts"
Cohesion: 0.11
Nodes (29): createDependencyResolution(), BUILTIN_PACKAGES, Deps, isValidPackageName(), MANIFEST, packageInfo, readDeps(), RegistryPackage (+21 more)

### Community 24 - "vitest"
Cohesion: 0.09
Nodes (25): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, ROOT_DIR, migrate(), MIGRATIONS_DIR, children (+17 more)

### Community 25 - "server/index.ts"
Cohesion: 0.08
Nodes (55): lucide-react@^1.66.0, lucide-react, radix-ui, react, api, modelBlockers(), ModelReadiness, playgroundModel() (+47 more)

### Community 26 - "components.test.ts"
Cohesion: 0.11
Nodes (14): { KIT_BUILTIN }, contractRoutes(), componentStandards(), FileMap, importTarget(), isClientSource(), isHelperSource(), isListSelect() (+6 more)

### Community 27 - "modules/builder/index.ts"
Cohesion: 0.11
Nodes (11): CheckAccessUseCase, ProjectIdentity, ProjectTarget, PersonalOrganizationUseCase, Access, MemberAccess, Organization, OrganizationProps (+3 more)

### Community 28 - "appRuntimeHttp.ts"
Cohesion: 0.12
Nodes (11): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+3 more)

### Community 29 - "urls.ts"
Cohesion: 0.16
Nodes (14): SharePorts, createShareAccess(), reservedSlug(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope (+6 more)

### Community 30 - "models.ts"
Cohesion: 0.08
Nodes (33): createCatalogService(), deleteModel(), importProviderModels(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), ClassificationPorts (+25 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.09
Nodes (59): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+51 more)

### Community 32 - "application/problems.ts"
Cohesion: 0.08
Nodes (22): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, createProblemService(), changed(), clearProblems() (+14 more)

### Community 33 - "infrastructure/routing.ts"
Cohesion: 0.08
Nodes (39): anthropicChat(), createModelRouter(), analyzeRequest(), Block, LlmMessage, LlmRequest, LlmResponse, LlmTool (+31 more)

### Community 34 - "OrgRole"
Cohesion: 0.13
Nodes (7): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, IOrganizationRepository

### Community 35 - "projectIndex.ts"
Cohesion: 0.09
Nodes (34): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, SERVICES_MANIFEST, clientReachable(), contextOfHelper(), ContextPlan, extractComponent(), ExtractOptions, formatMigrationPlan() (+26 more)

### Community 36 - "model-management/index.ts"
Cohesion: 0.11
Nodes (24): Catalog, createModelManagementQueries(), updateProjectModels(), isMode(), audit(), bindModelAudit(), bindCatalogService(), bindCatalogSync() (+16 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "model-management/providers.ts"
Cohesion: 0.15
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), ProviderError (+8 more)

### Community 39 - "Workspace.tsx"
Cohesion: 0.05
Nodes (59): ProjectEvent, ProjectLogLine, api, projectsController, transport, CreateProjectOptions, createProjectUseCases(), isProjectLogLine() (+51 more)

### Community 40 - "composition.ts"
Cohesion: 0.15
Nodes (24): startAppRuntimeEventRelay(), createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), initializeAppServices, bindEvaluationBuilder() (+16 more)

### Community 41 - "ProjectSandbox"
Cohesion: 0.16
Nodes (4): makeRoomForSandbox(), ProjectSandbox, SandboxRunError, ServicePool

### Community 42 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 43 - "projectLayout.ts"
Cohesion: 0.05
Nodes (59): APP_COMPONENT, ComponentConventions, ComponentKind, componentOf(), ComponentPaths, DEFAULT_CONVENTIONS, DEFAULT_PATHS, EndpointConvention (+51 more)

### Community 44 - "springRuntime.ts"
Cohesion: 0.05
Nodes (46): APP_DIR, buildCommand(), CACHE_DIR, clip(), detectSpringProject(), isSpringSource(), jarDirectory(), jvmCommand() (+38 more)

### Community 45 - "admission.ts"
Cohesion: 0.07
Nodes (22): ActiveRun, admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun() (+14 more)

### Community 46 - "application/context.ts"
Cohesion: 0.10
Nodes (11): Run, AppUser, createProjectCache(), createContext(), serviceContext(), EndpointContext, enqueue(), HttpError (+3 more)

### Community 47 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 48 - "roles.ts"
Cohesion: 0.05
Nodes (43): PLAN_DOC, PLAN_SECTIONS, BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST (+35 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (38): dependencies, @anthropic-ai/sdk@^1.3.0, better-auth@^1.7.26, clsx@^2.1.1, croner@^11.0.0, @electric-sql/pglite@^0.5.13, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+30 more)

### Community 50 - "createProjectsModule"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "AppEnv"
Cohesion: 0.11
Nodes (6): ClaimedJob, AppEnv, ProjectDbClient, JobsApi, JobPorts, ProjectRowsPort

### Community 52 - "http.test.ts"
Cohesion: 0.05
Nodes (58): ADMIN_MCP_INSTRUCTIONS, AdminMcpModules, createAdminMcpHandler(), accountExists(), execute(), existingModelIds(), nonSecretKeys(), projectExists() (+50 more)

### Community 53 - "BuilderWorkflowPorts"
Cohesion: 0.07
Nodes (12): BuilderWorkflowUseCase, FastBuildUseCase, TeamBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath() (+4 more)

### Community 54 - "studioApi.ts"
Cohesion: 0.07
Nodes (40): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, analyticsSummary, createAppUser, updateAppUserPassword, listEmails (+32 more)

### Community 55 - "mcp/oauth.ts"
Cohesion: 0.09
Nodes (34): accountFromOAuthAccessToken(), authorizationHtml(), createMcpOAuthRouter(), digest(), escapeHtml(), issueTokens(), json(), noStore (+26 more)

### Community 56 - "server/index.ts"
Cohesion: 0.07
Nodes (16): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, Cache (+8 more)

### Community 57 - "q"
Cohesion: 0.06
Nodes (12): PostgresMemberRepository, PostgresOrganizationSkillsRepository, PostgresLoginCodeRepository, McpOAuthAuthorizationCode, McpOAuthClient, McpOAuthRefreshGrant, PostgresMcpOAuthRepository, PostgresPasswordResetRepository (+4 more)

### Community 58 - "modules/project-knowledge/index.ts"
Cohesion: 0.10
Nodes (18): createKnowledgeService(), KnowledgeEngine, KnowledgeFiles, prepareCorpus(), KnowledgeAnswer, KnowledgeEdge, KnowledgeGraph, KnowledgeNode (+10 more)

### Community 60 - "oauth.test.ts"
Cohesion: 0.21
Nodes (12): mayLinkByEmail(), oauthSecretNames(), parseOAuthConfig(), STUDIO_OAUTH_BASE, studioOAuth(), studioOAuthConfig(), oauthEngine, oauthSecret() (+4 more)

### Community 61 - "bundler.ts"
Cohesion: 0.09
Nodes (48): COMPONENTS_MANIFEST, dataRole(), layoutOf(), ProjectComponent, readLayout(), safeLayout(), esbuild@^0.28.2, esbuild (+40 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "services"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "mcp/server.ts"
Cohesion: 0.08
Nodes (35): BUILTIN_OAUTH_PROVIDERS, build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse() (+27 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.06
Nodes (6): Extraction, StandardMigration, FileMap, PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "appOAuth.ts"
Cohesion: 0.22
Nodes (13): safeOAuthConfig(), backWithError(), engineFor(), errorMessage(), ERRORS, escapeHtml(), json(), oauthRoute() (+5 more)

### Community 68 - "adminApi.ts"
Cohesion: 0.10
Nodes (31): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+23 more)

### Community 69 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 70 - "ExecutionMetrics"
Cohesion: 0.11
Nodes (10): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, StaticToolRegistryAdapter (+2 more)

### Community 71 - "client/index.ts"
Cohesion: 0.16
Nodes (14): AppUser, AuthProvider, SignInWithOptions, realtime, Contract, createApi(), RouteInput, RouteOutput (+6 more)

### Community 72 - "application/projectData.ts"
Cohesion: 0.27
Nodes (9): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+1 more)

### Community 73 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 74 - "ProjectDb"
Cohesion: 0.11
Nodes (11): AppDataPorts, createAppDataService(), TransactionSession, ProjectMigration, SqlExecutionResult, TransactionAction, projectRowsRepository, quoteIdent() (+3 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 77 - "createCollaborationModule"
Cohesion: 0.16
Nodes (6): ClaimInvitesUseCase, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), IOrganizationQueries, fixture()

### Community 78 - "ProjectServices"
Cohesion: 0.13
Nodes (5): CoreModulesDependencies, ProjectPatch, ProjectsModuleDependencies, ProjectServices, endpoint()

### Community 79 - "PostgresOrganizationRepository"
Cohesion: 0.09
Nodes (9): MemberQueries, PostgresOrganizationRepository, IMemberQueries, InviteView, IOrganizationNameDirectory, MemberView, Org, OrgMemberView (+1 more)

### Community 80 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 81 - "accountLifecycle.ts"
Cohesion: 0.09
Nodes (6): PostgresApiTokenRepository, AdminApiTokenInfo, ApiTokenInfo, ApiTokenPurpose, ApiTokenRepository, IdentityRandom

### Community 83 - "ref_node_url"
Cohesion: 0.07
Nodes (22): DATA, jar, ROOT, server, root, server, types, worker (+14 more)

### Community 84 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 85 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (8): PlatformCollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "bootstrap/server.ts"
Cohesion: 0.04
Nodes (62): @hono/node-server@^2.1.5, @hono/node-server, ApplicationLifecycle, LifecycleService, lifecycle, shutdown(), app, lifecycle (+54 more)

### Community 88 - "infrastructure/cache.ts"
Cohesion: 0.16
Nodes (5): CACHE_LIMITS, ProjectCache, createProjectCacheRepository(), PROJECT_CACHE_SCHEMA, CacheRepository

### Community 89 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 90 - "PostgresProjectsStore.ts"
Cohesion: 0.14
Nodes (7): BeforeImage, ProjectProps, ChangeEntry, PostgresProjectFileRepository, PATCHABLE, ProjectEventPort, LogChangeInput

### Community 91 - "shared/oauth.ts"
Cohesion: 0.15
Nodes (15): OAuthConfig, OAuthOptionValue, OAuthProviderSpec, asBool(), asString(), builtinOptions(), created, createEngine() (+7 more)

### Community 92 - "domain/contracts.ts"
Cohesion: 0.08
Nodes (19): AiBlock, AiContextMetrics, AiFusionTrace, AiUsage, AppAiInput, AppAiResult, AppUser, CheckoutInput (+11 more)

### Community 93 - "GithubError"
Cohesion: 0.17
Nodes (17): branchName(), createGithubAppService(), installation(), requireApp(), selectRepository(), GithubApp, Installation, pageNumber() (+9 more)

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (15): LoginWithOAuthUseCase, OAuthLogin, OAuthLoginResult, LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies (+7 more)

### Community 95 - "cli.ts"
Cohesion: 0.17
Nodes (13): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), DEV_FIXTURE, Fixture (+5 more)

### Community 96 - "Plan.ts"
Cohesion: 0.08
Nodes (29): NATIVE_LAYOUT, CheckPlanUseCase, ReviewAndFixUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, covers() (+21 more)

### Community 97 - "infrastructure/apps.ts"
Cohesion: 0.16
Nodes (13): AppCredentials, appJwt(), cache, credentials(), generations, githubAppStore, pending, tokenFor() (+5 more)

### Community 98 - "springRuntime.test.ts"
Cohesion: 0.16
Nodes (6): stopLanguageRuntimes(), DataBridgePorts, Env, readBody(), RuntimeDataBridge, TooLarge

### Community 99 - "En una app: `forja.auth.json`"
Cohesion: 0.20
Nodes (9): Con el agente o por MCP, Cómo encaja, En el código de la app, En el Studio, En una app: `forja.auth.json`, Inicio de sesión con redes sociales y OAuth (Better Auth), Límites, Rutas (`/_baas/`) (+1 more)

### Community 100 - "FinishGatePolicy.ts"
Cohesion: 0.14
Nodes (11): CreateFinishGateUseCase, BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey() (+3 more)

### Community 101 - "App.tsx"
Cohesion: 0.07
Nodes (43): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallContext, InstallEvent (+35 more)

### Community 102 - "crypto.ts"
Cohesion: 0.09
Nodes (20): createCoreModules(), depsKey(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, PlatformMailerService, PostgresOAuthIdentityRepository, PostgresSessionRepository, createProjectKnowledgeModule() (+12 more)

### Community 103 - "RunTaskLaneUseCase.ts"
Cohesion: 0.08
Nodes (19): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, listTasks() (+11 more)

### Community 104 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (14): providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion(), PROBE_SYSTEM (+6 more)

### Community 105 - "server.mjs"
Cohesion: 0.11
Nodes (27): cache, cacheEntries, crons, db, enqueue(), env, handle(), here (+19 more)

### Community 106 - "AgentExecution.ts"
Cohesion: 0.07
Nodes (40): page(), GATE_FIXES, RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, BuilderContextMetrics (+32 more)

### Community 107 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "accountLifecycle.ts"
Cohesion: 0.33
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 110 - "domain/routing.ts"
Cohesion: 0.11
Nodes (26): AgentSpec, TurnState, KEYWORDS, RoleProfile, Posterior, FusionBudget, FusionStep, FusionTrace (+18 more)

### Community 111 - "app-services/realtime.ts"
Cohesion: 0.21
Nodes (5): DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket, publish, realtimeStats

### Community 112 - "fusion.ts"
Cohesion: 0.17
Nodes (15): routerAudit(), createRouterAdministration(), routerStats(), meanOf(), FUSION_BUDGETS, FusionEffort, FusionPattern, FusionPhase (+7 more)

### Community 113 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 114 - "BuilderToolsAdapter.ts"
Cohesion: 0.06
Nodes (31): isComponentMigrationPath(), requestSecret, assertDropTargets(), assertProjectObject(), assertSafeAgentSql(), assertSafePreviewSql(), containsDataChange(), containsDestructiveSchemaChange() (+23 more)

### Community 115 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (10): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+2 more)

### Community 116 - "model-management/router.ts"
Cohesion: 0.11
Nodes (23): analyzeHeuristic(), pick(), maxTokensFor(), ROLES, taskClassOf(), useFastPath(), createTurnFeedback(), penalizeTurn() (+15 more)

### Community 117 - "one"
Cohesion: 0.08
Nodes (10): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository (+2 more)

### Community 118 - "domain/securityScan.ts"
Cohesion: 0.17
Nodes (18): fileSide, nativeClient(), nativeServer(), FileMap, Finding, findSecret(), formatFinding(), isClient() (+10 more)

### Community 119 - "ProjectKnowledge.tsx"
Cohesion: 0.29
Nodes (8): buildGraphView(), GraphCard, GraphConnection, GraphEdge, GraphNode, GraphQuestion, ProjectGraph, ProjectKnowledge()

### Community 120 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 123 - "Plan de runtime multi-stack: FastAPI, Go y Spring Boot"
Cohesion: 0.10
Nodes (21): Adaptadores por stack, Aislamiento sin contenedores: condicion de publicacion, Arquitectura propuesta, Cache, artefactos y publicacion, Compatibilidad con BaaS y SDK, Contrato de proyecto y runtime, Decision inicial de datos, Despliegue gradual y rollback (+13 more)

### Community 124 - "Registro de implementación"
Cohesion: 0.12
Nodes (19): Constructor, Diagnóstico, Ejecución, Estado, Fase 6 — Exportar para producción, Garantías de no regresión, Idea central, Manifiesto `forja.json` (versión 1) (+11 more)

### Community 125 - "Evals.tsx"
Cohesion: 0.23
Nodes (11): api, evaluationsController, Agg, EvalCfg, Evals(), Metric(), money(), RunDetail (+3 more)

### Community 126 - "e2e.mjs"
Cohesion: 0.22
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 127 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, usage()

### Community 128 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 129 - "e2e-oauth.mjs"
Cohesion: 0.25
Nodes (6): call(), DATA, follow(), ROOT, server, studioProviders

### Community 130 - "ref_node_child_process"
Cohesion: 0.08
Nodes (20): cookie(), app, DATA, app, DATA, MODELS, req(), ROOT (+12 more)

### Community 133 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 134 - "ProjectsApplication.ts"
Cohesion: 0.13
Nodes (19): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, beforeImages(), restoredFiles(), turnFileChange(), Checkpoint (+11 more)

### Community 135 - "policies.test.ts"
Cohesion: 0.07
Nodes (26): visitorId, AiUnavailableError, createAi(), appAiChat(), createAnalytics(), analyticsSummary(), browserOf(), recordPageView() (+18 more)

### Community 138 - "Audit.tsx"
Cohesion: 0.32
Nodes (11): AuditReport, AuditStep, contextChange(), ContextMetrics, Audit(), ContextTrend(), count(), money() (+3 more)

### Community 139 - "recordOperationalEvent"
Cohesion: 0.39
Nodes (6): cleanupOperationalEvents(), OperationalEvent, readOperationalEvents(), recordOperationalEvent(), safeIdentifier(), q

### Community 140 - "starterFiles"
Cohesion: 0.22
Nodes (7): standardStarterFiles(), starterFiles(), starterFiles(), text(), legacy(), creation(), load()

### Community 141 - "integrations/github.ts"
Cohesion: 0.14
Nodes (13): apps, imports, legacy, linkRepo(), ports(), sync, gh(), githubAccountRepository (+5 more)

### Community 143 - "GithubGateway"
Cohesion: 0.13
Nodes (10): 2. Ajustes globales, Almacén, Registro, createJobQueue(), poll(), processJob(), pump(), start() (+2 more)

### Community 144 - "classification.test.ts"
Cohesion: 0.43
Nodes (6): createModelClassification(), answer(), model, prediction(), scope, setup()

### Community 145 - "integrations/index.ts"
Cohesion: 0.19
Nodes (21): api, integrationsController, GithubAccount, GithubRepository, GithubSelection, GithubCard, GithubCommitCard(), GithubSection() (+13 more)

### Community 146 - "postgres"
Cohesion: 0.24
Nodes (10): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+2 more)

### Community 147 - "healthcheck"
Cohesion: 0.53
Nodes (10): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+2 more)

### Community 148 - "migrate.mjs"
Cohesion: 0.27
Nodes (12): checksum(), client, ensureRole(), here, ident(), ledgerName(), ledgerSchema(), literal() (+4 more)

### Community 149 - "args"
Cohesion: 0.39
Nodes (9): build, BROWSER, JAVA, args, context, dockerfile, build, build (+1 more)

### Community 151 - "app-runtime"
Cohesion: 0.22
Nodes (9): command, environment, expose, labels, restart, security_opt, stop_grace_period, volumes (+1 more)

### Community 152 - "README.md"
Cohesion: 0.18
Nodes (7): Focused validation, Migration and limitations, One project: orders API and durable invoice worker, Run and scale, Studio service control center, Topology contract, What the example does

### Community 153 - "builder"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, builder

### Community 154 - "forja"
Cohesion: 0.25
Nodes (8): command, environment, expose, restart, security_opt, stop_grace_period, volumes, forja

### Community 155 - "Review Focus"
Cohesion: 0.25
Nodes (7): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 156 - "Memoria de los servicios"
Cohesion: 0.40
Nodes (5): Cómo consultarla, Dónde se va la memoria, Límites, Memoria de los servicios, ¿Reescribir algo en Go o Rust?

### Community 157 - "ServiceControlPanel.tsx"
Cohesion: 0.10
Nodes (21): react-dom@^19.3.1, react-dom, buildTree(), FileEntry, FileTree(), Folder, FolderContents(), serviceControlController (+13 more)

### Community 158 - "modules/projects/index.ts"
Cohesion: 0.10
Nodes (22): contentEtag(), FileConflictError, FileExpectation, resolveExpectation(), shortEtag(), Escritura y GitHub, DeleteFileUseCase, RenameFileUseCase (+14 more)

### Community 159 - "collaboration/ports/repositories.ts"
Cohesion: 0.10
Nodes (12): InviteMemberResult, InviteMemberUseCase, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, CollaborationModuleDependencies, PostgresCollaborationAccountRepository, CollaborationAccount (+4 more)

### Community 160 - "job-worker"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, job-worker

### Community 161 - "judgeRouting.test.ts"
Cohesion: 0.33
Nodes (5): billing, { callModel }, input, model, scope

### Community 162 - "Backends en otros lenguajes (Java / Spring Boot)"
Cohesion: 0.33
Nodes (6): Backends en otros lenguajes (Java / Spring Boot), Configuración, Cómo funciona, Imagen y despliegue, Seguridad, Siguientes lenguajes

### Community 167 - "GitHub integration"
Cohesion: 0.50
Nodes (3): GitHub integration, HTTP API, Native imports and synchronization

### Community 169 - "Fases"
Cohesion: 0.22
Nodes (9): Fase 0 — Layout como fuente de verdad (sin cambio de comportamiento), Fase 1 — Manifiesto y estructura libre, Fase 3 — Constructor y estándares por componente, Fase 4 — Base de datos por servicio, Fase 4 — Datos por servicio, Fase 5 — Otros stacks por componente, Fase 6 — Salida fuera de Forja, Fases (+1 more)

### Community 177 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 179 - "modules/integrations/application/github.ts"
Cohesion: 0.13
Nodes (13): createGithubAccountService(), connectAccount(), GithubAccountRepository, COMPONENTS_MANIFEST, Link, SyncResult, createGithubImportService(), findCredential() (+5 more)

### Community 181 - "modules/builder/index.ts"
Cohesion: 0.09
Nodes (32): AgentResult, calculateSpendUseCase, toolRegistry, runAgent(), bindBuilderCoreModules(), readFile(), estTokens(), GATE_THRESHOLD (+24 more)

### Community 184 - "createJobs"
Cohesion: 0.16
Nodes (19): createJobs(), addTimer(), enqueueJob(), executeJob(), fireDueTimers(), initializeAppServices(), report(), runJob() (+11 more)

### Community 191 - "domain/services.ts"
Cohesion: 0.19
Nodes (22): isPathPattern(), matchesPathPattern(), Fase 2 — Ejecución de componentes, createServiceControl(), restart(), scale(), snapshot(), endpointRoutes() (+14 more)

### Community 194 - "app-services/auth.ts"
Cohesion: 0.10
Nodes (33): createAuth(), confirmPasswordReset(), createAppUser(), createSession(), createTestUser(), ensureOwnerAdmin(), ensureProjectOwner(), requestPasswordReset() (+25 more)

### Community 200 - "scripts"
Cohesion: 0.08
Nodes (24): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+16 more)

### Community 202 - "createIdentityModule"
Cohesion: 0.11
Nodes (5): AdminApiTokenError, IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 210 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 212 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 237 - "Panel de administración del sistema — diseño"
Cohesion: 0.10
Nodes (21): 10. Documentación, 1. Capa de datos, 3. Proveedores y modelos, 4. Playground de agentes, 5. Enrutador, 6. API de administración, 7. Studio, 8. Errores y seguridad (+13 more)

### Community 248 - "client.ts"
Cohesion: 0.20
Nodes (12): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), createStorage() (+4 more)

### Community 319 - "ISettingsStore"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 346 - "Plan de escalado a microservicios"
Cohesion: 0.11
Nodes (18): Arquitectura objetivo inicial, Cache y estado distribuido, Decisiones propuestas, Estado actual verificado, Eventos, colas y transacciones, Fase 0. Medir y fijar contratos, Fase 1. Infraestructura distribuida dentro del monolito, Fase 2. Extraer runner y workloads pesados (+10 more)

### Community 359 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 416 - "settings/index.ts"
Cohesion: 0.20
Nodes (16): PlatformSettingType, SettingGroup, MOVED_ENV, warnMovedEnv(), createPlatformSettings(), byKey, Def, defs (+8 more)

## Knowledge Gaps
- **20 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1603 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `FileMap`, `Chat.tsx`, `app-services/context.ts`, `ref_node_path`, `domain/score.ts`, `projects/application/usecases.ts`, `infrastructure/projectDb.ts`, `database/index.ts`, `infrastructure/playground.ts`, `ProjectDb`, `config.ts`, `model-management/catalog.ts`, `app-runtime/index.ts`, `appServer.ts`, `deps.ts`, `server/index.ts`, `components.test.ts`, `modules/builder/index.ts`, `models.ts`, `application/problems.ts`, `infrastructure/routing.ts`, `OrgRole`, `projectIndex.ts`, `model-management/index.ts`, `model-management/providers.ts`, `Workspace.tsx`, `composition.ts`, `project-observability/security.ts`, `projectLayout.ts`, `admission.ts`, `roles.ts`, `package.json`, `createProjectsModule`, `http.test.ts`, `BuilderWorkflowPorts`, `mcp/oauth.ts`, `server/index.ts`, `modules/project-knowledge/index.ts`, `oauth.test.ts`, `bundler.ts`, `mcp/server.ts`, `adminApi.ts`, `ExecutionMetrics`, `ProjectDb`, `builderService.ts`, `createCollaborationModule`, `devDependencies`, `ref_node_url`, `collaboration/postgresAdapters.test.ts`, `Changes.tsx`, `bootstrap/server.ts`, `infrastructure/cache.ts`, `createGithubSyncService`, `GithubError`, `modules/identity/index.ts`, `Plan.ts`, `infrastructure/apps.ts`, `springRuntime.test.ts`, `FinishGatePolicy.ts`, `crypto.ts`, `RunTaskLaneUseCase.ts`, `infrastructure/probe.ts`, `AgentExecution.ts`, `OrganizationSkillsService.ts`, `fusion.ts`, `BuilderToolsAdapter.ts`, `mcp/jobs.ts`, `model-management/router.ts`, `ref_node_child_process`, `BuilderRunRegistry`, `evaluations/bindings.test.ts`, `ProjectsApplication.ts`, `policies.test.ts`, `Audit.tsx`, `recordOperationalEvent`, `starterFiles`, `integrations/github.ts`, `classification.test.ts`, `ApiError`, `ServiceControlPanel.tsx`, `modules/projects/index.ts`, `collaboration/ports/repositories.ts`, `judgeRouting.test.ts`, `securityScan.test.ts`, `apiTypes.test.ts`, `architecture.test.ts`, `modules/integrations/application/github.ts`, `modules/builder/index.ts`, `domain/services.ts`, `createIdentityModule`, `usage/usage.ts`, `IntegrationRepository`, `ISettingsStore`, `PlatformSettingsService`?**
  _High betweenness centrality (0.272) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BuilderTurnAdapter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05759493670886076 - nodes in this community are weakly interconnected._
- **Why does `react` connect `server/index.ts` to `format.ts`, `index.tsx`, `Chat.tsx`, `App.tsx`, `client/index.ts`, `projects/application/usecases.ts`, `internal/router.ts`, `Audit.tsx`, `Workspace.tsx`, `package.json`, `integrations/index.ts`, `Changes.tsx`, `ProjectKnowledge.tsx`, `ServiceControlPanel.tsx`, `Evals.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createStudioApi()` (e.g. with `readServiceRuntime()` and `restartServiceRuntime()`) actually correct?**
  _`createStudioApi()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1425287356321839 - nodes in this community are weakly interconnected._