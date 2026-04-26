import { apiClient } from "./api";

export const cinemaService = {
  getAllCinemas: async () => {
    const response = await apiClient.get(`/cinemas`);
    return response.data;
  },
  getCinemaOptions: async () => {
    const response = await apiClient.get(`/cinemas/cinema-option`);
    return response.data;
  },
  getRoomOptions: async (cinemaId: string, projections?: string[]) => {
    const response = await apiClient.get(`/rooms/options`, { params: { cinemaId, projections } });
    return response.data;
  }
};
