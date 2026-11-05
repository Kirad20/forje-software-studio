# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 616 files · ~268,379 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .css 4, .example 1)

## Summary
- 4165 nodes · 10706 edges · 190 communities (153 shown, 37 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 580 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4eb535be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- model-management/providers.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- roles.ts
- ModelRouter.ts
- appServer.ts
- http-client.ts
- Dashboard.tsx
- bootstrap/server.ts
- with
- ContextPorts
- composition.ts
- evaluations/bindings.test.ts
- project-observability/security.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ExecutionMetrics
- database/index.ts
- model-management/catalog.ts
- projectIndex.ts
- bundler.ts
- Account
- domain/messages.ts
- ApplicationLifecycle
- administration/presentation/Models.tsx
- project-observability/problems.ts
- modules/collaboration/index.ts
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- agents.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- BuilderWorkflow.ts
- urls.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- vitest
- createProblemService
- infrastructure/playground.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- skills.test.ts
- domain/securityScan.ts
- BuilderToolsAdapter.ts
- server/index.ts
- AgentExecution.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- Desplegar Forja en Coolify
- PostgresProjectsStore
- createJobs
- tracing.ts
- Workspace.tsx
- client.ts
- deps.test.ts
- IntegrationRepository
- IOrganizationRepository
- OrchestrationPolicy.ts
- services
- createGithubSyncService
- collaboration/postgresAdapters.test.ts
- app-runtime/index.ts
- one
- sandbox.ts
- ProjectDb
- TEST_DATABASE_URL
- ModelRouter.ts
- ref_node_path
- domain/score.ts
- Changes.tsx
- model-management/index.ts
- replaceVisibleText
- RunAgentUseCase.ts
- BuilderWorkflowPorts
- executeRun
- builderService.ts
- BootstrapService
- mcp/jobs.ts
- createSecrets
- ProjectsApplication.ts
- infrastructure/auth.ts
- Review Focus
- app-services/payments.ts
- Plan
- react
- usage/usage.ts
- modules/identity/index.ts
- PostgresApiTokenRepository
- integrations/index.ts
- AgentExecutionResult
- app-services/projectDb.ts
- OrganizationSkillsService.ts
- guides.ts
- platformDb
- AccountLifecycleRepository
- ports.ts
- e2e.mjs
- securityReview.ts
- devDependencies
- github.mjs
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- settingReactions.ts
- { api, auth, storage, ai }
- ISettingsStore
- format.ts
- ProjectServices
- transports/mcp.test.ts
- PostgresPlatformSettingsStoreAdapter
- postgres
- healthcheck
- models/presentation/Models.tsx
- app-runtime
- studio.mjs
- build
- app-services/context.ts
- PlatformSettingsService
- apiTypes.test.ts
- builder
- GithubGateway
- admission.ts
- model-management/router.test.ts
- forja
- FinishGateAdapter.ts
- execution.test.ts
- ports/jobs.ts
- GithubAccountRepository
- Cómo está hecho
- IdentityRandom
- integrations/github.ts
- q
- ApiError
- exports.test.tsx
- spring.ts
- AgentExecutionSpec
- accounts.ts
- forms.tsx
- AgentExecutionPorts
- app-services/ai.ts
- createAuth
- app-services/realtime.ts
- GithubAuthorization
- Checkpoint
- SqlAgentTaskRepository.ts
- GithubProjectPorts
- createCollaborationModule
- PostgresOrganizationRepository
- FastBuildPorts
- GithubRepository
- policies.test.ts
- ProjectPath
- cli.ts
- builderServer.ts
- RunTaskLaneUseCase
- runtimeClient.ts
- JobCron
- architecture.test.ts
- settings/index.ts
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
1. `vitest` - 131 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 69 edges
4. `react` - 45 edges
5. `createIdentityModule()` - 42 edges
6. `ProjectsStore` - 40 edges
7. `one()` - 40 edges
8. `createProjectsModule()` - 39 edges
9. `PostgresProjectsStore` - 35 edges
10. `ProjectView()` - 35 edges

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

## Communities (190 total, 37 thin omitted)

### Community 0 - "model-management/providers.ts"
Cohesion: 0.08
Nodes (35): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+27 more)

