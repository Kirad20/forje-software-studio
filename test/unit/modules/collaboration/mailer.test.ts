import { describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("../../../../server/baas/email.js", () => ({ sendPlatformEmail: send }));
vi.mock("../../../../server/config.js", () => ({ config: { publicUrl: "https://studio.example" } }));
import { PlatformCollaborationMailerService } from "../../../../server/modules/collaboration/infrastructure/PlatformCollaborationMailerService.js";

describe("Collaboration invitation email adapter", () => {
  it("preserves the public URL, subject, HTML and delivery result", async () => {
    send.mockResolvedValue(false);
    expect(await new PlatformCollaborationMailerService().sendInvitation({
      to: "invitee@example.com",
      inviterEmail: "owner@example.com",
      projectId: "p",
      projectName: "Alpha",
    })).toBe(false);
    expect(send).toHaveBeenCalledWith(
      "invitee@example.com",
      "owner@example.com te invitó a «Alpha» en Forja",
      '<p>owner@example.com te invitó a colaborar en <b>Alpha</b>.</p><p><a href="https://studio.example/p/p">Abrir el proyecto</a> (entra con este correo).</p>',
    );
  });
});
