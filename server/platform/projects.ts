import { randomBytes } from "node:crypto";
import { newId } from "../lib/crypto.js";
import { starterFiles } from "../templates/starter.js";
import { one, platformDb, q } from "./db.js";
import { emitProject } from "./events.js";

export type FileMap = Record<string, string>;

/** Who made a change, shown in the checkpoint timeline. */
export type Author = "builder" | "owner" | "mcp" | "system" | "github";

export interface SeoSettings {
  siteName?: string;
  siteDescription?: string;
  robots?: boolean;
  sitemap?: boolean;
  /** Browser/OS chrome color for the installed app. */
  themeColor?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  slug: string | null;
  visibility: "public" | "private";
  aiEnabled: boolean;
  emailDomain: string | null;
  emailDomainVerified: boolean;
  publishedVersionId: string | null;
  publishedAt: string | null;
  favorite: boolean;
  archived: boolean;
  folderId: string | null;
  lastOpenedAt: string;
  systemPrompt: string;
  designPrompt: string;
  seo: SeoSettings;
  /** Bumped to revoke every preview and private-app link handed out so far. */
  shareEpoch: number;
  createdAt: string;
  updatedAt: string;
}

const PROJECT_COLS = `id, owner_id as "ownerId", name, description, slug, visibility, ai_enabled as "aiEnabled",
  email_domain as "emailDomain", email_domain_verified as "emailDomainVerified",
  published_version_id as "publishedVersionId", published_at as "publishedAt",
  favorite, archived, folder_id as "folderId", last_opened_at as "lastOpenedAt",
  system_prompt as "systemPrompt", design_prompt as "designPrompt", seo, share_epoch as "shareEpoch",
  created_at as "createdAt", updated_at as "updatedAt"`;

/** The only places a project file may live; mirrors the conventions the builder is taught. */
const ALLOWED = /^(pages|components|helpers|endpoints|jobs|static)\/[A-Za-z0-9_.$\-/[\]]+$|^base\.css$/;

/** Working notes the builder keeps for itself; never served or published. */
export const isDevFile = (path: string) => path.startsWith("static/__dev/");

export function assertValidPath(path: string) {
  if (!ALLOWED.test(path) || path.includes("..") || path.includes("//")) {
    throw new Error(`Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, static/ o base.css.`);
  }
}

export async function createProject(ownerId: string, name: string, description = "", files?: FileMap): Promise<Project> {
  // Lowercase hex: the id is also a hostname label (pv-<id>.localhost).
  const id = randomBytes(8).toString("hex");
  const db = await platformDb();
  await db.transaction(async (tx) => {
    await tx.query(`insert into projects (id, owner_id, name, description) values ($1, $2, $3, $4)`, [id, ownerId, name, description]);
    for (const [path, content] of Object.entries(files ?? starterFiles(name))) {
      await tx.query(`insert into project_files (project_id, path, content) values ($1, $2, $3)`, [id, path, content]);
    }
  });
  await createCheckpoint(id, "Proyecto creado", "system");
  // Create the app database now, so the first request does not pay for initializing it.
  void import("../baas/projectDb.js").then((m) => m.projectDb(id).one("select 1")).catch(() => {});
  return (await getProject(id))!;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return one<Project>(`select ${PROJECT_COLS} from projects where id = $1`, [id]);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return one<Project>(`select ${PROJECT_COLS} from projects where slug = $1`, [slug]);
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  return q<Project>(`select ${PROJECT_COLS} from projects where owner_id = $1 order by last_opened_at desc`, [ownerId]);
}

const PATCHABLE: Record<string, string> = {
  name: "name",
  description: "description",
  aiEnabled: "ai_enabled",
  visibility: "visibility",
  emailDomain: "email_domain",
  emailDomainVerified: "email_domain_verified",
  favorite: "favorite",
  archived: "archived",
  folderId: "folder_id",
  systemPrompt: "system_prompt",
  designPrompt: "design_prompt",
  seo: "seo",
};

export type ProjectPatch = Partial<Pick<Project, keyof typeof PATCHABLE & keyof Project>>;

export async function updateProject(id: string, patch: ProjectPatch) {
  const sets: string[] = [];
  const params: unknown[] = [id];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || !PATCHABLE[k]) continue;
    params.push(k === "seo" ? JSON.stringify(v) : v);
    sets.push(`${PATCHABLE[k]} = $${params.length}`);
  }
  if (sets.length) await q(`update projects set ${sets.join(", ")} where id = $1`, params);
}