### Community 1 - "index.tsx"
Cohesion: 0.16
Nodes (17): clsx@^2.1.1, sonner@^2.0.8, clsx, sonner, Button, ButtonProps, Badge(), Card() (+9 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.11
Nodes (38): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+30 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.06
Nodes (54): ChatStreamEvent, api, builderController, streamGet, streamPost, Lane, TeamTurn, Block (+46 more)

### Community 4 - "roles.ts"
Cohesion: 0.08
Nodes (23): BUILDER_SYSTEM_PROMPT, AgentToolRole, allowedToolsForRole(), assertRoleToolAccess(), BACKEND, CHECKLIST, CONTRACT, DATA (+15 more)

### Community 5 - "ModelRouter.ts"
Cohesion: 0.14
Nodes (24): AgentSpec, TurnState, KEYWORDS, LAMBDA, RoleProfile, Posterior, Effort, LlmResponse (+16 more)

### Community 6 - "appServer.ts"
Cohesion: 0.09
Nodes (46): formatProblem(), pageRoutes(), analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle() (+38 more)

### Community 7 - "http-client.ts"
Cohesion: 0.10
Nodes (16): appServicesController, createEvaluationUseCases(), filesController, transport, createController(), HttpOptions, HttpPort, ApiError (+8 more)

### Community 8 - "Dashboard.tsx"
Cohesion: 0.11
Nodes (31): AgentLanes(), LaneCard(), LaneStep, money(), ROLE, Savings(), STEP_LABEL, tokens() (+23 more)

### Community 9 - "bootstrap/server.ts"
Cohesion: 0.06
Nodes (35): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+27 more)

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ContextPorts"
Cohesion: 0.08
Nodes (9): AppAiResult, AppUser, CheckoutInput, EmailInput, EmailResult, StoredObject, AuthPorts, ContextPorts (+1 more)

### Community 12 - "composition.ts"
Cohesion: 0.14
Nodes (23): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder(), bindEvaluationResources() (+15 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (16): Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole, Role, ToolContext, ToolOutput (+8 more)

### Community 14 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (51): describeSchema, ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), runAgent(), active, AgentResult (+43 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ExecutionMetrics"
Cohesion: 0.07
Nodes (24): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, AgentResult (+16 more)

### Community 18 - "database/index.ts"
Cohesion: 0.15
Nodes (12): config, DEFAULT_MODELS_ALLOW, env, paths, resolvePublicUrl(), LEGACY, SCRYPT, waiting (+4 more)

### Community 19 - "model-management/catalog.ts"
Cohesion: 0.11
Nodes (33): Task 3: Proveedores y modelos en BD + seeders, 3. Proveedores y modelos, 6. API de administración, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), tasks, allowedModels() (+25 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.11
Nodes (20): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, buildIndex(), cache, declaredDeps(), factsOf(), FileFacts, findSymbol(), kindOf() (+12 more)

### Community 21 - "bundler.ts"
Cohesion: 0.13
Nodes (25): createProjectCheck(), ProjectCompilerPort, packageName(), BuildProblem, FileMap, endpointRoutes(), exampleFiles(), jobFiles() (+17 more)

### Community 22 - "Account"
Cohesion: 0.12
Nodes (6): Account, AccountProps, Email, COMMON_PASSWORDS, Password, PostgresAccountRepository

### Community 23 - "domain/messages.ts"
Cohesion: 0.12
Nodes (22): anthropicChat(), Block, LlmMessage, LlmRequest, LlmTool, ModelCallError, CompatEndpoint, anthropicChat() (+14 more)

### Community 24 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.07
Nodes (59): radix-ui, react, administrationController, api, Admin(), TABS, AgentEvent, Agents() (+51 more)

### Community 26 - "project-observability/problems.ts"
Cohesion: 0.09
Nodes (16): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+8 more)

