import type { CustomerFilterParams } from "@/types/customer";
import { apiClient } from "./api";

export const customerService = {
  getAllCustomers: async (params: CustomerFilterParams) => {
    const response = await apiClient.get(`/customers`, {
      params,
    });
    return response.data;
  },
  updateCustomerStatus: async (id: string, status: boolean) => {
    const response = await apiClient.put(`/customers/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get(`/customers/profile`);
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.post(`/customers/update-profile`, data);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await apiClient.put(`/customers/change-password`, data);
    return response.data;
  },
};
