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

export const ALL_GENRES = ["Hành động", "Kinh dị", "Tình cảm", "Hài hước", "Viễn tưởng", "Phiêu lưu"];
export const ALL_PROJECTION = ["2D", "3D", "IMAX"];
export const ALL_TRANSLATION = [
  { label: "Lồng tiếng", value: "DUBBING" },
  { label: "Phụ đề", value: "SUBTITLES" },
  { label: "Thuyết minh", value: "VOICE_OVER" }
];
export const ALL_STATUS = ["UPCOMING", "NOW_SHOWING", "ENDED"];