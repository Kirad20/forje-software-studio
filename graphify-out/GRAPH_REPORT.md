# Graph Report - anemone  (2026-11-04)

## Corpus Check
- 599 files · ~249,728 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .css 3, .example 1)

## Summary
- 4084 nodes · 10453 edges · 175 communities (143 shown, 32 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 578 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3ba272f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- infrastructure/playground.ts
- index.tsx
- infrastructure/runner.ts
- Chat.tsx
- crypto.ts
- composition.ts
- appServer.ts
- http-client.ts
- q
- project-observability/events.ts
- with
- ModelRouter.ts
- createModelRouter
- evaluations/bindings.test.ts
- skills.test.ts
- BuilderTurnAdapter.ts
- memory/application/service.ts
- ref_node_crypto
- app-services/jobs.ts
- database/index.ts
- projectIndex.ts
- bundler.ts
- PostgresProviderRepository.ts
- collaboration/postgresAdapters.test.ts
- infrastructure/probe.ts
- administration/presentation/Models.tsx
- project-observability/events.ts
- CollaborationModuleDependencies
- modules/projects/index.ts
- Panel de administración del sistema — diseño
- studio.mjs
- ProjectView.tsx
- studioApi.ts
- SettingDefinition
- Plan.ts
- builderService.ts
- builder/contracts.ts
- compilerOptions
- models.ts
- projects/application/usecases.ts
- collaboration/ports/repositories.ts
- model-management/router.ts
- client/index.ts
- scripts
- ContextPorts
- shared/security.ts
- ProjectsApplication.ts
- mcp/server.ts
- internal/router.ts
- package.json
- ProjectsStore
- Project
- Inventario de funciones de Lovable → Forja
- OrchestrationPolicy.ts
- vitest
- ProjectDbClient
- server/index.ts
- infrastructure/appDataService.ts
- createIdentityModule
- CLAUDE.md
- PostgresProjectFileRepository
- deps.ts
- sandboxWorker.mjs
- postgres
- AgentExecutionAdapter.ts
- PostgresProjectsStore
- Panel de administración del sistema — diseño
- app-runtime/index.ts
- Plan
- client.ts
- Workspace.tsx
- GithubAccountRepository
- IOrganizationRepository
- policies.test.ts
- services
- createGithubSyncService
- admission.ts
- OrchestrationPolicy.ts
- builder/contracts.ts
- appRuntimeServer.ts
- model-management/catalog.ts
- TEST_DATABASE_URL
- app-services/analytics.ts
- Review Focus
- domain/score.ts
- Changes.tsx
- admission.ts
- runBuilderTurn
- createJobs
- roles.ts
- GithubAuthorization
- typecheck.ts
- BootstrapService
- modules/identity/index.ts
- integrations/github.ts
- ExecutionMetrics
- ports/jobs.ts
- cli.ts
- BuilderWorkflowPorts
- github.mjs
- react
- usage/usage.ts
- createSecrets
- appRuntimeServer.ts
- infrastructure/routing.ts
- AgentExecution.ts
- urls.ts
- OrganizationSkillsService.ts
- SqlAgentTaskRepository.ts
- ApplicationLifecycle
- project-observability/security.ts
- ports.ts
- e2e.mjs
- PostgresApiTokenRepository
- devDependencies
- PostgresOrganizationRepository.ts
- RouterAdministration.ts
- platform.ts
- RealtimeTransport
- IntegrationRepository
- { api, auth, storage, ai }
- ISettingsStore
- IPasswordHasher
- model-management/index.ts
- settingReactions.ts
- app-services/storage.ts
- postgres
- healthcheck
- IMailerService
- app-runtime
- exports.test.tsx
- build
- domain/securityScan.ts
- PlatformSettingsService
- createEmail
- builder
- apiTypes.test.ts
- platformAllows
- BuilderToolsAdapter.ts
- forja
- config.ts
- one
- integrations/index.ts
- bootstrap/server.ts
- PostgresPlatformSettingsStoreAdapter
- appRuntimeServer.ts
- FastBuildPorts
- JobCron
- ProjectServices
- ProjectSandbox
- execution.test.ts
- replaceVisibleText
- transports/mcp.test.ts
- createAuth
- architecture.test.ts
- FinishGateAdapter.ts
- settings/index.ts
- forms.tsx
- GithubGateway
- application/context.ts
- GithubProjectPorts
- collaboration/ports/repositories.ts
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
1. `vitest` - 128 edges
2. `q()` - 100 edges
3. `createStudioApi()` - 69 edges
4. `createIdentityModule()` - 42 edges
5. `ProjectsStore` - 40 edges
6. `one()` - 40 edges
7. `react` - 39 edges
8. `createProjectsModule()` - 39 edges
9. `ProjectView()` - 38 edges
10. `PostgresProjectsStore` - 35 edges

## Surprising Connections (you probably didn't know these)
- `9. Publicar, hosting y crecimiento` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts
- `Avance` --references--> `useHead()`  [INFERRED]
  docs/inventario-lovable.md → sdk/client/internal/router.ts
- `6. IA dentro de las apps` --references--> `tools()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/BuilderTurnAdapter.ts
- `1. Chat y agente del constructor` --references--> `selectContext()`  [INFERRED]
  docs/inventario-lovable.md → server/modules/builder/infrastructure/projectIndex.ts
- `Task 6: Studio — página de administración` --references--> `useLoad()`  [INFERRED]
  docs/superpowers/plans/2026-11-01-panel-admin.md → studio/src/features/files/presentation/Panels.tsx

## Import Cycles
- None detected.

## Communities (175 total, 32 thin omitted)

### Community 0 - "infrastructure/playground.ts"
Cohesion: 0.12
Nodes (29): AdminApiModules, body(), createAdminApi(), me(), modelIdOf(), AdministrationEnv, AdministrationRouteGroups, createAdministrationApi() (+21 more)

### Community 1 - "index.tsx"
Cohesion: 0.15
Nodes (19): clsx@^2.1.1, react@^19.3.1, sonner@^2.0.8, clsx, react, sonner, Button, ButtonProps (+11 more)

### Community 2 - "infrastructure/runner.ts"
Cohesion: 0.12
Nodes (37): removeProjectData, removeProjectData(), sessionCookie(), endSession, testSession, EvalError, RunRequest, recoverRuns() (+29 more)

### Community 3 - "Chat.tsx"
Cohesion: 0.05
Nodes (67): ChatStreamEvent, api, builderController, streamGet, streamPost, AgentLanes(), Lane, LaneCard() (+59 more)

### Community 4 - "crypto.ts"
Cohesion: 0.15
Nodes (17): createCoreModules(), BcryptArgonPasswordHasher, NodeBootstrapCrypto, config, burnPasswordCheck(), hashPassword(), LEGACY, newId() (+9 more)

### Community 5 - "composition.ts"
Cohesion: 0.15
Nodes (22): createMonolith(), startBindings(), stopBindings(), configureJobRuntime(), configureAppServiceObserver(), configureSecretIntegrations(), initializeAppServices, bindEvaluationBuilder() (+14 more)

### Community 6 - "appServer.ts"
Cohesion: 0.10
Nodes (39): analyticsBeacon(), appOrigin(), baasRoute(), badge(), callEndpoint(), clientBundle(), clientCache, cookie() (+31 more)

### Community 7 - "http-client.ts"
Cohesion: 0.07
Nodes (30): api, billingController, Meter(), Plan(), Usage, api, evaluationsController, createEvaluationUseCases() (+22 more)

### Community 8 - "q"
Cohesion: 0.06
Nodes (8): PostgresMemberRepository, PostgresOrganizationRepository, PostgresAccountRepository, PostgresLoginCodeRepository, PostgresPasswordResetRepository, PostgresSessionRepository, PasswordResetRepository, q()

### Community 9 - "project-observability/events.ts"
Cohesion: 0.33
Nodes (6): startAppRuntimeEventRelay(), adapters, listeners, log, onProjectEvent(), projectEvents

### Community 10 - "with"
Cohesion: 0.06
Nodes (38): env, runs-on, services, steps, runs-on, steps, PLAYWRIGHT_BROWSERS_PATH, POSTGRES_PASSWORD (+30 more)

### Community 11 - "ModelRouter.ts"
Cohesion: 0.12
Nodes (26): AgentSpec, TurnState, Catalog, KEYWORDS, LAMBDA, maxTokensFor(), RoleProfile, Posterior (+18 more)

### Community 12 - "createModelRouter"
Cohesion: 0.16
Nodes (18): createModelManagementQueries(), routerAudit(), updateProjectModels(), analyzeHeuristic(), createModelRouter(), analyzeRequest(), callModel(), pick() (+10 more)

### Community 13 - "evaluations/bindings.test.ts"
Cohesion: 0.06
Nodes (20): PlaygroundView, AgentEvent, AgentResult, Block, BuilderTool, EvaluationAgentSpec, EvaluationBuilderPort, PlaygroundRole (+12 more)

### Community 14 - "skills.test.ts"
Cohesion: 0.19
Nodes (17): AUTHORED_SKILLS, BUILTIN_SKILLS, readVendored(), Skill, unix(), VENDORED, VENDORED_INFO, allSkills() (+9 more)

### Community 15 - "BuilderTurnAdapter.ts"
Cohesion: 0.09
Nodes (46): ScheduleTasksUseCase, rewardOf(), criteriaOf(), planOverview(), active, AgentResult, background(), cleanText() (+38 more)

### Community 16 - "memory/application/service.ts"
Cohesion: 0.09
Nodes (13): createMemoryService(), labels, limits, MAX_MEMORY_CHARS, Memory, MEMORY_KINDS, MemoryKind, MemoryRepository (+5 more)

### Community 17 - "ref_node_crypto"
Cohesion: 0.23
Nodes (7): createTestCoreModules(), dataDir, dir, SKILL, unbindBuilder, dir, seedLocal

### Community 18 - "app-services/jobs.ts"
Cohesion: 0.12
Nodes (10): bindJobs, JOB_LIMITS, jobPorts, log(), secretPorts, addTimer, isJobRunnerStarted, JobPorts (+2 more)

### Community 19 - "database/index.ts"
Cohesion: 0.07
Nodes (27): Task 1: Postgres, migraciones y helper de tests, Task 3: Proveedores y modelos en BD + seeders, 9. Pruebas, pg, migrate(), ANTHROPIC_MODELS, PROVIDERS, seedDefaults() (+19 more)

### Community 20 - "projectIndex.ts"
Cohesion: 0.08
Nodes (27): 2026-11-02 - Reusing ProjectIndex in Graph Traversal, describeSchema, getProject(), buildIndex(), cache, declaredDeps(), factsOf(), FileFacts (+19 more)

### Community 21 - "bundler.ts"
Cohesion: 0.15
Nodes (26): createProjectCheck(), packageName(), EndpointInfo, endpointRoutes(), exampleFiles(), jobFiles(), JobInfo, PageInfo (+18 more)

### Community 22 - "PostgresProviderRepository.ts"
Cohesion: 0.12
Nodes (18): createProviderService(), deleteProvider(), ensureProviders(), listProviders(), reloadProviders(), saveProvider(), audit(), missingProvider() (+10 more)

### Community 23 - "collaboration/postgresAdapters.test.ts"
Cohesion: 0.18
Nodes (9): PlatformCollaborationMailerService, ICollaborationMailerService, SendInvitationParams, collaboration, collaborationAccountRepository, collaborationMailerService, memberRepository, organizationRepository (+1 more)

### Community 24 - "infrastructure/probe.ts"
Cohesion: 0.25
Nodes (15): 6. API de administración, providerOf(), call(), ECHO_TOOL, errorOf(), listProviderModels(), ModelProbe, perMillion() (+7 more)

### Community 25 - "administration/presentation/Models.tsx"
Cohesion: 0.09
Nodes (34): administrationController, api, TABS, AgentEvent, Agents(), ROLE_LABEL, RoleInfo, RunPanel() (+26 more)

### Community 26 - "project-observability/events.ts"
Cohesion: 0.10
Nodes (13): createLogService(), LogEntry, LogRepository, ProjectEvent, BuildProblem, locate(), Problem, ProblemEffects (+5 more)

### Community 27 - "CollaborationModuleDependencies"
Cohesion: 0.13
Nodes (6): PersonalOrganizationUseCase, Organization, OrganizationProps, PostgresPersonalOrganizationRepository, IPersonalOrganizationRepository, QueryHandle

### Community 28 - "modules/projects/index.ts"
Cohesion: 0.09
Nodes (14): DeleteFileUseCase, RenameFileUseCase, WriteFileUseCase, ProjectPath, IProjectFileRepository, app, database, pool (+6 more)

### Community 29 - "Panel de administración del sistema — diseño"
Cohesion: 0.11
Nodes (19): 10. Documentación, 1. Capa de datos, 2. Ajustes globales, 4. Playground de agentes, 5. Enrutador, 7. Studio, 8. Errores y seguridad, Almacén (+11 more)

### Community 30 - "studio.mjs"
Cohesion: 0.11
Nodes (24): app, DATA, MODELS, req(), ROOT, SEED, call(), log (+16 more)

### Community 31 - "ProjectView.tsx"
Cohesion: 0.10
Nodes (53): api, appServicesController, AddRowDialog(), Analytics, AnalyticsPanel(), Bars(), Col, DataPanel() (+45 more)

### Community 32 - "studioApi.ts"
Cohesion: 0.06
Nodes (56): createStudioApi(), Env, SESSION_COOKIE, StudioApiModules, aiUsage, analyticsSummary, listEmails, receiveEmail (+48 more)

### Community 34 - "Plan.ts"
Cohesion: 0.14
Nodes (16): CheckPlanUseCase, checkContract(), CONTRACT_FILE, covers(), MAX_CONTRACT, MAX_GOAL, MAX_TASKS, order() (+8 more)

### Community 35 - "builderService.ts"
Cohesion: 0.09
Nodes (13): AgentEvent, accountSchema, ActiveBuilderStream, BuilderServicePorts, BuilderStreamSubscriber, BuilderToolResult, BuilderTurnInput, createBuilderService() (+5 more)

### Community 36 - "builder/contracts.ts"
Cohesion: 0.12
Nodes (13): GATE_FIXES, summarize(), addUsage(), AgentExecutionSpec, Block, emptyUsage(), ExecutionContext, ExecutionModel (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 38 - "models.ts"
Cohesion: 0.11
Nodes (14): createCatalogService(), deleteModel(), saveModel(), CompatEndpoint, creditsAtRate(), globToRegex(), matchesModelPolicy(), ModelChanges (+6 more)

### Community 39 - "projects/application/usecases.ts"
Cohesion: 0.09
Nodes (23): ProjectEvent, ProjectLogLine, projectsController, transport, createProjectUseCases(), isProjectLogLine(), isProjectProblem(), isRecord() (+15 more)

### Community 40 - "collaboration/ports/repositories.ts"
Cohesion: 0.11
Nodes (7): InviteMemberResult, InviteMemberUseCase, ProjectTarget, RemoveMemberUseCase, ProjectInvite, ProjectInviteProps, IMemberRepository

### Community 41 - "model-management/router.ts"
Cohesion: 0.17
Nodes (16): ROLES, createTurnFeedback(), penalizeTurn(), feedbackModel(), TurnModelDecision, postgresTurnFeedback, TurnFeedbackPorts, TurnFeedbackRepository (+8 more)

### Community 42 - "client/index.ts"
Cohesion: 0.15
Nodes (11): Contract, createApi(), RouteInput, RouteOutput, Routes, RouteSpec, Spec, useApi() (+3 more)

### Community 43 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:reset, db:seed, db:seed:dev, dev, dev:server (+9 more)

### Community 44 - "ContextPorts"
Cohesion: 0.09
Nodes (9): AppAiResult, AppUser, CheckoutInput, EmailInput, EmailResult, StoredObject, AuthPorts, ContextPorts (+1 more)

### Community 45 - "shared/security.ts"
Cohesion: 0.19
Nodes (10): resolvePublicUrl(), clientIp(), createRateLimiter(), RateLimitError, RateLimitQuery, RateLimitStoreError, requestOrigin(), startRateLimitCleanup() (+2 more)

### Community 46 - "ProjectsApplication.ts"
Cohesion: 0.15
Nodes (19): BeforeImage, beforeImages(), restoredFiles(), turnFileChange(), ChangeEntry, normalizeProjectProfile(), ProjectPatch, ProjectProfile (+11 more)

### Community 47 - "mcp/server.ts"
Cohesion: 0.07
Nodes (38): build(), Guide, guideById, guideList(), GUIDES, OVERVIEW_PARTS, parse(), readGuides() (+30 more)

### Community 48 - "internal/router.ts"
Cohesion: 0.17
Nodes (18): base(), Window, client, realtime, currentPath(), ForjaApp(), Link(), listeners (+10 more)

### Community 49 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, @anthropic-ai/sdk@^1.3.0, croner@^11.0.0, esbuild@^0.28.2, @hono/node-server@^2.1.5, lucide-react@^1.66.0, @modelcontextprotocol/sdk@^1.32.2, motion@^14.9.0 (+33 more)

### Community 50 - "ProjectsStore"
Cohesion: 0.06
Nodes (5): isDevFile(), ProjectsApplication, createProjectsModule(), ProjectsStore, fixture()

### Community 51 - "Project"
Cohesion: 0.08
Nodes (12): CreateCheckpointUseCase, CreateProjectInput, CreateProjectUseCase, Author, Checkpoint, CheckpointProps, Project, ProjectProps (+4 more)

### Community 52 - "Inventario de funciones de Lovable → Forja"
Cohesion: 0.14
Nodes (13): 10. Colaboración, workspace y empresa, 1. Chat y agente del constructor, 2. Verificación, pruebas y calidad, 3. Editor y vista previa, 4. Proyectos, 5. Backend incluido («Cloud»), 6. IA dentro de las apps, 7. Conectores e integraciones (+5 more)

### Community 53 - "OrchestrationPolicy.ts"
Cohesion: 0.25
Nodes (8): BuilderWorkflowUseCase, FastBuildUseCase, assertRunning(), BuilderRequestFeatures, Cancellation, ChatMode, useFastPath(), workflowFixture()

### Community 54 - "vitest"
Cohesion: 0.12
Nodes (15): @electric-sql/pglite@^0.5.13, @electric-sql/pglite, vitest, projectDb(), createProjectRowsRepository(), projectRowsRepository, authRepository(), createAuthRepository() (+7 more)

### Community 56 - "server/index.ts"
Cohesion: 0.09
Nodes (14): Ctx, JobCtx, ServiceCtx, Db, AppUser, Ai, AiMessage, CheckoutInput (+6 more)

### Community 57 - "infrastructure/appDataService.ts"
Cohesion: 0.17
Nodes (6): AppDataPorts, createAppDataService(), TransactionSession, SqlExecutionResult, TransactionAction, isInternalServiceRequest()

### Community 58 - "createIdentityModule"
Cohesion: 0.12
Nodes (4): IdentityAccountsService, createIdentityModule(), PublicAccount, fixture()

### Community 61 - "deps.ts"
Cohesion: 0.12
Nodes (24): createDependencyResolution(), PackageRegistryPort, KIT_BUILTIN, KIT_CATALOG, KitEntry, kitSummary(), BUILTIN_PACKAGES, catalogVersion() (+16 more)

### Community 62 - "sandboxWorker.mjs"
Cohesion: 0.19
Nodes (13): calls, deepEqual(), expect(), fmt(), HttpError, load(), modules, rpc() (+5 more)

### Community 63 - "postgres"
Cohesion: 0.18
Nodes (10): environment, image, restart, volumes, services, postgres, volumes, forja-data (+2 more)

### Community 65 - "AgentExecutionAdapter.ts"
Cohesion: 0.09
Nodes (31): app, lifecycle, monolith, stopRuntimeEventRelay(), AgentResult, calculateSpendUseCase, toolRegistry, runAgent() (+23 more)

### Community 67 - "Panel de administración del sistema — diseño"
Cohesion: 0.08
Nodes (21): 1. Certificado comodín (una vez por servidor), 2. Crear el recurso, 3. Primer acceso, 4. Comprobaciones, Desplegar Forja en Coolify, Local, sin Coolify, Notas de diseño, Operación (+13 more)

### Community 68 - "app-runtime/index.ts"
Cohesion: 0.06
Nodes (38): RuntimeProjectsPort, bindRuntimeObservation(), configureRuntimeProjects(), publication, suggestSlug, AppTarget, loadFiles(), allowedRequest() (+30 more)

### Community 69 - "Plan"
Cohesion: 0.26
Nodes (3): TeamBuildUseCase, Plan, TeamBuildPorts

### Community 70 - "client.ts"
Cohesion: 0.15
Nodes (14): createClient(), ChatMessage, createAi(), createApiWorkflow(), AppUser, createAuth(), { apiUrl }, createRealtime() (+6 more)

### Community 71 - "Workspace.tsx"
Cohesion: 0.06
Nodes (54): api, collaborationController, EMPTY, OrgSkill, OrgSkillsSection(), View, api, memoryController (+46 more)

### Community 72 - "GithubAccountRepository"
Cohesion: 0.18
Nodes (4): createGithubAccountService(), connectAccount(), GithubAccountRepository, setup()

### Community 73 - "IOrganizationRepository"
Cohesion: 0.13
Nodes (8): CreateOrgResult, CreateOrgUseCase, ManageOrgMemberUseCase, ORG_ROLES, OrgPolicy, OrgRole, ICollaborationAccountRepository, IOrganizationRepository

### Community 74 - "policies.test.ts"
Cohesion: 0.26
Nodes (6): CheckoutInput, createPayments(), paymentsFor(), paymentPorts, paymentsFor, PaymentPorts

### Community 75 - "services"
Cohesion: 0.17
Nodes (11): environment, ports, environment, environment, ports, ports, services, app-runtime (+3 more)

### Community 76 - "createGithubSyncService"
Cohesion: 0.23
Nodes (12): createGithubSyncService(), branchHead(), doSync(), pull(), releaseSync(), reschedulePoll(), startGithubSync(), stopGithubSync() (+4 more)

### Community 77 - "admission.ts"
Cohesion: 0.08
Nodes (18): admission, AdmissionPorts, AdmissionState, JudgeModel, MAX_JOBS, MAX_REPEATS, planRun(), runBudget() (+10 more)

### Community 78 - "OrchestrationPolicy.ts"
Cohesion: 0.26
Nodes (9): ReviewAndFixUseCase, Review, reviewFixTasks(), PlanTask, SpecialistRole, FixResult, ReviewAndFixPorts, TeamReviewOutcome (+1 more)

### Community 79 - "builder/contracts.ts"
Cohesion: 0.27
Nodes (14): applySummary(), blockTokens(), callLabel(), estimateTokens(), hasResults(), KEEP_RECENT_RESULTS, KEEP_RECENT_STEPS, pruneToolResults() (+6 more)

### Community 80 - "appRuntimeServer.ts"
Cohesion: 0.16
Nodes (13): Conexión, hono@^4.13.14, hono, app, lifecycle, monolith, runtimePorts, startHttp() (+5 more)

### Community 81 - "model-management/catalog.ts"
Cohesion: 0.11
Nodes (29): createLocalSeed(), readSeedFile(), SeedFile, deleteModel(), lastSync(), providers(), saveModel(), startCatalogSync() (+21 more)

### Community 83 - "app-services/analytics.ts"
Cohesion: 0.20
Nodes (9): visitorId, createAnalytics(), analyticsSummary(), browserOf(), recordPageView(), visitorId(), analyticsDays(), analyticsPorts (+1 more)

### Community 84 - "Review Focus"
Cohesion: 0.25
Nodes (7): Global Constraints, Panel de administración + Postgres — plan de implementación, Review Focus, Task 4: API de administración (ajustes, proveedores, modelos, sondas), Task 5: Playground de agentes y enrutador, Task 6: Studio — página de administración, Task 7: `.env`, documentación y verificación final

### Community 85 - "domain/score.ts"
Cohesion: 0.14
Nodes (25): EvalSize, aggregate, clamp01(), counted(), FileMap, hygieneScore(), judgeScore(), mean() (+17 more)

### Community 86 - "Changes.tsx"
Cohesion: 0.19
Nodes (16): DiffLine, diffLines(), hunks(), baseName(), cache, ChangeCard(), diffStats(), FileChange (+8 more)

### Community 87 - "admission.ts"
Cohesion: 0.30
Nodes (4): ActiveRun, executeRun(), RunPorts, CaseResult

### Community 89 - "createJobs"
Cohesion: 0.06
Nodes (32): createJobs(), addTimer(), executeJob(), fireDueTimers(), initializeAppServices(), listJobs(), report(), runJob() (+24 more)

### Community 90 - "roles.ts"
Cohesion: 0.10
Nodes (19): BACKEND, CHECKLIST, CONTRACT, DATA, DESIGN, FAST_EXCLUDED_TOOLS, FIRST_BUILD, FRONTEND (+11 more)

### Community 92 - "typecheck.ts"
Cohesion: 0.22
Nodes (12): checkProject, IGNORED, isSource(), MODULES, parseDiagnostics(), require, run(), SDK (+4 more)

### Community 93 - "BootstrapService"
Cohesion: 0.19
Nodes (6): BootstrapService, SetupError, BootstrapAccounts, BootstrapCrypto, BootstrapPolicy, setup()

### Community 94 - "modules/identity/index.ts"
Cohesion: 0.09
Nodes (15): LoginWithPasswordUseCase, RequestLoginCodeUseCase, UpdateAccountNameUseCase, VerifyLoginCodeUseCase, Account, AccountProps, PlatformRole, Email (+7 more)

### Community 95 - "integrations/github.ts"
Cohesion: 0.09
Nodes (24): GithubError, GithubRepository, Link, SyncResult, accountStatus, connectAccount, createRepo, disconnectAccount (+16 more)

### Community 96 - "ExecutionMetrics"
Cohesion: 0.10
Nodes (11): CalculateSpendUseCase, AgentRole, RoleName, SPECIALIST_ROLES, VALID_ROLES, ExecutionMetrics, ExecutionMetricsProps, ROLE_TOOLS (+3 more)

### Community 97 - "ports/jobs.ts"
Cohesion: 0.13
Nodes (12): AiUnavailableError, createAi(), appAiChat(), AiBlock, AppAiInput, aiPorts, AiModel, AiPorts (+4 more)

### Community 98 - "cli.ts"
Cohesion: 0.19
Nodes (10): [command, ...flags], main(), monolith, seedDev, seedLocal, createDevelopmentSeed(), sendPlatformEmail, emailPorts (+2 more)

### Community 100 - "github.mjs"
Cohesion: 0.15
Nodes (8): blobId(), sha1(), startFakeGithub(), app, DATA, jar, ROOT, SEED

### Community 101 - "react"
Cohesion: 0.15
Nodes (22): App(), NAV, Redirect(), Shell(), UserMenu(), go(), listeners, usePath() (+14 more)

### Community 102 - "usage/usage.ts"
Cohesion: 0.15
Nodes (8): createUsageService(), DAILY_ACTIONS, UsageRepository, countAction(), usageRepository, actionsToday, countAction, mocks

### Community 103 - "createSecrets"
Cohesion: 0.18
Nodes (4): createSecrets(), projectSecretEnv(), secretEnv(), SecretPorts

### Community 104 - "appRuntimeServer.ts"
Cohesion: 0.20
Nodes (16): ProjectDataError, cloneDatabase(), closeAll(), closeProject(), dumpDatabase(), execSql(), get(), isAwake() (+8 more)

### Community 105 - "infrastructure/routing.ts"
Cohesion: 0.08
Nodes (33): JUDGE_DIMENSIONS, JudgeDimension, Judgement, JUDGE_SYSTEM, judgeDesign(), JudgeInput, parseJudgement(), anthropicChat() (+25 more)

### Community 106 - "AgentExecution.ts"
Cohesion: 0.11
Nodes (13): RunTaskLaneUseCase, TaskLifecycleUseCase, AgentExecutionResult, requiresFinishGate(), AgentTask, AgentTaskRepository, TaskCompletion, LaneTask (+5 more)

### Community 107 - "urls.ts"
Cohesion: 0.21
Nodes (12): createShareAccess(), DAY, parseHost(), PREVIEW_PREFIX, SHARE_COOKIE, ShareScope, tokenParts(), appPublicUrl() (+4 more)

### Community 108 - "OrganizationSkillsService.ts"
Cohesion: 0.14
Nodes (10): OrganizationSkillsService, canWriteOrganizationSkill(), OrganizationSkill, OrganizationSkillContent, OrgSkillError, validateOrganizationSkill(), PostgresOrganizationSkillsRepository, OrganizationSkillsRepository (+2 more)

### Community 109 - "SqlAgentTaskRepository.ts"
Cohesion: 0.21
Nodes (8): ListAgentTasksUseCase, SqlAgentTaskRepository, tasks, AgentTaskQueries, AgentTaskView, availableModels(), listCatalog(), mocks

### Community 110 - "ApplicationLifecycle"
Cohesion: 0.18
Nodes (5): ApplicationLifecycle, LifecycleService, shutdown(), shutdown(), shutdown()

### Community 111 - "project-observability/security.ts"
Cohesion: 0.13
Nodes (13): createSecurityService(), Finding, ScanRow, ScanView, SecurityPorts, SecurityRepository, SecurityView, securityRepository (+5 more)

### Community 112 - "ports.ts"
Cohesion: 0.08
Nodes (20): createBuildVerification(), BuildPorts, PublicationPorts, RuntimeEvent, RuntimeObservationPorts, SharePorts, ProjectCompilerPort, createPublication() (+12 more)

### Community 113 - "e2e.mjs"
Cohesion: 0.20
Nodes (6): DATA, jar, req(), ROOT, server, signInAs()

### Community 114 - "PostgresApiTokenRepository"
Cohesion: 0.18
Nodes (3): PostgresApiTokenRepository, ApiTokenInfo, ApiTokenRepository

### Community 115 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, @babel/parser@^7.28.0, concurrently@^10.0.6, tsx@^4.23.15, @types/nodemailer@^8.0.2, @types/ws@^8.18.2, vite@^8.3.5, @vitejs/plugin-react@^6.1.2 (+8 more)

### Community 116 - "PostgresOrganizationRepository.ts"
Cohesion: 0.11
Nodes (13): MemberQueries, OrganizationNamesQuery, OrganizationQueries, CollaborationModuleDependencies, createCollaborationModule(), IMemberQueries, InviteView, IOrganizationNameDirectory (+5 more)

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

### Community 123 - "IPasswordHasher"
Cohesion: 0.24
Nodes (3): IdentityModuleDependencies, IdentityAccountsDependencies, IPasswordHasher

### Community 124 - "model-management/index.ts"
Cohesion: 0.15
Nodes (17): bindModelAudit(), bindCatalogService(), bindCatalogSync(), createPlatformCatalogService(), ModelSpendView, ProjectModelPatch, ProjectModelSettings, RouterDecisionView (+9 more)

### Community 125 - "settingReactions.ts"
Cohesion: 0.22
Nodes (3): createSettingReactions(), SettingReactionPorts, SettingsChangePort

### Community 126 - "app-services/storage.ts"
Cohesion: 0.12
Nodes (10): createStorage(), putObject(), MAX_PROJECT_STORAGE_BYTES, StorageLimitError, StoredObject, MAX_FILE_BYTES, safeStorageKey(), SECRET_NAME (+2 more)

### Community 127 - "postgres"
Cohesion: 0.25
Nodes (9): condition, depends_on, condition, depends_on, app-runtime, builder, postgres, depends_on (+1 more)

### Community 128 - "healthcheck"
Cohesion: 0.53
Nodes (9): healthcheck, healthcheck, healthcheck, interval, retries, start_period, test, timeout (+1 more)

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

### Community 135 - "createEmail"
Cohesion: 0.38
Nodes (4): createEmail(), sendEmail(), sendPlatformEmail(), verifiedSender()

### Community 136 - "builder"
Cohesion: 0.29
Nodes (7): command, environment, expose, restart, stop_grace_period, volumes, builder

### Community 137 - "apiTypes.test.ts"
Cohesion: 0.54
Nodes (6): apiTypes(), doc(), key(), methodName(), Schema, schemaToTs()

### Community 138 - "platformAllows"
Cohesion: 0.33
Nodes (6): 3. Proveedores y modelos, `llm/catalog.ts`, Pruebas de conexión, Tablas (`002_admin.sql`), allowedModels(), platformAllows()

### Community 139 - "BuilderToolsAdapter.ts"
Cohesion: 0.05
Nodes (11): requestSecret, B, BuilderTool, I, N, out(), S, typed() (+3 more)

### Community 140 - "forja"
Cohesion: 0.33
Nodes (6): environment, expose, restart, stop_grace_period, volumes, forja

### Community 142 - "config.ts"
Cohesion: 0.11
Nodes (16): beginTransaction(), dispatch(), SandboxError, sandboxes, WORKER, DEFAULT_MODELS_ALLOW, env, paths (+8 more)

### Community 144 - "one"
Cohesion: 0.06
Nodes (9): PostgresAccountLifecycleRepository, AccountAccessUpdate, AccountAdminView, AccountCreation, AccountLifecycleRepository, AccountSecurity, IdentityRandom, one() (+1 more)

### Community 145 - "integrations/index.ts"
Cohesion: 0.12
Nodes (26): api, integrationsController, GithubCard, GithubCommitCard(), GithubSection(), Link, Mark(), CreateDialog() (+18 more)

### Community 146 - "bootstrap/server.ts"
Cohesion: 0.09
Nodes (20): withDefaultHeaders(), app, handleMcp, lifecycle, listening(), monolith, reactions, resolveApp() (+12 more)

### Community 149 - "appRuntimeServer.ts"
Cohesion: 0.16
Nodes (9): AppEnv, appErrorPage(), AppHost, AppRuntimeHttpPorts, createAppRuntimeHttpApp(), handleAppRuntimeRequest(), RequestPorts, resolveApp() (+1 more)

### Community 152 - "ProjectServices"
Cohesion: 0.25
Nodes (3): CoreModulesDependencies, ProjectsModuleDependencies, ProjectServices

### Community 154 - "execution.test.ts"
Cohesion: 0.33
Nodes (4): RunAgentUseCase, fixture(), model, usage

### Community 155 - "replaceVisibleText"
Cohesion: 0.33
Nodes (5): page(), escapeRe(), FileMap, replaceVisibleText(), TextEditResult

### Community 156 - "transports/mcp.test.ts"
Cohesion: 0.10
Nodes (21): DEV_FIXTURE, Fixture, bindBuilderCoreModules(), builderCoreModules, CollaborationModule, IdentityModule, ProjectsModule, account (+13 more)

### Community 157 - "createAuth"
Cohesion: 0.13
Nodes (21): createAuth(), confirmPasswordReset(), createSession(), ensureOwnerAdmin(), requestPasswordReset(), setTemporaryPassword(), signIn(), signUp() (+13 more)

### Community 178 - "architecture.test.ts"
Cohesion: 0.13
Nodes (14): SourceImport, sourceImports(), visit(), stringLiteral(), featuresRoot, files(), findCycles(), visit() (+6 more)

### Community 250 - "FinishGateAdapter.ts"
Cohesion: 0.10
Nodes (19): CreateFinishGateUseCase, BuildProblem, newBuildProblems(), newRuntimeProblems(), Ownership, ownsFile(), problemKey(), RuntimeProblem (+11 more)

### Community 279 - "settings/index.ts"
Cohesion: 0.17
Nodes (19): encryptHeaders(), PlatformSettingType, SettingGroup, MOVED_ENV, createPlatformSettings(), byKey, Def, defs (+11 more)

### Community 286 - "forms.tsx"
Cohesion: 0.46
Nodes (7): Checkbox, describe(), Field(), FieldProps, Input, Select, Textarea

### Community 344 - "application/context.ts"
Cohesion: 0.08
Nodes (13): Run, RunInput, AppUser, createContext(), serviceContext(), EndpointContext, HttpError, JobContext (+5 more)

### Community 361 - "collaboration/ports/repositories.ts"
Cohesion: 0.14
Nodes (8): CheckAccessUseCase, ProjectIdentity, ClaimInvitesUseCase, Access, MemberAccess, PostgresCollaborationAccountRepository, CollaborationAccount, OrganizationRecord

## Knowledge Gaps
- **17 isolated node(s):** `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js`, `{ api, auth, storage, ai }`, `{ publishProject, unpublishProject }` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1184 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `crypto.ts`, `composition.ts`, `http-client.ts`, `project-observability/events.ts`, `createModelRouter`, `evaluations/bindings.test.ts`, `skills.test.ts`, `memory/application/service.ts`, `ref_node_crypto`, `app-services/jobs.ts`, `database/index.ts`, `projectIndex.ts`, `PostgresProviderRepository.ts`, `collaboration/postgresAdapters.test.ts`, `project-observability/events.ts`, `CollaborationModuleDependencies`, `modules/projects/index.ts`, `Plan.ts`, `builderService.ts`, `builder/contracts.ts`, `models.ts`, `projects/application/usecases.ts`, `collaboration/ports/repositories.ts`, `model-management/router.ts`, `shared/security.ts`, `mcp/server.ts`, `package.json`, `ProjectsStore`, `Project`, `OrchestrationPolicy.ts`, `createIdentityModule`, `deps.ts`, `AgentExecutionAdapter.ts`, `app-runtime/index.ts`, `client.ts`, `GithubAccountRepository`, `IOrganizationRepository`, `policies.test.ts`, `createGithubSyncService`, `admission.ts`, `builder/contracts.ts`, `model-management/catalog.ts`, `domain/score.ts`, `Changes.tsx`, `runBuilderTurn`, `BootstrapService`, `modules/identity/index.ts`, `integrations/github.ts`, `ExecutionMetrics`, `usage/usage.ts`, `infrastructure/routing.ts`, `AgentExecution.ts`, `OrganizationSkillsService.ts`, `SqlAgentTaskRepository.ts`, `ApplicationLifecycle`, `project-observability/security.ts`, `ports.ts`, `devDependencies`, `PostgresOrganizationRepository.ts`, `RouterAdministration.ts`, `IntegrationRepository`, `ISettingsStore`, `model-management/index.ts`, `settingReactions.ts`, `exports.test.tsx`, `PlatformSettingsService`, `apiTypes.test.ts`, `BuilderToolsAdapter.ts`, `config.ts`, `bootstrap/server.ts`, `execution.test.ts`, `replaceVisibleText`, `transports/mcp.test.ts`, `architecture.test.ts`, `FinishGateAdapter.ts`, `application/context.ts`, `collaboration/ports/repositories.ts`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `q()` (e.g. with `infrastructure/repositories.ts` and `shared/security.ts`) actually correct?**
  _`q()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `./dynamic.js`, `./inlineType.js`, `./dynamicTemplate.js` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `infrastructure/playground.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `react` connect `index.tsx` to `Chat.tsx`, `exports.test.tsx`, `react`, `http-client.ts`, `Workspace.tsx`, `client/index.ts`, `internal/router.ts`, `package.json`, `integrations/index.ts`, `Changes.tsx`, `administration/presentation/Models.tsx`, `forms.tsx`, `ProjectView.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createIdentityModule()` (e.g. with `.complete()` and `.init()`) actually correct?**
  _`createIdentityModule()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `infrastructure/runner.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12050739957716702 - nodes in this community are weakly interconnected._