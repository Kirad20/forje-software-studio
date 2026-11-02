import { sendPlatformEmail } from "../../../baas/email.js";
import type { IMailerService } from "../ports/repositories.js";

export class PlatformMailerService implements IMailerService {
  async sendLoginCode(email: string, code: string): Promise<boolean> {
    return sendPlatformEmail(
      email,
      `Tu código de acceso a Forja: ${code}`,
      `<p>Tu código para entrar en Forja es:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 15 minutos. Si no lo pediste, ignora este correo.</p>`,
    );
  }

  async sendPasswordReset(email: string, code: string): Promise<boolean> {
    return sendPlatformEmail(
      email,
      `Código para cambiar tu contraseña de Forja: ${code}`,
      `<p>Usa este código para elegir una contraseña nueva:</p><p style="font-size:28px;letter-spacing:4px"><b>${code}</b></p><p>Caduca en 30 minutos. Si no lo pediste, ignora este correo: tu contraseña sigue igual.</p>`,
    );
  }
}
