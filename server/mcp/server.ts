import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { BUILDER_SYSTEM_PROMPT } from "../builder/prompt.js";
import { builderTools, previewUrl, toolByName } from "../builder/tools.js";
import type { Account } from "../platform/accounts.js";
import { createCheckpoint, createProject, getProject, listProjects } from "../platform/projects.js";

/**
 * Remote MCP server: lets any MCP client (Claude, ChatGPT, Cursor, Codex...) build Forja
 * projects with its own model. Same tools as the in-studio builder, plus project lookup.
 * Authenticated with an API token created in the studio (Authorization: Bearer fj_...).
 */
const projectIdProp = { projectId: { type: "string", description: "Id del proyecto (de list_projects o create_project)" } };

const extraTools = [
  {
    name: "list_projects",
    description: "Lista tus proyectos de Forja (id, nombre, publicado).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_project",
    description: "Crea un proyecto nuevo y devuelve su id y el enlace de la vista previa en vivo. Comparte el enlace con el usuario.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" }, description: { type: "string" } },
      required: ["name"],
    },
  },
  {
    name: "get_guide",
    description: "Manual de Forja: estructura de proyecto, SDK de cliente y servidor, reglas. Léelo antes del primer cambio.",
    inputSchema: { type: "object", properties: {} },
  },
];

function buildServer(account: Account) {
  const server = new Server(
    { name: "forja", version: "0.1.0" },
    {
      capabilities: { tools: {} },
      instructions:
        "Forja aloja apps full-stack TypeScript/React con base de datos, auth, archivos, correo, IA, tareas y tiempo real incluidos. Llama get_guide antes del primer cambio. Tras create_project comparte el enlace de vista previa.",
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      ...extraTools,
      ...builderTools.map((t) => {
        const schema = t.input_schema as { properties: Record<string, unknown>; required?: string[] };
        return {
          name: t.name,
          description: t.description,
          inputSchema: {
            type: "object" as const,
            properties: { ...projectIdProp, ...schema.properties },
            required: ["projectId", ...(schema.required ?? [])],
          },
        };
      }),
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    const text = (t: string, isError = false) => ({ content: [{ type: "text" as const, text: t }], isError });
    try {
      switch (req.params.name) {
        case "list_projects": {
          const list = await listProjects(account.id);
          return text(list.map((p) => `${p.id}  ${p.name}${p.slug ? `  (publicado: ${p.slug})` : ""}`).join("\n") || "Sin proyectos.");
        }
        case "create_project": {
          const p = await createProject(account.id, String(args.name), String(args.description ?? ""));
          return text(`Proyecto creado: ${p.id}\nVista previa en vivo: ${previewUrl(p.id)}`);
        }
        case "get_guide":
          return text(BUILDER_SYSTEM_PROMPT);
      }
      const tool = toolByName.get(req.params.name);
      if (!tool) return text(`Herramienta desconocida: ${req.params.name}`, true);
      const projectId = String(args.projectId ?? "");
      const project = await getProject(projectId);
      if (!project || project.ownerId !== account.id) return text("Proyecto no encontrado en esta cuenta.", true);
      const ctx = { account, projectId };
      const out = await tool.run(args, ctx);
      if ((ctx as { wrote?: boolean }).wrote && req.params.name !== "create_checkpoint") {
        // Each write is cheap to checkpoint and makes MCP edits undoable from the studio.
        await createCheckpoint(projectId, `MCP: ${req.params.name} ${String(args.path ?? "")}`.trim());
      }
      return text(out);
    } catch (e) {
      return text(`Error: ${(e as Error).message}`, true);
    }
  });
  return server;
}

/** Stateless: a fresh server and transport per request, so any instance can answer. */
export async function handleMcp(req: Request, account: Account): Promise<Response> {
  const server = buildServer(account);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    void server.close();
  }
}
