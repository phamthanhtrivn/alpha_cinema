export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderSearchParams {
  keyword?: string;
  orderId?: string;
  customerId?: string;
  employeeId?: string;
  cinemaId?: string;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  minTotalPayment?: number;
  maxTotalPayment?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export interface OrderSummary {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  employeeId?: string;
  cinemaId?: string;
  cinemaName?: string;
  movieId?: string;
  movieTitle?: string;
  showScheduleId?: string;
  roomId?: string;
  roomName?: string;
  projectionType?: string;
  translationType?: string;
  showStartTime?: string;
  createdAt?: string;
  status: OrderStatus;
  totalPrice: number;
  pointDiscount: number;
  promotionDiscount: number;
  totalPayment: number;
  seatCount: number;
  productCount: number;
  promotionCode?: string;
}

export interface OrderSeat {
  seatId?: string;
  seatNumber?: string;
  rowName?: string;
  columnName?: string;
  seatTypeId?: string;
  ticketPriceId?: string;
  ticketPrice: number;
  finalPrice: number;
  showSeatType?: string;
}

export interface OrderProduct {
  productId?: string;
  productName?: string;
  pictureUrl?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface OrderDetail extends OrderSummary {
  customerPhone?: string;
  cinemaAddress?: string;
  roomNumber?: number;
  showEndTime?: string;
  qrCode?: string;
  pointsRedeemed: number;
  updatedAt?: string;
  seats: OrderSeat[];
  products: OrderProduct[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}
