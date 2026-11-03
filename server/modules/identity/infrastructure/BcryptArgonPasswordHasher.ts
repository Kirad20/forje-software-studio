import { burnPasswordCheck, hashPassword, passwordNeedsRehash, verifyPassword } from "../../../shared/crypto.js";
import type { IPasswordHasher } from "../ports/repositories.js";

export class BcryptArgonPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return verifyPassword(password, hash);
  }

  needsRehash(hash: string): boolean {
    return passwordNeedsRehash(hash);
  }

  async burnCheck(password: string): Promise<void> {
    return burnPasswordCheck(password);
  }
}
