import { apiClient } from "./api";

export const seatTypeService = {
  getAllSeatTypes: async () => {
    const response = await apiClient.get(`/seat-types`);
    return response.data;
  },
  getAllSeatTypesAndPage : async (params : any) => {
    const response = await apiClient.get(`/seat-types/page`, {params});
    return response.data;
  },
  createSeatType: async (data: { name: string; description: string }) => {
    const response = await apiClient.post(`/seat-types/create`, data);
    return response.data;
  },
  updateSeatType: async (
    id: string,
    data: { name: string; description: string },
  ) => {
    const response = await apiClient.put(`/seat-types/edit/${id}`, data);
    return response.data;
  },
};