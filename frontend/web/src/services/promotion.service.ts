import { apiClient } from "./api";
import type { PromotionFilterParams } from "@/types/promotion";

export const promotionService = {
  getAllPromotions: async (params?: PromotionFilterParams) => {
    const response = await apiClient.get(`/promotions/page`, { params });
    return response.data;
  },
  createPromotion: async (data: any) => {
    const response = await apiClient.post(`/promotions/create`, data);
    return response.data;
  },
  updatePromotion: async (data: any) => {
    const response = await apiClient.put(`/promotions/update`, data);
    return response.data;
  }
};
