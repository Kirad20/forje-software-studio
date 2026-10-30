import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../config.js";
import { one, q } from "../platform/db.js";
import { log } from "../platform/events.js";

export interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
  /** Display name, or a full address at the project's verified domain. */
  from?: string;
}

let transport: Transporter | null | undefined;
const getTransport = () => (transport ??= config.smtpUrl ? nodemailer.createTransport(config.smtpUrl) : null);

/**
 * Sends one email from an app. Until the project has a verified sending domain and the
 * From address uses it, mail addressed to anyone but the owner is delivered to the owner
 * instead, with the intended recipient in the subject — testing never reaches real users.
 */
export async function sendEmail(projectId: string, input: EmailInput) {
  const project = await one<{ owner_email: string; name: string; email_domain: string | null; email_domain_verified: boolean }>(
    `select a.email as owner_email, p.name, p.email_domain, p.email_domain_verified
     from projects p join accounts a on a.id = p.owner_id where p.id = $1`,
    [projectId],
  );
  if (!project) throw new Error("Proyecto no encontrado");

  const fromAddress = input.from?.includes("@") ? input.from.replace(/.*<|>.*/g, "") : null;
  const domainOk =
    project.email_domain_verified && !!fromAddress && fromAddress.toLowerCase().endsWith(`@${project.email_domain?.toLowerCase()}`);
  const from = domainOk ? input.from! : `${input.from && !input.from.includes("@") ? input.from : project.name} <${config.emailFrom}>`;

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
        log(projectId, { env: "preview", level: "error", source: "email", message: `Fallo al enviar a ${to}: ${(e as Error).message}` });
      }
    }
    await q(
      `insert into emails (project_id, to_address, intended_to, from_address, subject, html, status) values ($1, $2, $3, $4, $5, $6, $7)`,
      [projectId, to, redirect ? intended : null, from, subject, html, status],
    );
    log(projectId, { env: "preview", level: "info", source: "email", message: `Correo "${subject}" → ${to} (${status})` });
    results.push({ to, intendedTo: intended, redirected: redirect, status });
  }
  return results;
}

/** Mail from Forja itself (sign-in codes). Returns false when no SMTP is configured. */
export async function sendPlatformEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransport();
  if (!t) return false;
  try {
    await t.sendMail({ from: `Forja <${config.emailFrom}>`, to, subject, html });
    return true;
  } catch (e) {
    console.error("[forja] no se pudo enviar el correo de acceso:", (e as Error).message);
    return false;
  }
}

/** Records an inbound email (posted by a mail gateway or the Email tab's test form). */
export async function receiveEmail(projectId: string, input: { from: string; to: string; subject: string; html: string }) {
  await q(
    `insert into emails (project_id, direction, to_address, from_address, subject, html, status) values ($1, 'in', $2, $3, $4, $5, 'received')`,
    [projectId, input.to, input.from, input.subject, input.html],
  );
}

export async function listEmails(projectId: string) {
  return q(
    `select id, direction, to_address as "to", intended_to as "intendedTo", from_address as "from", subject, html, status, created_at as "createdAt"
     from emails where project_id = $1 order by created_at desc limit 200`,
    [projectId],
  );
}
