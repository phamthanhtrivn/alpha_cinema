import { apiClient } from "./api";

export const orderService = {
  checkoutEmployee: async (data: any) => {
    const response = await apiClient.post(`/checkouts/payment-by-cash`, data);
    console.log(response);
    return response.data;
  }
}