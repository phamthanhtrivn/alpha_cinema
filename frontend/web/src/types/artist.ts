export interface ArtistResDTO {
    id: string;
    fullName: string;
    bio: string;
    dateOfBirth: string;
    nationality: string;
    avatarUrl: string;
    type?: string;
}

export interface ArtistSummary {
    id: string;
    fullName: string;
}

export const ALL_ARTIST_TYPES = [
    { label: "Diễn viên", value: "ACTOR" },
    { label: "Đạo diễn", value: "DIRECTOR" }
];
