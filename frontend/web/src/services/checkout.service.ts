import { apiClient } from "./api";
import type {
  ConfirmCheckoutSessionRequest,
  CreateCheckoutSessionRequest,
  DetermineTicketPriceResponse,
  CheckoutConfirmResponse,
  CheckoutSessionResponse,
  UpdateCheckoutSessionRequest,
} from "@/types/checkout";

export const checkoutService = {
  determineTicketPrice: async (params: {
    seatTypeId: string;
    projectionType: string;
    showTime: string;
  }) => {
    const response = await apiClient.get("/tickets/determine-ticket-price", {
      params,
    });
    return response.data as {
      success: boolean;
      data: DetermineTicketPriceResponse;
      message?: string;
    };
  },
  createSession: async (request: CreateCheckoutSessionRequest) => {
    const response = await apiClient.post("/checkouts/sessions", request);
    return response.data as {
      success: boolean;
      data: CheckoutSessionResponse;
      message?: string;
    };
  },
  updateSession: async (
    sessionId: string,
    request: UpdateCheckoutSessionRequest,
  ) => {
    const response = await apiClient.put(
      `/checkouts/sessions/${sessionId}`,
      request,
    );
    return response.data as {
      success: boolean;
      data: CheckoutSessionResponse;
      message?: string;
    };
  },
  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`/checkouts/sessions/${sessionId}`);
    return response.data as {
      success: boolean;
      data: CheckoutSessionResponse;
      message?: string;
    };
  },
  confirmSession: async (
    sessionId: string,
    request: ConfirmCheckoutSessionRequest,
    userIp?: string,
  ) => {
    const response = await apiClient.post(
      `/checkouts/sessions/${sessionId}/confirm`,
      request,
      {
        headers: userIp ? { "X-User-IP": userIp } : undefined,
      },
    );
    return response.data as {
      success: boolean;
      data: CheckoutConfirmResponse;
      message?: string;
    };
  },
  confirmZeroPaymentSession: async (sessionId: string) => {
    const response = await apiClient.post(
      `/checkouts/sessions/${sessionId}/confirm-zero-payment`,
    );
    return response.data as {
      success: boolean;
      data: CheckoutConfirmResponse;
      message?: string;
    };
  },
  cancelSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/checkouts/sessions/${sessionId}`);
    return response.data as { success: boolean; message?: string };
  },
};
