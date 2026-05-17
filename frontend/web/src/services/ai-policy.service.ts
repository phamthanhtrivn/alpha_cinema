import { apiClient } from "./api";

export interface AiPolicy {
  id: string;
  title: string;
  topic: string;
  source: string;
  content: string;
  active: boolean;
  chunkCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiPolicyRequest {
  title: string;
  topic: string;
  content: string;
  active: boolean;
}

export interface AiPolicySyncResponse {
  policyCount: number;
  chunkCount: number;
}

export interface AiPolicySearchParams {
  keyword?: string;
  topic?: string;
  source?: string;
  active?: boolean;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const aiPolicyService = {
  getPolicies: async (params?: AiPolicySearchParams) => {
    const response = await apiClient.get("/ai/knowledge/admin/policies", {
      params,
    });
    return response.data as ApiResponse<AiPolicy[]>;
  },

  createPolicy: async (request: AiPolicyRequest) => {
    const response = await apiClient.post(
      "/ai/knowledge/admin/policies",
      request,
    );
    return response.data as ApiResponse<AiPolicy>;
  },

  updatePolicy: async (id: string, request: AiPolicyRequest) => {
    const response = await apiClient.put(
      `/ai/knowledge/admin/policies/${id}`,
      request,
    );
    return response.data as ApiResponse<AiPolicy>;
  },

  deletePolicy: async (id: string) => {
    const response = await apiClient.delete(
      `/ai/knowledge/admin/policies/${id}`,
    );
    return response.data as ApiResponse<void>;
  },

  syncPolicies: async () => {
    const response = await apiClient.post("/ai/knowledge/admin/policies/sync");
    return response.data as ApiResponse<AiPolicySyncResponse>;
  },
};
