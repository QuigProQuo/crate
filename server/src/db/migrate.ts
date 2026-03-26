import db from './index';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const MIGRATIONS_DIR = resolve(import.meta.dir, 'migrations');

// Create migrations tracking table
db.run(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

export function migrate() {
  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((r: any) => r.name)
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    console.log(`Applied migration: ${file}`);
  }
}

// Run if called directly
if (import.meta.main) {
  migrate();
  console.log('Migrations complete.');
}
