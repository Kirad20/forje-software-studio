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
    if (/^CREATE\s+TYPE\b/i.test(statement) && /\bAS\s+ENUM\b/i.test(statement)) continue;
    if (
      /^ALTER\s+TABLE\b/i.test(statement) &&
      /\bADD\b/i.test(statement) &&
      !/\b(?:DROP|RENAME|OWNER|DISABLE|ENABLE|VALIDATE|SET\s+(?:SCHEMA|TABLESPACE|LOGGED|UNLOGGED|WITHOUT|ACCESS\s+METHOD))\b/i.test(statement)
    ) {
      assertProjectObject(statement, /^ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?/i);
      continue;
    }
    if (/^INSERT\s+INTO\b/i.test(statement) && !/\bON\s+CONFLICT\b[\s\S]*\bDO\s+UPDATE\b/i.test(statement)) {
      assertProjectObject(statement, /^INSERT\s+INTO\s+(?:ONLY\s+)?/i);
      continue;
    }
    throw new Error("SQL del agente rechazado: solo se permiten CREATE TABLE/INDEX, CREATE TYPE AS ENUM, ALTER TABLE aditivo e INSERT sin UPDATE por conflicto.");
  }
}
