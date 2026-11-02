import { sendPlatformEmail } from "../../../baas/email.js";
import { config } from "../../../config.js";
import type { ICollaborationMailerService, SendInvitationParams } from "../ports/repositories.js";

export class PlatformCollaborationMailerService implements ICollaborationMailerService {
  async sendInvitation(params: SendInvitationParams): Promise<boolean> {
    const { to, inviterEmail, projectId, projectName } = params;
    return sendPlatformEmail(
      to,
      `${inviterEmail} te invitó a «${projectName}» en Forja`,
      `<p>${inviterEmail} te invitó a colaborar en <b>${projectName}</b>.</p><p><a href="${config.publicUrl}/p/${projectId}">Abrir el proyecto</a> (entra con este correo).</p>`,
    );
  }
}
