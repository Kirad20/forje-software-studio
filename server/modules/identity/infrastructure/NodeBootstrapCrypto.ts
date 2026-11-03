import { randomBytes, timingSafeEqual } from "node:crypto";
import { sha256 } from "../../../lib/crypto.js";
import type { BootstrapCrypto } from "../ports/bootstrap.js";

export class NodeBootstrapCrypto implements BootstrapCrypto {
  generate(): string {
    return randomBytes(24).toString("base64url");
  }

  hash(token: string): string {
    return sha256(token);
  }

  matches(givenHash: string, storedHash: string): boolean {
    const a = Buffer.from(givenHash, "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