### Community 27 - "modules/collaboration/index.ts"
Cohesion: 0.14
Nodes (7): PersonalOrganizationUseCase, Organization, OrganizationProps, CollaborationModuleDependencies, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.11
Nodes (15): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, Author, CheckpointProps, IProjectFileRepository, app, database (+7 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.12
Nodes (18): 10. Documentación, 1. Capa de datos, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Conexión, Decisiones tomadas con el usuario (+10 more)

### Community 30 - "agents.mjs"
Cohesion: 0.08
Nodes (22): app, DATA, app, DATA, MODELS, req(), ROOT, SEED (+14 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.11
Nodes (57): api, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel(), DocsPanel() (+49 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.07
Nodes (46): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, MAX_PROJECT_STORAGE_BYTES, storagePorts (+38 more)

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "BuilderWorkflow.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 36 - "urls.ts"
Cohesion: 0.17
Nodes (13): SharePorts, createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts() (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.10
Nodes (18): createCatalogService(), deleteModel(), listCatalog(), modelReadiness(), permitAccountModel(), saveModel(), updateProjectModels(), creditsAtRate() (+10 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.12
Nodes (19): createIdentityUseCases(), ProjectEvent, ProjectLogLine, projectsController, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+11 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.08
Nodes (15): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, Access (+7 more)

### Community 41 - "model-management/router.ts"
Cohesion: 0.14
Nodes (18): ROLES, createTurnFeedback(), penalizeTurn(), posteriors, feedbackModel(), TurnModelDecision, postgresTurnFeedback, routingPorts (+10 more)

### Community 42 - "client/index.ts"
Cohesion: 0.17
Nodes (14): ChatMessage, AppUser, realtime, Contract, createApi(), RouteInput, RouteOutput, Routes (+6 more)

### Community 43 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+10 more)

### Community 44 - "vitest"
Cohesion: 0.09
Nodes (21): Task 1: Postgres, migraciones y helper de tests, 9. Pruebas, pg, vitest, migrate(), drop(), freshDatabase(), TEST_DATABASE_URL (+13 more)

### Community 45 - "createProblemService"
Cohesion: 0.47
Nodes (9): createProblemService(), changed(), clearProblems(), fromLog(), listProblems(), recheckBuild(), stopProblems(), upsert() (+1 more)

### Community 46 - "infrastructure/playground.ts"
Cohesion: 0.10
Nodes (33): hono@^4.13.14, hono, AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv (+25 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.14
Nodes (16): buildServer(), CONTEXT_TOOLS, createMcpHandler(), DESTRUCTIVE, expectedVersionProp, extraTools, Hints, hintsOf() (+8 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.20
Nodes (15): base(), Window, client, currentPath(), ForjaApp(), Link(), listeners, matchRoute() (+7 more)

### Community 49 - "package.json"
Cohesion: 0.06
Nodes (43): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, @electric-sql/pglite@^0.5.13, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2 (+35 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.07
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.11
Nodes (7): CreateProjectInput, Project, ProjectProps, Visibility, PostgresProjectRepository, ProjectRow, IProjectRepository

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.13
Nodes (15): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+7 more)

### Community 53 - "skills.test.ts"
Cohesion: 0.17
Nodes (19): builderTools, ROLE_PROMPTS, AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED (+11 more)

### Community 54 - "domain/securityScan.ts"
Cohesion: 0.21
Nodes (15): FileMap, Finding, findSecret(), formatFinding(), isClient(), isCode(), isServer(), lineOf() (+7 more)

### Community 55 - "BuilderToolsAdapter.ts"
Cohesion: 0.07
Nodes (21): requestSecret, assertProjectObject(), assertSafeAgentSql(), objectName(), redactSqlData(), isSafeProjectPath(), assertOwnerRequestedForget(), assertOwnerSourcedMemory() (+13 more)

### Community 56 - "server/index.ts"
Cohesion: 0.08
Nodes (15): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+7 more)

### Community 57 - "AgentExecution.ts"
Cohesion: 0.15
Nodes (11): AgentEvent, Block, ExecutionModel, ExecutionTool, Message, ToolDefinition, IMAGE_TYPES, UPLOADS (+3 more)

### Community 58 - "createIdentityModule"
Cohesion: 0.15
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.08
Nodes (36): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+28 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "Desplegar Forja en Coolify"
Cohesion: 0.11
Nodes (15): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+7 more)

### Community 67 - "createJobs"
Cohesion: 0.25
Nodes (14): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+6 more)

### Community 68 - "tracing.ts"
Cohesion: 0.20
Nodes (8): StepRecord, ToolCallRecord, createLangfuse(), Event, fromConfig(), langfuse, LangfuseOptions, usage

### Community 69 - "Workspace.tsx"
Cohesion: 0.06
Nodes (31): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+23 more)

### Community 70 - "client.ts"
Cohesion: 0.20
Nodes (11): createClient(), createAi(), createApiWorkflow(), createAuth(), { apiUrl }, createRealtime(), Handler, createStorage() (+3 more)

### Community 72 - "IntegrationRepository"
Cohesion: 0.17
Nodes (6): createIntegrationService(), Integration, INTEGRATION_TYPES, IntegrationInput, IntegrationRepository, IntegrationType

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.30
Nodes (11): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+3 more)

### Community 77 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.20
Nodes (8): PostgresCollaborationAccountRepository, CollaborationAccount, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository, sendInvitation

### Community 78 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (36): RuntimeProjectsPort, EndpointInfo, JobInfo, bindRuntimeObservation(), configureRuntimeProjects(), publication, stopAppRuntime(), suggestSlug (+28 more)

### Community 79 - "one"
Cohesion: 0.11
Nodes (9): PlatformRole, PostgresAccountLifecycleRepository, AccountRow, SessionAccountRow, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountSecurity (+1 more)

### Community 80 - "sandbox.ts"
Cohesion: 0.19
Nodes (7): beginTransaction(), dispatch(), ProjectSandbox, SandboxError, sandboxes, SandboxRunError, WORKER

### Community 81 - "ProjectDb"
Cohesion: 0.06
Nodes (20): createProjectData(), createProjectRows(), columnsFor(), createProjectRow(), deleteProjectRows(), listProjectRows(), mask(), ProjectDataError (+12 more)

### Community 83 - "ModelRouter.ts"
Cohesion: 0.16
Nodes (18): createModelManagementQueries(), routerAudit(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick(), maxTokensFor() (+10 more)

### Community 84 - "ref_node_path"
Cohesion: 0.15
Nodes (12): vite, createDevelopmentSeed(), DEV_FIXTURE, Fixture, ROOT_DIR, MIGRATIONS_DIR, studioPwa(), here (+4 more)

### Community 85 - "domain/score.ts"
Cohesion: 0.10
Nodes (31): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), JUDGE_DIMENSIONS, JudgeDimension (+23 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.20
Nodes (15): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+7 more)

### Community 87 - "model-management/index.ts"
Cohesion: 0.16
Nodes (16): Catalog, bindModelAudit(), bindCatalogService(), bindCatalogSync(), ModelSpendView, ProjectModelPatch, ProjectModelSettings, RouterDecisionView (+8 more)

### Community 88 - "replaceVisibleText"
Cohesion: 0.40
Nodes (4): escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 89 - "RunAgentUseCase.ts"
Cohesion: 0.20
Nodes (20): GATE_FIXES, summarize(), addUsage(), emptyUsage(), ExecutionContext, applySummary(), blockTokens(), callLabel() (+12 more)

### Community 91 - "executeRun"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 92 - "builderService.ts"
Cohesion: 0.10
Nodes (13): accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService(), BuilderServiceClient (+5 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "mcp/jobs.ts"
Cohesion: 0.19
Nodes (9): CallResult, fail(), Job, jobs, jobStatus(), MAX_WAIT_SECONDS, PENDING_SCHEMA, runOrDefer() (+1 more)

### Community 95 - "createSecrets"
Cohesion: 0.16
Nodes (5): createSecrets(), projectSecretEnv(), secretEnv(), SECRET_NAME, SecretPorts

### Community 96 - "ProjectsApplication.ts"
Cohesion: 0.16
Nodes (17): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+9 more)

### Community 97 - "infrastructure/auth.ts"
Cohesion: 0.27
Nodes (7): BcryptArgonPasswordHasher, burnPasswordCheck(), hashPassword(), passwordNeedsRehash(), scryptKey(), verifyPassword(), withSlot()

### Community 98 - "Review Focus"
Cohesion: 0.22
Nodes (8): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 2: Registro y almacén de ajustes, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 99 - "app-services/payments.ts"
Cohesion: 0.27
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 100 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 101 - "react"
Cohesion: 0.08
Nodes (30): Admin, App(), NAV, Redirect(), Shell(), UserMenu(), InstallEvent, Pwa() (+22 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.16
Nodes (7): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, mocks

### Community 103 - "modules/identity/index.ts"
Cohesion: 0.08
Nodes (12): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, IdentityModuleDependencies, PlatformMailerService, IdentityAccountsDependencies, IAccountRepository (+4 more)

### Community 104 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 105 - "integrations/index.ts"
Cohesion: 0.23
Nodes (15): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+7 more)

### Community 106 - "AgentExecutionResult"
Cohesion: 0.18
Nodes (5): TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), AgentTaskRepository, TaskLanePorts

### Community 107 - "app-services/projectDb.ts"
Cohesion: 0.17
Nodes (21): app, monolith, runtimePorts, wss, cloneDatabase(), closeAll(), closeProject(), dumpDatabase() (+13 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.19
Nodes (9): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), OrganizationSkillsRepository, SecretDetector (+1 more)

### Community 109 - "guides.ts"
Cohesion: 0.22
Nodes (12): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+4 more)

