// Aplica los archivos SQL de /supabase contra la base de datos de Supabase.
// Se ejecuta automáticamente en cada build (prebuild). Cada archivo se
// aplica una sola vez; el registro vive en la tabla schema_migrations.
//
// Requiere la variable de entorno SUPABASE_DB_URL con la cadena de conexión
// directa de Postgres (Supabase → Project Settings → Database → Connection
// string → URI). Si no está definida, el script no hace nada y termina ok,
// para que `npm run build` siga funcionando en local sin credenciales.

import pg from "pg";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase");

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] SUPABASE_DB_URL no está configurado — saltando migraciones.");
  process.exit(0);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

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
} finally {
  await client.end();
}
