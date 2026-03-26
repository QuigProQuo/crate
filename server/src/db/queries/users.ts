import db from '../index';

export function findByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any | null;
}

export function findByAppleId(appleId: string) {
  return db.prepare('SELECT * FROM users WHERE apple_id = ?').get(appleId) as any | null;
}

export function findById(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any | null;
}

export function create(data: { email?: string; apple_id?: string; display_name?: string }) {
  return db.prepare(
    'INSERT INTO users (email, apple_id, display_name) VALUES (?, ?, ?) RETURNING *'
  ).get(data.email ?? null, data.apple_id ?? null, data.display_name ?? null) as any;
}

export function update(id: string, data: { email?: string; apple_id?: string; display_name?: string }) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.apple_id !== undefined) { fields.push('apple_id = ?'); values.push(data.apple_id); }
  if (data.display_name !== undefined) { fields.push('display_name = ?'); values.push(data.display_name); }

  if (fields.length === 0) return findById(id);

  fields.push('updated_at = unixepoch()');
  values.push(id);

  return db.prepare(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING *`
  ).get(...values) as any;
}
