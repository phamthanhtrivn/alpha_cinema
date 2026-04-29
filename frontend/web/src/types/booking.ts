export interface SeatResponseToProduct {
    seatId: string;
    rowName: string;
    columnName: string;
    seatType: string;
    usable: boolean;
    status: string;
}

export interface BookingLayoutDTO {
    cinemaId: string;
    projection: string;
    translation: string;
    ageType: string;
    movieFormat: string;
    startTime: string;
    cinemaName: string;
    roomName: string;
    seats: SeatResponseToProduct[];
}
