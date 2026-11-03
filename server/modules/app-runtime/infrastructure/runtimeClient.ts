import { z } from "zod";
import { config } from "../../../shared/config.js";

export interface RuntimeEndpointCall {
  projectId: string;
  method: "GET" | "POST";
  route: string;
  query?: Record<string, string>;
  cookie?: string;
  body?: string;
}

const responseSchema = z.object({
  status: z.number().int().min(100).max(599),
  body: z.string(),
  contentType: z.string().nullable(),
});

export async function callRuntimeEndpoint(
  input: RuntimeEndpointCall,
  baseUrl = config.appRuntimeInternalUrl,
  token = config.appDataServiceToken,
) {
  if (!baseUrl) throw new Error("APP_RUNTIME_INTERNAL_URL must be configured");
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/internal/runtime/call-endpoint`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`App runtime service returned ${response.status}: ${await response.text()}`);
  }
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("App runtime service returned an invalid endpoint response");
  return parsed.data;
}
