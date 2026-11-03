export interface SettingsChangePort {
  onSettingsChanged(listener: (keys: string[]) => void): () => void;
}

export interface SettingReactionPorts {
  resetTransport(): void;
  reloadLangfuse(): void;
  reschedulePoll(): void;
}

export function createSettingReactions(
  settings: SettingsChangePort,
  reactions: SettingReactionPorts,
) {
  let unsubscribe: (() => void) | undefined;

  return {
    start() {
      if (unsubscribe) return;
      unsubscribe = settings.onSettingsChanged((keys) => {
        const changed = (prefix: string) => keys.some((key) => key === prefix || key.startsWith(`${prefix}.`));
        if (changed("smtpUrl")) reactions.resetTransport();
        if (changed("langfuse")) reactions.reloadLangfuse();
        if (changed("github.pollMs")) reactions.reschedulePoll();
      });
    },
    stop() {
      unsubscribe?.();
      unsubscribe = undefined;
    },
  };
}
