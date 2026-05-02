import type { ProductFilterParams } from "@/types/product";
import { apiClient } from "./api";

export const productService = {
  getAllProduct: async (params: ProductFilterParams) => {
    const response = await apiClient.get(`/products/admin`, {
      params,
    });
    return response.data;
  },
  addProduct: async (data: FormData) => {
    const response = await apiClient.post(`/products/admin`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/admin/${id}`);
    return response.data;
  },
  updateProduct: async (id: string, data: FormData) => {
    const response = await apiClient.put(`/products/admin/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
