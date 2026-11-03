// Database tasks: npm run db:migrate | db:seed [-- --force] | db:seed:dev | db:reset [-- --yes]
import pg from "pg";
import { config } from "../../shared/config.js";
import { closePlatformDb, platformDb } from "../../shared/database/index.js";
import { createDevelopmentSeed } from "./developmentSeed.js";
import { createLocalSeed } from "./localSeed.js";
import { createMonolith } from "../composition.js";
import { closeAll } from "../../modules/app-services/projectDb.js";
import { stopEmailTransport } from "../../modules/app-services/email.js";

const [command, ...flags] = process.argv.slice(2);
const monolith = createMonolith();
const seedDev = createDevelopmentSeed(monolith);
const seedLocal = createLocalSeed(monolith.settings);

async function main() {
  if (!config.databaseUrl) throw new Error("Falta DATABASE_URL.");
  if (command !== "reset") await platformDb();
  await monolith.startBindings();
  if (command !== "migrate" && command !== "reset") {
    await monolith.settings.start();
    await monolith.models.start();
  }
  switch (command) {
    case "migrate":
      // platformDb() applies pending migrations and the default seed.
      await platformDb();
      console.log("Migraciones y valores por defecto al día.");
      break;
    case "seed": {
      await platformDb();
      const done = await seedLocal(config.seedFile, { force: flags.includes("--force") });
      console.log(done.length ? `${config.seedFile}: ${done.join(", ")}` : `Nada que aplicar desde ${config.seedFile || "(sin archivo)"}.`);
      break;
    }
    case "seed:dev": {
      await platformDb();
      const done = await seedDev();
      console.log(done.length ? `Datos de desarrollo: ${done.join(", ")}` : "Los datos de desarrollo ya estaban.");
      console.log("Cuentas: admin@forja.test / forja-admin-1234 · dev@forja.test / forja-dev-1234");
      break;
    }
    case "reset": {
      if (process.env.NODE_ENV === "production" && !flags.includes("--yes")) throw new Error("db:reset borra todo: con NODE_ENV=production pásale -- --yes.");
      const client = new pg.Client({ connectionString: config.databaseUrl });
      await client.connect();
      await client.query(`drop schema public cascade; create schema public;`);
      await client.end();
      await platformDb();
      await monolith.settings.start();
      await monolith.models.start();
      const done = await seedLocal(config.seedFile);
      console.log(`Base de datos vacía y migrada.${done.length ? ` ${config.seedFile}: ${done.join(", ")}` : ""}`);
      break;
    }
    default:
      throw new Error("Uso: tsx server/bootstrap/database/cli.ts migrate | seed [--force] | seed:dev | reset [--yes]");
  }
}

try {
  await main();
} catch (error) {
  console.error("[forja] database command:", error);
  process.exitCode = 1;
} finally {
  try {
    await monolith.models.stop();
    monolith.settings.stop();
    stopEmailTransport();
    await closeAll();
    await monolith.stopBindings();
  } finally {
    await closePlatformDb();
  }
}
