import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export function studioPwa(root: string): Plugin {
  return {
    name: "forja-studio-pwa",
    apply: "build",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((file) => file.startsWith("assets/") && !file.endsWith(".map")).sort();
      const publicFiles = ["offline.html", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
      const hash = createHash("sha256");
      for (const file of files) {
        const item = bundle[file];
        hash.update(file).update(item.type === "chunk" ? item.code : item.source);
      }
      for (const file of publicFiles) hash.update(readFileSync(path.join(root, "public", file)));
      const template = readFileSync(path.join(root, "pwa", "service-worker.js"), "utf8");
      hash.update(template);
      this.emitFile({
        type: "asset", fileName: "sw.js",
        source: template.replace("__VERSION__", hash.digest("hex").slice(0, 16))
          .replace("__PRECACHE__", JSON.stringify([...files, ...publicFiles].map((file) => `/${file}`))),
      });
    },
  };
}
