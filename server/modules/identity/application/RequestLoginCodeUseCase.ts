import type { ILoginCodeRepository, IMailerService } from "../ports/repositories.js";

export class RequestLoginCodeUseCase {
  constructor(
    private readonly loginCodeRepo: ILoginCodeRepository,
    private readonly mailer: IMailerService,
    private readonly codeGenerator: () => string,
  ) {}

  async execute(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const code = this.codeGenerator();
    await this.loginCodeRepo.saveCode(normalized, code, 15);
    const sent = await this.mailer.sendLoginCode(normalized, code);
    if (!sent) {
      console.log(`[forja] código de acceso para ${normalized}: ${code}`);
    }
    return sent;
  }
}
