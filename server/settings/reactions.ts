import { resetTransport } from "../baas/email.js";
import { reloadLangfuse } from "../builder/tracing.js";
import { config } from "../config.js";
import { reschedulePoll } from "../platform/github.js";
import { onSettingsChanged } from "./store.js";

/**
 * What changes when an admin saves a setting, beyond `config` itself: caches and timers that
 * were built from the old value. Kept in one place so the modules stay free of the settings store.
 */
export function wireSettingReactions() {
  onSettingsChanged((keys) => {
    const changed = (prefix: string) => keys.some((k) => k === prefix || k.startsWith(`${prefix}.`));
    if (changed("smtpUrl")) resetTransport();
    if (changed("langfuse")) reloadLangfuse();
    if (changed("github.pollMs")) reschedulePoll();
    if (keys.includes("evals.enabled") && config.evals.enabled) void import("../evals/runner.js").then((m) => m.recoverEvals()).catch(() => {});
  });
}
