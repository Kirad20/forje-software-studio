import { config } from "../shared/config.js";
import { newId, newToken, numericCode, sha256 } from "../shared/crypto.js";
import { platformDb } from "../shared/database/index.js";
import {
  BcryptArgonPasswordHasher,
  NodeBootstrapCrypto,
  PlatformMailerService,
  PostgresAccountLifecycleRepository,
  PostgresAccountRepository,
  PostgresApiTokenRepository,
  PostgresLoginCodeRepository,
  PostgresPasswordResetRepository,
  PostgresSessionRepository,
  createIdentityModule,
} from "../modules/identity/index.js";
import {
  OrganizationSkillsService,
  PlatformCollaborationMailerService,
  PostgresCollaborationAccountRepository,
  PostgresMemberRepository,
  PostgresOrganizationRepository,
  PostgresOrganizationSkillsRepository,
  PostgresPersonalOrganizationRepository,
  createCollaborationModule,
} from "../modules/collaboration/index.js";
import { PostgresProjectsStore, createProjectsModule, type ProjectServices } from "../modules/projects/index.js";
import {
  PlatformSettingsRegistryAdapter,
  PostgresPlatformSettingsStoreAdapter,
  createPlatformSettings,
  createSettingsModule,
} from "../modules/settings/index.js";
import path from "node:path";
import { createRepositoryRuntime, DockerRepositoryRunner, PostgresRepositoryStore } from "../modules/repository-runtime/index.js";
import { appUrl, previewOrigin } from "../modules/app-runtime/index.js";
import { studioOrigins } from "../shared/security.js";

export interface CoreModulesDependencies {
  projectServices: ProjectServices;
  sendPlatformEmail(to: string, subject: string, html: string): Promise<boolean>;
  findSecret(text: string): string | null;
}

import { createProjectKnowledgeModule } from "../modules/project-knowledge/index.js";

export function createCoreModules(dependencies: CoreModulesDependencies) {
  const memberRepository = new PostgresMemberRepository();
  const collaborationAccountRepository = new PostgresCollaborationAccountRepository();
  const organizationRepository = new PostgresOrganizationRepository();
  const personalOrganizations = new PostgresPersonalOrganizationRepository();

  const collaboration = createCollaborationModule({
    members: memberRepository,
    accounts: collaborationAccountRepository,
    mailer: new PlatformCollaborationMailerService(dependencies.sendPlatformEmail, config.publicUrl),
    organizations: organizationRepository,
    organizationQueries: organizationRepository,
    organizationNames: organizationRepository,
    memberQueries: memberRepository,
    personalOrganizations,
    personalOrganizationsForTransaction: (tx) => new PostgresPersonalOrganizationRepository(tx),
    id: newId,
    skills: new OrganizationSkillsService(
      new PostgresOrganizationSkillsRepository(),
      { findSecret: dependencies.findSecret },
    ),
  });

  const projectsStore = new PostgresProjectsStore(
    platformDb,
    {
      ensurePersonalOrg: (tx, accountId) => collaboration.ensurePersonalOrg(tx, accountId),
      personalOrgId: collaboration.personalOrgId,
    },
    dependencies.projectServices,
  );
  const projects = createProjectsModule({
    store: projectsStore,
    files: projectsStore,
    services: dependencies.projectServices,
  });
  const repositoryStore = new PostgresRepositoryStore();
  const repositoryRuntime = createRepositoryRuntime({
    store: repositoryStore,
    runner: new DockerRepositoryRunner({
      enabled: process.env.FORJA_REPOSITORY_RUNNER === "docker",
      unavailableReason: process.env.FORJA_REPOSITORY_RUNNER === "docker" && !process.env.SECRETS_KEY
        ? "Repository runner requires a stable SECRETS_KEY; encrypted deployment credentials must survive restarts"
        : undefined,
      contextRoot: path.join(config.dataDir, "repository-contexts"),
      host: process.env.FORJA_REPOSITORY_RUNNER_HOST,
      environmentSecret: (id, env) => repositoryStore.environmentSecret(id, env),
    }),
    readAllFiles: projects.readAllFiles,
    recordPublish: (id, slug, files, author = "owner") => projects.recordPublish(id, slug, files, author),
    isSlugTaken: projects.isSlugTaken,
    appUrl,
    previewUrl: previewOrigin,
    previewFrameOrigins: studioOrigins(),
  });

  const accountRepository = new PostgresAccountRepository();
  const sessionRepository = new PostgresSessionRepository();
  const passwordHasher = new BcryptArgonPasswordHasher();
  const mailer = new PlatformMailerService(dependencies.sendPlatformEmail);
  const lifecycleRepository = new PostgresAccountLifecycleRepository(
    (tx, id, name) => collaboration.createPersonalOrg(tx, id, name),
  );
  const settingsService = createPlatformSettings();
  const settings = createSettingsModule({
    service: settingsService,
    registry: new PlatformSettingsRegistryAdapter(),
    store: new PostgresPlatformSettingsStoreAdapter(settingsService),
  });
  const identity = createIdentityModule({
    accounts: {
      accounts: lifecycleRepository,
      sessions: sessionRepository,
      resets: new PostgresPasswordResetRepository(),
      tokens: new PostgresApiTokenRepository(collaboration.organizationNames),
      hasher: passwordHasher,
      random: { id: newId, token: newToken, code: numericCode, hash: sha256 },
      mailer,
      collaboration: {
        hasInvite: collaboration.hasProjectInvite,
        deletePersonalOrg: collaboration.deletePersonalOrg,
      },
      projects: { ownedProjectIds: projects.listAccountOwnedProjectIds },
      policy: {
        get signup() { return config.signup; },
        get freeCredits() { return config.freeCredits; },
      },
      audit: settings.audit,
    },
    accountRepository,
    loginCodes: new PostgresLoginCodeRepository(),
    bootstrapCrypto: new NodeBootstrapCrypto(),
    bootstrapPolicy: { bootstrapToken: config.bootstrapToken, publicUrl: config.publicUrl },
    claimInvites: async (accountId, email) => {
      await collaboration.claimInvites(accountId, email);
    },
  });

  const knowledge = createProjectKnowledgeModule(projects, dependencies.findSecret);
  return { identity, collaboration, projects, settings, knowledge, repositoryRuntime };
}
