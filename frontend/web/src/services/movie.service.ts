import { apiClient } from "./api";

export const movieService = {
  getAllMovies: async (params?: any) => {
    const response = await apiClient.get(`/movies/admin`, { params });
    return response.data;
  },
  getMovieById: async (id: string) => {
    const response = await apiClient.get(`/movies/admin/${id}`);
    return response.data;
  },
  updateMovie: async (id: string, data: any, imageFile?: File) => {
    const formData = new FormData();
    formData.append("movie", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    const response = await apiClient.put(`/movies/admin/${id}`, formData, {
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
    const response = await apiClient.post(`/movies/admin`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
  getAgeTypes: async () => {
    const response = await apiClient.get(`/movies/admin/age-type`);
    return response.data;
  },
  suggestMovies: async (title: string, size: number = 5) => {
    const response = await apiClient.get(`/movies/admin/suggestions`, { params: { title, size } });
    return response.data;
  },
  clientGetMovie: async (releaseStatus: string, title: string) => {
    const response = await apiClient.get(`/movies/public`, { params: { releaseStatus, title } });
    return response.data;
  },
  clientGetDetailMovie: async (id: string) => {
    const response = await apiClient.get(`/movies/public/${id}`);
    return response.data;
  }

};
