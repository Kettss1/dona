import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('Running migrations...');

  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

  for (const file of sqlFiles) {
    const result = await query<{ name: string }>(
      'SELECT name FROM migrations WHERE name = $1',
      [file]
    );

    if (result.rows.length > 0) {
      console.log(`Skipping ${file} (already executed)`);
      continue;
    }

    console.log(`Executing ${file}...`);
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    await query(sql);
    await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
    console.log(`Completed ${file}`);
  }

  console.log('Migrations complete!');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
