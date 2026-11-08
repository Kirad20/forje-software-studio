// Callable real-daemon integration, no simulated Docker. Run: node --import tsx test\repository-runtime-docker.mjs
import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { createRepositoryRuntime, DockerRepositoryRunner, dockerCommand } from "../server/modules/repository-runtime/index.ts";

const id = `docker-smoke-${Date.now()}`;
const contextRoot = path.resolve("test", `.repository-runtime-${id}`);
await mkdir(contextRoot, { recursive: true });
let state;
const store = {
  load: async () => state && structuredClone(state),
  save: async (_id, next) => { state = structuredClone(next); },
  list: async () => state ? [id] : [], delete: async () => { state = undefined; },
  exclusive: async (_id, work) => work(),
};
const files = {
  "package.json": JSON.stringify({ name: "runtime-smoke", scripts: { start: "node server.mjs" } }),
  "Dockerfile": "FROM node:24-bookworm-slim\nWORKDIR /app\nCOPY . .\nRUN mkdir -p /app/data && chown node:node /app/data\nUSER node\nEXPOSE 3000\nCMD [\"node\",\"server.mjs\"]\n",
  "server.mjs": `import http from "node:http"; import fs from "node:fs"; import crypto from "node:crypto";
const state = "/app/data/counter"; const count = Number(fs.existsSync(state) ? fs.readFileSync(state,"utf8") : 0)+1;fs.writeFileSync(state,String(count));
const fingerprint=(value)=>crypto.createHash("sha256").update(value).digest("hex");
http.createServer((req,res)=>{res.setHeader("content-type","application/json"); res.end(JSON.stringify({ count, port:process.env.PORT, database:!!process.env.DATABASE_URL, publicUrl:process.env.PUBLIC_URL, key:process.env.SECRETS_KEY.length, keyFingerprint:fingerprint(process.env.SECRETS_KEY), databaseFingerprint:fingerprint(process.env.DATABASE_URL) }));}).listen(Number(process.env.PORT),"0.0.0.0");`,
};
if (process.argv.includes("--generated")) delete files.Dockerfile;
const runner = new DockerRepositoryRunner({
  enabled: true, contextRoot,
  command: async (args, options) => {
    console.log(`docker ${args[0]} ${args[1] ?? ""}`);
    return dockerCommand(args, options);
  },
});
const runtime = createRepositoryRuntime({
  store, runner, readAllFiles: async () => files, isSlugTaken: async () => false,
  recordPublish: async () => {}, previewUrl: () => "https://preview.smoke.test",
  appUrl: () => "https://published.smoke.test",
});
try {
  assert.equal(await runner.available(), true, "Docker daemon must be available");
  await runtime.configure(id, { postgres: true, storagePath: "/app/data" });
  const built = await runtime.build(id);
  assert.equal(built.preview.status, "ready");
  const published = await runtime.publish(id, { slug: "runtime-smoke", revisionId: built.preview.id });
  assert.equal(published.preview.image, published.published.image, "Publication must promote exactly the built image");
  const preview = await (await runtime.serve(new Request("https://preview.smoke.test/"), id, "preview")).json();
  const production = await (await runtime.serve(new Request("https://published.smoke.test/"), id, "published")).json();
  assert.equal(preview.count, 1);
  assert.equal(production.count, 1, "Preview/published storage volumes must be isolated");
  assert.equal(production.database, true);
  assert.equal(production.key, 64);
  assert.notEqual(preview.keyFingerprint, production.keyFingerprint, "Child encryption keys must be isolated by environment");
  assert.notEqual(preview.databaseFingerprint, production.databaseFingerprint, "Database credentials must be isolated by environment");
  assert.equal(production.publicUrl, "https://published.smoke.test");
  await runtime.stop(id, "preview");
  assert.equal((await runtime.get(id)).preview, null);
  assert.equal((await runtime.get(id)).published.id, built.preview.id);
  console.log(`PASS real Docker ${process.argv.includes("--generated") ? "generated Node" : "Dockerfile"}: build, health, immutable publication, separate PostgreSQL/storage/key, proxy and stop`);
} finally {
  await runtime.remove(id);
  await rm(contextRoot, { recursive: true, force: true });
}
