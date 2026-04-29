import { apiClient } from "./api";
import type { CinemaFilterParams } from "@/types/cinema";

export const cinemaService = {
  getAllCinemas: async () => {
    const response = await apiClient.get(`/cinemas`);
    return response.data;
  },
  getCinemaOptions: async () => {
    const response = await apiClient.get(`/cinemas/public/cinema-option`);
    return response.data;
  },
  getRoomOptions: async (cinemaId: string, projections?: string[]) => {
    const response = await apiClient.get(`/rooms/options`, { params: { cinemaId, projections } });
    return response.data;
  },
  getAllCinemasansPage: async (params?: CinemaFilterParams) => {
    const response = await apiClient.get(`/cinemas/page`, { params });
    return response.data;
  },
  updateCinemaStatus: async (id: string, status: boolean) => {
    const response = await apiClient.put(`/cinemas/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
  updateCinema: async (id: string, data: any) => {
    const response = await apiClient.put(`/cinemas/edit/${id}`, data);
    return response.data;
  },
  createCinema: async (data: any) => {
    const response = await apiClient.post(`/cinemas/create`, data);
    return response.data;
  },
};
