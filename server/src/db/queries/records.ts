import db from '../index';

export function upsert(data: {
  discogs_id: number;
  title: string;
  artist: string;
  year?: number;
  label?: string;
  genres?: string;
  cover_image?: string;
  tracklist?: string;
  lowest_price?: number;
  num_for_sale?: number;
  have_count?: number;
  want_count?: number;
}) {
  return db.prepare(`
    INSERT INTO records (discogs_id, title, artist, year, label, genres, cover_image, tracklist, lowest_price, num_for_sale, have_count, want_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(discogs_id) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      year = excluded.year,
      label = excluded.label,
      genres = excluded.genres,
      cover_image = excluded.cover_image,
      tracklist = excluded.tracklist,
      lowest_price = excluded.lowest_price,
      num_for_sale = excluded.num_for_sale,
      have_count = excluded.have_count,
      want_count = excluded.want_count,
      updated_at = unixepoch()
    RETURNING *
  `).get(
    data.discogs_id,
    data.title,
    data.artist,
    data.year ?? null,
    data.label ?? null,
    data.genres ?? null,
    data.cover_image ?? null,
    data.tracklist ?? null,
    data.lowest_price ?? null,
    data.num_for_sale ?? null,
    data.have_count ?? null,
    data.want_count ?? null
  ) as any;
}

export function findById(discogsId: number) {
  return db.prepare('SELECT * FROM records WHERE discogs_id = ?').get(discogsId) as any | null;
}
