export const ProductType = {
  SINGLE: "SINGLE",
  COMBO: "COMBO",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  pictureUrl: string;
  description: string;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

export interface ProductFilterParams {
  id?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: ProductType;
  status?: boolean;
  page?: number;
  size?: number;
}
