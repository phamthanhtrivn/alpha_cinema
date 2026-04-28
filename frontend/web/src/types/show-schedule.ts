export interface ShowScheduleResDTO {
    id: string;
    movieId: string;
    movieTitle: string;
    movieThumbnailUrl: string;
    projectionType: string;
    translationType: string;
    roomId: string;
    cinemaId: string;
    startTime: string;
    endTime: string;
    availableSeat: number;
    status: boolean;
}

export interface ShowScheduleSearchDTO {
    movieId?: string;
    cinemaId?: string;
    roomId?: string;
    projectionType?: string;
    translationType?: string;
    status?: boolean;
    date?: string;
    page?: number;
    size?: number;
}

export interface Showtime {
    id: string;
    time: string;
}

export interface FormatShowtime {
    projection: string;
    translation: string;
    showtimes: Showtime[];
}

export interface CinemaShowtime {
    cinemaId: string;
    cinemaName: string;
    formats: FormatShowtime[];
}