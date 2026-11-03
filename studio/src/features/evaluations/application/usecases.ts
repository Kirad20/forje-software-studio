import type { HttpPort } from "../../../shared/application/http-port.js";

export function createEvaluationUseCases(http: HttpPort) {
  return {
    exportRun: async (id: string, format: "json" | "md", signal?: AbortSignal) =>
      (await http.response(`/admin/evals/runs/${id}/export?format=${format}`, signal)).text(),
  };
}
