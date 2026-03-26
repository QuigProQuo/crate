import db from '../index';

export function create(data: {
  user_id: string;
  type: string;
  payload: string;
}) {
  return db.prepare(
    'INSERT INTO notifications (user_id, type, payload) VALUES (?, ?, ?) RETURNING *'
  ).get(data.user_id, data.type, data.payload) as any;
}

export function findByUser(userId: string, unreadOnly = false, limit = 50, offset = 0) {
  if (unreadOnly) {
    return db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(userId, limit, offset) as any[];
  }
  return db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, limit, offset) as any[];
}

export function markRead(id: string) {
  return db.prepare(
    'UPDATE notifications SET read = 1 WHERE id = ? RETURNING *'
  ).get(id) as any;
}
