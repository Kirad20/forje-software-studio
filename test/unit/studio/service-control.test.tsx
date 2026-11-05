import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServiceControlView } from "../../../studio/src/features/service-control/index.js";

describe("Service control center rendering", () => {
  it("shows truthful desired/actual state, failures, scaling and targeted restart", () => {
    const html = renderToStaticMarkup(<ServiceControlView busy="" onRefresh={() => {}} onScale={async () => {}} onRestart={async () => {}} data={{
      manifest: true, queueScope: "Últimas 100 tareas", runtime: { available: false, scope: "app-runtime", services: [], error: "offline" },
      services: [{ name: "invoices", kind: "worker", endpoints: [], jobs: ["jobs/invoices.ts"], scalable: true,
        desired: { replicas: 2, maxConcurrency: 1 }, runtime: [], queueCounts: { failed: 1 }, lastFailure: "SMTP down",
        queue: [{ id: "q1", job: "invoices", service: "invoices", env: "published", status: "failed", attempts: 3, maxAttempts: 3, error: "SMTP down" }] }],
    }} />);
    expect(html).toContain("Centro de control");
    expect(html).toContain("Configuración deseada");
    expect(html).toContain("Runtime no disponible");
    expect(html).toContain("workers remotos");
    expect(html).toContain("SMTP down");
    expect(html).toContain("Guardar escala");
    expect(html).toContain("Reiniciar");
    expect(html).not.toContain("Saludable");
  });
  it("renders monolith compatibility without unsupported scaling controls", () => {
    const html = renderToStaticMarkup(<ServiceControlView busy="" onRefresh={() => {}} onScale={async () => {}} onRestart={async () => {}} data={{
      manifest: false, queueScope: "Últimas 100 tareas", runtime: { available: true, scope: "app-runtime", services: [] },
      services: [{ name: "monolith", kind: "monolith", endpoints: [], jobs: [], scalable: false,
        desired: { replicas: 1, maxConcurrency: null }, runtime: [], queueCounts: {}, queue: [], lastFailure: null }],
    }} />);
    expect(html).toContain("Compatibilidad monolito");
    expect(html).not.toContain("Guardar escala");
  });
  it("does not count unstarted replica slots as running processes", () => {
    const html = renderToStaticMarkup(<ServiceControlView busy="" onRefresh={() => {}} onScale={async () => {}} onRestart={async () => {}} data={{
      manifest: false, queueScope: "Últimas 100 tareas", runtime: { available: true, scope: "app-runtime", services: [] },
      services: [{ name: "monolith", kind: "monolith", endpoints: [], jobs: [], scalable: false,
        desired: { replicas: 1, maxConcurrency: null }, runtime: [{ env: "preview", replicas: [{ pid: null, ready: false, active: 0 }] }],
        queueCounts: {}, queue: [], lastFailure: null }],
    }} />);
    expect(html).toContain("Sin procesos observados");
  });
});
