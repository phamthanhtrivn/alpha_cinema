import type {
  AdminDashboardData,
  DashboardSectionKey,
  DashboardFilterState,
  OverviewMetric,
} from "@/types/dashboard";
import { apiClient } from "./api";

const today = new Date();
const isoAt = (hour: number, minute = 0) => {
  const date = new Date(today);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockDashboardData: AdminDashboardData = {
  overview: [
    {
      id: "today-revenue",
      title: "Tổng doanh thu hôm nay",
      value: 184500000,
      format: "currency",
      trend: { value: 12.4, direction: "up", label: "so với hôm qua" },
    },
    {
      id: "tickets-sold",
      title: "Tổng vé bán hôm nay",
      value: 1268,
      format: "number",
      trend: { value: 8.1, direction: "up", label: "so với hôm qua" },
    },
    {
      id: "total-orders",
      title: "Tổng đơn hàng",
      value: 742,
      format: "number",
      trend: { value: 4.2, direction: "up", label: "trong ngày" },
    },
    {
      id: "paid-orders",
      title: "Đơn thanh toán thành công",
      value: 689,
      format: "number",
      trend: { value: 2.6, direction: "up", label: "so với kỳ trước" },
    },
    {
      id: "failed-orders",
      title: "Đơn thanh toán thất bại",
      value: 18,
      format: "number",
      trend: { value: 1.1, direction: "down", label: "so với kỳ trước" },
    },
    {
      id: "seat-occupancy",
      title: "Tỷ lệ lấp đầy ghế",
      value: 72,
      format: "percent",
      trend: { value: 6.5, direction: "up", label: "toàn hệ thống" },
    },
    {
      id: "new-users",
      title: "Người dùng mới",
      value: 96,
      format: "number",
      trend: { value: 3.4, direction: "flat", label: "ổn định" },
    },
    {
      id: "active-promotions",
      title: "Khuyến mãi đang chạy",
      value: 14,
      format: "number",
      trend: { value: 6.0, direction: "up", label: "so với kỳ trước" },
    },
    {
      id: "today-schedules",
      title: "Suất chiếu hôm nay",
      value: 84,
      format: "number",
      trend: { value: 5.0, direction: "up", label: "đang mở bán" },
    },
  ],
  revenue: {
    totalRevenue: 1284000000,
    totalTickets: 8240,
    totalProducts: 3196,
    comparison: { value: 14.8, direction: "up", label: "so với kỳ trước" },
    series: [
      { label: "T2", revenue: 148000000, tickets: 920, products: 340 },
      { label: "T3", revenue: 172000000, tickets: 1050, products: 386 },
      { label: "T4", revenue: 164000000, tickets: 980, products: 361 },
      { label: "T5", revenue: 216000000, tickets: 1340, products: 508 },
      { label: "T6", revenue: 248000000, tickets: 1550, products: 641 },
      { label: "T7", revenue: 284000000, tickets: 1760, products: 712 },
      { label: "CN", revenue: 252000000, tickets: 1640, products: 648 },
    ],
  },
  movies: {
    topRevenue: [
      { id: "m1", title: "Avengers: Secret Wars", revenue: 328000000, ticketsSold: 1840, occupancyRate: 86, status: "NOW_SHOWING" },
      { id: "m2", title: "Doraemon Movie 2026", revenue: 244000000, ticketsSold: 2106, occupancyRate: 79, status: "NOW_SHOWING" },
      { id: "m3", title: "The Batman Part II", revenue: 216000000, ticketsSold: 1260, occupancyRate: 74, status: "NOW_SHOWING" },
    ],
    topTickets: [
      { id: "m2", title: "Doraemon Movie 2026", revenue: 244000000, ticketsSold: 2106, occupancyRate: 79, status: "NOW_SHOWING" },
      { id: "m1", title: "Avengers: Secret Wars", revenue: 328000000, ticketsSold: 1840, occupancyRate: 86, status: "NOW_SHOWING" },
      { id: "m4", title: "Inside Out 3", revenue: 156000000, ticketsSold: 1418, occupancyRate: 68, status: "COMING_SOON" },
    ],
    nowShowing: 28,
    comingSoon: 12,
  },
  schedules: [
    { id: "ss1", cinemaId: "C001", movieTitle: "Avengers: Secret Wars", cinemaName: "Alpha Quận 1", roomName: "Phòng 4", startTime: isoAt(18, 30), endTime: isoAt(21, 5), status: "NEAR_FULL", soldSeats: 118, totalSeats: 132 },
    { id: "ss2", cinemaId: "C002", movieTitle: "Doraemon Movie 2026", cinemaName: "Alpha Thủ Đức", roomName: "Phòng 2", startTime: isoAt(19, 0), endTime: isoAt(20, 55), status: "ON_SALE", soldSeats: 74, totalSeats: 128 },
    { id: "ss3", cinemaId: "C003", movieTitle: "The Batman Part II", cinemaName: "Alpha Gò Vấp", roomName: "Phòng 6", startTime: isoAt(20, 15), endTime: isoAt(22, 55), status: "SOLD_OUT", soldSeats: 156, totalSeats: 156 },
    { id: "ss4", cinemaId: "C004", movieTitle: "Inside Out 3", cinemaName: "Alpha Quận 7", roomName: "Phòng 1", startTime: isoAt(21, 10), endTime: isoAt(22, 50), status: "ON_SALE", soldSeats: 52, totalSeats: 110 },
  ],
  orders: {
    statuses: { paid: 689, pending: 31, cancelled: 14, expired: 7, refunded: 1 },
    successRate: 92.8,
    paymentMethods: [
      { method: "VNPAY", orders: 428, revenue: 102000000, successRate: 94.2 },
      { method: "MOMO", orders: 218, revenue: 52300000, successRate: 91.4 },
      { method: "CASH", orders: 43, revenue: 30200000, successRate: 100 },
    ],
    recentOrders: [
      { id: "ORD-23091", customerName: "Nguyễn Minh Anh", movieTitle: "Avengers: Secret Wars", paymentMethod: "VNPAY", status: "PAID", totalPayment: 420000, createdAt: isoAt(20, 12) },
      { id: "ORD-23090", customerName: "Trần Gia Huy", movieTitle: "Doraemon Movie 2026", paymentMethod: "MOMO", status: "PENDING_PAYMENT", totalPayment: 210000, createdAt: isoAt(20, 4) },
      { id: "ORD-23089", customerName: "Lê Hoàng Nam", movieTitle: "The Batman Part II", paymentMethod: "VNPAY", status: "FAILED", totalPayment: 360000, createdAt: isoAt(19, 58) },
      { id: "ORD-23088", customerName: "Phạm Thu Hà", movieTitle: "Inside Out 3", paymentMethod: "CASH", status: "PAID", totalPayment: 285000, createdAt: isoAt(19, 42) },
    ],
  },
  loyalty: {
    pointsIssued: 428600,
    pointsRedeemed: 184200,
    tiers: [
      { tier: "MEMBER", members: 8420 },
      { tier: "SILVER", members: 1860 },
      { tier: "GOLD", members: 426 },
    ],
    topCustomers: [
      { id: "c1", name: "Nguyễn Minh Anh", totalSpending: 12800000, loyaltyPoint: 2640 },
      { id: "c2", name: "Trần Gia Huy", totalSpending: 10450000, loyaltyPoint: 2188 },
      { id: "c3", name: "Lê Hoàng Nam", totalSpending: 8900000, loyaltyPoint: 1790 },
    ],
  },
  ai: {
    totalConversations: 1842,
    totalUserQuestions: 4210,
    totalAssistantAnswers: 4168,
    averageMessagesPerConversation: 4.6,
    guestConversations: 612,
    memberConversations: 1230,
    totalChats: 1842,
    successRate: 88.6,
    popularQuestions: [
      { question: "Làm sao đổi suất chiếu?", count: 312 },
      { question: "Có dùng điểm loyalty được không?", count: 248 },
      { question: "Vé đã thanh toán nhưng chưa có QR?", count: 194 },
    ],
    questionTrend: [
      { label: "T2", questions: 420 },
      { label: "T3", questions: 486 },
      { label: "T4", questions: 512 },
      { label: "T5", questions: 608 },
      { label: "T6", questions: 742 },
      { label: "T7", questions: 811 },
      { label: "CN", questions: 631 },
    ],
    recentQuestions: [
      { id: 1, conversationId: "ai-431", question: "VNPAY thanh toán rồi nhưng chưa thấy vé?", createdAt: isoAt(20, 5) },
      { id: 2, conversationId: "ai-430", question: "Có đổi ghế được không?", createdAt: isoAt(19, 48) },
    ],
    recentConversations: [
      { id: "ai-431", customerName: "Minh Anh", guest: false, messageCount: 8, createdAt: isoAt(20, 1), archivedAt: isoAt(20, 5), userName: "Minh Anh", topic: "Thanh toán VNPAY", status: "RESOLVED" },
      { id: "ai-430", customerName: "Guest", guest: true, messageCount: 5, createdAt: isoAt(19, 44), archivedAt: isoAt(19, 48), userName: "Gia Huy", topic: "Đổi ghế", status: "ESCALATED" },
    ],
  },
  systemHealth: [
    { id: "gateway", name: "API Gateway", status: "UP", responseTimeMs: 42, errorRate: 0.02, lastChecked: isoAt(20, 15) },
    { id: "auth", name: "Auth/User Service", status: "UP", responseTimeMs: 58, errorRate: 0.04, lastChecked: isoAt(20, 15) },
    { id: "cinema", name: "Cinema Management Service", status: "UP", responseTimeMs: 73, errorRate: 0.08, lastChecked: isoAt(20, 14) },
    { id: "order", name: "Order Service", status: "DEGRADED", responseTimeMs: 186, errorRate: 1.2, lastChecked: isoAt(20, 14) },
    { id: "payment", name: "Payment Service", status: "UP", responseTimeMs: 91, errorRate: 0.2, lastChecked: isoAt(20, 15) },
    { id: "product", name: "Product Service", status: "UP", responseTimeMs: 68, errorRate: 0.06, lastChecked: isoAt(20, 15) },
    { id: "notification", name: "Notification Service", status: "UP", responseTimeMs: 53, errorRate: 0.1, lastChecked: isoAt(20, 13) },
    { id: "ai", name: "AI Service", status: "UP", responseTimeMs: 224, errorRate: 0.4, lastChecked: isoAt(20, 13) },
    { id: "redis", name: "Redis", status: "UP", responseTimeMs: 12, errorRate: 0, lastChecked: isoAt(20, 15) },
    { id: "kafka", name: "Kafka", status: "UP", responseTimeMs: 31, errorRate: 0.01, lastChecked: isoAt(20, 15) },
    { id: "database", name: "Database", status: "UP", responseTimeMs: 29, errorRate: 0.03, lastChecked: isoAt(20, 15) },
  ],
  reviews: {
    averageRating: 4.4,
    totalReviews: 1286,
    pendingReviews: 38,
    resolvedReviews: 1248,
    ratingDistribution: [
      { rating: 5, count: 742 },
      { rating: 4, count: 318 },
      { rating: 3, count: 146 },
      { rating: 2, count: 52 },
      { rating: 1, count: 28 },
    ],
    recentReviews: [
      { id: "rv1", customerName: "Nguyễn Minh Anh", movieTitle: "Avengers: Secret Wars", rating: 5, comment: "Phim hay, phòng chiếu sạch.", createdAt: isoAt(19, 30) },
      { id: "rv2", customerName: "Trần Gia Huy", movieTitle: "Doraemon Movie 2026", rating: 4, comment: "Combo giao nhanh, âm thanh tốt.", createdAt: isoAt(18, 45) },
      { id: "rv3", customerName: "Lê Hoàng Nam", movieTitle: "The Batman Part II", rating: 3, comment: "Xếp hàng thanh toán hơi lâu.", createdAt: isoAt(17, 20) },
    ],
  },
  products: {
    totalRevenue: 214800000,
    itemsSold: 3196,
    comboAttachRate: 38.8,
    topProducts: [
      { id: "p1", name: "Combo Popcorn Couple", pictureUrl: "", quantitySold: 860, revenue: 77400000 },
      { id: "p2", name: "Bắp rang bơ lớn", pictureUrl: "", quantitySold: 734, revenue: 44040000 },
      { id: "p3", name: "Nước ngọt size L", pictureUrl: "", quantitySold: 692, revenue: 27680000 },
    ],
    lowStockProducts: [
      { id: "p4", name: "Nachos cheese", stock: 18 },
      { id: "p5", name: "Trà đào chai", stock: 24 },
      { id: "p6", name: "Hotdog", stock: 31 },
    ],
  },
  promotions: {
    totalPromotions: 48,
    ordersApplied: 392,
    totalDiscountValue: 58600000,
    averageDiscountValue: 149489,
    statuses: { active: 14, upcoming: 8, expired: 22, paused: 4 },
    topPromotions: [
      {
        id: "promo1",
        code: "WEEKEND20",
        name: "Cuối tuần vui vẻ",
        ordersUsed: 148,
        discountValue: 22100000,
        revenueAfterDiscount: 186400000,
        status: "ACTIVE",
        quota: 500,
        remaining: 124,
      },
      {
        id: "promo2",
        code: "COMBO15",
        name: "Ưu đãi combo",
        ordersUsed: 112,
        discountValue: 13600000,
        revenueAfterDiscount: 94200000,
        status: "ACTIVE",
        quota: 400,
        remaining: 98,
      },
      {
        id: "promo3",
        code: "STUDENT10",
        name: "Sinh viên xem phim",
        ordersUsed: 84,
        discountValue: 7900000,
        revenueAfterDiscount: 63800000,
        status: "UPCOMING",
        quota: 300,
        remaining: 216,
      },
      {
        id: "promo4",
        code: "BIRTHDAY",
        name: "Sinh nhật thành viên",
        ordersUsed: 48,
        discountValue: 15000000,
        revenueAfterDiscount: 42600000,
        status: "PAUSED",
        quota: 200,
        remaining: 152,
      },
    ],
  },
  employees: {
    totalEmployees: 186,
    activeEmployees: 172,
    inactiveEmployees: 14,
    roles: [
      { role: "ADMIN", total: 6 },
      { role: "MANAGER", total: 28 },
      { role: "STAFF", total: 152 },
    ],
    topEmployees: [
      { id: "e1", name: "Phạm Thu Hà", role: "STAFF", cinemaName: "Alpha Quận 1", ordersHandled: 126, revenueHandled: 52800000 },
      { id: "e2", name: "Võ Minh Khang", role: "STAFF", cinemaName: "Alpha Thủ Đức", ordersHandled: 112, revenueHandled: 46300000 },
      { id: "e3", name: "Ngô Bích Trâm", role: "MANAGER", cinemaName: "Alpha Gò Vấp", ordersHandled: 98, revenueHandled: 41800000 },
    ],
  },
};

const cinemaScale: Record<string, number> = {
  C001: 0.34,
  C002: 0.27,
  C003: 0.24,
  C004: 0.15,
};

const scaleNumber = (value: number, ratio: number) => Math.round(value * ratio);

const rangeScale = (filters: DashboardFilterState) => {
  const yearDelta = Math.max(today.getFullYear() - filters.year, 0);

  if (filters.range === "all-time") return 2.4;
  if (filters.range === "year") return Math.max(1.2, 1.7 - yearDelta * 0.12);
  if (filters.range === "month") {
    return Math.max(0.8, 1.05 + filters.month * 0.015 - yearDelta * 0.08);
  }

  return Math.max(0.65, 0.88 + filters.week * 0.04 - yearDelta * 0.05);
};

const applyRangeFilter = (
  data: AdminDashboardData,
  filters: DashboardFilterState,
): AdminDashboardData => {
  const ratio = rangeScale(filters);

  return {
    ...data,
    overview: data.overview.map((metric) => ({
      ...metric,
      value: metric.format === "percent" ? metric.value : scaleNumber(metric.value, ratio),
    })),
    revenue: {
      ...data.revenue,
      totalRevenue: scaleNumber(data.revenue.totalRevenue, ratio),
      totalTickets: scaleNumber(data.revenue.totalTickets, ratio),
      totalProducts: scaleNumber(data.revenue.totalProducts, ratio),
      series: data.revenue.series.map((point) => ({
        ...point,
        revenue: scaleNumber(point.revenue, ratio),
        tickets: scaleNumber(point.tickets, ratio),
        products: scaleNumber(point.products, ratio),
      })),
    },
    movies: {
      ...data.movies,
      topRevenue: data.movies.topRevenue.map((movie) => ({
        ...movie,
        revenue: scaleNumber(movie.revenue, ratio),
        ticketsSold: scaleNumber(movie.ticketsSold, ratio),
      })),
      topTickets: data.movies.topTickets.map((movie) => ({
        ...movie,
        revenue: scaleNumber(movie.revenue, ratio),
        ticketsSold: scaleNumber(movie.ticketsSold, ratio),
      })),
      nowShowing: scaleNumber(data.movies.nowShowing, ratio),
      comingSoon: scaleNumber(data.movies.comingSoon, ratio),
    },
    schedules: data.schedules.map((schedule) => ({
      ...schedule,
      soldSeats: Math.min(schedule.totalSeats, scaleNumber(schedule.soldSeats, ratio)),
    })),
    orders: {
      ...data.orders,
      statuses: {
        paid: scaleNumber(data.orders.statuses.paid, ratio),
        pending: scaleNumber(data.orders.statuses.pending, ratio),
        cancelled: scaleNumber(data.orders.statuses.cancelled, ratio),
        expired: scaleNumber(data.orders.statuses.expired, ratio),
        refunded: scaleNumber(data.orders.statuses.refunded, ratio),
      },
      paymentMethods: data.orders.paymentMethods.map((method) => ({
        ...method,
        orders: scaleNumber(method.orders, ratio),
        revenue: scaleNumber(method.revenue, ratio),
      })),
      recentOrders: data.orders.recentOrders,
    },
    loyalty: {
      ...data.loyalty,
      pointsIssued: scaleNumber(data.loyalty.pointsIssued, ratio),
      pointsRedeemed: scaleNumber(data.loyalty.pointsRedeemed, ratio),
      tiers: data.loyalty.tiers.map((tier) => ({
        ...tier,
        members: scaleNumber(tier.members, ratio),
      })),
      topCustomers: data.loyalty.topCustomers.map((customer) => ({
        ...customer,
        totalSpending: scaleNumber(customer.totalSpending, ratio),
        loyaltyPoint: scaleNumber(customer.loyaltyPoint, ratio),
      })),
    },
    reviews: {
      ...data.reviews,
      totalReviews: scaleNumber(data.reviews.totalReviews, ratio),
      pendingReviews: scaleNumber(data.reviews.pendingReviews, ratio),
      resolvedReviews: scaleNumber(data.reviews.resolvedReviews, ratio),
      ratingDistribution: data.reviews.ratingDistribution.map((item) => ({
        ...item,
        count: scaleNumber(item.count, ratio),
      })),
    },
    products: {
      ...data.products,
      totalRevenue: scaleNumber(data.products.totalRevenue, ratio),
      itemsSold: scaleNumber(data.products.itemsSold, ratio),
      topProducts: data.products.topProducts.map((product) => ({
        ...product,
        quantitySold: scaleNumber(product.quantitySold, ratio),
        revenue: scaleNumber(product.revenue, ratio),
      })),
    },
    promotions: {
      ...data.promotions,
      totalPromotions: scaleNumber(data.promotions.totalPromotions, ratio),
      ordersApplied: scaleNumber(data.promotions.ordersApplied, ratio),
      totalDiscountValue: scaleNumber(data.promotions.totalDiscountValue, ratio),
      averageDiscountValue: scaleNumber(data.promotions.averageDiscountValue, ratio),
      statuses: {
        active: scaleNumber(data.promotions.statuses.active, ratio),
        upcoming: scaleNumber(data.promotions.statuses.upcoming, ratio),
        expired: scaleNumber(data.promotions.statuses.expired, ratio),
        paused: scaleNumber(data.promotions.statuses.paused, ratio),
      },
      topPromotions: data.promotions.topPromotions.map((promotion) => ({
        ...promotion,
        ordersUsed: scaleNumber(promotion.ordersUsed, ratio),
        discountValue: scaleNumber(promotion.discountValue, ratio),
        revenueAfterDiscount: scaleNumber(promotion.revenueAfterDiscount, ratio),
      })),
    },
    employees: {
      ...data.employees,
      totalEmployees: scaleNumber(data.employees.totalEmployees, ratio),
      activeEmployees: scaleNumber(data.employees.activeEmployees, ratio),
      inactiveEmployees: scaleNumber(data.employees.inactiveEmployees, ratio),
      roles: data.employees.roles.map((role) => ({
        ...role,
        total: scaleNumber(role.total, ratio),
      })),
      topEmployees: data.employees.topEmployees.map((employee) => ({
        ...employee,
        ordersHandled: scaleNumber(employee.ordersHandled, ratio),
        revenueHandled: scaleNumber(employee.revenueHandled, ratio),
      })),
    },
    ai: {
      ...data.ai,
      totalConversations: scaleNumber(data.ai.totalConversations, ratio),
      totalUserQuestions: scaleNumber(data.ai.totalUserQuestions, ratio),
      totalAssistantAnswers: scaleNumber(data.ai.totalAssistantAnswers, ratio),
      guestConversations: scaleNumber(data.ai.guestConversations, ratio),
      memberConversations: scaleNumber(data.ai.memberConversations, ratio),
      totalChats: scaleNumber(data.ai.totalChats, ratio),
      popularQuestions: data.ai.popularQuestions.map((question) => ({
        ...question,
        count: scaleNumber(question.count, ratio),
      })),
      questionTrend: data.ai.questionTrend.map((point) => ({
        ...point,
        questions: scaleNumber(point.questions, ratio),
      })),
    },
  };
};

const applyCinemaFilter = (
  data: AdminDashboardData,
  cinemaId?: string,
): AdminDashboardData => {
  if (!cinemaId) return data;

  const ratio = cinemaScale[cinemaId] ?? 0.25;
  const schedules = data.schedules.filter((schedule) => schedule.cinemaId === cinemaId);
  const cinemaName = schedules[0]?.cinemaName;

  return {
    ...data,
    overview: data.overview.map((metric) => ({
      ...metric,
      value:
        metric.format === "percent"
          ? metric.value
          : scaleNumber(metric.value, ratio),
      trend: metric.trend
        ? {
            ...metric.trend,
            label: cinemaName ? `${metric.trend.label} - ${cinemaName}` : metric.trend.label,
          }
        : undefined,
    })),
    revenue: {
      ...data.revenue,
      totalRevenue: scaleNumber(data.revenue.totalRevenue, ratio),
      totalTickets: scaleNumber(data.revenue.totalTickets, ratio),
      totalProducts: scaleNumber(data.revenue.totalProducts, ratio),
      series: data.revenue.series.map((point) => ({
        ...point,
        revenue: scaleNumber(point.revenue, ratio),
        tickets: scaleNumber(point.tickets, ratio),
        products: scaleNumber(point.products, ratio),
      })),
    },
    movies: {
      ...data.movies,
      topRevenue: data.movies.topRevenue.map((movie) => ({
        ...movie,
        revenue: scaleNumber(movie.revenue, ratio),
        ticketsSold: scaleNumber(movie.ticketsSold, ratio),
      })),
      topTickets: data.movies.topTickets.map((movie) => ({
        ...movie,
        revenue: scaleNumber(movie.revenue, ratio),
        ticketsSold: scaleNumber(movie.ticketsSold, ratio),
      })),
      nowShowing: scaleNumber(data.movies.nowShowing, ratio),
      comingSoon: scaleNumber(data.movies.comingSoon, ratio),
    },
    schedules,
    orders: {
      ...data.orders,
      statuses: {
        paid: scaleNumber(data.orders.statuses.paid, ratio),
        pending: scaleNumber(data.orders.statuses.pending, ratio),
        cancelled: scaleNumber(data.orders.statuses.cancelled, ratio),
        expired: scaleNumber(data.orders.statuses.expired, ratio),
        refunded: scaleNumber(data.orders.statuses.refunded, ratio),
      },
      paymentMethods: data.orders.paymentMethods.map((method) => ({
        ...method,
        orders: scaleNumber(method.orders, ratio),
        revenue: scaleNumber(method.revenue, ratio),
      })),
      recentOrders: data.orders.recentOrders.slice(0, Math.max(schedules.length, 1)),
    },
    loyalty: {
      ...data.loyalty,
      pointsIssued: scaleNumber(data.loyalty.pointsIssued, ratio),
      pointsRedeemed: scaleNumber(data.loyalty.pointsRedeemed, ratio),
      tiers: data.loyalty.tiers.map((tier) => ({
        ...tier,
        members: scaleNumber(tier.members, ratio),
      })),
    },
    reviews: {
      ...data.reviews,
      totalReviews: scaleNumber(data.reviews.totalReviews, ratio),
      pendingReviews: scaleNumber(data.reviews.pendingReviews, ratio),
      resolvedReviews: scaleNumber(data.reviews.resolvedReviews, ratio),
      ratingDistribution: data.reviews.ratingDistribution.map((item) => ({
        ...item,
        count: scaleNumber(item.count, ratio),
      })),
    },
    products: {
      ...data.products,
      totalRevenue: scaleNumber(data.products.totalRevenue, ratio),
      itemsSold: scaleNumber(data.products.itemsSold, ratio),
      topProducts: data.products.topProducts.map((product) => ({
        ...product,
        quantitySold: scaleNumber(product.quantitySold, ratio),
        revenue: scaleNumber(product.revenue, ratio),
      })),
    },
    promotions: {
      ...data.promotions,
      totalPromotions: scaleNumber(data.promotions.totalPromotions, ratio),
      ordersApplied: scaleNumber(data.promotions.ordersApplied, ratio),
      totalDiscountValue: scaleNumber(data.promotions.totalDiscountValue, ratio),
      averageDiscountValue: scaleNumber(data.promotions.averageDiscountValue, ratio),
      statuses: {
        active: scaleNumber(data.promotions.statuses.active, ratio),
        upcoming: scaleNumber(data.promotions.statuses.upcoming, ratio),
        expired: scaleNumber(data.promotions.statuses.expired, ratio),
        paused: scaleNumber(data.promotions.statuses.paused, ratio),
      },
      topPromotions: data.promotions.topPromotions.map((promotion) => ({
        ...promotion,
        ordersUsed: scaleNumber(promotion.ordersUsed, ratio),
        discountValue: scaleNumber(promotion.discountValue, ratio),
        revenueAfterDiscount: scaleNumber(promotion.revenueAfterDiscount, ratio),
      })),
    },
    employees: {
      ...data.employees,
      totalEmployees: scaleNumber(data.employees.totalEmployees, ratio),
      activeEmployees: scaleNumber(data.employees.activeEmployees, ratio),
      inactiveEmployees: scaleNumber(data.employees.inactiveEmployees, ratio),
      roles: data.employees.roles.map((role) => ({
        ...role,
        total: Math.max(scaleNumber(role.total, ratio), role.role === "ADMIN" ? 1 : 0),
      })),
      topEmployees: data.employees.topEmployees.filter((employee) =>
        cinemaName ? employee.cinemaName === cinemaName : true,
      ),
    },
    ai: {
      ...data.ai,
      totalConversations: scaleNumber(data.ai.totalConversations, ratio),
      totalUserQuestions: scaleNumber(data.ai.totalUserQuestions, ratio),
      totalAssistantAnswers: scaleNumber(data.ai.totalAssistantAnswers, ratio),
      guestConversations: scaleNumber(data.ai.guestConversations, ratio),
      memberConversations: scaleNumber(data.ai.memberConversations, ratio),
      totalChats: scaleNumber(data.ai.totalChats, ratio),
      popularQuestions: data.ai.popularQuestions.map((question) => ({
        ...question,
        count: scaleNumber(question.count, ratio),
      })),
      questionTrend: data.ai.questionTrend.map((point) => ({
        ...point,
        questions: scaleNumber(point.questions, ratio),
      })),
    },
  };
};

const toDashboardParams = (filters: DashboardFilterState) => ({
  range: filters.range,
  year: filters.year,
  month: filters.month,
  week: filters.week,
  cinemaId: filters.cinemaId,
});

const unwrapDashboardResponse = (payload: unknown) => {
  const record = payload as { data?: unknown };
  return (record?.data ?? payload) as Partial<AdminDashboardData>;
};

const numericValue = (value: unknown) => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const currentMetricValue = (
  metrics: OverviewMetric[],
  id: string,
) => numericValue(metrics.find((metric) => metric.id === id)?.value);

const makeOverviewMetric = (
  data: AdminDashboardData,
  id: string,
  value: number,
  format: OverviewMetric["format"],
): OverviewMetric => {
  const existing = data.overview.find((metric) => metric.id === id);
  const fallback = mockDashboardData.overview.find((metric) => metric.id === id);

  return {
    ...(fallback ?? { id, title: id, value, format }),
    ...(existing ?? {}),
    id,
    value,
    format: existing?.format ?? fallback?.format ?? format,
    trend: existing?.trend ?? fallback?.trend,
  };
};

const restoreOverviewStats = (data: AdminDashboardData): AdminDashboardData => {
  const overview = data.overview ?? [];
  const statuses = data.orders?.statuses;
  const paidOrders = numericValue(statuses?.paid);
  const failedOrders =
    numericValue((statuses as unknown as Record<string, unknown>)?.failed) +
    numericValue(statuses?.cancelled) +
    numericValue(statuses?.expired);
  const totalOrders = Math.max(
    paidOrders +
      numericValue(statuses?.pending) +
      numericValue(statuses?.cancelled) +
      numericValue(statuses?.expired) +
      numericValue(statuses?.refunded),
    currentMetricValue(overview, "total-orders"),
  );
  const soldSeats = data.schedules.reduce(
    (total, schedule) => total + numericValue(schedule.soldSeats),
    0,
  );
  const totalSeats = data.schedules.reduce(
    (total, schedule) => total + numericValue(schedule.totalSeats),
    0,
  );
  const seatOccupancy = totalSeats ? Math.round((soldSeats * 1000) / totalSeats) / 10 : 0;
  const loyalty = data.loyalty as AdminDashboardData["loyalty"] & { newUsers?: number };
  const newUsers = Math.max(
    numericValue(loyalty?.newUsers),
    currentMetricValue(overview, "new-users"),
  );
  const activePromotions = Math.max(
    numericValue(data.promotions?.statuses?.active),
    currentMetricValue(overview, "active-promotions"),
  );

  return {
    ...data,
    overview: [
      makeOverviewMetric(data, "today-revenue", numericValue(data.revenue?.totalRevenue), "currency"),
      makeOverviewMetric(data, "tickets-sold", numericValue(data.revenue?.totalTickets), "number"),
      makeOverviewMetric(data, "total-orders", totalOrders, "number"),
      makeOverviewMetric(data, "paid-orders", Math.max(paidOrders, currentMetricValue(overview, "paid-orders")), "number"),
      makeOverviewMetric(data, "failed-orders", Math.max(failedOrders, currentMetricValue(overview, "failed-orders")), "number"),
      makeOverviewMetric(data, "seat-occupancy", Math.max(seatOccupancy, currentMetricValue(overview, "seat-occupancy")), "percent"),
      makeOverviewMetric(data, "new-users", newUsers, "number"),
      makeOverviewMetric(data, "active-promotions", activePromotions, "number"),
      makeOverviewMetric(data, "today-schedules", Math.max(data.schedules.length, currentMetricValue(overview, "today-schedules")), "number"),
    ],
  };
};

const withMockFallback = (filters: DashboardFilterState) => {
  const clonedData = JSON.parse(JSON.stringify(mockDashboardData)) as AdminDashboardData;
  return restoreOverviewStats(applyRangeFilter(applyCinemaFilter(clonedData, filters.cinemaId), filters));
};

const mergeSectionData = (
  section: DashboardSectionKey,
  payload: Partial<AdminDashboardData>,
  fallback: AdminDashboardData,
): AdminDashboardData => {
  if (payload.overview && payload.orders && payload.movies) {
    return restoreOverviewStats(payload as AdminDashboardData);
  }

  if (section === "customers" && payload.loyalty) {
    return restoreOverviewStats({ ...fallback, loyalty: payload.loyalty });
  }

  return restoreOverviewStats({
    ...fallback,
    ...(section === "revenue" && payload.revenue ? { revenue: payload.revenue } : {}),
    ...(section === "employees" && payload.employees ? { employees: payload.employees } : {}),
    ...(section === "reviews" && payload.reviews ? { reviews: payload.reviews } : {}),
    ...(section === "movies" && payload.movies ? { movies: payload.movies } : {}),
    ...(section === "products" && payload.products ? { products: payload.products } : {}),
    ...(section === "schedules" && payload.schedules ? { schedules: payload.schedules } : {}),
    ...(section === "orders" && payload.orders ? { orders: payload.orders } : {}),
    ...(section === "promotions" && payload.promotions ? { promotions: payload.promotions } : {}),
  });
};

export const dashboardService = {
  getAdminDashboard: async (
    filters: DashboardFilterState,
  ): Promise<AdminDashboardData> =>
    apiClient
      .get("/dashboard/admin", { params: toDashboardParams(filters) })
      .then((response) => restoreOverviewStats(unwrapDashboardResponse(response.data) as AdminDashboardData))
      .catch(() => withMockFallback(filters)),

  getAdminDashboardSection: async (
    section: DashboardSectionKey,
    filters: DashboardFilterState,
  ): Promise<AdminDashboardData> =>
    apiClient
      .get(`/dashboard/admin/${section}`, { params: toDashboardParams(filters) })
      .then((response) =>
        mergeSectionData(section, unwrapDashboardResponse(response.data), withMockFallback(filters)),
      )
      .catch(() => withMockFallback(filters)),

  getManagerDashboard: async (
    filters: DashboardFilterState,
  ): Promise<AdminDashboardData> =>
    apiClient
      .get("/dashboard/manager", { params: toDashboardParams(filters) })
      .then((response) => restoreOverviewStats(unwrapDashboardResponse(response.data) as AdminDashboardData))
      .catch(() => withMockFallback(filters)),

  getStaffDashboard: async (
    filters: DashboardFilterState,
    employeeId: string,
  ): Promise<AdminDashboardData> =>
    apiClient
      .get("/dashboard/staff", {
        params: {
          ...toDashboardParams(filters),
          employeeId,
        },
      })
      .then((response) => restoreOverviewStats(unwrapDashboardResponse(response.data) as AdminDashboardData))
      .catch(() => withMockFallback(filters)),
};
