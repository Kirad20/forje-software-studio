import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { config } from "../config.js";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const newId = () => randomBytes(12).toString("base64url");
export const newToken = () => randomBytes(32).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const numericCode = (digits: number) => String(randomInt(0, 10 ** digits)).padStart(digits, "0");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scryptAsync(password, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}

const key = () => Buffer.from(config.secretsKey, "hex");

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(enc: string): string {
  const [iv, tag, data] = enc.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv!);
  decipher.setAuthTag(tag!);
  return Buffer.concat([decipher.update(data!), decipher.final()]).toString("utf8");
}
