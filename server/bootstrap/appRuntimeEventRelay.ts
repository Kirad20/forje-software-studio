import { onProjectEvent } from "../modules/project-observability/events.js";

export function startAppRuntimeEventRelay(baseUrl: string, token: string): () => void {
  if (!baseUrl) return () => {};
  if (!token) throw new Error("APP_DATA_SERVICE_TOKEN must be configured for runtime event relay");
  const base = baseUrl.replace(/\/+$/, "");
  return onProjectEvent((projectId, event) => {
    if (event.type !== "files") return;
    void fetch(`${base}/internal/runtime/project-event`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ projectId, event }),
    }).then((response) => {
      if (!response.ok) throw new Error(`App runtime event relay returned ${response.status}: ${response.statusText}`);
    }).catch((error) => {
      console.error("[forja] app runtime event relay:", error);
    });
  });
}
