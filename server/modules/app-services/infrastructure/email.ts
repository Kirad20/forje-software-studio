import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../../../shared/config.js";
import { platformRepository } from "./repositories.js";
import { log } from "./observer.js";
let transport: Transporter | null | undefined;
const getTransport = () => (transport ??= config.smtpUrl ? nodemailer.createTransport(config.smtpUrl) : null);
export function resetTransport() { transport?.close(); transport = undefined; }
export const stopEmailTransport = resetTransport;
export const emailPorts = { ...platformRepository, log, getTransport, emailFrom: () => config.emailFrom };