### Community 110 - "platformDb"
Cohesion: 0.21
Nodes (6): platformDb, Tx, wrap(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults()

### Community 112 - "ports.ts"
Cohesion: 0.11
Nodes (15): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, createPublication(), assertPublishable(), Author (+7 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "securityReview.ts"
Cohesion: 0.18
Nodes (6): BuilderTool, toolByName, typed(), Reported, running, SEVERITIES

### Community 115 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+7 more)

### Community 116 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 117 - "RouterAdministration.ts"
Cohesion: 0.28
Nodes (8): createRouterAdministration(), routerStats(), RouterPosteriorRow, RouterStats, postgresRouterAdministrationRepository, RouterAdministrationRepository, resetRouter(), routerStats()

### Community 118 - "platform.ts"
Cohesion: 0.11
Nodes (6): PostgresSettingsRepository, SettingsRepository, AuditAction, SettingWrite, StoredSetting, ISecretCipher

### Community 120 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 122 - "ISettingsStore"
Cohesion: 0.14
Nodes (9): GetPlatformSettingsUseCase, UpdatePlatformSettingsUseCase, SettingDefinitionProps, SettingType, SettingValue, createSettingsModule(), SettingsModuleDependencies, ISettingsRegistry (+1 more)

### Community 123 - "format.ts"
Cohesion: 0.38
Nodes (6): api, billingController, Meter(), Plan(), Usage, bytes()

### Community 124 - "ProjectServices"
Cohesion: 0.22
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 125 - "transports/mcp.test.ts"
Cohesion: 0.11
Nodes (18): builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account, app, collaboration, identity (+10 more)

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

### Community 129 - "models/presentation/Models.tsx"
Cohesion: 0.24
Nodes (11): api, modelsController, AccountModels(), ModelChecklist(), ModelRow, MODES, price(), ProjectModels() (+3 more)

### Community 130 - "app-runtime"
Cohesion: 0.25
Nodes (8): command, environment, expose, labels, restart, stop_grace_period, volumes, app-runtime

### Community 131 - "studio.mjs"
Cohesion: 0.24
Nodes (14): ADMIN, assert(), cleanup(), freePort(), get(), main(), resources, ROOT (+6 more)

### Community 132 - "build"
Cohesion: 0.48
Nodes (7): build, BROWSER, args, context, dockerfile, build, build

### Community 133 - "app-services/context.ts"
Cohesion: 0.07
Nodes (24): bindJobs, listEmails, receiveEmail, sendEmail, sendPlatformEmail, emailPorts, resetTransport(), stopEmailTransport (+16 more)

### Community 134 - "PlatformSettingsService"
Cohesion: 0.22
Nodes (7): PlatformSettingsService, SettingDef, SettingsError, SettingView, SettingsDependencies, fixture(), fixture()

### Community 135 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "GithubGateway"
Cohesion: 0.18
Nodes (4): 2. Ajustes globales, Almacén, Registro, GithubGateway

### Community 138 - "admission.ts"
Cohesion: 0.08
Nodes (17): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+9 more)

### Community 139 - "model-management/router.test.ts"
Cohesion: 0.25
Nodes (6): a, b, features, response, scope, setup()

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 141 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (18): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+10 more)

