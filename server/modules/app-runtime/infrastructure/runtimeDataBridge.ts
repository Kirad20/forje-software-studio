import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import type { AddressInfo } from "node:net";

type Env = "preview" | "published";
export interface DataBridgePorts {
  query(projectId: string, env: Env, sql: string, params: unknown[]): Promise<unknown[]>;
  exec(projectId: string, env: Env, sql: string): Promise<void>;
}

const MAX_BODY = 1024 * 1024;

/**
 * Lets an app process in another language reach its project's database. Each process gets its own
 * random token, bound to one project and environment; the bridge resolves the project from the token,
 * never from the request, and the SQL goes through the same data-only guard as ctx.db.
 * Listens on loopback only.
 */
export class RuntimeDataBridge {
  private server: Server | null = null;
  private address: Promise<string> | null = null;
  private readonly grants = new Map<string, { projectId: string; env: Env }>();

  constructor(private readonly ports: DataBridgePorts) {}

  url(): Promise<string> {
    this.address ??= new Promise((resolve, reject) => {
      const server = createServer((req, res) => void this.handle(req, res));
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`));
      server.unref();
      this.server = server;
    });
    return this.address;
  }

  grant(projectId: string, env: Env) {
    const token = randomBytes(32).toString("hex");
    this.grants.set(token, { projectId, env });
    return token;
  }

  revoke(token: string) {
    this.grants.delete(token);
  }

  close() {
    this.grants.clear();
    this.server?.close();
    this.server = null;
    this.address = null;
  }

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };
    const token = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.authorization ?? "")?.[1];
    const grant = token ? this.grants.get(token) : undefined;
    if (!grant) return send(401, { error: "Token de datos no válido" });
    if (req.method !== "POST" || (req.url !== "/query" && req.url !== "/exec")) return send(404, { error: "Usa POST /query o POST /exec" });
    let body: { sql?: unknown; params?: unknown };
    try {
      body = JSON.parse(await readBody(req));
    } catch (error) {
      return send(error instanceof TooLarge ? 413 : 400, { error: error instanceof TooLarge ? "Petición demasiado grande" : "JSON no válido" });
    }
    if (typeof body.sql !== "string" || !body.sql.trim()) return send(400, { error: "Falta sql" });
    if (body.params !== undefined && !Array.isArray(body.params)) return send(400, { error: "params debe ser una lista" });
    try {
      if (req.url === "/exec") {
        await this.ports.exec(grant.projectId, grant.env, body.sql);
        return send(200, { ok: true });
      }
      return send(200, { rows: await this.ports.query(grant.projectId, grant.env, body.sql, (body.params as unknown[] | undefined) ?? []) });
    } catch (error) {
      return send(400, { error: (error as Error).message });
    }
  }
}

class TooLarge extends Error {}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new TooLarge());
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.once("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.once("error", reject);
  });
}
