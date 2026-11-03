import { describe, expect, it, vi } from "vitest";
import { createSettingReactions } from "../../../../server/bootstrap/settingReactions.js";

describe("Bootstrap setting reactions", () => {
  it("subscribes once, applies each related reaction, and unsubscribes idempotently", () => {
    let listener: ((keys: string[]) => void) | undefined;
    const unsubscribe = vi.fn(() => { listener = undefined; });
    const onSettingsChanged = vi.fn((next: (keys: string[]) => void) => {
      listener = next;
      return unsubscribe;
    });
    const ports = {
      resetTransport: vi.fn(),
      reloadLangfuse: vi.fn(),
      reschedulePoll: vi.fn(),
      reloadServices: vi.fn(),
    };
    const reactions = createSettingReactions({ onSettingsChanged }, ports);

    reactions.start();
    reactions.start();
    listener?.(["smtpUrl", "langfuse.secretKey", "github.pollMs"]);
    expect(onSettingsChanged).toHaveBeenCalledOnce();
    expect(ports.resetTransport).toHaveBeenCalledOnce();
    expect(ports.reloadLangfuse).toHaveBeenCalledOnce();
    expect(ports.reschedulePoll).toHaveBeenCalledOnce();
    expect(ports.reloadServices).toHaveBeenCalledOnce();

    reactions.stop();
    reactions.stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(listener).toBeUndefined();
  });
});
