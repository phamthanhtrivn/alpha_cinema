import { apiClient } from "./api";
import type {
  ApiResponse,
  OrderDetail,
  OrderHistoryItem,
  OrderSearchParams,
  OrderSummary,
  PageResponse,
} from "@/types/order";

export const orderService = {
  checkoutEmployee: async (data: unknown) => {
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
  getTicketDetailByOrderId: async (id: string) => {
    const response = await apiClient.get(`/orders/ticket-detail/${id}`);
    return response.data;
  },
  checkIn: async (data: {
    orderId: string;
    showScheduleId: string;
    seatIds: string[];
  }) => {
    const response = await apiClient.post(`/orders/check-in-ticket`, data);
    return response.data;
  },

  lockSeats: async (data: { showScheduleId: string; seatIds: string[] }) => {
    const response = await apiClient.post(`/orders/seats/lock`, data);
    return response.data;
  },

  unlockSeats: async (data: { showScheduleId: string; seatIds: string[] }) => {
    const response = await apiClient.post(`/orders/seats/unlock`, data);
    return response.data;
  },
  getOrderHistoryDetail: async (id: string) => {
    const response = await apiClient.get(`/orders/customer/${id}`);
    return response.data as ApiResponse<OrderHistoryItem>;
  },
  getOrderHistory: async () => {
    const response = await apiClient.get(`/orders/my-orders`);
    return response.data;
  }
}
