import type { ICollaborationMailerService, SendInvitationParams } from "../ports/repositories.js";

export class PlatformCollaborationMailerService implements ICollaborationMailerService {
  constructor(
    private readonly sendPlatformEmail: (to: string, subject: string, html: string) => Promise<boolean>,
    private readonly publicUrl: string,
  ) {}

  async sendInvitation(params: SendInvitationParams): Promise<boolean> {
    const { to, inviterEmail, projectId, projectName } = params;
    return this.sendPlatformEmail(
      to,
      `${inviterEmail} te invitó a «${projectName}» en Forja`,
      `<p>${inviterEmail} te invitó a colaborar en <b>${projectName}</b>.</p><p><a href="${this.publicUrl}/p/${projectId}">Abrir el proyecto</a> (entra con este correo).</p>`,
    );
  }
}
