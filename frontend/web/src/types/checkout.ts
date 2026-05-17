export interface DetermineTicketPriceResponse {
  id: string;
  seatTypeId: string;
  projectionType: string;
  dayType: string;
  price: number;
}

export interface CheckoutSeatRequest {
  seatId: string;
  ticketPriceId: string;
  finalPrice?: number;
  rowName?: string;
  columnName?: string;
  seatNumber?: string;
}

export interface CheckoutProductItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  customerId: string;
  showScheduleId: string;
  cinemaId: string;
  seats: CheckoutSeatRequest[];
}

export interface UpdateCheckoutSessionRequest {
  items?: CheckoutProductItemRequest[];
  promotionCode?: string;
  promotionDiscount?: number;
  pointDiscount?: number;
  pointsToRedeem?: number;
}

export interface ConfirmCheckoutSessionRequest {
  paymentMethod: string;
  bankCode?: string;
}

export interface CheckoutProductItemResponse {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutSeatResponse {
  seatId: string;
  ticketPriceId: string;
  finalPrice: number;
  rowName: string;
  columnName: string;
  seatNumber: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  orderId?: string | null;
  customerId: string;
  showScheduleId: string;
  seats: CheckoutSeatResponse[];
  items: CheckoutProductItemResponse[];
  promotionCode?: string | null;
  seatSubtotal: number;
  productSubtotal: number;
  promotionDiscount: number;
  pointDiscount: number;
  pointsRedeemed: number;
  availableLoyaltyPoints: number;
  totalPayment: number;
  status: string;
  expiresAt: string;
}

export interface CheckoutSeatPaymentResponse {
  seatNumber: string;
  price: number;
}

export interface CheckoutConfirmResponse {
  orderId: string;
  status: string;
  message: string;
  seats: CheckoutSeatPaymentResponse[];
  products: CheckoutProductItemResponse[];
  paymentMethod: string;
  paymentUrl?: string | null;
  totalPayment: number;
}
