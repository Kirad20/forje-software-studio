import { estimateRequestTokens, type LlmRequest } from "./messages.js";
import type { ExecutionContextMetrics } from "./fusion.js";

const bytes = (text: string) => new TextEncoder().encode(text).length;
const estimateText = (text: string) => Math.ceil(text.length / 3.5 * 1.2);
const FILE_READ = /^(?:read_file|read_files)$/;

export function contextMetrics(req: LlmRequest): ExecutionContextMetrics {
  const metrics: ExecutionContextMetrics = {
    estimatedInputTokens: estimateRequestTokens(req), systemTokens: estimateText(req.system ?? ""),
    historyTokens: 0, toolSchemaTokens: estimateText(JSON.stringify(req.tools ?? [])), framingTokens: 0,
    systemBytes: bytes(req.system ?? ""), historyBytes: 0, toolSchemaBytes: bytes(JSON.stringify(req.tools ?? [])),
    messages: req.messages.length, images: 0, imageTokens: 0, imageBytes: 0, toolCalls: 0, toolResults: 0, toolResultBytes: 0,
    fileReadCalls: 0, requestedFileCount: 0, fileToolResultBytes: 0,
  };
  const files = new Set<string>();
  const history = req.messages.map(message => ({
    ...message, content: typeof message.content === "string" ? message.content : message.content.map(block => {
      if (block.type === "image") {
        metrics.images++;
        const encoded = block.source.data.replace(/\s/g, "");
        if (encoded.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
          if (metrics.imageBytes !== undefined) metrics.imageBytes += encoded.length / 4 * 3 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
        } else delete metrics.imageBytes;
        return { type: "image" };
      }
      if (block.type === "tool_use") {
        metrics.toolCalls++;
        if (FILE_READ.test(block.name)) {
          files.add(block.id);
          metrics.fileReadCalls++;
          metrics.requestedFileCount += Array.isArray(block.input.paths) ? block.input.paths.length : typeof block.input.path === "string" ? 1 : 0;
        }
      }
      if (block.type === "tool_result") {
        metrics.toolResults++;
        const length = bytes(block.content);
        metrics.toolResultBytes += length;
        if (files.has(block.tool_use_id)) metrics.fileToolResultBytes += length;
      }
      return block;
    }),
  }));
  const serialized = JSON.stringify(history);
  metrics.historyBytes = bytes(serialized);
  metrics.historyTokens = estimateText(serialized) + Math.ceil(metrics.images * 1500 * 1.2);
  metrics.imageTokens = Math.ceil(metrics.images * 1500 * 1.2);
  metrics.framingTokens = Math.max(0, metrics.estimatedInputTokens - metrics.systemTokens - metrics.historyTokens - metrics.toolSchemaTokens);
  return metrics;
}
