export type DashboardRange = "year" | "month" | "week" | "all-time";

export type DashboardSectionKey =
  | "revenue"
  | "customers"
  | "employees"
  | "reviews"
  | "movies"
  | "products"
  | "schedules"
  | "orders"
  | "promotions";

export interface DashboardFilterState {
  range: DashboardRange;
  year: number;
  month: number;
  week: number;
  cinemaId?: string;
}

export type TrendDirection = "up" | "down" | "flat";

export interface DashboardTrend {
  value: number;
  direction: TrendDirection;
  label: string;
}

export interface OverviewMetric {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number" | "percent";
  trend?: DashboardTrend;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  tickets: number;
  products: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalTickets: number;
  totalProducts: number;
  comparison?: DashboardTrend;
  series: RevenuePoint[];
}

export interface MoviePerformanceItem {
  id: string;
  title: string;
  revenue: number;
  ticketsSold: number;
  occupancyRate: number;
  status: "NOW_SHOWING" | "COMING_SOON";
}

export interface MoviePerformanceData {
  topRevenue: MoviePerformanceItem[];
  topTickets: MoviePerformanceItem[];
  nowShowing: number;
  comingSoon: number;
}

export interface ShowScheduleOccupancy {
  id: string;
  cinemaId: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  status: "ON_SALE" | "NEAR_FULL" | "SOLD_OUT" | "ENDED";
  soldSeats: number;
  totalSeats: number;
}

export interface OrderStatusSummary {
  paid: number;
  pending: number;
  cancelled: number;
  expired: number;
  refunded: number;
}

export interface PaymentMethodSummary {
  method: "VNPAY" | "MOMO" | "CASH";
  orders: number;
  revenue: number;
  successRate: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  movieTitle: string;
  paymentMethod: PaymentMethodSummary["method"];
  status: "PAID" | "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED" | "EXPIRED" | "FAILED";
  totalPayment: number;
  createdAt: string;
}

export interface OrderPaymentAnalytics {
  statuses: OrderStatusSummary;
  successRate: number;
  paymentMethods: PaymentMethodSummary[];
  recentOrders: RecentOrder[];
}

export interface LoyaltyTierSummary {
  tier: "MEMBER" | "SILVER" | "GOLD";
  members: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalSpending: number;
  loyaltyPoint: number;
}

export interface LoyaltyAnalytics {
  newUsers?: number;
  pointsIssued: number;
  pointsRedeemed: number;
  tiers: LoyaltyTierSummary[];
  topCustomers: TopCustomer[];
}

export interface AiQuestionStat {
  question: string;
  count: number;
}

export interface AiConversation {
  id: string;
  customerName: string;
  guest: boolean;
  messageCount: number;
  createdAt: string;
  archivedAt: string;
  userName?: string;
  topic?: string;
  status?: "RESOLVED" | "ESCALATED";
}

export interface AiQuestionTrendPoint {
  label: string;
  questions: number;
}

export interface AiRecentQuestion {
  id: number;
  conversationId: string;
  question: string;
  createdAt: string;
}

export interface AiChatbotAnalytics {
  totalConversations: number;
  totalUserQuestions: number;
  totalAssistantAnswers: number;
  averageMessagesPerConversation: number;
  guestConversations: number;
  memberConversations: number;
  totalChats: number;
  successRate: number;
  popularQuestions: AiQuestionStat[];
  questionTrend: AiQuestionTrendPoint[];
  recentQuestions: AiRecentQuestion[];
  recentConversations: AiConversation[];
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: "UP" | "DOWN" | "DEGRADED";
  responseTimeMs?: number;
  errorRate?: number;
  lastChecked: string;
}

export interface RatingDistributionItem {
  rating: number;
  count: number;
}

export interface RecentReview {
  id: string;
  customerName: string;
  movieTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
  resolvedReviews: number;
  ratingDistribution: RatingDistributionItem[];
  recentReviews: RecentReview[];
}

export interface TopProduct {
  id: string;
  name: string;
  pictureUrl?: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export interface ProductAnalytics {
  totalRevenue: number;
  itemsSold: number;
  comboAttachRate: number;
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
}

export interface PromotionStatusSummary {
  active: number;
  upcoming: number;
  expired: number;
  paused: number;
}

export interface PromotionUsageItem {
  id: string;
  code: string;
  name: string;
  ordersUsed: number;
  discountValue: number;
  revenueAfterDiscount: number;
  status: "ACTIVE" | "UPCOMING" | "EXPIRED" | "PAUSED";
  quota: number;
  remaining: number;
}

export interface PromotionAnalytics {
  totalPromotions: number;
  ordersApplied: number;
  totalDiscountValue: number;
  averageDiscountValue: number;
  statuses: PromotionStatusSummary;
  topPromotions: PromotionUsageItem[];
}

export interface EmployeeRoleSummary {
  role: "ADMIN" | "MANAGER" | "STAFF";
  total: number;
}

export interface TopEmployee {
  id: string;
  name: string;
  role: EmployeeRoleSummary["role"];
  cinemaId?: string;
  cinemaName: string;
  ordersHandled: number;
  revenueHandled: number;
}

export interface EmployeeAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  roles: EmployeeRoleSummary[];
  topEmployees: TopEmployee[];
}

export interface AdminDashboardData {
  overview: OverviewMetric[];
  revenue: RevenueAnalytics;
  movies: MoviePerformanceData;
  schedules: ShowScheduleOccupancy[];
  orders: OrderPaymentAnalytics;
  loyalty: LoyaltyAnalytics;
  ai: AiChatbotAnalytics;
  systemHealth: ServiceHealth[];
  reviews: ReviewAnalytics;
  products: ProductAnalytics;
  promotions: PromotionAnalytics;
  employees: EmployeeAnalytics;
}