export async function revokeShareLinks(id: string) {
  await q(`update projects set share_epoch = share_epoch + 1 where id = $1`, [id]);
}

export async function markOpened(id: string) {
  await q(`update projects set last_opened_at = now() where id = $1`, [id]);
}

export async function deleteProject(id: string) {
  await q(`delete from projects where id = $1`, [id]);
}

/** Copies code, settings and the app database; not published state, chat or uploaded files. */
export async function duplicateProject(ownerId: string, sourceId: string): Promise<Project> {
  const src = (await getProject(sourceId))!;
  const copy = await createProject(ownerId, `${src.name} (copia)`, src.description, await readAllFiles(sourceId));
  await updateProject(copy.id, { systemPrompt: src.systemPrompt, designPrompt: src.designPrompt, seo: src.seo, folderId: src.folderId });
  const { cloneDatabase } = await import("../baas/projectDb.js");
  await cloneDatabase(sourceId, copy.id);
  return (await getProject(copy.id))!;
}

// --- Folders ------------------------------------------------------------------

export async function listFolders(accountId: string) {
  return q<{ id: string; name: string }>(`select id, name from folders where account_id = $1 order by name`, [accountId]);
}

export async function createFolder(accountId: string, name: string) {
  const id = newId();
  await q(`insert into folders (id, account_id, name) values ($1, $2, $3)`, [id, accountId, name.trim().slice(0, 60) || "Carpeta"]);
  return id;
}

export async function deleteFolder(accountId: string, id: string) {
  await q(`delete from folders where account_id = $1 and id = $2`, [accountId, id]);
}

// --- Files ------------------------------------------------------------------

export async function readAllFiles(projectId: string): Promise<FileMap> {
  const rows = await q<{ path: string; content: string }>(`select path, content from project_files where project_id = $1 order by path`, [
    projectId,
  ]);
  return Object.fromEntries(rows.map((r) => [r.path, r.content]));
}

export async function listFiles(projectId: string) {
  return q<{ path: string; size: number; updatedAt: string }>(
    `select path, length(content) as size, updated_at as "updatedAt" from project_files where project_id = $1 order by path`,
    [projectId],
  );
}

export async function readFile(projectId: string, path: string): Promise<string | undefined> {
  return (await one<{ content: string }>(`select content from project_files where project_id = $1 and path = $2`, [projectId, path]))?.content;
}

async function logChange(
  projectId: string,
  change: { kind: string; paths: string[]; author: Author; before?: Record<string, string | null>; label?: string; description?: string; actor?: string },
) {
  await q(`insert into project_changes (project_id, kind, paths, author, label, description, before, actor) values ($1, $2, $3, $4, $5, $6, $7, $8)`, [
    projectId,
    change.kind,
    JSON.stringify(change.paths),
    change.author,
    change.label ?? null,
    change.description ?? null,
    JSON.stringify(change.before ?? {}),
    change.actor ?? null,
  ]);
}

/** `actor` is the email of the person behind the change, for the timeline. */
export async function writeFile(projectId: string, path: string, content: string, author: Author = "owner", actor?: string) {
  assertValidPath(path);
  const before = await readFile(projectId, path);
  if (before === content) return;
  await q(
    `insert into project_files (project_id, path, content) values ($1, $2, $3)
     on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`,
    [projectId, path, content],
  );
  await logChange(projectId, { kind: before === undefined ? "create" : "edit", paths: [path], author, actor, before: { [path]: before ?? null } });
  await touch(projectId, [path]);
}

