import { apiClient } from "./api";

export const artistsService = {
    getArtists: async (params?: any) => {
        const response = await apiClient.get(`/artists`, { params });
        return response.data;
    },
    getArtistById: async (id: string) => {
        const response = await apiClient.get(`/artists/${id}`);
        return response.data;
    },
    createArtist: async (data: any, imageFile?: File) => {
        const formData = new FormData();
        formData.append("artist", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        const response = await apiClient.post(`/artists`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },
    updateArtist: async (id: string, data: any, imageFile?: File) => {
        const formData = new FormData();
        formData.append("artist", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        const response = await apiClient.put(`/artists/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },
    deleteArtist: async (id: string) => {
        const response = await apiClient.delete(`/artists/${id}`);
        return response.data;
    }
};
