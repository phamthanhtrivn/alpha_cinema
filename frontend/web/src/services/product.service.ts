import { apiClient } from "./api";
import type { ProductFilterParams } from "@/types/product";

export const productService = {
  getAllProductsWithoutPagination: async () => {
    const response = await apiClient.get(`/products/all`);
    return response.data;
  },
  getSouvenirProducts: async () => {
    const response = await apiClient.get(`/products/souvenirs`);
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/admin/${id}`);
    return response.data;
  },
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
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },
  addToCart: async (productId: string, quantity: number) => {
    const response = await apiClient.post('/cart/add', { productId, quantity });
    return response.data;
  },
  updateCartItem: async (productId: string, quantity: number) => {
    const response = await apiClient.put('/cart/update', { productId, quantity });
    return response.data;
  },
  removeCartItem: async (productId: string) => {
    const response = await apiClient.delete(`/cart/remove/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },
};
