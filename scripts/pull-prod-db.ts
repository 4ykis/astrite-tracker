// Copies every row from the production database into the local one, so the
// app can be tried against real data. Production is only read (findMany);
// the local database is wiped first (all User rows, which cascade to every
// other table) and then filled with the same rows, ids included.
//
// Usage (with `npm run db:local` running in another terminal):
//   1. Put the production connection string into .env.prod (gitignored):
//        PROD_DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"
//      (Vercel → project → Settings → Environment Variables → WUWA_DATABASE_URL)
//   2. npm run db:pull-prod
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { Prisma, PrismaClient } from "@prisma/client";

for (const file of [".env.prod", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const prodUrl = process.env.PROD_DATABASE_URL;
const localUrls = [process.env.WUWA_PRISMA_DATABASE_URL, process.env.WUWA_DATABASE_URL];

if (!prodUrl) {
  console.error("PROD_DATABASE_URL is not set (put it in .env.prod).");
  process.exit(1);
}

// Refuse to write anywhere but a local Postgres: a wrong .env must never
// let this wipe a remote database.
for (const url of localUrls) {
  const host = url ? new URL(url).hostname : "";
  if (!["localhost", "127.0.0.1"].includes(host)) {
    console.error(`Local database URL must point at localhost, got "${host || "(unset)"}". Check .env.`);
    process.exit(1);
  }
}
if (localUrls.includes(prodUrl)) {
  console.error("PROD_DATABASE_URL is the same as the local database URL.");
  process.exit(1);
}

type Delegate = {
  findMany: () => Promise<Record<string, unknown>[]>;
  createMany: (args: { data: Record<string, unknown>[] }) => Promise<{ count: number }>;
};

function delegate(client: PrismaClient, model: string): Delegate {
  const key = model[0].toLowerCase() + model.slice(1);
  return (client as unknown as Record<string, Delegate>)[key];
}

async function main() {
  console.log("Applying migrations to the local database...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const prod = new PrismaClient({ datasourceUrl: prodUrl });
  const local = new PrismaClient();

  try {
    // User first: every other model references it.
    const models = Prisma.dmmf.datamodel.models
      .map((m) => m.name)
      .sort((a, b) => Number(b === "User") - Number(a === "User"));

    const data: Record<string, Record<string, unknown>[]> = {};
    for (const model of models) {
      data[model] = await delegate(prod, model).findMany();
      console.log(`Read ${data[model].length} ${model} rows from production`);
    }

    await local.$transaction(async (tx) => {
      await tx.user.deleteMany();
      for (const model of models) {
        if (data[model].length === 0) continue;
        const { count } = await delegate(tx as PrismaClient, model).createMany({ data: data[model] });
        console.log(`Wrote ${count} ${model} rows locally`);
      }
    }, { timeout: 120_000 });

    console.log("Done. Log in at http://localhost:3000 with the same Google account.");
  } finally {
    await Promise.all([prod.$disconnect(), local.$disconnect()]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
