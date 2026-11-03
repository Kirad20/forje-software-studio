export { createEmail } from "./application/email.js";
export type { EmailInput } from "./application/email.js";
export { resetTransport, stopEmailTransport } from "./infrastructure/email.js";
import { createEmail } from "./application/email.js";
import { emailPorts } from "./infrastructure/email.js";
export const { sendEmail, sendPlatformEmail, receiveEmail, listEmails } = createEmail(emailPorts);
