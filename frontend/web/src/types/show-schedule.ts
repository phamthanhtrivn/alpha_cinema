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
