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

export interface ShowScheduleSnapshot {
  id: string;
  movieId?: string;
  movieTitle: string;
  movieThumbnailUrl: string;
  ageType: string; // T18, P, C13...
  projectionType: string; // 2D, 3D
  translationType: string; // SUBTITLES, DUBBING
  startTime: string; // ISO Date string
  endTime?: string;
  roomId?: string;
  cinemaId?: string;
}

export interface SeatSnapshot {
  id: string;
  rowName: string;
  columnName: string;
  unitPrice: number;
}

// 4. Thông tin bắp nước (Dùng cho Item trong list)
export interface ProductSnapshot {
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  pictureUrl?: string;
  quantity: number;
  unitPrice: number;
  subTotal?: number;
}

// 5. Interface CHÍNH để hứng dữ liệu từ API /history
export interface OrderHistoryItem {
  id: string;
  createdAt: string; // Ngày đặt vé
  totalPrice: number;
  totalPayment: number;
  pointDiscount: number;
  promotionDiscount: number;
  status: OrderStatus;
  qrCode: string;

  // Thông tin rạp & phòng (đã được Order Service ráp sẵn)
  cinemaName: string;
  roomNumber: string;

  // Snapshot suất chiếu (chứa thông tin Phim)
  showScheduleSnapshot: ShowScheduleSnapshot | null;

  // Lưu ý: Hai trường này có thể là null/empty khi load danh sách 20 item
  // Chỉ khi vào detail mới có dữ liệu đầy đủ
  seats: SeatSnapshot[] | null;
  products: ProductSnapshot[] | null;
}
