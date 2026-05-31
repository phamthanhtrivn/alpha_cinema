import { apiClient } from "./api";
import type { PromotionFilterParams } from "@/types/promotion";

export const promotionService = {
  getAllPromotions: async (params?: PromotionFilterParams) => {
    const response = await apiClient.get(`/promotions/page`, { params });
    return response.data;
  },
  /** Lấy danh sách khuyến mãi đang hoạt động (public, không cần auth) */
  getActivePromotions: async () => {
    const response = await apiClient.get(`/promotions/public/active`);
    return response.data; // ApiResponse<PromotionPublicResponse[]>
  },
  createPromotion: async (data: any) => {
    const response = await apiClient.post(`/promotions/create`, data);
    return response.data;
  },
  updatePromotion: async (data: any) => {
    const response = await apiClient.put(`/promotions/update`, data);
    return response.data;
  },
};
