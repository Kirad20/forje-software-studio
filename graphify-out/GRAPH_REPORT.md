# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 604 files · ~255,669 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4111 nodes · 10536 edges · 165 communities (140 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76ecaeb6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- q
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- crypto.ts
- composition.ts
- appServer.ts
- http-client.ts
- project-observability/security.ts
- ModelRouter.ts
- with
- model-management/index.ts
- app-services/jobs.ts
- evaluations/bindings.test.ts
- one
- BuilderTurnAdapter.ts
- memory/application/service.ts
- vitest
- createCollaborationModule
- admission.ts
- roles.ts
- bundler.ts
- PostgresProviderRepository.ts
- appRuntimeServer.ts
- createProjectRows
- administration/presentation/Models.tsx
- project-observability/events.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- transports/mcp.test.ts
- executeRun
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- ContextPorts
- model-management/router.test.ts
- RunAgentUseCase.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- guides.ts
- ProjectDb
- projectIndex.ts
- server/index.ts
- cli.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- modules/builder/index.ts
- PostgresProjectsStore
- createJobs
- app-runtime/index.ts
- infrastructure/playground.ts
- client.ts
- Workspace.tsx
- integrations/github.ts
- IOrganizationRepository
- policies.test.ts
- services
- createGithubSyncService
- appRuntimeServer.ts
- model-management/catalog.ts
- models/presentation/Models.tsx
- collaboration/postgresAdapters.test.ts
- ILoginCodeRepository
- TEST_DATABASE_URL
- Memory.tsx
- config.ts
- domain/score.ts
- Changes.tsx
- policies.test.ts
- studio.mjs
- createSecrets
- skills.test.ts
- GithubAuthorization
- builderService.ts
- BootstrapService
- PostgresAccountRepository
- Inventario de interfaz de Floot → Forja
- ProjectsApplication.ts
- execution.test.ts
- builderServer.ts
- PostgresPlatformSettingsStoreAdapter
- Desplegar Forja en Coolify
- react
- usage/usage.ts
- mcp/jobs.ts
- app-services/email.ts
- agentCompact.test.ts
- AgentExecutionResult
- urls.ts
- OrganizationSkillsService.ts
- Review Focus
- model-management/providers.ts
- BuilderWorkflowPorts
- ports.ts
- sandbox.ts
- 1. Capa de datos
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- IntegrationRepository
- { api, auth, storage, ai }
- ISettingsStore
- infrastructure/repositories.ts
- postgres
- healthcheck
- ILoginCodeRepository
- app-runtime
- ProjectSandbox
- build
- domain/securityScan.ts
- PlatformSettingsService
- PostgresApiTokenRepository
- builder
- metrics.test.ts
- BuilderToolsAdapter.ts
- forja
- ApplicationLifecycle
- audit.ts
- bootstrap/server.ts
- exports.test.tsx
- createHttp
- collaboration/ports/repositories.ts
- Cómo está hecho
- forms.tsx
- BuilderRunRegistry
- createAuth
- FileMap
- architecture.test.ts
- FinishGateAdapter.ts
- settings/index.ts
- GithubGateway
- application/context.ts
- { getSecurity, saveScan, startDeepScan, setIgnored }
- { BuildError, buildClient, buildExamples, checkProject, compileServerModule, endpointRoutes, pageRoutes, exampleFiles, jobFiles, readJobSettings, formatProblem }
- { BUILTIN_PACKAGES, MANIFEST, readDeps, writeDeps, isValidPackageName, packageName, isNodeBuiltin, depsDir, ensureDeps, resolvePackage, withManifestLock }
- { KIT_BUILTIN, KIT_CATALOG, kitSummary }
- { publishProject, unpublishProject }
- { quickScan, findSecret, formatFinding }
- { runBrowserTest, inspectPreview, allowedRequest, closeBrowser }
- { SandboxRunError, runInSandbox, stopSandbox, stopAllSandboxes }
- { serveApp, parseCookies, cookie }
- { SHARE_COOKIE, RESERVED_SLUG, shareToken, checkShareToken, previewOrigin, previewUrl, appUrl, parseAppHost }
- { typecheckProject, parseDiagnostics, verifyBuild }
- { syncProject, holdSync, releaseSync, watchLinked, startGithubSync, stopGithubSync, reschedulePoll }

