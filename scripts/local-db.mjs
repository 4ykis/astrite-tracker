// Starts a local Postgres instance for development, no Docker/WSL required.
// Data persists in .pgdata/ across restarts. Matches the connection string
// in .env (postgres:postgres@localhost:51218/template1).
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, "..", ".pgdata");

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "postgres",
  port: 51218,
  persistent: true,
});

if (!existsSync(databaseDir)) {
  await pg.initialise();
}

await pg.start();
console.log("Postgres is running on localhost:51218 (Ctrl+C to stop)");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await pg.stop();
    process.exit(0);
  });
}
