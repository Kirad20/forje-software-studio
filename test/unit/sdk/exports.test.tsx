import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as client from "../../../sdk/client/index.js";
import * as ui from "../../../sdk/ui/index.js";

describe("official SDK product entries", () => {
  it("does not register browser listeners when the product entry is imported", async () => {
    const addEventListener = vi.fn();
    vi.stubGlobal("window", { addEventListener });
    try {
      vi.resetModules();
      await import("../../../sdk/client/index.js");
      expect(addEventListener).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("preserves all client exports and route matching", () => {
    for (const name of ["ForjaApp", "Link", "navigate", "matchRoute", "useRoute", "useHead", "ApiError",
      "api", "createApi", "useApi", "auth", "useUser", "storage", "realtime", "useChannel", "ai"]) {
      expect(client).toHaveProperty(name);
    }
    expect(client.matchRoute("/posts/:id", "/posts/a%20b")).toEqual({ id: "a b" });
    expect(client.matchRoute("/posts/:id", "/posts")).toBeNull();
    expect(client.matchRoute("/posts/:id", "/other/1")).toBeNull();
  });

  it("preserves all UI exports and loading/accessibility behavior", () => {
    for (const name of ["cx", "toast", "Spinner", "Skeleton", "EmptyState", "ErrorState", "Toaster",
      "Button", "Input", "Textarea", "Select", "Checkbox", "Card", "Badge", "Dialog", "Tabs", "Tooltip", "FadeIn"]) {
      expect(ui).toHaveProperty(name);
    }
    const button = renderToStaticMarkup(createElement(ui.Button, { loading: true }, "Guardar"));
    expect(button).toContain('disabled=""');
    expect(button).toContain('aria-busy="true"');
    expect(button).toContain('aria-label="Procesando"');
    const input = renderToStaticMarkup(createElement(ui.Input, { id: "email", label: "Email", error: "Required" }));
    expect(input).toContain('for="email"');
    expect(input).toContain('aria-invalid="true"');
    expect(input).toContain('aria-describedby="email-msg"');
    expect(input).toContain('role="alert"');
  });
});
