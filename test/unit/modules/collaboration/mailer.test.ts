import { describe, expect, it, vi } from "vitest";

import { PlatformCollaborationMailerService } from "../../../../server/modules/collaboration/infrastructure/PlatformCollaborationMailerService.js";

describe("Collaboration invitation email adapter", () => {
  it("preserves the public URL, subject, HTML and delivery result", async () => {
    const send = vi.fn().mockResolvedValue(false);
    expect(await new PlatformCollaborationMailerService(send, "https://studio.example").sendInvitation({
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
