import type { BuildProblem, FileMap } from "./publication.js";

export type SpringBuildTool = "maven" | "gradle";
export interface SpringProject { tool: SpringBuildTool }

const MAX_PROBLEMS = 40;
const MAX_TEXT = 600;

/** A Spring project is a Maven/Gradle build at the project root that depends on spring-boot. */
export function detectSpringProject(files: FileMap): SpringProject | null {
  const pom = files["pom.xml"];
  if (pom !== undefined && /spring-boot/.test(pom)) return { tool: "maven" };
  for (const name of ["build.gradle", "build.gradle.kts"]) {
    const script = files[name];
    if (script !== undefined && /org\.springframework\.boot|spring-boot/.test(script)) return { tool: "gradle" };
  }
  return null;
}

/**
 * Command run inside the container. Wrappers are ignored on purpose: they download an arbitrary
 * distribution; the image's own Maven/Gradle is the one the platform vouches for.
 */
export function buildCommand(project: SpringProject, skipTests: boolean): string[] {
  if (project.tool === "maven") {
    return ["mvn", "-B", "-ntp", "-Dmaven.repo.local=/cache/m2", "package", ...(skipTests ? ["-DskipTests"] : [])];
  }
  return ["gradle", "--no-daemon", "--console=plain", "-g", "/cache/gradle", "bootJar", ...(skipTests ? [] : ["test"])];
}

/** Where the runnable jar lands, relative to the project root. */
export function jarDirectory(tool: SpringBuildTool) {
  return tool === "maven" ? "target" : "build/libs";
}

/** Picks the executable jar: not the `-plain`, `-sources` or `-javadoc` ones. */
export function pickJar(names: string[]): string | null {
  const jars = names.filter((n) => n.endsWith(".jar") && !/-(plain|sources|javadoc|original)\.jar$/.test(n));
  return jars.sort()[0] ?? null;
}

const clip = (s: string) => (s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT)}â€¦` : s);
const normalize = (p: string) => p.replace(/\\/g, "/").replace(/^\/work\//, "").replace(/^\.\//, "");

/**
 * Turns Maven/Gradle output into build problems. javac diagnostics look like
 * `[ERROR] /work/src/Foo.java:[12,5] cannot find symbol` (Maven) or
 * `/work/src/Foo.java:12: error: cannot find symbol` (Gradle); Maven adds `symbol:` lines.
 * Anything else that failed the build is reported once, against the build file.
 */
export function parseSpringOutput(tool: SpringBuildTool, output: string, known: Set<string>, failed: boolean): BuildProblem[] {
  const problems: BuildProblem[] = [];
  const seen = new Set<string>();
  let last: BuildProblem | null = null;
  const push = (p: BuildProblem) => {
    const key = `${p.file}:${p.line ?? 0}:${p.text}`;
    if (seen.has(key)) return;
    seen.add(key);
    problems.push(p);
    last = p;
  };
  for (const raw of output.split(/\r?\n/)) {
    const line = raw.replace(/^\[(?:ERROR|WARNING)\]\s?/, "").trimEnd();
    const maven = /^(.+?\.(?:java|kt)):\[(\d+),(\d+)\]\s+(.*)$/.exec(line);
    const gradle = /^(.+?\.(?:java|kt)):(\d+): error: (.*)$/.exec(line);
    const match = maven ?? gradle;
    if (match) {
      const file = normalize(match[1]!);
      last = null;
      if (!known.has(file)) continue;
      push({ file, line: Number(match[2]), column: maven ? Number(match[3]) : 1, text: clip(`Java: ${maven ? match[4]! : match[3]!}`) });
    } else if (last && /^\s*(symbol|location|required|found|reason):/.test(raw.replace(/^\[ERROR\]/, ""))) {
      (last as BuildProblem).text = clip(`${(last as BuildProblem).text} ${line.trim()}`);
    } else if (!line.trim()) last = null;
  }
  if (failed && !problems.length) {
    const reason = tool === "maven"
      ? output.split(/\r?\n/).find((l) => /^\[ERROR\].*(Failed to execute goal|Could not resolve|Non-resolvable|Non-parseable)/.test(l))
      : output.split(/\r?\n/).find((l) => /(What went wrong|Could not resolve|Execution failed)/.test(l));
    const file = tool === "maven" ? "pom.xml" : "build.gradle";
    problems.push({ file, text: clip(`La compilaciÃ³n fallÃ³: ${reason?.replace(/^\[ERROR\]\s*/, "").trim() ?? "revisa la salida de la compilaciÃ³n."}`) });
  }
  return problems.slice(0, MAX_PROBLEMS);
}

/** Docker container and volume names are derived from the project id; keep them to a safe alphabet. */
export const safeId = (projectId: string) => projectId.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);
