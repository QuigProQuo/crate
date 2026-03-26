// Mirror frontend types
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

// Server-specific types
export interface CollectionItem {
  id: string;
  userId: string;
  discogsId: number;
  status: 'have' | 'want';
  notes: string | null;
  addedAt: number;
  record?: RecordInfo;
}

export interface PriceAlert {
  id: string;
  userId: string;
  discogsId: number;
  threshold: number;
  active: boolean;
  lastChecked: number | null;
  lastPrice: number | null;
  triggeredAt: number | null;
  record?: RecordInfo;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: number;
}