export async function deleteFile(projectId: string, path: string, author: Author = "owner") {
  const before = await readFile(projectId, path);
  if (before === undefined) return;
  await q(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
  await logChange(projectId, { kind: "delete", paths: [path], author, before: { [path]: before } });
  await touch(projectId, [path]);
}

export async function renameFile(projectId: string, from: string, to: string, author: Author = "owner") {
  assertValidPath(to);
  const content = await readFile(projectId, from);
  if (content === undefined) throw new Error(`No existe ${from}`);
  const existing = await readFile(projectId, to);
  await q(`delete from project_files where project_id = $1 and path = $2`, [projectId, to]);
  await q(`update project_files set path = $3, updated_at = now() where project_id = $1 and path = $2`, [projectId, from, to]);
  await logChange(projectId, { kind: "rename", paths: [from, to], author, before: { [from]: content, [to]: existing ?? null } });
  await touch(projectId, [from, to]);
}

async function touch(projectId: string, paths: string[]) {
  await q(`update projects set updated_at = now() where id = $1`, [projectId]);
  emitProject(projectId, { type: "files", paths });
}

// --- Checkpoints: named points on the change timeline ------------------------------

export async function createCheckpoint(projectId: string, label: string, author: Author = "owner", description?: string, actor?: string) {
  await logChange(projectId, { kind: "checkpoint", paths: [], author, actor, label: label.slice(0, 120), description });
  return (await one<{ id: number }>(`select max(id) as id from project_changes where project_id = $1`, [projectId]))!.id;
}

export interface ChangeEntry {
  id: number;
  kind: string;
  paths: string[];
  author: Author;
  label: string | null;
  description: string | null;
  actor: string | null;
  createdAt: string;
}

export async function listChanges(projectId: string, limit = 300): Promise<ChangeEntry[]> {
  return q<ChangeEntry>(
    `select id, kind, paths, author, label, description, actor, created_at as "createdAt"
     from project_changes where project_id = $1 order by id desc limit $2`,
    [projectId, limit],
  );
}

/**
 * Puts every file back as it was right after change `changeId`, by undoing all newer
 * changes newest-first. The restore is itself logged, so it can be undone too. Code only:
 * the app's data is untouched.
 */
export async function restoreToChange(projectId: string, changeId: number, author: Author = "owner", actor?: string) {
  const target = await one<{ id: number; label: string | null; kind: string; created_at: string }>(
    `select id, label, kind, created_at from project_changes where project_id = $1 and id = $2`,
    [projectId, changeId],
  );
  if (!target) throw new Error("Punto de restauración no encontrado");
  const newer = await q<{ before: Record<string, string | null> }>(
    `select before from project_changes where project_id = $1 and id > $2 order by id desc`,
    [projectId, changeId],
  );
  const desired = new Map<string, string | null>();
  for (const c of newer) for (const [path, content] of Object.entries(c.before)) desired.set(path, content);
  if (!desired.size) return;

  const current = await readAllFiles(projectId);
  const undo: Record<string, string | null> = {};
  for (const path of desired.keys()) undo[path] = current[path] ?? null;
  const db = await platformDb();
  await db.transaction(async (tx) => {
    for (const [path, content] of desired) {
      if (content === null) await tx.query(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
      else
        await tx.query(
          `insert into project_files (project_id, path, content) values ($1, $2, $3)
           on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`,
          [projectId, path, content],
        );
    }
  });
  await logChange(projectId, {
    kind: "restore",
    paths: [...desired.keys()],
    author,
    actor,
    label: `Restaurado a ${target.label ?? `cambio #${target.id}`}`,
    before: undo,
  });
  await touch(projectId, [...desired.keys()]);
}

// --- Publishing ----------------------------------------------------------------

export async function publishedFiles(projectId: string): Promise<FileMap | undefined> {
  return (
    await one<{ files: FileMap }>(`select v.files from projects p join published_versions v on v.id = p.published_version_id where p.id = $1`, [
      projectId,
    ])
  )?.files;
}

export async function isSlugTaken(slug: string, projectId: string) {
  return !!(await one(`select 1 from projects where slug = $1 and id <> $2`, [slug, projectId]));
}

export async function recordPublish(projectId: string, slug: string, files: FileMap, author: Author = "owner") {
  const versionId = newId();
  const shipped = Object.fromEntries(Object.entries(files).filter(([p]) => !isDevFile(p)));
  await q(`insert into published_versions (id, project_id, files) values ($1, $2, $3)`, [versionId, projectId, JSON.stringify(shipped)]);
  await q(`update projects set slug = $2, published_version_id = $3, published_at = now() where id = $1`, [projectId, slug, versionId]);
  await logChange(projectId, { kind: "publish", paths: [], author, label: "App publicada" });
  emitProject(projectId, { type: "published", slug });
}

export async function unpublish(projectId: string) {
  await q(`update projects set slug = null, published_version_id = null, published_at = null where id = $1`, [projectId]);
}

/** True when the preview has changes the live app does not. Working notes don't count. */
export async function hasUnpublishedChanges(projectId: string): Promise<boolean> {
  const live = await publishedFiles(projectId);
  if (!live) return false;
  const current = await readAllFiles(projectId);
  const keys = new Set([...Object.keys(live), ...Object.keys(current)].filter((k) => !isDevFile(k)));
  for (const k of keys) if (live[k] !== current[k]) return true;
  return false;
}
