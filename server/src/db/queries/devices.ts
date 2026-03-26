import db from '../index';

export function findByUuid(deviceUuid: string) {
  return db.prepare('SELECT * FROM devices WHERE device_uuid = ?').get(deviceUuid) as any | null;
}

export function register(deviceUuid: string, userId?: string) {
  return db.prepare(
    'INSERT INTO devices (device_uuid, user_id) VALUES (?, ?) ON CONFLICT(device_uuid) DO UPDATE SET last_seen_at = unixepoch() RETURNING *'
  ).get(deviceUuid, userId ?? null) as any;
}

export function linkToUser(deviceUuid: string, userId: string) {
  return db.prepare(
    'UPDATE devices SET user_id = ? WHERE device_uuid = ? RETURNING *'
  ).get(userId, deviceUuid) as any;
}

export function updateLastSeen(deviceUuid: string) {
  return db.prepare(
    'UPDATE devices SET last_seen_at = unixepoch() WHERE device_uuid = ? RETURNING *'
  ).get(deviceUuid) as any;
}