## God Nodes (most connected - your core abstractions)
1. `vitest` - 129 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 69 edges
4. `createIdentityModule()` - 42 edges
5. `react` - 40 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 38 edges
10. `PostgresProjectsStore` - 35 edges

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

## Communities (165 total, 25 thin omitted)

### Community 0 - "q"
Cohesion: 0.07
Nodes (7): PostgresMemberRepository, PostgresOrganizationRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, q()

### Community 1 - "index.tsx"
Cohesion: 0.17
Nodes (16): sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card(), EmptyState() (+8 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.13
Nodes (35): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+27 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (71): react, ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane (+63 more)

### Community 4 - "crypto.ts"
Cohesion: 0.19
Nodes (16): createCoreModules(), BcryptArgonPasswordHasher, config, burnPasswordCheck(), hashPassword(), LEGACY, newId(), newToken() (+8 more)

### Community 5 - "composition.ts"
Cohesion: 0.12
Nodes (26): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+18 more)

### Community 6 - "appServer.ts"
Cohesion: 0.07
Nodes (48): analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache, cookie() (+40 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (29): api, billingController, Meter(), Plan(), Usage, api, collaborationController, createEvaluationUseCases() (+21 more)

### Community 8 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 9 - "ModelRouter.ts"
Cohesion: 0.10
Nodes (38): AgentSpec, TurnState, anthropicChat(), KEYWORDS, LAMBDA, RoleProfile, Block, Effort (+30 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "model-management/index.ts"
Cohesion: 0.12
Nodes (21): Catalog, createModelManagementQueries(), routerAudit(), updateProjectModels(), bindModelAudit(), bindCatalogService(), bindCatalogSync(), meanOf() (+13 more)

### Community 12 - "app-services/jobs.ts"
Cohesion: 0.07
Nodes (14): jobPorts, log(), secretPorts, addTimer, isJobRunnerStarted, AiModel, AiPorts, EmailPorts (+6 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "one"
Cohesion: 0.08
Nodes (8): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, one(), Tx

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.07
Nodes (59): describeSchema, CreateFinishGateUseCase, rewardOf(), criteriaOf(), planOverview(), formatStandard(), BuilderTool, toolByName (+51 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "vitest"
Cohesion: 0.09
Nodes (22): pg, vitest, createTestCoreModules(), freshDatabase(), TEST_DATABASE_URL, dataDir, dir, monolith (+14 more)

### Community 18 - "createCollaborationModule"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 19 - "admission.ts"
Cohesion: 0.08
Nodes (18): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+10 more)

### Community 20 - "roles.ts"
Cohesion: 0.07
Nodes (34): assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), assertOwnerRequestedForget(), assertOwnerSourcedMemory(), normalized(), assertOwnerRequestedAuthSetup() (+26 more)

### Community 21 - "bundler.ts"
Cohesion: 0.11
Nodes (30): createProjectCheck(), ProjectCompilerPort, Deps, packageName(), BuildProblem, FileMap, EndpointInfo, endpointRoutes() (+22 more)

### Community 22 - "PostgresProviderRepository.ts"
Cohesion: 0.14
Nodes (16): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), missingProvider(), OPENROUTER_URL (+8 more)

### Community 23 - "appRuntimeServer.ts"
Cohesion: 0.28
Nodes (15): cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake(), metricsFor() (+7 more)

### Community 24 - "createProjectRows"
Cohesion: 0.15
Nodes (10): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+2 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.07
Nodes (48): administrationController, api, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel(), RunView (+40 more)

### Community 26 - "project-observability/events.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.08
Nodes (19): CreateCheckpointUseCase, DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, Checkpoint, CheckpointProps, ProjectPath (+11 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.18
Nodes (12): 10. Documentación, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Decisiones tomadas con el usuario, Fuera de alcance, Objetivo (+4 more)

### Community 30 - "agents.mjs"
Cohesion: 0.12
Nodes (15): app, DATA, app, DATA, MODELS, ROOT, SEED, MODELS (+7 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (46): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+38 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (49): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+41 more)

### Community 34 - "Plan.ts"
Cohesion: 0.08
Nodes (28): CheckPlanUseCase, ReviewAndFixUseCase, TeamBuildUseCase, Review, reviewFixTasks(), checkContract(), CONTRACT_FILE, covers() (+20 more)

### Community 35 - "transports/mcp.test.ts"
Cohesion: 0.11
Nodes (18): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+10 more)

### Community 36 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (14): createCatalogService(), deleteModel(), saveModel(), creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges, ModelError (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (22): ProjectEvent, ProjectLogLine, projectsController, transport, isProjectLogLine(), isProjectProblem(), isRecord(), parseProjectEvent() (+14 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 41 - "model-management/router.ts"
Cohesion: 0.15
Nodes (16): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, ModelRouterPorts, TurnFeedbackPorts (+8 more)

### Community 42 - "client/index.ts"
Cohesion: 0.20
Nodes (12): AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec (+4 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "ContextPorts"
Cohesion: 0.07
Nodes (15): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, AppAiResult, AppUser, CheckoutInput (+7 more)

### Community 45 - "model-management/router.test.ts"
Cohesion: 0.10
Nodes (21): analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), useFastPath(), posteriors, gamma() (+13 more)

### Community 46 - "RunAgentUseCase.ts"
Cohesion: 0.08
Nodes (32): page(), RunAgentUseCase, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext (+24 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (15): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+7 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, clsx@^2.1.1, croner@^11.0.0, esbuild@^0.28.2, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.08
Nodes (5): isDevFile(), ProjectsApplication, ProjectSnapshot, createProjectsModule(), ProjectsStore

### Community 51 - "Project"
Cohesion: 0.09
Nodes (9): CreateProjectInput, CreateProjectUseCase, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository (+1 more)

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "guides.ts"
Cohesion: 0.20
Nodes (13): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+5 more)

### Community 54 - "ProjectDb"
Cohesion: 0.08
Nodes (12): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, AppDataPorts, createAppDataService(), TransactionSession, ProjectDbClient, SqlExecutionResult, TransactionAction (+4 more)

### Community 55 - "projectIndex.ts"
Cohesion: 0.11
Nodes (19): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+11 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "cli.ts"
Cohesion: 0.19
Nodes (12): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), createLocalSeed(), readSeedFile() (+4 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (6): IdentityAccountsService, COMMON_PASSWORDS, Password, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (37): createBuildVerification(), createDependencyResolution(), PackageRegistryPort, BuildPorts, KIT_BUILTIN, KIT_CATALOG, kitSummary(), BUILTIN_PACKAGES (+29 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "modules/builder/index.ts"
Cohesion: 0.10
Nodes (27): runAgent(), cleanText(), extractMemories(), updateSummary(), estTokens(), GATE_THRESHOLD, metricsReport, newRunId() (+19 more)

### Community 66 - "PostgresProjectsStore"
Cohesion: 0.07
Nodes (3): PostgresProjectsStore, ProjectOrganizations, QueryHandle

### Community 67 - "createJobs"
Cohesion: 0.10
Nodes (23): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+15 more)

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.05
Nodes (39): RuntimeProjectsPort, KitEntry, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, loadFiles() (+31 more)

### Community 69 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (28): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+20 more)

### Community 70 - "client.ts"
Cohesion: 0.27
Nodes (9): createClient(), ChatMessage, createAi(), createApiWorkflow(), createAuth(), createRealtime(), createStorage(), StoredFile (+1 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.09
Nodes (43): EMPTY, OrgSkill, OrgSkillsSection(), View, api, Dashboard(), DeleteDialog(), IDEAS (+35 more)

### Community 72 - "integrations/github.ts"
Cohesion: 0.05
Nodes (28): createGithubAccountService(), connectAccount(), GithubAccountRepository, GithubError, GithubProjectPorts, GithubRepository, Link, SyncResult (+20 more)

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "policies.test.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.27
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 77 - "appRuntimeServer.ts"
Cohesion: 0.10
Nodes (18): hono@^4.13.14, hono, AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest() (+10 more)

### Community 78 - "model-management/catalog.ts"
Cohesion: 0.15
Nodes (20): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels(), allowedModels(), availableModels() (+12 more)

### Community 79 - "models/presentation/Models.tsx"
Cohesion: 0.25
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 80 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 81 - "ILoginCodeRepository"
Cohesion: 0.10
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, PlatformRole, Email (+4 more)

### Community 83 - "Memory.tsx"
Cohesion: 0.21
Nodes (11): api, memoryController, Kind, kindOf(), KINDS, Memory, MemoryList(), MemorySection() (+3 more)

### Community 84 - "config.ts"
Cohesion: 0.13
Nodes (13): DEV_FIXTURE, Fixture, DEFAULT_MODELS_ALLOW, env, paths, ROOT_DIR, MIGRATIONS_DIR, here (+5 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (32): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+24 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "policies.test.ts"
Cohesion: 0.08
Nodes (22): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail(), sendPlatformEmail() (+14 more)

### Community 88 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 89 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 90 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 92 - "builderService.ts"
Cohesion: 0.05
Nodes (27): CalculateSpendUseCase, GATE_FIXES, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps (+19 more)

### Community 93 - "BootstrapService"
Cohesion: 0.14
Nodes (7): BootstrapService, SetupError, NodeBootstrapCrypto, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 95 - "Inventario de interfaz de Floot → Forja"
Cohesion: 0.25
Nodes (5): Barra lateral del panel, Inventario de interfaz de Floot → Forja, Panel de proyectos, Services (tres columnas: servicios · lista · detalle; los usados primero, el resto atenuado), Vista de proyecto

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.17
Nodes (13): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+5 more)

### Community 97 - "execution.test.ts"
Cohesion: 0.29
Nodes (4): ScheduleTasksUseCase, fixture(), model, usage

### Community 98 - "builderServer.ts"
Cohesion: 0.11
Nodes (22): @hono/node-server@^2.1.5, @hono/node-server, startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay() (+14 more)

### Community 100 - "Desplegar Forja en Coolify"
Cohesion: 0.20
Nodes (10): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+2 more)

### Community 101 - "react"
Cohesion: 0.10
Nodes (32): App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners, usePath() (+24 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 104 - "app-services/email.ts"
Cohesion: 0.43
Nodes (4): sendPlatformEmail, emailPorts, resetTransport(), stopEmailTransport

### Community 105 - "agentCompact.test.ts"
Cohesion: 0.33
Nodes (4): LlmMessage, calls, model, usage

### Community 106 - "AgentExecutionResult"
Cohesion: 0.08
Nodes (18): ListAgentTasksUseCase, RunTaskLaneUseCase, TaskLifecycleUseCase, AgentEvent, AgentExecutionResult, requiresFinishGate(), SqlAgentTaskRepository, AgentTaskQueries (+10 more)

### Community 107 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "Review Focus"
Cohesion: 0.12
Nodes (15): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración (+7 more)

### Community 110 - "model-management/providers.ts"
Cohesion: 0.13
Nodes (29): 6. API de administración, providerOf(), providers(), createCatalogSync(), lastSync(), startCatalogSync(), syncOpenRouter(), tierFor() (+21 more)

### Community 111 - "BuilderWorkflowPorts"
Cohesion: 0.08
Nodes (10): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), BuilderWorkflowPorts (+2 more)

### Community 112 - "ports.ts"
Cohesion: 0.12
Nodes (12): PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author, formatProblem(), PublicationFinding (+4 more)

### Community 113 - "sandbox.ts"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "1. Capa de datos"
Cohesion: 0.33
Nodes (6): 1. Capa de datos, Conexión, `.env` resultante, Infraestructura, Migraciones, Seeders

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "IntegrationRepository"
Cohesion: 0.16
Nodes (7): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType, integrationRepository

### Community 122 - "ISettingsStore"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 124 - "infrastructure/repositories.ts"
Cohesion: 0.26
Nodes (7): authRepository(), createQueryRepository(), platformRepository, schemaRows(), statement(), statements, DatabasePorts

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "ILoginCodeRepository"
Cohesion: 0.10
Nodes (6): IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, ILoginCodeRepository, IMailerService, IPasswordHasher

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.20
Nodes (8): Task 2: Registro y almacén de ajustes, PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "PostgresApiTokenRepository"
Cohesion: 0.10
Nodes (4): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository, IdentityRandom

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 138 - "metrics.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (19): requestSecret, B, I, N, out(), S, typed(), createProblemService() (+11 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 142 - "audit.ts"
Cohesion: 0.29
Nodes (6): audit(), columns, postgresCatalogRepository, Row, postgresModelAudit(), ModelAudit

### Community 146 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (29): withDefaultHeaders(), app, handleMcp, listening(), monolith, reactions, resolveApp(), runtimeAccessPorts (+21 more)

### Community 149 - "createHttp"
Cohesion: 0.25
Nodes (4): { apiUrl }, ApiError, createHttp(), HttpTransport

### Community 150 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

### Community 153 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 161 - "FileMap"
Cohesion: 0.13
Nodes (3): CoreModulesDependencies, FileMap, ProjectServices

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.11
Nodes (16): BuildProblem, isSafeProjectPath(), newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+8 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.17
Nodes (19): encryptHeaders(), PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 313 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 344 - "application/context.ts"
Cohesion: 0.09
Nodes (15): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext (+7 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `crypto.ts`, `composition.ts`, `PlatformSettingsService`, `http-client.ts`, `project-observability/security.ts`, `metrics.test.ts`, `BuilderToolsAdapter.ts`, `app-services/jobs.ts`, `ApplicationLifecycle`, `evaluations/bindings.test.ts`, `BuilderTurnAdapter.ts`, `memory/application/service.ts`, `model-management/index.ts`, `bootstrap/server.ts`, `createCollaborationModule`, `roles.ts`, `admission.ts`, `collaboration/ports/repositories.ts`, `PostgresProviderRepository.ts`, `createHttp`, `exports.test.tsx`, `project-observability/events.ts`, `BuilderRunRegistry`, `modules/collaboration/index.ts`, `modules/projects/index.ts`, `Plan.ts`, `transports/mcp.test.ts`, `models.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `model-management/router.test.ts`, `RunAgentUseCase.ts`, `package.json`, `architecture.test.ts`, `Project`, `guides.ts`, `ProjectDb`, `projectIndex.ts`, `createIdentityModule`, `deps.ts`, `modules/builder/index.ts`, `app-runtime/index.ts`, `integrations/github.ts`, `IOrganizationRepository`, `collaboration/postgresAdapters.test.ts`, `ILoginCodeRepository`, `config.ts`, `domain/score.ts`, `Changes.tsx`, `policies.test.ts`, `application/context.ts`, `skills.test.ts`, `builderService.ts`, `BootstrapService`, `execution.test.ts`, `builderServer.ts`, `ISettingsStore`, `mcp/jobs.ts`, `usage/usage.ts`, `agentCompact.test.ts`, `AgentExecutionResult`, `OrganizationSkillsService.ts`, `model-management/providers.ts`, `BuilderWorkflowPorts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `IntegrationRepository`, `FinishGateAdapter.ts`, `infrastructure/repositories.ts`?**
  _High betweenness centrality (0.269) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `q` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Chat.tsx` to `index.tsx`, `react`, `http-client.ts`, `Workspace.tsx`, `client/index.ts`, `models/presentation/Models.tsx`, `internal/router.ts`, `package.json`, `Memory.tsx`, `exports.test.tsx`, `Changes.tsx`, `administration/presentation/Models.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12513842746400886 - nodes in this community are weakly interconnected._