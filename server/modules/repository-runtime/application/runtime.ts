import { inferRepositoryConfig, RepositoryRuntimeError, validateRepositoryConfig, type RepositoryDeployment, type RepositoryEnvironment, type RepositorySnapshot, type RepositoryState } from "../domain/repository.js";
import type { RepositoryRuntimePorts } from "../ports/runtime.js";

export function createRepositoryEngine(ports: RepositoryRuntimePorts) {
  const locks = new Set<string>();
  let activeBuilds = 0;
  async function locked<T>(id: string, work: () => Promise<T>): Promise<T> {
    if (locks.has(id)) throw new RepositoryRuntimeError("Repository operation already in progress", 409);
    locks.add(id);
    try { return await ports.store.exclusive(id, work); } finally { locks.delete(id); }
  }
  async function state(id: string): Promise<RepositoryState> {
    return await ports.store.load(id) ?? {
      config: inferRepositoryConfig(await ports.readAllFiles(id)), status: "idle", error: null,
      revisions: [], deployments: {}, slug: null, logs: "",
    };
  }
  async function available() {
    if (!await ports.runner.available()) throw new RepositoryRuntimeError(ports.runner.unavailableReason ?? "Repository Docker runner is disabled or unavailable", 503);
  }
  function snapshot(s: RepositoryState, enabled: boolean): RepositorySnapshot {
    const revisions = s.revisions.map(({ files: _files, config: _config, ...revision }) => revision);
    const revision = (env: RepositoryEnvironment) => revisions.find((r) => r.id === s.deployments[env]?.revisionId) ?? null;
    return { available: enabled, config: s.config, status: s.status, error: s.error ?? (!enabled ? ports.runner.unavailableReason ?? null : null), preview: revision("preview"), published: revision("published"), revisions, logs: s.logs };
  }
  async function get(id: string) { return snapshot(await state(id), await ports.runner.available()); }
  async function configure(id: string, patch: Partial<RepositoryState["config"]>) {
    return locked(id, async () => {
      const s = await state(id);
      s.config = validateRepositoryConfig({ ...s.config, ...patch });
      await ports.store.save(id, s);
      return snapshot(s, await ports.runner.available());
    });
  }
  async function deploy(id: string, s: RepositoryState, env: RepositoryEnvironment, revision: RepositoryState["revisions"][number], url: string) {
    const candidate = { ...await ports.runner.deploy(id, env, revision, revision.config, url), revisionId: revision.id, publicUrl: url, projectId: id, environment: env };
    try {
      if (!await ports.runner.healthy(candidate, revision.config)) {
        let detail: string;
        try { detail = await ports.runner.logs(candidate, id, env); } catch (error) { detail = `Container diagnostics unavailable: ${error instanceof Error ? error.message : "unknown error"}`; }
        throw new RepositoryRuntimeError(`Application health check failed\n${detail.slice(-4000)}`, 422);
      }
      return candidate;
    } catch (error) {
      await ports.runner.stop(id, env, candidate);
      if (!s.deployments[env]) await ports.runner.stop(id, env);
      throw error;
    }
  }
  function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Repository runtime failed"; }
  async function build(id: string) {
    if (activeBuilds >= 2) throw new RepositoryRuntimeError("Repository build capacity reached; try again later", 409);
    activeBuilds++;
    try { return ports.store.buildSlot ? await ports.store.buildSlot(() => buildLocked(id)) : await buildLocked(id); }
    finally { activeBuilds--; }
  }
  async function buildLocked(id: string) {
    return locked(id, async () => {
      await available();
      const s = await state(id);
      if (s.revisions.length >= 20) throw new RepositoryRuntimeError("Repository revision retention limit reached (20); delete this runtime/project before importing again", 409);
      const files = { ...await ports.readAllFiles(id) };
      const config = validateRepositoryConfig(s.config);
      const revision = { id: ports.id(), image: "", createdAt: ports.now(), status: "ready" as "ready" | "failed", error: null as string | null, files, config };
      s.status = "building"; s.error = null; s.logs = "";
      await ports.store.save(id, s);
      let candidate: RepositoryDeployment | undefined;
      let committed: RepositoryState | undefined;
      try {
        revision.image = await ports.runner.build(id, revision.id, files, config, (text) => { s.logs = (s.logs + text).slice(-65536); });
        candidate = await deploy(id, s, "preview", revision, ports.previewUrl(id));
        const old = s.deployments.preview;
        const next: RepositoryState = { ...s, revisions: [...s.revisions, revision], deployments: { ...s.deployments, preview: candidate }, status: "ready" };
        await ports.store.save(id, next);
        committed = next;
        if (old) await ports.runner.stop(id, "preview", old);
        return snapshot(next, true);
      } catch (error) {
        if (committed) {
          committed.error = `Healthy preview retained; previous container cleanup failed: ${errorMessage(error)}`;
          await ports.store.save(id, committed);
          throw new RepositoryRuntimeError(committed.error, 422);
        }
        if (candidate) await ports.runner.stop(id, "preview", candidate);
        if (!s.deployments.preview) await ports.runner.stop(id, "preview");
        revision.status = "failed"; revision.error = errorMessage(error);
        if (!s.revisions.some((r) => r.id === revision.id)) s.revisions.push(revision);
        s.status = "failed"; s.error = revision.error;
        await ports.store.save(id, s);
        throw error instanceof RepositoryRuntimeError ? error : new RepositoryRuntimeError(revision.error, 422);
      }
    });
  }
  async function publish(id: string, input: { slug: string; revisionId?: string }, author?: Parameters<RepositoryRuntimePorts["recordPublish"]>[3]) {
    return locked(id, async () => {
      await available();
      if (!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(input.slug) || input.slug === "preview" || input.slug === "studio") throw new RepositoryRuntimeError("Invalid publication slug", 400);
      if (await ports.isSlugTaken(input.slug, id)) throw new RepositoryRuntimeError("Publication slug is already taken", 409);
      const s = await state(id);
      const revisionId = input.revisionId ?? s.deployments.preview?.revisionId;
      const revision = s.revisions.find((r) => r.id === revisionId && r.status === "ready");
      if (!revision) throw new RepositoryRuntimeError("Build a healthy repository revision before publishing", 409);
      let candidate: RepositoryDeployment | undefined;
      let committed: RepositoryState | undefined;
      try {
        candidate = await deploy(id, s, "published", revision, ports.appUrl(input.slug));
        const old = s.deployments.published;
        const next: RepositoryState = { ...s, deployments: { ...s.deployments, published: candidate }, slug: input.slug, status: "ready", error: null };
        await ports.store.save(id, next);
        await ports.recordPublish(id, input.slug, revision.files, author);
        committed = next;
        if (old) await ports.runner.stop(id, "published", old);
        return snapshot(next, true);
      } catch (error) {
        if (committed) {
          committed.error = `Healthy publication retained; previous container cleanup failed: ${errorMessage(error)}`;
          await ports.store.save(id, committed);
          throw new RepositoryRuntimeError(committed.error, 422);
        }
        if (candidate) await ports.runner.stop(id, "published", candidate);
        if (!s.deployments.published) await ports.runner.stop(id, "published");
        s.error = "Publication failed; published diagnostics are restricted to the project owner";
        await ports.store.save(id, s);
        throw error instanceof RepositoryRuntimeError ? error : new RepositoryRuntimeError(errorMessage(error), 422);
      }
    });
  }
  async function rollback(id: string, revisionId: string) {
    const s = await state(id);
    if (!s.slug) throw new RepositoryRuntimeError("No publication to roll back", 409);
    return publish(id, { slug: s.slug, revisionId });
  }
  async function stop(id: string, env: RepositoryEnvironment) {
    return locked(id, async () => {
      await available();
      const s = await state(id);
      await ports.runner.stop(id, env);
      delete s.deployments[env];
      if (!s.deployments.preview && !s.deployments.published) s.status = "idle";
      await ports.store.save(id, s);
      return snapshot(s, true);
    });
  }
  async function logs(id: string, env: RepositoryEnvironment = "preview") {
    const s = await state(id);
    const deployment = s.deployments[env];
    if (!deployment) return s.logs;
    await available();
    return (s.logs + "\n" + await ports.runner.logs(deployment, id, env)).slice(-65536);
  }
  async function serve(request: Request, id: string, env: RepositoryEnvironment) {
    const s = await state(id);
    if (!s.deployments[env]) return new Response("Repository application is not running", { status: 503 });
    return ports.proxy(request, scopedDeployment(id, s, env), env);
  }
  function scopedDeployment(id: string, s: RepositoryState, env: RepositoryEnvironment): RepositoryDeployment {
    const deployment = s.deployments[env]!;
    return { ...deployment, projectId: id, environment: env, publicUrl: deployment.publicUrl ?? (env === "preview" ? ports.previewUrl(id) : s.slug ? ports.appUrl(s.slug) : undefined) };
  }
  async function deployment(id: string, env: RepositoryEnvironment) {
    const s = await state(id);
    if (!s.deployments[env]) throw new RepositoryRuntimeError("Repository application is not running", 503);
    return scopedDeployment(id, s, env);
  }
  async function reconcile() {
    if (!await ports.runner.available()) return;
    for (const id of await ports.store.list()) {
      await locked(id, async () => {
        const s = await state(id);
        if (s.status === "building") { s.status = "failed"; s.error = "Build interrupted by platform restart"; }
        for (const env of ["preview", "published"] as const) {
          const deployment = s.deployments[env];
          if (deployment && !await ports.runner.healthy(deployment, s.revisions.find((r) => r.id === deployment.revisionId)?.config ?? s.config)) {
            await ports.runner.stop(id, env, deployment);
            delete s.deployments[env];
            s.status = "failed"; s.error = `${env} deployment unavailable after restart`;
          }
        }
        await ports.store.save(id, s);
        await ports.runner.cleanup?.(id, Object.values(s.deployments).map((d) => d.container));
      });
    }
  }
  async function remove(id: string) {
    return locked(id, async () => {
      const s = await state(id);
      if (s.revisions.length || Object.keys(s.deployments).length) await available();
      await ports.runner.remove(id, s.revisions.map((r) => r.image).filter(Boolean));
      await ports.store.delete(id);
    });
  }
  return { get, configure, build, publish, rollback, stop, logs, serve, deployment, reconcile, remove };
}
