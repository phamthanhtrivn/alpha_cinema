import { apiClient } from "./api";
import type {
  ApiResponse,
  OrderDetail,
  OrderSearchParams,
  OrderSummary,
  PageResponse,
} from "@/types/order";

export const orderService = {
  checkoutEmployee: async (data: any) => {
    const response = await apiClient.post(`/checkouts/payment-by-cash`, data);
    return response.data;
  },

  getOrders: async (params?: OrderSearchParams) => {
    const response = await apiClient.get(`/orders/page`, { params });
    return response.data as ApiResponse<PageResponse<OrderSummary>>;
  },

  getOrderDetail: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data as ApiResponse<OrderDetail>;
  },
};