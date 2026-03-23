export interface RecordInfo {
  id: number;
  title: string;
  artist: string;
  year: number;
  label: string;
  genres: string[];
  coverImage: string;
  tracklist: TrackInfo[];
}

export interface TrackInfo {
  position: string;
  title: string;
  duration: string;
}

export interface TrackPreview {
  title: string;
  previewUrl: string | null;
  duration: number;
}

export interface Identification {
  artist: string;
  album: string;
  confidence: 'high' | 'medium' | 'low';
}

export type LookupStatus = 'idle' | 'loading' | 'results' | 'error';

export interface LookupState {
  status: LookupStatus;
  step?: 'identify' | 'discogs' | 'previews';
  record?: RecordInfo;
  previews?: TrackPreview[];
  error?: string;
}
