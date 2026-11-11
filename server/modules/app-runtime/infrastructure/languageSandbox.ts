import { spawn, type ChildProcess } from "node:child_process";

/**
 * Isolation for project code that is not JavaScript (JVM, Python…). Node's permission model only
 * covers Node, so these processes run under bubblewrap: a fresh user/pid/ipc namespace, an empty
 * environment, read-only system directories and only the mounts the caller lists — never the data
 * directory, other projects or the platform's secrets. "unsafe" spawns directly (local development
 * only, chosen explicitly); "off" disables non-JavaScript runtimes.
 */
export type LanguageSandboxMode = "bwrap" | "unsafe" | "off";

export interface SandboxMount { host: string; target: string; writable?: boolean }
export interface SandboxSpec {
  command: string[];
  /** A mount target. */
  cwd: string;
  env: Record<string, string>;
  mounts: SandboxMount[];
}
export interface SandboxInvocation { command: string; args: string[]; cwd?: string; env: Record<string, string>; shell: boolean }

/** Read-only system paths compilers and runtimes need. Missing ones are skipped. */
const SYSTEM_READ_ONLY = [
  "/usr", "/etc/alternatives", "/etc/java-17-openjdk", "/etc/java-21-openjdk", "/etc/maven", "/etc/ssl",
  "/etc/ca-certificates", "/etc/resolv.conf", "/etc/hosts", "/etc/nsswitch.conf", "/etc/localtime",
];
/** Debian keeps /bin, /lib… as links into /usr. */
const MERGED_USR: [string, string][] = [["usr/bin", "/bin"], ["usr/sbin", "/sbin"], ["usr/lib", "/lib"], ["usr/lib64", "/lib64"]];
const BASE_ENV = { PATH: "/usr/local/bin:/usr/bin:/bin", HOME: "/tmp", LANG: "C.UTF-8" };

export function sandboxInvocation(spec: SandboxSpec, mode: Exclude<LanguageSandboxMode, "off">, hostEnv: NodeJS.ProcessEnv = process.env): SandboxInvocation {
  if (mode === "bwrap") {
    const env = { ...BASE_ENV, ...spec.env };
    return {
      command: "bwrap",
      args: [
        "--unshare-user", "--unshare-pid", "--unshare-ipc", "--unshare-uts", "--unshare-cgroup-try",
        "--die-with-parent", "--new-session", "--clearenv",
        ...SYSTEM_READ_ONLY.flatMap((p) => ["--ro-bind-try", p, p]),
        ...MERGED_USR.flatMap(([target, link]) => ["--symlink", target, link]),
        "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp",
        ...spec.mounts.flatMap((m) => [m.writable ? "--bind" : "--ro-bind", m.host, m.target]),
        "--chdir", spec.cwd,
        ...Object.entries(env).flatMap(([k, v]) => ["--setenv", k, v]),
        "--", ...spec.command,
      ],
      env: {},
      shell: false,
    };
  }
  // Unsafe: same command with mount targets rewritten to host paths, and still no platform secrets.
  const mounts = [...spec.mounts].sort((a, b) => b.target.length - a.target.length);
  const translate = (arg: string) => mounts.reduce((out, m) => out.replace(new RegExp(`(^|=)${escape(m.target)}(?=/|$)`, "g"), `$1${m.host}`), arg);
  const [command, ...args] = spec.command.map(translate);
  const passthrough = ["PATH", "SYSTEMROOT", "JAVA_HOME", "MAVEN_HOME", "TEMP", "TMP"]
    .filter((k) => hostEnv[k] !== undefined).map((k) => [k, hostEnv[k]!]);
  return {
    command: command!,
    args,
    cwd: translate(spec.cwd),
    env: { ...Object.fromEntries(passthrough), ...spec.env },
    shell: process.platform === "win32",
  };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function spawnSandboxed(spec: SandboxSpec, mode: Exclude<LanguageSandboxMode, "off">): ChildProcess {
  const inv = sandboxInvocation(spec, mode);
  return spawn(inv.command, inv.args, { cwd: inv.cwd, env: inv.env, shell: inv.shell, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
}

/** Runs a short command and resolves to its exit code and (truncated) output. */
export function probe(command: string, args: string[], timeoutMs = 15_000): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve) => {
    let output = "";
    let child: ChildProcess;
    try {
      child = spawn(command, args, { shell: process.platform === "win32", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      resolve({ code: null, output: (error as Error).message });
      return;
    }
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    const append = (d: Buffer) => { output = (output + d.toString()).slice(-4000); };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    child.once("error", (error) => { clearTimeout(timer); resolve({ code: null, output: error.message }); });
    child.once("close", (code) => { clearTimeout(timer); resolve({ code, output }); });
  });
}

let bwrapCheck: Promise<string | null> | null = null;

/** Null when bubblewrap can create its namespaces here; otherwise why not (missing binary, seccomp…). */
export function bwrapUnavailable(): Promise<string | null> {
  // Probe with the exact arguments real builds use, so a missing mount fails here and not mid-build.
  const inv = sandboxInvocation({ command: ["true"], cwd: "/tmp", env: {}, mounts: [] }, "bwrap");
  bwrapCheck ??= probe(inv.command, inv.args)
    .then(({ code, output }) => code === 0 ? null : `bubblewrap no puede aislar procesos aquí: ${output.trim().slice(0, 300) || "no está instalado"}`);
  return bwrapCheck;
}
