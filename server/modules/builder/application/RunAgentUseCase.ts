import { addUsage, emptyUsage, type AgentEvent, type AgentExecutionResult, type AgentExecutionSpec, type Block, type ContextAuditEvent, type ExecutionContext, type ExecutionModel, type Message } from "../domain/AgentExecution.js";
import type { AgentExecutionPorts } from "../ports/AgentExecutionPorts.js";
import { applySummary, estimateTokens, pruneToolResults, renderTranscript, splitForSummary, textTokens, thresholds } from "../domain/ContextCompaction.js";

export const GATE_FIXES = 2;
const GATE_STEPS = 8;

function summarize(name: string, input: Record<string, unknown>): string {
  if (typeof input.path === "string") return input.path;
  if (Array.isArray(input.paths)) return (input.paths as string[]).join(", ");
  if (typeof input.sql === "string") return input.sql.replace(/\s+/g, " ").slice(0, 80);
  if (typeof input.route === "string") return `${input.method ?? ""} ${input.route}`.trim();
  if (typeof input.name === "string") return input.name;
  if (typeof input.label === "string") return input.label;
  return name;
}

export class RunAgentUseCase<M extends ExecutionModel> {
  constructor(private readonly ports: AgentExecutionPorts<M>) {}

  async execute<C extends ExecutionContext>(spec: AgentExecutionSpec<M, C>): Promise<AgentExecutionResult<M>> {
    const history: Message[] = [...spec.messages];
    const tools = spec.tools.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
    const byName = new Map(spec.tools.map(t => [t.name, t]));
    const opening = spec.messages.length;
    const fixedTokens = textTokens(spec.system ?? "") + textTokens(JSON.stringify(tools));
    spec.ctx.reads ??= new Map();
    const result: AgentExecutionResult<M> = { text: "", model: null, usage: emptyUsage(), usd: 0, credits: 0, steps: [], buildOk: null, testsOk: null, toolErrors: 0, hitStepLimit: false, written: [], gate: null, gateFixes: 0 };
    const emit = (e: AgentEvent) => spec.emit(spec.taskId && ["text", "tool_start", "tool_end", "fusion_step", "fusion_done"].includes(e.type) ? ({ ...e, taskId: spec.taskId } as AgentEvent) : e);
    const runId = this.ports.newRunId();
    const agentId = spec.agentId ?? runId;
    let traceId: string | undefined;
    const audit = (event: Pick<ContextAuditEvent, "kind" | "measured" | "beforeTokens" | "afterTokens" | "bytes" | "count">) => this.ports.recordContextEvent?.({
      projectId: spec.ctx.projectId, taskId: spec.taskId, turnId: spec.turnId, agentId, traceId, ...event,
    });
    let maxSteps = spec.maxSteps;
    let reminded = false;
    let gatedAt = -1;
    let affinityGeneration = 0;
    let author: M | undefined;
    let lastCallGeneration = -1;
    const runGate = async (): Promise<string | null> => {
      const id = `gate-${runId}-${result.gateFixes}`;
      emit({ type: "tool_start", id, name: "finish_gate", summary: "Comprobación automática antes de terminar" });
      gatedAt = result.steps.length;
      let report: string | null;
      try {
        report = await spec.finishGate!.check();
      } catch (e) {
        emit({ type: "tool_end", id, ok: false, output: `No se pudo comprobar: ${(e as Error).message}` });
        return null;
      }
      result.gate = report ? "failed" : "passed";
      emit({ type: "tool_end", id, ok: !report, output: report ? report.slice(0, 2000) : "Sin problemas nuevos." });
      return report;
    };
    for (let step = 0; step < maxSteps; step++) {
      if (spec.signal.aborted) throw new Error("Detenido.");
      if (result.model?.context) {
        const limit = thresholds(result.model.context);
        const size = () => fixedTokens + estimateTokens(history);
        if (size() > limit.prune) {
          const beforePrune = size();
          const pruned = pruneToolResults(history, opening);
          if (pruned.pruned) {
            history.splice(0, history.length, ...pruned.messages);
            spec.ctx.reads.clear();
            affinityGeneration++;
            author = undefined;
            audit({ kind: "compaction", measured: false, beforeTokens: beforePrune, afterTokens: size(), count: pruned.pruned });
          }
          if (size() > limit.summarize && this.ports.summarize) {
            const cut = splitForSummary(history, opening);
            if (cut !== null) {
              try {
                const beforeSummary = size();
                const summary = await this.ports.summarize(renderTranscript(history.slice(opening, cut)), { agentId });
                if (summary.text.trim()) {
                  result.usage = addUsage(result.usage, summary.usage);
                  result.usd += summary.usd;
                  result.credits += summary.credits;
                  history.splice(0, history.length, ...applySummary(history, opening, cut, summary.text.trim()));
                  spec.ctx.reads.clear();
                  affinityGeneration++;
                  author = undefined;
                  audit({ kind: "compaction", measured: false, beforeTokens: beforeSummary, afterTokens: size(), count: cut - opening });
                }
              } catch (error) {
                this.ports.compactionFailed?.(error);
              }
            }
          }
        }
      }
      const callStarted = this.ports.now();
      const last = history.at(-1);
      const toolContinuation = last?.role === "user" && Array.isArray(last.content) && last.content.some(block => block.type === "tool_result");
      const call = await this.ports.callModel({
        messages: history, tools: tools.length ? tools : undefined,
        pinned: author,
        affinityKey: JSON.stringify([spec.ctx.projectId, spec.turnId, spec.taskId ?? spec.role, affinityGeneration]),
        agentId,
        decisionBoundary: lastCallGeneration !== affinityGeneration || !toolContinuation,
        onFusionStep: step => emit({ type: "fusion_step", step: {
          id: step.id, phase: step.phase, modelId: step.modelId, servedBy: step.servedBy,
          effort: step.effort, ms: step.ms, usage: step.usage, usd: step.usd, credits: step.credits,
          context: step.context,
          ...(step.error ? { error: "La llamada al modelo falló." } : {}),
        } }),
      });
      author = call.model;
      lastCallGeneration = affinityGeneration;
      traceId = call.fusion?.operationId;
      if (call.fusion) emit({ type: "fusion_done", operationId: call.fusion.operationId, pattern: call.fusion.pattern, warnings: call.fusion.warnings, usd: call.usd, credits: call.credits });
      if (!result.model || result.model.id !== call.model.id) {
        result.model = call.model;
        spec.ctx.actor = `${spec.role}@${call.model.model}`;
        await spec.onModel?.(call.model, call.failed.length ? `tras fallar ${call.failed.join("; ")}` : "");
      }
      const usage = call.totalUsage ?? call.response.usage;
      result.usage = addUsage(result.usage, usage);
      this.ports.recordStep({ runId, projectId: spec.ctx.projectId, turnId: spec.turnId, taskId: spec.taskId, role: spec.role, step, modelId: call.model.id, usage, ms: this.ports.now() - callStarted, usd: call.usd });
      result.usd += call.usd;
      result.credits += call.credits;
      const assistant: Message = { role: "assistant", content: call.response.content };
      history.push(assistant);
      if (spec.persist) await this.ports.save(spec.persist.projectId, assistant, spec.turnId);
      for (const b of call.response.content) if (b.type === "text" && b.text.trim()) emit({ type: "text", text: b.text });
      const texts = call.response.content.filter((b): b is Extract<Block, { type: "text" }> => b.type === "text").map(b => b.text.trim()).filter(Boolean);
      if (texts.length) result.text = texts.join("\n");
      const calls = call.response.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
      if (!calls.length) {
        if (spec.requiredTool && !reminded && !result.steps.some(st => st.tool === spec.requiredTool && st.ok)) {
          reminded = true;
          maxSteps = Math.max(maxSteps, step + 2);
          history.push({ role: "user", content: `Todavía no has llamado a ${spec.requiredTool}. Llámala ahora con la herramienta (no escribas el resultado como texto).` });
          continue;
        }
        if (spec.finishGate && spec.ctx.wrote && !spec.signal.aborted) {
          const report = await runGate();
          if (report && result.gateFixes < GATE_FIXES) {
            result.gateFixes++;
            maxSteps = Math.max(maxSteps, step + 1 + GATE_STEPS);
            history.push({ role: "user", content: `Comprobación automática antes de terminar: tus cambios dejaron estos problemas.\n\n${report}\n\nArregla la causa (lee el archivo y usa edit_file), comprueba con check_build o get_problems y termina con tu resumen actualizado. Si algo no se puede arreglar dentro de tu tarea, explícalo en el resumen.` });
            continue;
          }
        }
        break;
      }
      const images: Block[] = [];
      const results = await Promise.all(calls.map(async (c): Promise<Block> => {
        const summary = summarize(c.name, c.input);
        emit({ type: "tool_start", id: c.id, name: c.name, summary });
        await this.ports.countAction(spec.ctx.account.id);
        let output: string;
        let ok = true;
        const started = this.ports.now();
        try {
          const tool = byName.get(c.name);
          if (!tool) throw new Error(`Herramienta no disponible para este agente: ${c.name}`);
          const out = await tool.run(c.input, spec.ctx);
          if (typeof out === "string") output = out;
          else {
            output = out.text;
            if (result.model?.vision === false) output += `\n(${out.images.length} captura(s) omitida(s): el modelo actual no ve imágenes; fíate del texto y los errores.)`;
            else for (const img of out.images) images.push({ type: "image", source: { type: "base64", ...img } });
          }
        } catch (e) {
          ok = false;
          output = `Error: ${(e as Error).message}`;
        }
        if (c.name === "check_build") result.buildOk = ok && output.startsWith("Compila sin errores");
        if (c.name === "run_tests") result.testsOk = ok && output.startsWith("Todo en verde");
        if (!ok) result.toolErrors++;
        if (c.name === "read_files" || c.name === "read_file") audit({ kind: "file_read", measured: true, bytes: ok ? new TextEncoder().encode(output).length : 0, count: 1 });
        this.ports.recordToolCall({ runId, projectId: spec.ctx.projectId, source: "builder", role: spec.role, step, tool: c.name, inputChars: JSON.stringify(c.input ?? {}).length, resultChars: output.length, ok, ms: this.ports.now() - started });
        result.steps.push({ tool: c.name, summary, ok, ...(!ok ? { output: output.slice(0, 2000) } : {}) });
        emit({ type: "tool_end", id: c.id, ok, output: output.slice(0, 2000) });
        return { type: "tool_result", tool_use_id: c.id, content: output, is_error: !ok || undefined };
      }));
      history.push({ role: "user", content: [...results, ...images] });
      if (spec.persist) await this.ports.save(spec.persist.projectId, { role: "user", content: results }, spec.turnId);
      if (step === maxSteps - 1) result.hitStepLimit = true;
    }
    if (spec.finishGate && spec.ctx.wrote && gatedAt !== result.steps.length && !spec.signal.aborted) await runGate();
    result.written = [...(spec.ctx.written ?? [])];
    return result;
  }
}
