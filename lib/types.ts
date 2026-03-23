export interface RecordInfo {
  id: number;
  title: string;
  artist: string;
  year: number;
  label: string;
  genres: string[];
  coverImage: string;
  tracklist: TrackInfo[];
  lowestPrice?: number;
  numForSale?: number;
  haveCount?: number;
  wantCount?: number;
}

export type GoldmineGrade = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P';

export interface ConditionGrade {
  mediaGrade: GoldmineGrade;
  sleeveGrade: GoldmineGrade;
  confidence: 'high' | 'medium' | 'low';
  notes: string[];
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
