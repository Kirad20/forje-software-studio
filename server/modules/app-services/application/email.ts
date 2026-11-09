import type { EmailPorts } from "../ports/email.js";
import { verifiedSender } from "../domain/policies.js";
import type { AppEnv } from "../domain/contracts.js";

export interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
  /** Display name, or a full address at the project's verified domain. */
  from?: string;
}

export function createEmail({ one, q, log, getTransport, emailFrom }: EmailPorts) {

/**
 * Sends one email from an app. Until the project has a verified sending domain and the
 * From address uses it, mail addressed to anyone but the owner is delivered to the owner
 * instead, with the intended recipient in the subject — testing never reaches real users.
 */
async function sendEmail(projectId: string, input: EmailInput, env: AppEnv = "published") {
  const project = await one<{ owner_email: string; name: string; email_domain: string | null; email_domain_verified: boolean }>(
    "emailProject",
    [projectId],
  );
  if (!project) throw new Error("Proyecto no encontrado");

  const domainOk = verifiedSender(project, input.from);
  const from = domainOk ? input.from! : `${input.from && !input.from.includes("@") ? input.from : project.name} <${emailFrom()}>`;

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const results = [];
  for (const intended of recipients) {
    const redirect = !domainOk && intended.toLowerCase() !== project.owner_email.toLowerCase();
    const to = redirect ? project.owner_email : intended;
    const subject = redirect ? `[para: ${intended}] ${input.subject}` : input.subject;
    const html = redirect
      ? `<p style="background:#fff7e6;padding:8px;border-radius:6px;font-size:13px">Este correo era para <b>${intended}</b>. Llega a ti porque el proyecto aún no tiene un dominio de envío verificado.</p>${input.html}`
      : input.html;

    let status = "logged";
    const t = getTransport();
    if (t) {
      try {
        await t.sendMail({ from, to, subject, html });
        status = "sent";
      } catch (e) {
        status = "failed";
        log(projectId, { env, level: "error", source: "email", message: `Fallo al enviar a ${to}: ${(e as Error).message}` });
      }
    }
    await q(
      "emailRecordOutbound",
      [projectId, to, redirect ? intended : null, from, subject, html, status, env],
    );
    log(projectId, { env, level: "info", source: "email", message: `Correo "${subject}" → ${to} (${status})` });
    results.push({ to, intendedTo: intended, redirected: redirect, status });
  }
  return results;
}

/** Mail from Forja itself (sign-in codes). Returns false when no SMTP is configured. */
async function sendPlatformEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransport();
  if (!t) return false;
  try {
    await t.sendMail({ from: `Forja <${emailFrom()}>`, to, subject, html });
    return true;
  } catch (e) {
    console.error("[forja] no se pudo enviar el correo de acceso:", (e as Error).message);
    return false;
  }
}

/** Records an inbound email (posted by a mail gateway or the Email tab's test form). */
async function receiveEmail(projectId: string, input: { from: string; to: string; subject: string; html: string }, env: AppEnv = "published") {
  await q(
    "emailRecordInbound",
    [projectId, input.to, input.from, input.subject, input.html, env],
  );
}

async function listEmails(projectId: string, env?: AppEnv) {
  return q(
    "emailList",
    [projectId, env ?? null],
  );
}
return { sendEmail, sendPlatformEmail, receiveEmail, listEmails };
}
