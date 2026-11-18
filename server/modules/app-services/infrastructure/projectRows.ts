import { projectDb } from "./projectDb.js";
import { one } from "../../../shared/database/index.js";
import type { ProjectRowsPort } from "../ports/projectData.js";
import type { ProjectDb } from "../ports/database.js";
import type { AppEnv } from "../domain/contracts.js";
const quoteIdent = (value: string) => `"${value.replaceAll('"', '""')}"`;
/** `orders.items` (a forja.json component schema) or a bare public table. */
const splitTable = (table: string): [string, string] => {
  const dot = table.indexOf(".");
  return dot > 0 ? [table.slice(0, dot), table.slice(dot + 1)] : ["public", table];
};
const quoteTable = (table: string) => {
  const [schema, name] = splitTable(table);
  return schema === "public" ? quoteIdent(name) : `${quoteIdent(schema)}.${quoteIdent(name)}`;
};
export function createProjectRowsRepository(database: (projectId: string, env?: AppEnv) => ProjectDb, platformOne: typeof one): ProjectRowsPort {
  return {
    async primaryKeys(projectId, table, env = "preview") {
      const rows = await database(projectId, env).query<{ column_name: string }>(
        `select kcu.column_name from information_schema.table_constraints tc
         join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema and kcu.table_name = tc.table_name
         where tc.table_schema = $2 and tc.table_name = $1 and tc.constraint_type = 'PRIMARY KEY' order by kcu.ordinal_position`, [splitTable(table)[1], splitTable(table)[0]]);
      return rows.map((row) => row.column_name);
    },
    async read(projectId, table, columns, primaryKey, limit, offset, search, env = "preview") {
      const db = database(projectId, env);
      const where = search ? `where ${columns.map((column) => `${quoteIdent(column)}::text ilike $3`).join(" or ")}` : "";
      const order = primaryKey ? `order by ${quoteIdent(primaryKey)}` : "";
      const rows = await db.query(`select * from ${quoteTable(table)} ${where} ${order} limit $1 offset $2`, search ? [limit, offset, `%${search}%`] : [limit, offset]);
      const total = (await db.one<{ n: number }>(`select count(*)::int as n from ${quoteTable(table)} ${where.replace(/\$3/g, "$1")}`, search ? [`%${search}%`] : []))!.n;
      return { rows, total };
    },
    create(projectId, table, entries, env = "preview") {
      const sql = entries.length
        ? `insert into ${quoteTable(table)} (${entries.map(([column]) => quoteIdent(column)).join(", ")}) values (${entries.map((_, index) => `$${index + 1}`).join(", ")}) returning *`
        : `insert into ${quoteTable(table)} default values returning *`;
      return database(projectId, env).one(sql, entries.map(([, value]) => value));
    },
    async delete(projectId, table, primaryKey, keys, env = "preview") {
      return (await database(projectId, env).query(`delete from ${quoteTable(table)} where ${quoteIdent(primaryKey)}::text = any($1::text[]) returning 1`, [keys])).length;
    },
    users(projectId, env = "preview") {
      return database(projectId, env).query(`select id, email, name, role, password_hash is not null as "hasPassword", created_at as "createdAt" from _forja_users order by created_at desc limit 500`);
    },
    async counts(projectId, env = "preview") {
      const users = await database(projectId, env).one<{ n: number }>(`select count(*)::int as n from _forja_users`);
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
