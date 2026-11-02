import type { IAccountRepository } from "../ports/repositories.js";

export class UpdateAccountNameUseCase {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async execute(id: string, name: string): Promise<void> {
    const trimmed = name.trim().slice(0, 80);
    await this.accountRepo.updateName(id, trimmed);
  }
}
