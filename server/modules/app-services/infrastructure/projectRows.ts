import { projectDb } from "./projectDb.js";
import { one } from "../../../shared/database/index.js";
import type { ProjectRowsPort } from "../ports/projectData.js";
import type { ProjectDb } from "../ports/database.js";
const quoteIdent = (value: string) => `"${value.replaceAll('"', '""')}"`;
export function createProjectRowsRepository(database: (projectId: string) => ProjectDb, platformOne: typeof one): ProjectRowsPort {
  return {
    async primaryKeys(projectId, table) {
      const rows = await database(projectId).query<{ column_name: string }>(
        `select kcu.column_name from information_schema.table_constraints tc
         join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema and kcu.table_name = tc.table_name
         where tc.table_schema = 'public' and tc.table_name = $1 and tc.constraint_type = 'PRIMARY KEY' order by kcu.ordinal_position`, [table]);
      return rows.map((row) => row.column_name);
    },
    async read(projectId, table, columns, primaryKey, limit, offset, search) {
      const db = database(projectId);
      const where = search ? `where ${columns.map((column) => `${quoteIdent(column)}::text ilike $3`).join(" or ")}` : "";
      const order = primaryKey ? `order by ${quoteIdent(primaryKey)}` : "";
      const rows = await db.query(`select * from ${quoteIdent(table)} ${where} ${order} limit $1 offset $2`, search ? [limit, offset, `%${search}%`] : [limit, offset]);
      const total = (await db.one<{ n: number }>(`select count(*)::int as n from ${quoteIdent(table)} ${where.replace(/\$3/g, "$1")}`, search ? [`%${search}%`] : []))!.n;
      return { rows, total };
    },
    create(projectId, table, entries) {
      const sql = entries.length
        ? `insert into ${quoteIdent(table)} (${entries.map(([column]) => quoteIdent(column)).join(", ")}) values (${entries.map((_, index) => `$${index + 1}`).join(", ")}) returning *`
        : `insert into ${quoteIdent(table)} default values returning *`;
      return database(projectId).one(sql, entries.map(([, value]) => value));
    },
    async delete(projectId, table, primaryKey, keys) {
      return (await database(projectId).query(`delete from ${quoteIdent(table)} where ${quoteIdent(primaryKey)}::text = any($1::text[]) returning 1`, [keys])).length;
    },
    users(projectId) {
      return database(projectId).query(`select id, email, name, role, password_hash is not null as "hasPassword", created_at as "createdAt" from _forja_users order by created_at desc limit 500`);
    },
    async counts(projectId) {
      const users = await database(projectId).one<{ n: number }>(`select count(*)::int as n from _forja_users`);
      const stats = await platformOne<{ ai: number; storage: number; email: number; creditsUsed: number }>(
        `select (select count(*)::int from ai_usage where project_id = $1) as ai,
          (select count(*)::int from storage_objects where project_id = $1) as storage,
          (select count(*)::int from emails where project_id = $1) as email,
          (select coalesce(sum(credits), 0)::int from ai_usage where project_id = $1) as "creditsUsed"`, [projectId]);
      return { users: users?.n ?? 0, ai: stats?.ai ?? 0, storage: stats?.storage ?? 0, email: stats?.email ?? 0, creditsUsed: stats?.creditsUsed ?? 0 };
    },
  };
}
export const projectRowsRepository = createProjectRowsRepository(projectDb, one);
