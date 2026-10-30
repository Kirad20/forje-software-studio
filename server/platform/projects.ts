import { randomBytes } from "node:crypto";
import { newId } from "../lib/crypto.js";
import { starterFiles } from "../templates/starter.js";
import { one, platformDb, q } from "./db.js";
import { emitProject } from "./events.js";

export type FileMap = Record<string, string>;

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
  createdAt: string;
  updatedAt: string;
}

const PROJECT_COLS = `id, owner_id as "ownerId", name, description, slug, visibility, ai_enabled as "aiEnabled",
  email_domain as "emailDomain", email_domain_verified as "emailDomainVerified",
  published_version_id as "publishedVersionId", published_at as "publishedAt",
  created_at as "createdAt", updated_at as "updatedAt"`;

/** The only places a project file may live; mirrors the conventions the builder is taught. */
const ALLOWED = /^(pages|components|helpers|endpoints|jobs|static)\/[A-Za-z0-9_.$\-/[\]]+$|^base\.css$/;

export function assertValidPath(path: string) {
  if (!ALLOWED.test(path) || path.includes("..") || path.includes("//")) {
    throw new Error(
      `Ruta no válida: "${path}". Usa pages/, components/, helpers/, endpoints/, jobs/, static/ o base.css.`,
    );
  }
}

export async function createProject(ownerId: string, name: string, description = ""): Promise<Project> {
  // Lowercase hex: the id is also a hostname label (pv-<id>.localhost).
  const id = randomBytes(8).toString("hex");
  const db = await platformDb();
  await db.transaction(async (tx) => {
    await tx.query(`insert into projects (id, owner_id, name, description) values ($1, $2, $3, $4)`, [
      id,
      ownerId,
      name,
      description,
    ]);
    for (const [path, content] of Object.entries(starterFiles(name))) {
      await tx.query(`insert into project_files (project_id, path, content) values ($1, $2, $3)`, [id, path, content]);
    }
  });
  await createCheckpoint(id, "Proyecto creado");
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
  return q<Project>(`select ${PROJECT_COLS} from projects where owner_id = $1 order by updated_at desc`, [ownerId]);
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "description" | "aiEnabled" | "visibility" | "emailDomain" | "emailDomainVerified">>,
) {
  const cols: Record<string, string> = {
    name: "name",
    description: "description",
    aiEnabled: "ai_enabled",
    visibility: "visibility",
    emailDomain: "email_domain",
    emailDomainVerified: "email_domain_verified",
  };
  const sets: string[] = [];
  const params: unknown[] = [id];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || !cols[k]) continue;
    params.push(v);
    sets.push(`${cols[k]} = $${params.length}`);
  }
  if (sets.length) await q(`update projects set ${sets.join(", ")}, updated_at = now() where id = $1`, params);
}

export async function deleteProject(id: string) {
  await q(`delete from projects where id = $1`, [id]);
}

// --- Files ------------------------------------------------------------------

export async function readAllFiles(projectId: string): Promise<FileMap> {
  const rows = await q<{ path: string; content: string }>(
    `select path, content from project_files where project_id = $1 order by path`,
    [projectId],
  );
  return Object.fromEntries(rows.map((r) => [r.path, r.content]));
}

export async function listFiles(projectId: string) {
  return q<{ path: string; size: number; updatedAt: string }>(
    `select path, length(content) as size, updated_at as "updatedAt" from project_files where project_id = $1 order by path`,
    [projectId],
  );
}

export async function readFile(projectId: string, path: string): Promise<string | undefined> {
  return (await one<{ content: string }>(`select content from project_files where project_id = $1 and path = $2`, [projectId, path]))
    ?.content;
}

export async function writeFile(projectId: string, path: string, content: string) {
  assertValidPath(path);
  await q(
    `insert into project_files (project_id, path, content) values ($1, $2, $3)
     on conflict (project_id, path) do update set content = excluded.content, updated_at = now()`,
    [projectId, path, content],
  );
  await touch(projectId, [path]);
}

export async function deleteFile(projectId: string, path: string) {
  await q(`delete from project_files where project_id = $1 and path = $2`, [projectId, path]);
  await touch(projectId, [path]);
}

export async function renameFile(projectId: string, from: string, to: string) {
  assertValidPath(to);
  await q(`update project_files set path = $3, updated_at = now() where project_id = $1 and path = $2`, [projectId, from, to]);
  await touch(projectId, [from, to]);
}

async function touch(projectId: string, paths: string[]) {
  await q(`update projects set updated_at = now() where id = $1`, [projectId]);
  emitProject(projectId, { type: "files", paths });
}

// --- Checkpoints -----------------------------------------------------------------

export async function createCheckpoint(projectId: string, label: string) {
  const id = newId();
  await q(`insert into checkpoints (id, project_id, label, files) values ($1, $2, $3, $4)`, [
    id,
    projectId,
    label,
    JSON.stringify(await readAllFiles(projectId)),
  ]);
  return id;
}

export async function listCheckpoints(projectId: string) {
  return q(
    `select id, label, created_at as "createdAt", (select count(*) from jsonb_object_keys(files))::int as "fileCount"
     from checkpoints where project_id = $1 order by created_at desc limit 100`,
    [projectId],
  );
}

/** Restoring rewrites the code only; the app's data is untouched, as in a real undo of code. */
export async function restoreCheckpoint(projectId: string, checkpointId: string) {
  const cp = await one<{ files: FileMap; label: string }>(`select files, label from checkpoints where id = $1 and project_id = $2`, [
    checkpointId,
    projectId,
  ]);
  if (!cp) throw new Error("Checkpoint no encontrado");
  await createCheckpoint(projectId, "Antes de restaurar");
  const db = await platformDb();
  await db.transaction(async (tx) => {
    await tx.query(`delete from project_files where project_id = $1`, [projectId]);
    for (const [path, content] of Object.entries(cp.files)) {
      await tx.query(`insert into project_files (project_id, path, content) values ($1, $2, $3)`, [projectId, path, content]);
    }
  });
  await touch(projectId, Object.keys(cp.files));
}

// --- Publishing ----------------------------------------------------------------

export async function publishedFiles(projectId: string): Promise<FileMap | undefined> {
  return (
    await one<{ files: FileMap }>(
      `select v.files from projects p join published_versions v on v.id = p.published_version_id where p.id = $1`,
      [projectId],
    )
  )?.files;
}

export async function isSlugTaken(slug: string, projectId: string) {
  return !!(await one(`select 1 from projects where slug = $1 and id <> $2`, [slug, projectId]));
}

export async function recordPublish(projectId: string, slug: string, files: FileMap) {
  const versionId = newId();
  await q(`insert into published_versions (id, project_id, files) values ($1, $2, $3)`, [versionId, projectId, JSON.stringify(files)]);
  await q(`update projects set slug = $2, published_version_id = $3, published_at = now() where id = $1`, [
    projectId,
    slug,
    versionId,
  ]);
  emitProject(projectId, { type: "published", slug });
}

export async function unpublish(projectId: string) {
  await q(`update projects set slug = null, published_version_id = null, published_at = null where id = $1`, [projectId]);
}

/** True when the preview has changes the live app does not. */
export async function hasUnpublishedChanges(projectId: string): Promise<boolean> {
  const live = await publishedFiles(projectId);
  if (!live) return false;
  const current = await readAllFiles(projectId);
  const keys = new Set([...Object.keys(live), ...Object.keys(current)]);
  for (const k of keys) if (live[k] !== current[k]) return true;
  return false;
}