### Community 142 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 143 - "ports/jobs.ts"
Cohesion: 0.11
Nodes (9): AiBlock, AiModel, AiPorts, EmailPorts, JobPorts, AppServiceEvent, ObserverPorts, QueryRepository (+1 more)

### Community 144 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 145 - "Cómo está hecho"
Cohesion: 0.33
Nodes (6): Arranque, Cómo está hecho, Forja, Límites conocidos, Paridad con Floot, ctx()

### Community 147 - "integrations/github.ts"
Cohesion: 0.12
Nodes (18): accountStatus, connectAccount, createRepo, disconnectAccount, getLink, handleWebhook, linkRepo, oauthFinish (+10 more)

### Community 148 - "q"
Cohesion: 0.07
Nodes (11): createCoreModules(), PostgresOrganizationSkillsRepository, NodeBootstrapCrypto, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, newToken() (+3 more)

### Community 151 - "spring.ts"
Cohesion: 0.22
Nodes (5): clip(), normalize(), parseSpringOutput(), SpringBuildTool, SpringProject

### Community 153 - "accounts.ts"
Cohesion: 0.27
Nodes (6): GithubError, Link, SyncResult, gh(), tokenFor(), setup()

### Community 154 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 156 - "app-services/ai.ts"
Cohesion: 0.39
Nodes (5): AiUnavailableError, createAi(), appAiChat(), AppAiInput, aiPorts

