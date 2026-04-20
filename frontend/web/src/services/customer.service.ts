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
};
