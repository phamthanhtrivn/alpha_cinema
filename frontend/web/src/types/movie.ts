import type { ArtistSummary } from "./artist";

export const ReleaseStatus = {
  UPCOMING: "UPCOMING",
  NOW_SHOWING: "NOW_SHOWING",
  ENDED: "ENDED",
};

export type ReleaseStatusType =
  (typeof ReleaseStatus)[keyof typeof ReleaseStatus];

export interface MovieSummaryResponse {
  id: string;
  title: string;
  duration: number;
  premiereDate: Date;
  producer: string;
  thumbnailUrl: string;
  ageType: string;
  releaseYear: number;
  nationality: string;
  avgRating: number;
  releaseStatus: ReleaseStatusType;
  genre: string[];
}

export interface SelectionDTO {
  id: string;
  label: string;
}

export interface MoviePublic {
  id: string;
  title: string;
  duration: number;
  premiereDate: Date;
  thumbnailUrl: string;
  trailerUrl: string;
  bannerUrl: string;
  ageType: string;
  avgRating: number;
}

export interface MoviePublicDetail {
  id: string;
  title: string;
  duration: number;
  description: string;
  premiereDate: Date;
  producer: string;
  thumbnailUrl: string;
  bannerUrl: string;
  ageType: string;
  releaseYear: number;
  nationality: string;
  avgRating: number;
  totalReviews: number;
  releaseStatus: ReleaseStatusType;
  genre: string[];
  actors: ArtistSummary[];
  directors: ArtistSummary[];
  trailerUrl: string;
}

export const ALL_GENRES = [
  "Hành động",
  "Kinh dị",
  "Tình cảm",
  "Hài hước",
  "Viễn tưởng",
  "Phiêu lưu",
];
export const ALL_PROJECTION = ["2D", "3D", "IMAX"];

export const ALL_PROJECTION_OPTIONS = [
  { label: "2D", value: "_2D" },
  { label: "3D", value: "_3D" },
  { label: "IMAX", value: "IMAX" },
];

export const ALL_TRANSLATION = [
  { label: "Lồng tiếng", value: "DUBBING" },
  { label: "Phụ đề", value: "SUBTITLES" },
  { label: "Thuyết minh", value: "VOICE_OVER" },
];
export const ALL_STATUS = ["UPCOMING", "NOW_SHOWING", "ENDED"];

export interface MovieSearchDTO {
  title?: string;
  releaseStatus?: ReleaseStatusType;
  nationality?: string;
  ageTypeId?: string;
  releaseYear?: number;
  genre?: string;
  artistId?: string;
  projectionType?: string;
  translationType?: string;
}
