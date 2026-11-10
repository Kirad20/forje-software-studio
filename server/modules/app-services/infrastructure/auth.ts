import { hashPassword, newId, newToken, numericCode, sha256, verifyPassword } from "../../../shared/crypto.js";
import { authRepository, platformRepository } from "./repositories.js";
import { sendEmail } from "../email.js";
import { log } from "./observer.js";
export const authPorts = {
  hashPassword, newId, newToken, numericCode, sha256, verifyPassword, projectDb: authRepository, sendEmail, log,
  async projectOwnerEmail(projectId: string) {
    const owner = await platformRepository.one<{ email: string }>("authProjectOwner", [projectId]);
    if (!owner) throw new Error("Proyecto no encontrado");
    return owner.email;
  },
};