### Community 157 - "createAuth"
Cohesion: 0.12
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 158 - "app-services/realtime.ts"
Cohesion: 0.16
Nodes (9): createRealtime(), attachSocket(), publish(), publishPresence(), stopRealtime(), DEFAULT_LIMITS, RealtimeLimits, RealtimeSocket (+1 more)

### Community 160 - "Checkpoint"
Cohesion: 0.24
Nodes (3): CreateCheckpointUseCase, CreateProjectUseCase, Checkpoint

### Community 161 - "SqlAgentTaskRepository.ts"
Cohesion: 0.20
Nodes (6): ListAgentTasksUseCase, SqlAgentTaskRepository, AgentTaskQueries, AgentTaskView, TaskCompletion, mocks

### Community 164 - "createCollaborationModule"
Cohesion: 0.10
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, createCollaborationModule(), PostgresMemberRepository, IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

### Community 168 - "policies.test.ts"
Cohesion: 0.10
Nodes (18): createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), createEmail(), sendEmail(), sendPlatformEmail() (+10 more)

### Community 170 - "cli.ts"
Cohesion: 0.21
Nodes (11): [command, ...flags], main(), monolith, seedDev, seedLocal, createLocalSeed(), readSeedFile(), SeedFile (+3 more)

### Community 171 - "builderServer.ts"
Cohesion: 0.10
Nodes (22): startAppRuntimeEventRelay(), lifecycle, app, lifecycle, monolith, stopRuntimeEventRelay(), lifecycle, seedLocal (+14 more)

