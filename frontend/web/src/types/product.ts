export const ProductType = {
  SINGLE: "SINGLE",
  COMBO: "COMBO",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

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
