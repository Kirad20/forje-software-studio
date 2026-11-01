import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

export const newId = () => randomBytes(12).toString("base64url");
export const newToken = () => randomBytes(32).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const numericCode = (digits: number) => String(randomInt(0, 10 ** digits)).padStart(digits, "0");

/**
 * Password hashing: scrypt (memory-hard, built into Node; argon2id would need a native
 * dependency until Node 24.7). Parameters follow OWASP's minimum (N=2^17, r=8, p=1) and travel
 * inside the hash, so they can be raised later and old hashes still verify and get upgraded.
 * Format: scrypt$N$r$p$salt$key. The legacy 3-part form (scrypt$salt$key) used N=16384.
 */
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, keyLen: 64 };
const LEGACY = { N: 2 ** 14, r: 8, p: 1 };

function scryptKey(password: string, salt: Buffer, N: number, r: number, p: number, len: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, len, { N, r, p, maxmem: 256 * N * r }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

// Each hash holds ~128 MB while it runs: cap the concurrent ones so a login flood cannot exhaust memory.
let running = 0;
const waiting: (() => void)[] = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (running >= 2) await new Promise<void>((r) => waiting.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

export function hashPassword(password: string): Promise<string> {
  return withSlot(async () => {
    const salt = randomBytes(16);
    const { N, r, p, keyLen } = SCRYPT;
    const key = await scryptKey(password, salt, N, r, p, keyLen);
    return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${key.toString("hex")}`;
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts[0] !== "scrypt") return Promise.resolve(false);
  const legacy = parts.length === 3;
  const [N, r, p] = legacy ? [LEGACY.N, LEGACY.r, LEGACY.p] : parts.slice(1, 4).map(Number);
  const [saltHex, keyHex] = legacy ? [parts[1], parts[2]] : [parts[4], parts[5]];
  if (!N || !r || !p || !saltHex || !keyHex || (parts.length !== 3 && parts.length !== 6)) return Promise.resolve(false);
  // Refuse parameters outside what we ever write: a tampered row must not become a memory bomb.
  if (N > 2 ** 20 || r > 16 || p > 4) return Promise.resolve(false);
  return withSlot(async () => {
    const expected = Buffer.from(keyHex, "hex");
    const key = await scryptKey(password, Buffer.from(saltHex, "hex"), N, r, p, expected.length);
    return key.length === expected.length && timingSafeEqual(key, expected);
  });
}

/** True when the stored hash uses weaker parameters than today's, so a login can upgrade it. */
export function passwordNeedsRehash(stored: string): boolean {
  const parts = stored.split("$");
  return parts.length === 3 || Number(parts[1]) < SCRYPT.N || Number(parts[2]) < SCRYPT.r || Number(parts[3]) < SCRYPT.p;
}

/** A hash to compare against when the account does not exist, so response time does not reveal it. */
let dummy: Promise<string> | undefined;
export async function burnPasswordCheck(password: string) {
  dummy ??= hashPassword("forja-timing-equalizer");
  await verifyPassword(password, await dummy);
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
