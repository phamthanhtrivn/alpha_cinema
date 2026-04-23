import { apiClient } from "./api";

export const movieService = {
  getAllMovies: async (params?: any) => {
    const response = await apiClient.get(`/movies`, { params });
    return response.data;
  },
  getMovieById: async (id: string) => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  },
  updateMovie: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append("movie", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    const response = await apiClient.put(`/movies/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
  createMovie: async (data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append("movie", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    const response = await apiClient.post(`/movies`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
  getAgeTypes: async () => {
    const response = await apiClient.get(`/movies/age-type`);
    return response.data;
  },
};
