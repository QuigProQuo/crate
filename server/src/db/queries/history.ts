import db from '../index';

export function add(data: {
  device_uuid?: string;
  user_id?: string;
  discogs_id: number;
  scanned_at: number;
  media_grade?: string;
  sleeve_grade?: string;
  grade_confidence?: string;
  grade_notes?: string;
}) {
  return db.prepare(`
    INSERT INTO scan_history (device_uuid, user_id, discogs_id, scanned_at, media_grade, sleeve_grade, grade_confidence, grade_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    data.device_uuid ?? null,
    data.user_id ?? null,
    data.discogs_id,
    data.scanned_at,
    data.media_grade ?? null,
    data.sleeve_grade ?? null,
    data.grade_confidence ?? null,
    data.grade_notes ?? null
  ) as any;
}

export function findByUser(userId: string, limit = 50, offset = 0) {
  return db.prepare(
    'SELECT sh.*, r.title, r.artist, r.cover_image FROM scan_history sh JOIN records r ON sh.discogs_id = r.discogs_id WHERE sh.user_id = ? ORDER BY sh.scanned_at DESC LIMIT ? OFFSET ?'
  ).all(userId, limit, offset) as any[];
}

export function findByDevice(deviceUuid: string, limit = 50, offset = 0) {
  return db.prepare(
    'SELECT sh.*, r.title, r.artist, r.cover_image FROM scan_history sh JOIN records r ON sh.discogs_id = r.discogs_id WHERE sh.device_uuid = ? ORDER BY sh.scanned_at DESC LIMIT ? OFFSET ?'
  ).all(deviceUuid, limit, offset) as any[];
}

export function updateGrade(id: string, data: {
  media_grade?: string;
  sleeve_grade?: string;
  grade_confidence?: string;
  grade_notes?: string;
}) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.media_grade !== undefined) { fields.push('media_grade = ?'); values.push(data.media_grade); }
  if (data.sleeve_grade !== undefined) { fields.push('sleeve_grade = ?'); values.push(data.sleeve_grade); }
  if (data.grade_confidence !== undefined) { fields.push('grade_confidence = ?'); values.push(data.grade_confidence); }
  if (data.grade_notes !== undefined) { fields.push('grade_notes = ?'); values.push(data.grade_notes); }

  if (fields.length === 0) return null;

  values.push(id);
  return db.prepare(
    `UPDATE scan_history SET ${fields.join(', ')} WHERE id = ? RETURNING *`
  ).get(...values) as any;
}

export function deleteById(id: string) {
  return db.prepare('DELETE FROM scan_history WHERE id = ? RETURNING *').get(id) as any | null;
}

export function mergeDeviceToUser(deviceUuid: string, userId: string) {
  return db.prepare(
    'UPDATE scan_history SET user_id = ? WHERE device_uuid = ? AND user_id IS NULL'
  ).run(userId, deviceUuid);
}
