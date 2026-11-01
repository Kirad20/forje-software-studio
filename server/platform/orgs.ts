import { newId } from "../lib/crypto.js";
import { one, q } from "./db.js";

/**
 * Organizations are the tenant boundary. Every account has a personal organization (created with it),
 * and can create or be added to team organizations. Projects belong to one organization; its members
 * reach them. Platform admins manage accounts, never other tenants' projects.
 */
export type OrgRole = "owner" | "admin" | "member";
export const ORG_ROLES: OrgRole[] = ["owner", "admin", "member"];

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  personal: boolean;
  role: OrgRole;
}

export const personalOrgId = (accountId: string) => `personal_${accountId}`;

/** Runs on any query handle (the pool or a transaction). */
type Query = { query: (sql: string, params?: unknown[]) => Promise<unknown> };

export async function createPersonalOrg(db: Query, accountId: string, name: string) {
  await db.query(`insert into organizations (id, name, personal) values ($1, $2, true) on conflict do nothing`, [personalOrgId(accountId), name]);
  await db.query(`insert into org_members (org_id, account_id, role) values ($1, $2, 'owner') on conflict do nothing`, [personalOrgId(accountId), accountId]);
}

/** Safety net for accounts created by older code paths: makes sure the personal organization exists. */
export async function ensurePersonalOrg(db: Query, accountId: string) {
  await db.query(
    `insert into organizations (id, name, personal) select $1, coalesce(nullif(name, ''), split_part(email, '@', 1)), true from accounts where id = $2 on conflict do nothing`,
    [personalOrgId(accountId), accountId],
  );
  await db.query(`insert into org_members (org_id, account_id, role) select $1, id, 'owner' from accounts where id = $2 on conflict do nothing`, [
    personalOrgId(accountId),
    accountId,
  ]);
}

export const listOrgs = (accountId: string) =>
  q<Org>(
    `select o.id, o.name, o.slug, o.personal, m.role from org_members m join organizations o on o.id = m.org_id
     where m.account_id = $1 order by o.personal desc, o.name`,
    [accountId],
  );

export async function orgRoleOf(orgId: string | null | undefined, accountId: string): Promise<OrgRole | null> {
  if (!orgId) return null;
  return (await one<{ role: OrgRole }>(`select role from org_members where org_id = $1 and account_id = $2`, [orgId, accountId]))?.role ?? null;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

export async function createOrg(accountId: string, rawName: string): Promise<Org> {
  const name = rawName.trim().slice(0, 60);
  if (name.length < 2) throw new Error("Ponle un nombre a la organización");
  const base = slugify(name) || "org";
  let slug = base;
  for (let i = 2; await one(`select 1 from organizations where slug = $1`, [slug]); i++) slug = `${base}-${i}`;
  const id = newId();
  await q(`insert into organizations (id, name, slug) values ($1, $2, $3)`, [id, name, slug]);
  await q(`insert into org_members (org_id, account_id, role) values ($1, $2, 'owner')`, [id, accountId]);
  return { id, name, slug, personal: false, role: "owner" };
}

export const listOrgMembers = (orgId: string) =>
  q<{ accountId: string; email: string; name: string | null; role: OrgRole; createdAt: string }>(
    `select m.account_id as "accountId", a.email, a.name, m.role, m.created_at as "createdAt"
     from org_members m join accounts a on a.id = m.account_id where m.org_id = $1 order by m.created_at`,
    [orgId],
  );

async function ownerCount(orgId: string) {
  return (await one<{ n: number }>(`select count(*)::int as n from org_members where org_id = $1 and role = 'owner'`, [orgId]))!.n;
}

/** Only owners may hand out ownership or touch other owners; admins manage plain members. */
function assertCanManage(actor: OrgRole, target: OrgRole | null, newRole?: OrgRole) {
  if (actor === "member") throw new Error("Solo propietarios y administradores gestionan miembros.");
  if (actor === "admin" && (target === "owner" || newRole === "owner")) throw new Error("Solo un propietario puede gestionar propietarios.");
}

/** Adds an existing account. People without an account are invited per project (project_invites) for now. */
export async function addOrgMember(orgId: string, actorRole: OrgRole, email: string, role: OrgRole) {
  if (!ORG_ROLES.includes(role)) throw new Error("Rol no válido");
  assertCanManage(actorRole, null, role);
  const org = await one<{ personal: boolean }>(`select personal from organizations where id = $1`, [orgId]);
  if (org?.personal) throw new Error("Una organización personal no admite miembros. Crea una organización de equipo.");
  const account = await one<{ id: string }>(`select id from accounts where email = $1 and not disabled`, [email.trim().toLowerCase()]);
  if (!account) throw new Error("Esa persona aún no tiene cuenta en Forja. Pídele que entre una vez con su correo.");
  await q(`insert into org_members (org_id, account_id, role) values ($1, $2, $3) on conflict (org_id, account_id) do update set role = excluded.role`, [
    orgId,
    account.id,
    role,
  ]);
}

export async function setOrgMemberRole(orgId: string, actorRole: OrgRole, accountId: string, role: OrgRole) {
  if (!ORG_ROLES.includes(role)) throw new Error("Rol no válido");
  const current = await orgRoleOf(orgId, accountId);
  if (!current) throw new Error("Esa persona no es miembro");
  assertCanManage(actorRole, current, role);
  if (current === "owner" && role !== "owner" && (await ownerCount(orgId)) <= 1) throw new Error("La organización necesita al menos un propietario.");
  await q(`update org_members set role = $3 where org_id = $1 and account_id = $2`, [orgId, accountId, role]);
}

export async function removeOrgMember(orgId: string, actorRole: OrgRole, actorId: string, accountId: string) {
  const current = await orgRoleOf(orgId, accountId);
  if (!current) return;
  if (accountId !== actorId) assertCanManage(actorRole, current);
  if (current === "owner" && (await ownerCount(orgId)) <= 1) throw new Error("La organización necesita al menos un propietario.");
  await q(`delete from org_members where org_id = $1 and account_id = $2`, [orgId, accountId]);
}
