import { apiClient } from "./api";

export const seatService = {
  getSeatByRoomId: async (roomId: string) => {
    const response = await apiClient.get(`/seats/${roomId}`);
    return response.data;
  },

  createAndUpdateSeat: async (seat: unknown) => {
    const response = await apiClient.post(`/seats/createAndUpdate`, seat);
    return response.data;
  },

  getAllSeatsByShowSchedule: async (showScheduleId: string, roomId: string) => {
    const response = await apiClient.get(`/seats/showSchedule`, {
      params: {
        showScheduleId,
        roomId,
      },
    });
    return response.data;
  }


};