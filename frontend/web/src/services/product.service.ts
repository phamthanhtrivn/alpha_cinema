import type { ProductFilterParams } from "@/types/product";
import { apiClient } from "./api";

export const productService = {
  getAllProduct: async (params: ProductFilterParams)=> {
    const response = await apiClient.get(`/products`, {
      params,
    });
    return response.data;
  },
};
