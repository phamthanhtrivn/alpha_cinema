import { apiClient } from "./api";

export interface PaymentResult {
  orderId: string;
  status: string;
  success: boolean;
  method?: string | null;
  amount: number;
  providerTransactionId?: string | null;
  message?: string | null;
  paidAt?: string | null;
}

export const paymentService = {
  getPaymentResult: async (token: string) => {
    const response = await apiClient.get("/payments/result", {
      params: { token },
    });
    return response.data as {
      success: boolean;
      data: PaymentResult;
      message?: string;
    };
  },
};