### Community 172 - "RunTaskLaneUseCase"
Cohesion: 0.40
Nodes (4): RunTaskLaneUseCase, fixture(), result, task

### Community 173 - "runtimeClient.ts"
Cohesion: 0.50
Nodes (3): callRuntimeEndpoint(), responseSchema, RuntimeEndpointCall

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.17
Nodes (19): encryptHeaders(), PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 344 - "application/context.ts"
Cohesion: 0.10
Nodes (12): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, publish() (+4 more)

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1211 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `model-management/providers.ts`, `http-client.ts`, `bootstrap/server.ts`, `composition.ts`, `evaluations/bindings.test.ts`, `project-observability/security.ts`, `memory/application/service.ts`, `ExecutionMetrics`, `database/index.ts`, `projectIndex.ts`, `Account`, `domain/messages.ts`, `ApplicationLifecycle`, `project-observability/problems.ts`, `modules/projects/index.ts`, `agents.mjs`, `Plan.ts`, `BuilderWorkflow.ts`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `package.json`, `ProjectsStore`, `skills.test.ts`, `BuilderToolsAdapter.ts`, `server/index.ts`, `AgentExecution.ts`, `createIdentityModule`, `deps.ts`, `tracing.ts`, `deps.test.ts`, `IntegrationRepository`, `IOrganizationRepository`, `collaboration/postgresAdapters.test.ts`, `app-runtime/index.ts`, `one`, `ProjectDb`, `ModelRouter.ts`, `ref_node_path`, `domain/score.ts`, `Changes.tsx`, `model-management/index.ts`, `replaceVisibleText`, `RunAgentUseCase.ts`, `builderService.ts`, `BootstrapService`, `mcp/jobs.ts`, `usage/usage.ts`, `modules/identity/index.ts`, `OrganizationSkillsService.ts`, `guides.ts`, `ports.ts`, `devDependencies`, `RouterAdministration.ts`, `settingReactions.ts`, `ISettingsStore`, `transports/mcp.test.ts`, `app-services/context.ts`, `PlatformSettingsService`, `apiTypes.test.ts`, `admission.ts`, `model-management/router.test.ts`, `FinishGateAdapter.ts`, `execution.test.ts`, `GithubAccountRepository`, `integrations/github.ts`, `ApiError`, `exports.test.tsx`, `accounts.ts`, `createAuth`, `Checkpoint`, `SqlAgentTaskRepository.ts`, `createCollaborationModule`, `policies.test.ts`, `ProjectPath`, `builderServer.ts`, `RunTaskLaneUseCase`, `runtimeClient.ts`, `architecture.test.ts`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `model-management/providers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07662337662337662 - nodes in this community are weakly interconnected._
- **Why does `react` connect `administration/presentation/Models.tsx` to `index.tsx`, `models/presentation/Models.tsx`, `Chat.tsx`, `react`, `Workspace.tsx`, `projects/application/usecases.ts`, `Dashboard.tsx`, `integrations/index.ts`, `client/index.ts`, `internal/router.ts`, `package.json`, `Changes.tsx`, `exports.test.tsx`, `forms.tsx`, `format.ts`, `ProjectView.tsx`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11497584541062802 - nodes in this community are weakly interconnected._