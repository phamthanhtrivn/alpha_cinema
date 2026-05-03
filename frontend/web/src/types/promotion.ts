export interface Promotion {
  id: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  quantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

export interface PromotionFilterParams {
  code?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}
