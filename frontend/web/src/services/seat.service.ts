import { apiClient } from "./api";

export const seatService = {
  getSeatByRoomId: async (roomId: string) => {
    const response = await apiClient.get(`/seats/${roomId}`);
    return response.data;
  },

  createAndUpdateSeat: async (seat: any) => {
    const response = await apiClient.post(`/seats/createAndUpdate`, seat);
    return response.data;
  },
};