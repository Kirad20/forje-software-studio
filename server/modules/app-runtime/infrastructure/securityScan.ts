import { createHash } from "node:crypto";
import { quickScan as scan } from "../domain/securityScan.js";
import type { FileMap } from "../domain/publication.js";

const fingerprint = (...parts: string[]) => createHash("sha1").update(parts.join("\0")).digest("hex").slice(0, 12);
export const quickScan = (files: FileMap) => scan(files, fingerprint);
export { findSecret, formatFinding, type Finding, type Severity } from "../domain/securityScan.js";
