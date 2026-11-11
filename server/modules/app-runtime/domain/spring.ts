import type { BuildProblem, FileMap } from "./publication.js";

export type SpringBuildTool = "maven" | "gradle";
export interface SpringProject { tool: SpringBuildTool }

/** Where the language sandbox mounts the build workspace, the dependency cache and the runnable jar. */
export const WORK_DIR = "/work";
export const CACHE_DIR = "/cache";
export const APP_DIR = "/app";

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

const SOURCE = /^(?:pom\.xml|build\.gradle(?:\.kts)?|settings\.gradle(?:\.kts)?|gradle\.properties|src\/(?:main|test)\/.+)$/;

/** Files that take part in the JVM build; the frontend (pages/, components/…) never does. */
export const isSpringSource = (file: string) => SOURCE.test(file);

export function springSources(files: FileMap): FileMap {
  const out: FileMap = {};
  for (const file of Object.keys(files).sort()) if (isSpringSource(file)) out[file] = files[file]!;
  return out;
}

/**
 * Command run inside the sandbox. Wrappers (mvnw, gradlew) are ignored on purpose: they download an
 * arbitrary distribution; the image's own Maven/Gradle is the one the platform vouches for.
 */
export function buildCommand(project: SpringProject, skipTests = true): string[] {
  if (project.tool === "maven") {
    return ["mvn", "-B", "-ntp", `-Dmaven.repo.local=${CACHE_DIR}/m2`, "package", ...(skipTests ? ["-DskipTests"] : [])];
  }
  return ["gradle", "--no-daemon", "--console=plain", "-g", `${CACHE_DIR}/gradle`, "bootJar", ...(skipTests ? [] : ["test"])];
}

/** Where the runnable jar lands, relative to the project root. */
export function jarDirectory(tool: SpringBuildTool) {
  return tool === "maven" ? "target" : "build/libs";
}

/** Picks the executable jar: not the `-plain`, `-sources`, `-javadoc` or `.original` ones. */
export function pickJar(names: string[]): string | null {
  const jars = names.filter((n) => n.endsWith(".jar") && !/-(plain|sources|javadoc|original)\.jar$/.test(n));
  return jars.sort()[0] ?? null;
}

export interface JvmOptions { maxHeapMb: number; preview: boolean }

/**
 * A small, predictable footprint per app: bounded heap and metaspace, the serial collector (no GC
 * threads per core) and one visible CPU. Previews stop at C1, which starts Spring noticeably faster.
 */
export function jvmCommand(jar: string, options: JvmOptions): string[] {
  return [
    "java",
    `-Xmx${options.maxHeapMb}m`,
    "-Xss512k",
    "-XX:MaxMetaspaceSize=160m",
    "-XX:ReservedCodeCacheSize=64m",
    "-XX:+UseSerialGC",
    "-XX:ActiveProcessorCount=1",
    "-XX:+ExitOnOutOfMemoryError",
    ...(options.preview ? ["-XX:TieredStopAtLevel=1"] : []),
    "-Dspring.jmx.enabled=false",
    "-jar",
    jar,
  ];
}

const clip = (s: string) => (s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT)}…` : s);

/**
 * Turns Maven/Gradle output into build problems. javac diagnostics look like
 * `[ERROR] /work/src/Foo.java:[12,5] cannot find symbol` (Maven) or
 * `/work/src/Foo.java:12: error: cannot find symbol` (Gradle); Maven adds `symbol:` lines.
 * Anything else that failed the build is reported once, against the build file.
 * `roots` are the absolute workspace paths the compiler may print (the sandbox mount or a host dir).
 */
export function parseSpringOutput(tool: SpringBuildTool, output: string, known: Set<string>, failed: boolean, roots: string[] = [WORK_DIR]): BuildProblem[] {
  const prefixes = roots.map((r) => r.replace(/\\/g, "/").replace(/\/+$/, "") + "/");
  const normalize = (p: string) => {
    let file = p.replace(/\\/g, "/");
    for (const prefix of prefixes) if (file.startsWith(prefix)) file = file.slice(prefix.length);
    return file.replace(/^\.\//, "");
  };
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
    const lines = output.split(/\r?\n/);
    const reason = tool === "maven"
      ? lines.find((l) => /^\[ERROR\].*(Failed to execute goal|Could not resolve|Non-resolvable|Non-parseable)/.test(l))
      : lines.find((l) => /(What went wrong|Could not resolve|Execution failed)/.test(l));
    const file = tool === "maven" ? "pom.xml" : "build.gradle";
    problems.push({ file, text: clip(`La compilación falló: ${reason?.replace(/^\[ERROR\]\s*/, "").trim() ?? "revisa la salida de la compilación."}`) });
  }
  return problems.slice(0, MAX_PROBLEMS);
}
