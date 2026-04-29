import type { Cinema } from "./cinema";

export interface Room {
  id: string;
  cinema: Cinema;
  roomNumber: number;
  projectionType: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

export interface RoomFilterParams {
  cinemaId?: string;
  roomNumber?: number;
  projectionType?: string;
  status?: boolean;
  page?: number;
  size?: number;
}
