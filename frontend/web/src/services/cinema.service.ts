import { apiClient } from "./api";

export const cinameService = {
  getAllCinemas: async () => {
    const response = await apiClient.get(`/cinemas`);
    return response.data;
  },
};
