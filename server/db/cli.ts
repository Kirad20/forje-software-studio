// Database tasks: npm run db:migrate | db:seed [-- --force] | db:seed:dev | db:reset [-- --yes]
import pg from "pg";
import { config } from "../config.js";
import { closePlatformDb, platformDb } from "../platform/db.js";
import { seedDev } from "./seeds/dev.js";
import { seedLocal } from "./seeds/local.js";

const [command, ...flags] = process.argv.slice(2);

async function main() {
  if (!config.databaseUrl) throw new Error("Falta DATABASE_URL.");
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
      const done = await seedLocal(config.seedFile);
      console.log(`Base de datos vacía y migrada.${done.length ? ` ${config.seedFile}: ${done.join(", ")}` : ""}`);
      break;
    }
    default:
      throw new Error("Uso: tsx server/db/cli.ts migrate | seed [--force] | seed:dev | reset [--yes]");
  }
}

main()
  .then(() => closePlatformDb())
  .catch(async (e) => {
    console.error(`[forja] ${(e as Error).message}`);
    await closePlatformDb().catch(() => {});
    process.exit(1);
  });
