import { apiClient } from "./api";
import type { RoomFilterParams } from "@/types/room";

export const roomService = {
  getAllRooms: async (params?: RoomFilterParams) => {
    const response = await apiClient.get(`/rooms/page`, { params });
    return response.data;
  },
  createRoom: async (data: any) => {
    const response = await apiClient.post(`/rooms/create`, data);
    return response.data;
  },
  updateRoom: async (id: string, data: any) => {
    const response = await apiClient.put(`/rooms/edit/${id}`, data);
    return response.data;
  },
};
