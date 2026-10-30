import { describe, expect, it } from "vitest";
import { meanOf, prior, sampleBeta } from "../../server/llm/bandit.js";
import { analyzeHeuristic, taskClassOf, useFastPath } from "../../server/llm/router.js";
import { costUsd, type ModelInfo } from "../../server/llm/catalog.js";

const ctx = { images: 0, targeted: false, fileCount: 20 };

describe("analyzeHeuristic", () => {
  it("treats a short style tweak as a fast, low-complexity change", () => {
    const f = analyzeHeuristic("Cambia el color del botón a verde", ctx)!;
    expect(f.intent).toBe("style");
    expect(f.complexity).toBeLessThanOrEqual(2);
    expect(useFastPath(f)).toBe(true);
  });

  it("treats a question as a question", () => {
    const f = analyzeHeuristic("¿Cómo funciona el inicio de sesión de la app?", ctx)!;
    expect(f.intent).toBe("question");
    expect(useFastPath(f)).toBe(true);
  });

  it("sends a multi-domain build to the team", () => {
    const f = analyzeHeuristic(
      "Crea una app de reservas para mi estudio de yoga: los clientes se registran con su correo y contraseña, eligen una clase del calendario, pagan con Stripe y reciben un recordatorio por correo cada día antes de la clase. Yo como admin veo la tabla de reservas y los pagos.",
      ctx,
    )!;
    expect(f.intent).toBe("new_app");
    expect(f.domains).toEqual(expect.arrayContaining(["auth", "payments", "email", "jobs", "data"]));
    expect(f.complexity).toBeGreaterThanOrEqual(4);
    expect(useFastPath(f)).toBe(false);
  });

  it("recognises a bug report", () => {
    expect(analyzeHeuristic("La página de pedidos da error 500 al guardar", ctx)!.intent).toBe("fix");
  });

  it("asks for the LLM classifier when no domain matches a long request", () => {
    expect(analyzeHeuristic("Quiero que la experiencia se sienta más humana y cercana para la gente que llega por primera vez, como si alguien los recibiera.", ctx)).toBeNull();
  });

  it("marks requests with images as needing vision and Select edits as targeted", () => {
    const f = analyzeHeuristic("Que se parezca a esta captura", { images: 1, targeted: true, fileCount: 20 })!;
    expect(f.needsVision).toBe(true);
    expect(f.targeted).toBe(true);
    expect(useFastPath(f)).toBe(true);
  });

  it("a fresh project is a new app", () => {
    expect(analyzeHeuristic("Una lista de compras", { images: 0, targeted: false, fileCount: 3 })!.intent).toBe("new_app");
  });
});

describe("taskClassOf", () => {
  it("buckets by role, complexity and main domain", () => {
    expect(taskClassOf("ui", { complexity: 1, domains: ["ui"], needsVision: false })).toBe("ui:low:ui");
    expect(taskClassOf("backend", { complexity: 4, domains: ["payments", "auth"], needsVision: false })).toBe("backend:high:payments");
    expect(taskClassOf("qa", { complexity: 3, domains: [], needsVision: false })).toBe("qa:mid:general");
  });
});

describe("bandit", () => {
  it("priors rise with tier", () => {
    expect(meanOf(prior(5))).toBeGreaterThan(meanOf(prior(3)));
    expect(meanOf(prior(3))).toBeGreaterThan(meanOf(prior(1)));
  });

  it("Thompson sampling converges on the model that actually succeeds more", () => {
    // Deterministic RNG so the test is stable.
    let seed = 42;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    // Model A has the better prior but succeeds 30% of the time; B succeeds 85%.
    const truth = { A: 0.3, B: 0.85 };
    const post = { A: prior(5), B: prior(3) };
    const picks = { A: 0, B: 0 };
    for (let i = 0; i < 400; i++) {
      const choice = sampleBeta(post.A, rand) > sampleBeta(post.B, rand) ? "A" : "B";
      picks[choice]++;
      const success = rand() < truth[choice] ? 1 : 0;
      post[choice] = { alpha: post[choice].alpha + success, beta: post[choice].beta + 1 - success, uses: post[choice].uses + 1 };
    }
    expect(meanOf(post.B)).toBeGreaterThan(meanOf(post.A));
    expect(picks.B).toBeGreaterThan(picks.A * 2);
  });

  it("samples stay in [0, 1]", () => {
    for (let i = 0; i < 200; i++) {
      const s = sampleBeta({ alpha: 0.3 + (i % 7), beta: 0.2 + (i % 5), uses: 0 });
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});

describe("costUsd", () => {
  const haiku: ModelInfo = {
    id: "anthropic:claude-haiku-5-5",
    provider: "anthropic",
    model: "claude-haiku-5-5",
    label: "Haiku",
    inPrice: 0.1,
    outPrice: 0.5,
    cacheReadPrice: 0.01,
    longPrompt: { threshold: 100_000, inPrice: 0.5, outPrice: 2.5 },
    context: 1_000_000,
    tools: true,
    vision: true,
    tier: 3,
    speed: 5,
    source: "builtin",
  };

  it("prices cached reads far below fresh input", () => {
    const fresh = costUsd(haiku, { input: 50_000, output: 0, cacheRead: 0, cacheWrite: 0 });
    const cached = costUsd(haiku, { input: 0, output: 0, cacheRead: 50_000, cacheWrite: 0 });
    expect(cached).toBeCloseTo(fresh / 10, 8);
  });

  it("applies long-prompt pricing above the threshold", () => {
    const short = costUsd(haiku, { input: 90_000, output: 1000, cacheRead: 0, cacheWrite: 0 });
    const long = costUsd(haiku, { input: 110_000, output: 1000, cacheRead: 0, cacheWrite: 0 });
    expect(long / 110_000).toBeGreaterThan((short / 90_000) * 3);
  });
});
