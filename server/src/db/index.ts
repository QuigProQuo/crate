import { Database } from 'bun:sqlite';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = process.env.DB_PATH || resolve(import.meta.dir, '../../data/crate.db');

// Ensure data directory exists
mkdirSync(resolve(DB_PATH, '..'), { recursive: true });

const db = new Database(DB_PATH);
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

export default db;
