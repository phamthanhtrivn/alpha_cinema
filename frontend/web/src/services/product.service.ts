import type { ProductFilterParams } from "@/types/product";
import { apiClient } from "./api";

export const productService = {
  getAllProduct: async (params: ProductFilterParams) => {
    const response = await apiClient.get(`/products`, {
      params,
    });
    return response.data;
  },
  addProduct: async (data: FormData) => {
    const response = await apiClient.post(`/products`, data);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
  updateProduct: async (id: string, data: FormData) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  }
};