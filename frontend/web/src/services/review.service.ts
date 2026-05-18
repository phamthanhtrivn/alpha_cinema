import { apiClient } from "./api";

export const reviewService = {
  getReviewsByMovieId: async (movieId: string, page: number = 0) => {
    const response = await apiClient.get(`/reviews/public/movie/${movieId}?page=${page}`);
    return response.data;
  },
  checkUserReviewed: async (movieId: string) => {
    try {
      const response = await apiClient.get(`/reviews/check?movieId=${movieId}`);
      return response.data;
    } catch {
      return { data: false };
    }
  },
  getCustomerReviews: async (page: number = 0) => {
    const response = await apiClient.get(`/reviews/customer?page=${page}`);
    return response.data;
  },
  createReview: async (data: { movieId: string, rating: number, comment: string }, files?: File[]) => {
    const formData = new FormData();
    formData.append(
      "review",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (files && files.length > 0) {
      files.forEach(file => formData.append("files", file));
    }

    const response = await apiClient.post('/reviews', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  }
};
