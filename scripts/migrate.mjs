// Aplica los archivos SQL de /supabase contra la base de datos de Supabase.
// Se ejecuta automáticamente en cada build. Cada archivo se aplica una sola
// vez; el registro vive en la tabla schema_migrations.
//
// Requiere la variable de entorno SUPABASE_DB_URL con la cadena de conexión
// directa de Postgres. En Vercel se recomienda el pooler (puerto 6543) porque
// los build hosts son IPv4-only y la conexión directa de Supabase es
// IPv6-only en proyectos nuevos.
//
// En local, si la variable no está definida, el script no hace nada y termina
// ok para que `npm run build` siga funcionando sin credenciales. En Vercel,
// si la variable falta, el build falla a propósito para que se note.

import pg from "pg";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase");

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const onVercel = !!process.env.VERCEL;

console.log("==================================================");
console.log("[migrate] Iniciando migraciones de Supabase");
console.log(`[migrate] entorno: ${onVercel ? "Vercel" : "local"}`);
console.log("==================================================");

if (!url) {
  if (onVercel) {
    console.error("[migrate] ERROR: SUPABASE_DB_URL no está configurada en Vercel.");
    console.error("[migrate] Configurala en Project Settings → Environment Variables.");
    console.error("[migrate] Usa el pooler (puerto 6543) para evitar problemas IPv4/IPv6:");
    console.error("[migrate]   postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres");
    process.exit(1);
  }
  console.log("[migrate] SUPABASE_DB_URL no está configurada — saltando migraciones (modo local).");
  process.exit(0);
}

let host = "(desconocido)";
try {
  const parsed = new URL(url);
  host = `${parsed.hostname}:${parsed.port || "5432"}`;
} catch {}
console.log(`[migrate] conectando a ${host}...`);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("[migrate] conexión OK");

  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz default now()
    );
  `);

  const files = (await readdir(migrationsDir))
    .filter(f => f.endsWith(".sql"))
    .sort();

  const { rows } = await client.query("select filename from schema_migrations");
  const applied = new Set(rows.map(r => r.filename));

  let pendientes = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] ${file} — ya aplicado`);
      continue;
    }
    pendientes++;
    console.log(`[migrate] aplicando ${file}...`);
    const sql = await readFile(join(migrationsDir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into schema_migrations (filename) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log(`[migrate]   ok ${file}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`[migrate]   FALLO ${file}: ${err.message}`);
      throw err;
    }
  }

  console.log(
    pendientes === 0
      ? "[migrate] sin cambios."
      : `[migrate] listo, ${pendientes} archivo(s) aplicado(s).`,
  );
} catch (err) {
  console.error(`[migrate] ERROR: ${err.message}`);
  if (err.code) console.error(`[migrate] código: ${err.code}`);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
