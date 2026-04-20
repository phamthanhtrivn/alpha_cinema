import { apiClient } from "./api";

export const seatTypeService = {
  getAllSeatTypes: async () => {
    const response = await apiClient.get(`/seat-types`);
    return response.data;
  },
  getSeatTypeById: async (id: string) => {
    const response = await apiClient.get(`/seat-types/${id}`);
    return response.data;
  },
};