import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { orderService } from '@/services/order.service';
import { notificationService } from '@/services/notification.service';
import { movieService } from '@/services/movie.service';
import type { CustomerProfile, Gender } from '@/types/customer';
import type { OrderHistoryItem } from '@/types/order';
import { OrderStatus } from '@/types/order';
import { ALL_TRANSLATION } from '@/types/movie';
import { Loader2, User, Star, Wallet, Phone, Mail, Calendar, Lock, MapPin, Clock, Film, AlertCircle, Bell, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/formatCurrency';
import { Container, Section } from '@/components/common/Layout';
import { Button } from '@/components/ui/button';
import { Card, FormField, SidebarAction, AgeBadge } from './profile/ProfileUIComponents';
import ChangePasswordModal from './profile/ChangePasswordModal';
import ChangeEmailModal from './profile/ChangeEmailModal';
import OrderDetailModal from './profile/OrderDetailModal';
import NotificationItem from './profile/NotificationItem';
import WriteReviewModal from '@/components/client/WriteReviewModal';
import { reviewService } from '@/services/review.service';
import ReviewItem from './profile/ReviewItem';
import Policy from '@/components/client/Policy';

// ==============================
// Types & Constants
// ==============================
type Tab = 'profile' | 'history' | 'notifications' | 'reviews' | 'policy';

const TABS: { key: Tab; label: string }[] = [
  { key: 'history', label: 'Lịch Sử Giao Dịch' },
  { key: 'profile', label: 'Thông Tin Cá Nhân' },
  { key: 'notifications', label: 'Thông Báo' },
  { key: 'reviews', label: 'Lịch Sử Đánh Giá' },
  { key: 'policy', label: 'Chính Sách' },
];

const tierLabel = (type: string) => {
  switch (type) {
    case "MEMBER":
      return "Member";
    case "SILVER":
      return "Silver";
    case "GOLD":
      return "Gold";
    default:
      return type;
  }
};

// ==============================
// Main Component
// ==============================
const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "profile",
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'profile' || tab === 'history' || tab === 'notifications' || tab === 'reviews' || tab === 'policy')) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMovie, setReviewMovie] = useState<{ id: string, name: string } | null>(null);

  const handleShowOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDetailOpen(true);
  };

  // ---- Data Fetching ----
  const { data: profile, isLoading } = useQuery<CustomerProfile>({
    queryKey: ["customer-profile"],
    queryFn: () => customerService.getProfile().then((res) => res.data),
  });

  const {
    data: orderHistory,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery<OrderHistoryItem[]>({
    queryKey: ["order-history"],
    queryFn: () =>
      orderService.getOrderHistory().then((res: any) => res.data ?? res),
    enabled: activeTab === "history",
  });

  // ---- Notifications Fetching ----
  const {
    data: notificationsData,
    fetchNextPage: fetchNextNotifications,
    hasNextPage: hasMoreNotifications,
    isFetchingNextPage: isFetchingMoreNotifications,
    isLoading: isNotificationsLoading,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 0 }) => notificationService.getNotifications(pageParam),
    getNextPageParam: (lastPage: any) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: activeTab === 'notifications',
  });

  const notifications = notificationsData?.pages.flatMap((page) => page.content) || [];

  // ---- Reviews Fetching ----
  const {
    data: reviewsData,
    fetchNextPage: fetchNextReviews,
    hasNextPage: hasMoreReviews,
    isFetchingNextPage: isFetchingMoreReviews,
    isLoading: isReviewsLoading,
  } = useInfiniteQuery({
    queryKey: ['customer-reviews'],
    queryFn: ({ pageParam = 0 }) => reviewService.getCustomerReviews(pageParam),
    getNextPageParam: (lastPage: any) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: activeTab === 'reviews',
  })

  const reviews = reviewsData?.pages.flatMap((page) => page.data.content) || [];

  // ---- Fetch Movie Details for Reviews ----
  const movieIds = Array.from(new Set(reviews.map((r: any) => r.movieId))).filter(Boolean);
  const { data: moviesData } = useQuery({
    queryKey: ['movies-by-ids', movieIds],
    queryFn: () => movieService.getMoviesByIds(movieIds as string[]).then(res => res.data),
    enabled: movieIds.length > 0 && activeTab === 'reviews',
  });

  const moviesMap = (moviesData || []).reduce((acc: any, movie: any) => {
    acc[movie.id] = movie;
    return acc;
  }, {});

  // ---- Profile Form State ----
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    gender: "MALE" as Gender,
    dateOfBirth: "",
    password: "",
  });

  React.useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        password: "",
      });
    }
  }, [profile]);

  // ---- Update Profile Mutation ----
  const updateMutation = useMutation({
    mutationFn: (data: any) => customerService.updateProfile(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Cập nhật thông tin thành công");
        setFieldErrors({});
        queryClient.setQueryData(["customer-profile"], res.data);
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        setFieldErrors(responseData.errors);
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
      } else {
        toast.error(responseData?.message || "Có lỗi xảy ra khi cập nhật");
      }
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    updateMutation.mutate({
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
    });
  };

  // ---- Tier Progress ----
  const tierProgress = () => {
    const spending = profile?.totalSpending ?? 0;
    return Math.min((spending / 4_000_000) * 100, 100);
  };

  const MILESTONES = [
    { pos: 0, label: "Member" },
    { pos: 50, label: "Silver" },
    { pos: 100, label: "Gold" },
  ];

  const progressPct = tierProgress(); // 0–100
  // Ensure a minimum visible width so even tiny amounts show the bar
  const barWidth = progressPct === 0 ? 0 : Math.max(progressPct, 2);

  // ---- Group order history by month/year ----
  const orderGroups: { label: string; orders: OrderHistoryItem[] }[] =
    React.useMemo(() => {
      if (!orderHistory) return [];
      const map = new Map<string, OrderHistoryItem[]>();
      orderHistory.forEach((order) => {
        const d = new Date(order.createdAt);
        const key = `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(order);
      });
      return [...map.entries()].map(([label, orders]) => ({ label, orders }));
    }, [orderHistory]);

  // ==============================
  // Render
  // ==============================
  return (
    <Section className="bg-slate-50 min-h-screen">
      <Container className="flex flex-col md:flex-row gap-6">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="sm:w-full md:w-72 lg:w-96 flex flex-col gap-4">
          <Card className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-alpha-blue" size={32} />
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shrink-0">
                    <span className="text-lg font-bold text-slate-700">
                      {profile?.fullName
                        ? profile.fullName
                          .trim()
                          .split(" ")
                          .pop()?.[0]
                          .toUpperCase()
                        : "?"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-slate-800 text-lg leading-tight">
                      {profile?.fullName || "—"}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star
                        size={12}
                        className="text-alpha-orange fill-alpha-orange"
                      />
                      <span className="text-sm font-medium">
                        {tierLabel(profile?.customerType ?? "MEMBER")} ·{" "}
                        {profile?.loyaltyPoint ?? 0} điểm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spending Progress */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base text-slate-700 font-medium mb-4">
                      Tổng chi tiêu 2026
                    </span>
                    <span className="text-base font-bold text-alpha-orange">
                      {formatCurrency(profile?.totalSpending ?? 0)}
                    </span>
                  </div>

                  <div className="relative h-2 rounded-full bg-slate-100 mt-12 mb-4">
                    {/* Alpha-blue progress fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-alpha-blue transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        boxShadow:
                          progressPct > 0
                            ? "0 0 6px rgba(var(--color-alpha-blue-rgb, 59,130,246),0.5)"
                            : "none",
                      }}
                    />
                    {/* Animated dot at current position */}
                    {progressPct > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${barWidth}%` }}
                      >
                        <span className="relative flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alpha-blue opacity-60" />
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-alpha-blue border-2 border-white shadow" />
                        </span>
                      </div>
                    )}
                    {/* Milestone markers */}
                    {MILESTONES.map((m, idx) => (
                      <div
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: `${m.pos}%` }}
                      >
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <div
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shadow-sm relative transition-colors ${progressPct >= m.pos
                              ? "bg-alpha-blue text-white border-alpha-blue"
                              : "bg-white text-slate-500 border-slate-200"
                              }`}
                          >
                            {m.label}
                            <div
                              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-r border-b rotate-45 ${progressPct >= m.pos
                                ? "bg-alpha-blue border-alpha-blue"
                                : "bg-white border-slate-200"
                                }`}
                            />
                          </div>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full border-2 transition-all duration-300 -translate-x-1/2 ${progressPct >= m.pos
                            ? "bg-white border-alpha-blue scale-110"
                            : "bg-white border-slate-300"
                            }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>0 đ</span>
                    <span>2.000.000 đ</span>
                    <span>4.000.000 đ</span>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card className="divide-y divide-slate-50 overflow-hidden">
            <SidebarAction
              label="HOTLINE hỗ trợ"
              subLabel="19002224 (9:00 – 22:00)"
              href="tel:19002224"
            />
            <SidebarAction
              label="Email"
              subLabel="hotro@alphastudio.vn"
              href="mailto:hotro@alphastudio.vn"
            />
            <SidebarAction label="Câu hỏi thường gặp" to="#" />
          </Card>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-100 flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key ? "border-alpha-blue text-alpha-blue" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2
                      className="animate-spin text-alpha-blue"
                      size={36}
                    />
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Họ và tên"
                        icon={<User />}
                        error={fieldErrors.fullName}
                      >
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                          }
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.fullName ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-alpha-blue"}`}
                        />
                      </FormField>

                      <FormField
                        label="Ngày sinh"
                        icon={<Calendar />}
                        error={fieldErrors.dateOfBirth}
                      >
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) =>
                            setForm({ ...form, dateOfBirth: e.target.value })
                          }
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.dateOfBirth ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-alpha-blue"}`}
                        />
                      </FormField>

                      <FormField label="Email">
                        <Mail
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type="email"
                          value={profile?.email ?? ""}
                          readOnly
                          className="w-full pl-9 pr-16 py-2.5 text-sm border border-slate-200 rounded-md bg-slate-100 text-slate-400 cursor-not-allowed"
                        />
                        <span
                          onClick={() => setIsEmailModalOpen(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-alpha-orange font-semibold cursor-pointer hover:underline"
                        >
                          Thay đổi
                        </span>
                      </FormField>

                      <FormField
                        label="Số điện thoại"
                        icon={<Phone />}
                        error={fieldErrors.phone}
                      >
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-alpha-blue"}`}
                        />
                      </FormField>

                      <FormField label="Giới tính" error={fieldErrors.gender}>
                        <div className="flex gap-6 pt-1">
                          {[
                            { value: "MALE", label: "Nam" },
                            { value: "FEMALE", label: "Nữ" },
                            { value: "OTHER", label: "Khác" },
                          ].map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={opt.value}
                                checked={form.gender === opt.value}
                                onChange={() =>
                                  setForm({
                                    ...form,
                                    gender: opt.value as Gender,
                                  })
                                }
                                className="accent-alpha-blue w-4 h-4"
                              />
                              <span className="text-sm text-slate-700">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormField>

                      <FormField label="Mật khẩu" icon={<Lock />}>
                        <input
                          readOnly
                          type="password"
                          placeholder="••••••••••"
                          value={form.password}
                          className="w-full pl-9 pr-16 py-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 focus:border-alpha-blue transition-all"
                        />
                        <span
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-alpha-orange font-semibold cursor-pointer hover:underline"
                        >
                          Thay đổi
                        </span>
                      </FormField>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-alpha-orange hover:bg-orange-600 text-white font-medium px-8 py-2.5 rounded-md transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-100 flex items-center gap-2"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> Đang
                            xử lý...
                          </>
                        ) : (
                          "Cập nhật"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                {isHistoryLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2
                      className="animate-spin text-alpha-blue"
                      size={36}
                    />
                  </div>
                ) : isHistoryError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <AlertCircle size={48} className="mb-4 opacity-40" />
                    <p className="font-semibold text-lg">
                      Không thể tải lịch sử
                    </p>
                    <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
                  </div>
                ) : !orderHistory || orderHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Wallet size={48} className="mb-4 opacity-30" />
                    <p className="font-semibold text-lg">
                      Chưa có giao dịch nào
                    </p>
                    <p className="text-sm mt-1">
                      Lịch sử mua vé của bạn sẽ hiển thị tại đây.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orderGroups.map(({ label, orders }) => (
                      <div key={label}>
                        {/* ── Month/Year header ── */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {label}
                          </span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* ── Cards ── */}
                        <div className="flex flex-col gap-3">
                          {orders.map((order) => {
                            const snap = order.showScheduleSnapshot;
                            if (!snap) return null;

                            const startDate = new Date(snap.startTime);
                            const dateStr = startDate.toLocaleDateString('vi-VN', {
                              weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                            });
                            const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                            const projLabel = `${snap.projectionType} - ${ALL_TRANSLATION.find(t => t.value === snap.translationType)?.label ?? snap.translationType}`;

                            return (
                              <div
                                key={order.id}
                                onClick={() => handleShowOrderDetail(order.id)}
                                className="relative flex gap-3 border border-slate-100 rounded-sm p-3 hover:border-alpha-blue/30 hover:shadow-sm transition-all bg-white cursor-pointer"
                              >
                                {order.status === OrderStatus.CONFIRMED && (
                                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-bold flex items-center gap-1">
                                    <Check size={10} strokeWidth={3} />
                                    Đã xem phim
                                  </div>
                                )}
                                {/* Thumbnail */}
                                <div className="w-16 h-24 rounded-sm overflow-hidden bg-slate-100 shrink-0">
                                  {snap.movieThumbnailUrl ? (
                                    <img src={snap.movieThumbnailUrl} alt={snap.movieTitle} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Film size={24} className="text-slate-300" />
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{snap.movieTitle}</p>

                                  {/* Tags */}
                                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                    <span className="text-[11px] font-medium text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{projLabel}</span>
                                    <AgeBadge ageType={snap.ageType} />
                                  </div>

                                  {/* Cinema */}
                                  <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-1">
                                    <MapPin size={11} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{order.cinemaName} - Phòng {order.roomNumber}</span>
                                  </div>

                                  {/* Time */}
                                  <div className="flex items-center gap-1 text-[12px] text-slate-600 mb-2">
                                    <Clock size={11} className="text-slate-400 shrink-0" />
                                    <span>{timeStr} - {dateStr}</span>
                                  </div>

                                  {/* Price */}
                                  <div className="flex justify-between items-center mt-2">
                                    <div className="flex-1 text-right">
                                      <span className="font-bold text-alpha-orange text-sm">{formatCurrency(order.totalPayment)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div >
                    ))}
                  </div >
                )}
              </div >
            )}

            {/* Notifications Tab */}
            {
              activeTab === 'notifications' && (
                <div>
                  {isNotificationsLoading ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="animate-spin text-alpha-blue" size={36} />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Bell size={48} className="mb-4 opacity-30" />
                      <p className="font-semibold text-lg">Không có thông báo nào</p>
                      <p className="text-sm mt-1">Các thông báo mới của bạn sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {notifications.map((notification: any) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={(id, url) => {
                            if (!notification.read) {
                              notificationService.markAsRead(id).then(() => {
                                queryClient.invalidateQueries({ queryKey: ["notifications"] });
                              });
                            }
                            if (url) {
                              window.location.href = url;
                            }
                          }}
                          onDelete={(id) => {
                            // Optimistic UI: Xóa ngay lập tức khỏi cache
                            queryClient.setQueryData(['notifications'], (oldData: any) => {
                              if (!oldData) return oldData;
                              return {
                                ...oldData,
                                pages: oldData.pages.map((page: any) => ({
                                  ...page,
                                  content: page.content.filter((n: any) => n.id !== id),
                                })),
                              };
                            });
                            // Gọi API xóa ở background
                            notificationService.deleteNotification(id);
                          }}
                        />
                      ))}

                      {hasMoreNotifications && (
                        <div className="flex justify-center mt-6">
                          <Button
                            variant="outline"
                            onClick={() => fetchNextNotifications()}
                            disabled={isFetchingMoreNotifications}
                            className="border-slate-200 text-slate-600 hover:text-alpha-blue hover:border-alpha-blue hover:bg-alpha-blue/5 transition-all"
                          >
                            {isFetchingMoreNotifications ? (
                              <><Loader2 size={16} className="animate-spin mr-2" /> Đang tải...</>
                            ) : 'Xem thêm'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            {/* Reviews Tab */}
            {
              activeTab === 'reviews' && (
                <div>
                  {isReviewsLoading ? (
                    <div className="flex justify-center py-20">
                      <Loader2 size={32} className="animate-spin text-alpha-orange opacity-50" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Star size={48} className="mb-4 opacity-30" />
                      <p className="font-semibold text-lg">Chưa có đánh giá nào</p>
                      <p className="text-sm mt-1">Các đánh giá phim của bạn sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {reviews.map((review: any) => (
                        <ReviewItem
                          key={review.id}
                          review={review}
                          movie={moviesMap[review.movieId]}
                        />
                      ))}

                      {hasMoreReviews && (
                        <div className="flex justify-center mt-6">
                          <Button
                            variant="outline"
                            onClick={() => fetchNextReviews()}
                            disabled={isFetchingMoreReviews}
                            className="border-slate-200 text-slate-600 hover:text-alpha-blue hover:border-alpha-blue hover:bg-alpha-blue/5 transition-all"
                          >
                            {isFetchingMoreReviews ? (
                              <><Loader2 size={16} className="animate-spin mr-2" /> Đang tải...</>
                            ) : 'Xem thêm'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            {/* Other Tabs */}
            {activeTab === "policy" && <Policy />}
          </div >
        </main >
      </Container >

      {/* Modals */}
      < ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      < ChangeEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
      < OrderDetailModal
        orderId={selectedOrderId}
        isOpen={isOrderDetailOpen}
        onClose={() => setIsOrderDetailOpen(false)}
      />
      {
        reviewMovie && (
          <WriteReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            movieId={reviewMovie.id}
            movieName={reviewMovie.name}
          />
        )
      }
    </Section >
  );
};

export default ProfilePage;
