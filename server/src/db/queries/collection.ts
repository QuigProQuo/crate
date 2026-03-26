import db from '../index';

export function upsert(data: {
  user_id: string;
  discogs_id: number;
  status: 'have' | 'want';
  notes?: string;
}) {
  return db.prepare(`
    INSERT INTO collection (user_id, discogs_id, status, notes)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, discogs_id) DO UPDATE SET
      status = excluded.status,
      notes = excluded.notes,
      updated_at = unixepoch()
    RETURNING *
  `).get(data.user_id, data.discogs_id, data.status, data.notes ?? null) as any;
}

export function findByUser(userId: string, status?: 'have' | 'want') {
  if (status) {
    return db.prepare(
      'SELECT c.*, r.title, r.artist, r.cover_image, r.year FROM collection c JOIN records r ON c.discogs_id = r.discogs_id WHERE c.user_id = ? AND c.status = ? ORDER BY c.added_at DESC'
    ).all(userId, status) as any[];
  }
  return db.prepare(
    'SELECT c.*, r.title, r.artist, r.cover_image, r.year FROM collection c JOIN records r ON c.discogs_id = r.discogs_id WHERE c.user_id = ? ORDER BY c.added_at DESC'
  ).all(userId) as any[];
}

export function deleteById(id: string) {
  return db.prepare('DELETE FROM collection WHERE id = ? RETURNING *').get(id) as any | null;
}
