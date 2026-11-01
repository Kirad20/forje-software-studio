import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "../../config.js";
import { createAccount, setPassword } from "../../platform/accounts.js";
import { one, q } from "../../platform/db.js";
import { addOrgMember, createOrg } from "../../platform/orgs.js";
import { createProject } from "../../platform/projects.js";

/**
 * Development data (npm run db:seed:dev): the accounts, organization and projects of
 * dev.fixture.json, with known passwords. Idempotent: what already exists is left as it is.
 * Refuses to run with NODE_ENV=production.
 */
interface Fixture {
  accounts: { email: string; name: string; password: string; platformRole: "admin" | "user"; credits: number }[];
  orgs: { name: string; owner: string; members: { email: string; role: "owner" | "admin" | "member" }[] }[];
  projects: { name: string; owner: string; org?: string; description?: string }[];
}

export const DEV_FIXTURE = path.join(ROOT_DIR, "server", "db", "seeds", "dev.fixture.json");

export async function seedDev(file = DEV_FIXTURE): Promise<string[]> {
  if (process.env.NODE_ENV === "production") throw new Error("db:seed:dev no corre con NODE_ENV=production: crea cuentas con contraseñas conocidas.");
  const fx = JSON.parse(readFileSync(file, "utf8")) as Fixture;
  const done: string[] = [];
  const idOf = async (email: string) => (await one<{ id: string }>(`select id from accounts where email = $1`, [email]))?.id;

  // Admins first: createAccount only makes an admin while there are no accounts at all.
  for (const a of [...fx.accounts].sort((x, y) => (x.platformRole === "admin" ? -1 : 0) - (y.platformRole === "admin" ? -1 : 0))) {
    if (await idOf(a.email)) continue;
    const anyAccount = !!(await one(`select 1 from accounts limit 1`));
    const id = await createAccount(a.email, a.name, null, anyAccount ? "user" : "admin");
    await setPassword(id, a.password);
    await q(`update accounts set platform_role = $2, credits = $3 where id = $1`, [id, a.platformRole, a.credits]);
    done.push(`cuenta ${a.email}`);
  }

  for (const o of fx.orgs) {
    const owner = (await idOf(o.owner))!;
    let org = await one<{ id: string }>(`select o.id from organizations o join org_members m on m.org_id = o.id where o.name = $1 and m.account_id = $2 and not o.personal`, [o.name, owner]);
    if (!org) {
      org = await createOrg(owner, o.name);
      done.push(`organización ${o.name}`);
    }
    for (const m of o.members) {
      if (await one(`select 1 from org_members where org_id = $1 and account_id = $2`, [org.id, await idOf(m.email)])) continue;
      await addOrgMember(org.id, "owner", m.email, m.role);
    }
  }

  for (const p of fx.projects) {
    const owner = (await idOf(p.owner))!;
    if (await one(`select 1 from projects where owner_id = $1 and name = $2`, [owner, p.name])) continue;
    const orgId = p.org ? (await one<{ id: string }>(`select id from organizations where name = $1 and not personal`, [p.org]))?.id : undefined;
    await createProject(owner, p.name, p.description ?? "", undefined, orgId);
    done.push(`proyecto ${p.name}`);
  }
  return done;
}
