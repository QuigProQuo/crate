import db from '../index';

export function create(data: {
  user_id: string;
  discogs_id: number;
  threshold: number;
}) {
  return db.prepare(`
    INSERT INTO price_alerts (user_id, discogs_id, threshold)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, discogs_id) DO UPDATE SET
      threshold = excluded.threshold,
      active = 1,
      triggered_at = NULL
    RETURNING *
  `).get(data.user_id, data.discogs_id, data.threshold) as any;
}

export function findByUser(userId: string) {
  return db.prepare(
    'SELECT pa.*, r.title, r.artist, r.cover_image FROM price_alerts pa JOIN records r ON pa.discogs_id = r.discogs_id WHERE pa.user_id = ? ORDER BY pa.created_at DESC'
  ).all(userId) as any[];
}

export function findActive() {
  return db.prepare(
    'SELECT pa.*, r.title, r.artist FROM price_alerts pa JOIN records r ON pa.discogs_id = r.discogs_id WHERE pa.active = 1'
  ).all() as any[];
}

export function updatePrice(id: string, price: number) {
  return db.prepare(
    'UPDATE price_alerts SET last_price = ?, last_checked = unixepoch() WHERE id = ? RETURNING *'
  ).get(price, id) as any;
}

export function trigger(id: string) {
  return db.prepare(
    'UPDATE price_alerts SET triggered_at = unixepoch(), active = 0 WHERE id = ? RETURNING *'
  ).get(id) as any;
}

export function deleteById(id: string) {
  return db.prepare('DELETE FROM price_alerts WHERE id = ? RETURNING *').get(id) as any | null;
}
