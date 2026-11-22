function redactSqlData(sql: string): string {
  let out = "";
  let i = 0;
  let blockDepth = 0;
  let dollarTag = "";
  let escapeString = false;
  let state: "normal" | "single" | "double" | "line" | "block" | "dollar" = "normal";

  while (i < sql.length) {
    const c = sql[i]!;
    const next = sql[i + 1];
    if (state === "line") {
      if (c === "\n") {
        out += "\n";
        state = "normal";
      } else out += " ";
      i++;
      continue;
    }
    if (state === "block") {
      if (c === "/" && next === "*") {
        blockDepth++;
        out += "  ";
        i += 2;
      } else if (c === "*" && next === "/") {
        blockDepth--;
        out += "  ";
        i += 2;
        if (!blockDepth) state = "normal";
      } else {
        out += c === "\n" ? "\n" : " ";
        i++;
      }
      continue;
    }
    if (state === "double") {
      if (c === '"' && next === '"') {
        out += '""';
        i += 2;
      } else if (c === '"') {
        out += '"';
        i++;
        state = "normal";
      } else {
        out += c === ";" ? " " : c;
        i++;
      }
      continue;
    }
    if (state === "single") {
      if (c === "\\" && escapeString && next !== undefined) {
        out += "  ";
        i += 2;
      } else if (c === "'" && next === "'") {
        out += "  ";
        i += 2;
      } else if (c === "'") {
        out += " ";
        i++;
        state = "normal";
        escapeString = false;
      } else {
        out += c === "\n" ? "\n" : " ";
        i++;
      }
      continue;
    }
    if (state === "dollar") {
      if (sql.startsWith(dollarTag, i)) {
        out += " ".repeat(dollarTag.length);
        i += dollarTag.length;
        dollarTag = "";
        state = "normal";
      } else {
        out += c === "\n" ? "\n" : " ";
        i++;
      }
      continue;
    }
    if (c === "-" && next === "-") {
      state = "line";
      out += "  ";
      i += 2;
    } else if (c === "/" && next === "*") {
      state = "block";
      blockDepth = 1;
      out += "  ";
      i += 2;
    } else if (c === "'") {
      state = "single";
      escapeString = /e/i.test(sql[i - 1] ?? "") && (i < 2 || !/[a-z_0-9$]/i.test(sql[i - 2]!));
      out += " ";
      i++;
    } else if (c === '"') {
      state = "double";
      out += '"';
      i++;
    } else if (c === "$") {
      const tag = /^\$(?:[a-z_][a-z_0-9]*)?\$/i.exec(sql.slice(i))?.[0];
      if (tag) {
        state = "dollar";
        dollarTag = tag;
        out += " ".repeat(tag.length);
        i += tag.length;
      } else {
        out += c;
        i++;
      }
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

function objectName(sql: string, prefix: RegExp): string[] {
  const start = prefix.exec(sql);
  if (!start) return [];
  let rest = sql.slice(start.index + start[0].length).trimStart();
  const names: string[] = [];
  for (let part = 0; part < 2; part++) {
    const match = /^(?:"((?:""|[^"])*)"|([a-z_][a-z_0-9$]*))/i.exec(rest);
    if (!match) break;
    names.push((match[1] ?? match[2]!).replace(/""/g, '"').toLowerCase());
    rest = rest.slice(match[0].length).trimStart();
    if (!rest.startsWith(".")) break;
    rest = rest.slice(1).trimStart();
  }
  return names;
}

function assertProjectObject(sql: string, prefix: RegExp): void {
  const names = objectName(sql, prefix);
  if (names.some((name) => name.startsWith("_forja_") || name.startsWith("pg_") || name === "information_schema" || name === "pg_catalog")) {
    throw new Error("SQL del agente rechazado: no se permite modificar tablas ni objetos internos del sistema.");
  }
}

const IDENT = String.raw`(?:"(?:""|[^"])+"|[a-z_][a-z_0-9$]*)`;
const QUALIFIED = new RegExp(String.raw`^\s*(${IDENT}(?:\s*\.\s*${IDENT})?)\s*`, "i");
const CREATE_VIEW = /^CREATE\s+(?:OR\s+REPLACE\s+)?(?:(?:TEMP|TEMPORARY)\s+)?(?:RECURSIVE\s+)?VIEW\s+/i;
const CREATE_MATERIALIZED_VIEW = /^CREATE\s+MATERIALIZED\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?/i;
const REFRESH_MATERIALIZED_VIEW = /^REFRESH\s+MATERIALIZED\s+VIEW\s+(?:CONCURRENTLY\s+)?/i;
const DROP_OBJECT = /^DROP\s+(?:TABLE|(?:MATERIALIZED\s+)?VIEW|INDEX|TYPE)\s+(?:IF\s+EXISTS\s+)?/i;
/** ALTER TABLE subcommands that are never allowed: they change ownership, security or storage, not the app's data model. */
const ALTER_TABLE_FORBIDDEN = /\b(?:RENAME|OWNER|DISABLE|ENABLE|VALIDATE|SET\s+(?:SCHEMA|TABLESPACE|LOGGED|UNLOGGED|WITHOUT|ACCESS\s+METHOD))\b/i;

/** DROP TABLE a, "b".c [CASCADE | RESTRICT]: every target must be an app object. */
function assertDropTargets(statement: string): void {
  let rest = statement.slice(DROP_OBJECT.exec(statement)![0].length).replace(/\s+(?:CASCADE|RESTRICT)\s*$/i, "");
  for (;;) {
    const match = QUALIFIED.exec(rest);
    if (!match) throw new Error("SQL del agente rechazado: DROP solo admite nombres de objetos de la app, separados por comas.");
    assertProjectObject(match[1]!, /^/);
    rest = rest.slice(match[0].length);
    if (!rest) return;
    if (!rest.startsWith(",")) throw new Error("SQL del agente rechazado: DROP solo admite nombres de objetos de la app, separados por comas.");
    rest = rest.slice(1);
  }
}

export function assertSafeAgentSql(sql: string): void {
  const statements = redactSqlData(sql).split(";").map((statement) => statement.trim()).filter(Boolean);
  if (!statements.length) throw new Error("No hay ninguna sentencia SQL para ejecutar.");

  for (const statement of statements) {
    if (/^CREATE\s+(?:(?:UNIQUE|TEMP|TEMPORARY)\s+)?TABLE\b/i.test(statement)) {
      if (/\bAS\s+(?:SELECT|WITH)\b/i.test(statement)) throw new Error("SQL del agente rechazado: CREATE TABLE AS podría copiar datos existentes.");
      assertProjectObject(statement, /^CREATE\s+(?:(?:UNIQUE|TEMP|TEMPORARY)\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?/i);
      continue;
    }
    if (/^CREATE\s+(?:UNIQUE\s+)?INDEX\b/i.test(statement)) {
      assertProjectObject(statement, /^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"(?:""|[^"])+"|[a-z_][a-z_0-9$]*)\s+ON\s+/i);
      continue;
    }
    if (/^CREATE\s+TYPE\b/i.test(statement) && /\bAS\s+ENUM\b/i.test(statement)) {
      assertProjectObject(statement, /^CREATE\s+TYPE\s+(?:IF\s+NOT\s+EXISTS\s+)?/i);
      continue;
    }
    if (CREATE_VIEW.test(statement)) {
      assertProjectObject(statement, CREATE_VIEW);
      continue;
    }
    if (CREATE_MATERIALIZED_VIEW.test(statement)) {
      assertProjectObject(statement, CREATE_MATERIALIZED_VIEW);
      continue;
    }
    if (REFRESH_MATERIALIZED_VIEW.test(statement)) {
      assertProjectObject(statement, REFRESH_MATERIALIZED_VIEW);
      continue;
    }
    if (DROP_OBJECT.test(statement)) {
      assertDropTargets(statement);
      continue;
    }
    if (/^ALTER\s+TABLE\b/i.test(statement) && /\b(?:ADD|DROP)\b/i.test(statement) && !ALTER_TABLE_FORBIDDEN.test(statement)) {
      assertProjectObject(statement, /^ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?/i);
      continue;
    }
    if (/^INSERT\s+INTO\b/i.test(statement) && !/\bON\s+CONFLICT\b[\s\S]*\bDO\s+UPDATE\b/i.test(statement)) {
      assertProjectObject(statement, /^INSERT\s+INTO\s+(?:ONLY\s+)?/i);
      continue;
    }
    throw new Error("SQL del agente rechazado: solo se permiten CREATE TABLE/INDEX/VIEW, CREATE MATERIALIZED VIEW, CREATE TYPE AS ENUM, ALTER TABLE ADD/DROP, DROP TABLE/VIEW/INDEX/TYPE de la app e INSERT sin UPDATE por conflicto.");
  }
}

export function containsSchemaChange(sql: string): boolean {
  return redactSqlData(sql)
    .split(";")
    .some((statement) =>
      /^\s*(?:CREATE\s+(?:(?:UNIQUE|TEMP|TEMPORARY)\s+)?(?:TABLE|INDEX)\b|CREATE\s+TYPE\b|ALTER\s+TABLE\b|DROP\b)/i.test(statement) ||
      CREATE_VIEW.test(statement.trim()) ||
      CREATE_MATERIALIZED_VIEW.test(statement.trim()),
    );
}

/**
 * Schema changes that lose stored data when replayed in production: DROP TABLE, DROP TYPE
 * (its columns go with it), ALTER TABLE … DROP [COLUMN] and any DROP … CASCADE. Dropping a
 * plain view, a materialized view (derived data) or an index, or a constraint/default, loses nothing.
 */
export function containsDestructiveSchemaChange(sql: string): boolean {
  return redactSqlData(sql)
    .split(";")
    .map((statement) => statement.trim())
    .some((statement) =>
      /^DROP\s+(?:TABLE|TYPE)\b/i.test(statement) ||
      (/^DROP\b/i.test(statement) && /\bCASCADE\s*$/i.test(statement)) ||
      (/^ALTER\s+TABLE\b/i.test(statement) &&
        /\bDROP\s+(?!(?:DEFAULT|NOT\s+NULL|IDENTITY|EXPRESSION|CONSTRAINT)\b)/i.test(statement)),
    );
}

export function containsDataChange(sql: string): boolean {
  return redactSqlData(sql)
    .split(";")
    .some((statement) => /^\s*(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE)\b/i.test(statement));
}

/** Builder SQL is confined to preview; it may change preview rows but not platform-owned objects. */
export function assertSafePreviewSql(sql: string): void {
  const statements = redactSqlData(sql).split(";").map((statement) => statement.trim()).filter(Boolean);
  if (!statements.length) throw new Error("No hay ninguna sentencia SQL para ejecutar.");

  for (const statement of statements) {
    if (/^CREATE\s+(?:(?:UNIQUE|TEMP|TEMPORARY)\s+)?TABLE\b/i.test(statement) ||
        /^CREATE\s+(?:UNIQUE\s+)?INDEX\b/i.test(statement) ||
        /^CREATE\s+TYPE\b/i.test(statement) ||
        CREATE_VIEW.test(statement) ||
        CREATE_MATERIALIZED_VIEW.test(statement) ||
        REFRESH_MATERIALIZED_VIEW.test(statement) ||
        DROP_OBJECT.test(statement) ||
        /^ALTER\s+TABLE\b/i.test(statement)) {
      assertSafeAgentSql(statement);
      continue;
    }
    if (/^INSERT\s+INTO\b/i.test(statement)) {
      assertProjectObject(statement, /^INSERT\s+INTO\s+(?:ONLY\s+)?/i);
      continue;
    }
    if (/^UPDATE\b/i.test(statement)) {
      assertProjectObject(statement, /^UPDATE\s+(?:ONLY\s+)?/i);
      continue;
    }
    if (/^DELETE\s+FROM\b/i.test(statement)) {
      assertProjectObject(statement, /^DELETE\s+FROM\s+(?:ONLY\s+)?/i);
      continue;
    }
    if (/^TRUNCATE\s+(?:TABLE\s+)?(?:ONLY\s+)?/i.test(statement)) {
      const prefix = /^TRUNCATE\s+(?:TABLE\s+)?(?:ONLY\s+)?/i;
      const target = statement.slice(prefix.exec(statement)?.[0].length ?? 0);
      if (!/^(?:"(?:""|[^"])+"|[a-z_][a-z_0-9$]*)(?:\.(?:"(?:""|[^"])+"|[a-z_][a-z_0-9$]*))?$/i.test(target)) {
        throw new Error("SQL del agente rechazado: TRUNCATE solo puede afectar una tabla de la app.");
      }
      assertProjectObject(statement, prefix);
      continue;
    }
    throw new Error("SQL del agente rechazado: solo se permite SQL de datos en vista previa y DDL de la app registrado como migración.");
  }
}
