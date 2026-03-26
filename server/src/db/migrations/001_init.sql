PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE,
  apple_id TEXT UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE devices (
  device_uuid TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_devices_user ON devices(user_id);

CREATE TABLE magic_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_magic_links_email ON magic_links(email);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_uuid TEXT REFERENCES devices(device_uuid),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE records (
  discogs_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER,
  label TEXT,
  genres TEXT,
  cover_image TEXT,
  tracklist TEXT,
  lowest_price REAL,
  num_for_sale INTEGER,
  have_count INTEGER,
  want_count INTEGER,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE scan_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  device_uuid TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  discogs_id INTEGER NOT NULL REFERENCES records(discogs_id),
  scanned_at INTEGER NOT NULL,
  media_grade TEXT,
  sleeve_grade TEXT,
  grade_confidence TEXT,
  grade_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_scan_history_user ON scan_history(user_id);
CREATE INDEX idx_scan_history_device ON scan_history(device_uuid);

CREATE TABLE collection (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discogs_id INTEGER NOT NULL REFERENCES records(discogs_id),
  status TEXT NOT NULL CHECK(status IN ('have', 'want')),
  notes TEXT,
  added_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, discogs_id)
);
CREATE INDEX idx_collection_user_status ON collection(user_id, status);

CREATE TABLE price_alerts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discogs_id INTEGER NOT NULL REFERENCES records(discogs_id),
  threshold REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  last_checked INTEGER,
  last_price REAL,
  triggered_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, discogs_id)
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
