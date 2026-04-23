import { apiClient } from "./api";

export const artistsService = {
    getArtists: async () => {
        const response = await apiClient.get(`/artists`);
        return response.data;
    },
};
