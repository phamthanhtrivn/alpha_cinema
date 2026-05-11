import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Ticket,
  MapPin,
  Clock3,
  Star,
  AlertCircle,
  Film,
} from "lucide-react";
import { BookingProgressBar } from "@/components/client/BookingProgressBar";
import {
  BookingCountdown,
  useBookingCountdown,
} from "@/components/client/BookingCountdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutService } from "@/services/checkout.service";
import { productService } from "@/services/product.service";
import { showScheduleService } from "@/services/show-schedule.service";
import { movieService } from "@/services/movie.service";
import type { BookingLayoutDTO } from "@/types/booking";
import { formatDDMMYYYY, formatHHmm } from "@/utils/formatTime";
import type {
  CheckoutSessionResponse,
  UpdateCheckoutSessionRequest,
} from "@/types/checkout";
import { ALL_TRANSLATION } from "@/types/movie";

type ProductItem = {
  id: string;
  name: string;
  unitPrice: number;
  pictureUrl?: string;
  description?: string;
  type?: string;
  status?: boolean;
};

type LocationState = {
  session?: CheckoutSessionResponse;
};

type MovieDetail = {
  title: string;
  thumbnailUrl: string;
  ageType: string;
  duration?: number;
};

type ApiResponse<T> = {
  data: T;
  success?: boolean;
  message?: string;
};

export const Checkout = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSession = (location.state as LocationState | null)?.session;
  const movieId = searchParams.get("movieId");

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [promotionCode, setPromotionCode] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: () =>
      checkoutService.getSession(sessionId!).then((res) => res.data),
    enabled: !!sessionId && !initialSession,
  });

  const { data: productResponse, isLoading: isProductLoading } = useQuery({
    queryKey: ["checkout-products"],
    queryFn: async () => {
      const response = await productService.getAllProduct({
        page: 0,
        size: 50,
        status: true,
      });
      return response.data.content as ProductItem[];
    },
  });

  const { data: layout } = useQuery<BookingLayoutDTO>({
    queryKey: ["checkout-layout", id],
    queryFn: async () => {
      const response = await showScheduleService.getBookingLayout(id!);
      return (response as unknown as ApiResponse<BookingLayoutDTO>).data;
    },
    enabled: !!id,
  });

  const { data: movie } = useQuery<MovieDetail>({
    queryKey: ["checkout-movie-detail", movieId],
    queryFn: async () => {
      const response = await movieService.clientGetDetailMovie(movieId!);
      return (response as unknown as ApiResponse<MovieDetail>).data;
    },
    enabled: !!movieId,
  });

  const session = initialSession || sessionData;
  const maxRedeemPoints = session?.availableLoyaltyPoints ?? 0;
  const parsedPoints = pointsToRedeem ? Number(pointsToRedeem) : 0;
  const redeemPoints = Math.min(Math.max(parsedPoints, 0), maxRedeemPoints);
  const subtotal =
    (session?.seatSubtotal ?? 0) + (session?.productSubtotal ?? 0);
  const discountPercent =
    session?.promotionDiscount && subtotal
      ? Math.round((session.promotionDiscount / subtotal) * 100)
      : 0;
  const { isExpired: isSessionExpired } = useBookingCountdown(
    session?.expiresAt,
  );

  useEffect(() => {
    if (session?.promotionCode) {
      setPromotionCode(session.promotionCode);
    }
    if (session?.pointsRedeemed) {
      setPointsToRedeem(
        String(Math.min(session.pointsRedeemed, maxRedeemPoints)),
      );
    }
  }, [session, maxRedeemPoints]);

  useEffect(() => {
    if (!productResponse?.length) return;
    setQuantities((prev) => {
      const next = { ...prev };
      productResponse.forEach((product) => {
        if (next[product.id] === undefined) {
          next[product.id] = 0;
        }
      });
      return next;
    });
  }, [productResponse]);

  const selectedProducts = useMemo(() => {
    return Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = productResponse?.find((item) => item.id === productId);
        return product
          ? {
              ...product,
              quantity,
              subtotal: quantity * product.unitPrice,
            }
          : null;
      })
      .filter(Boolean) as Array<
      ProductItem & { quantity: number; subtotal: number }
    >;
  }, [productResponse, quantities]);

  const productSubtotal = selectedProducts.reduce(
    (sum, product) => sum + product.subtotal,
    0,
  );
  const totalBeforeDiscount = (session?.seatSubtotal ?? 0) + productSubtotal;

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const nextQuantity = Math.max(0, current + delta);
      return { ...prev, [productId]: nextQuantity };
    });
  };

  const goBackToBooking = async () => {
    if (sessionId) {
      try {
        await checkoutService.cancelSession(sessionId);
      } catch {
        toast.error("Không thể hủy phiên thanh toán hiện tại.");
        return;
      }
    }

    navigate("/");
  };

  const handleContinue = async () => {
    if (!sessionId || !session) return;

    const request: UpdateCheckoutSessionRequest = {
      items: selectedProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      promotionCode: promotionCode.trim() || undefined,
      pointsToRedeem: redeemPoints || undefined,
    };

    try {
      setSubmitting(true);
      const response = await checkoutService.updateSession(sessionId, request);
      if (!response.success) {
        toast.error(response.message || "Không thể cập nhật phiên thanh toán.");
        return;
      }

      navigate(
        `/booking/${id}/checkout/${sessionId}/confirm${movieId ? `?movieId=${movieId}` : ""}`,
        {
          state: { session: response.data, movieId },
        },
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Không thể cập nhật phiên thanh toán."
          : "Không thể cập nhật phiên thanh toán.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <AlertCircle className="text-red-500 mx-auto" size={48} />
          <div className="text-lg font-bold text-slate-800">
            Phiên đặt vé đã hết hạn
          </div>
          <p className="text-slate-500">Vui lòng thực hiện lại đơn đặt vé.</p>
          <Button
            onClick={() => void goBackToBooking()}
            className="bg-alpha-blue text-white cursor-pointer hover:bg-blue-600"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (isSessionLoading || isProductLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-alpha-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-slate-900">
      <BookingProgressBar
        currentStep={1}
        onStepClick={(step) => {
          if (step === 0) {
            void goBackToBooking();
          }
        }}
      />

      <div className="max-w-360 mx-auto px-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => void goBackToBooking()}
          className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-alpha-blue"
        >
          <ArrowLeft size={16} />
          Quay lại chọn ghế
        </Button>
      </div>

      <div className="max-w-360 mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardHeader>
              <div className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                  <Ticket className="text-alpha-blue" size={20} />
                  Chọn sản phẩm và ưu đãi
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-2">
                    Tổng vé hiện tại
                  </div>
                  <div className="text-3xl font-black text-alpha-orange">
                    {session.seatSubtotal.toLocaleString("vi-VN")} đ
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Điểm hiện có
                  </div>
                  <div className="text-3xl font-black text-alpha-blue">
                    {session.availableLoyaltyPoints}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Mỗi 1 điểm có giá trị tương đương 1.000₫ khi sử dụng để
                    thanh toán. Bạn có thể dùng tối đa{" "}
                    {maxRedeemPoints.toLocaleString("vi-VN")} điểm cho đơn hàng
                    này.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block text-center">
                    Mã giảm giá <span className="text-red-500">*</span>{" "}
                    <span className="">(chỉ có thể áp dụng 1 mã)</span>
                  </label>
                  <Input
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">
                    Điểm muốn dùng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={maxRedeemPoints}
                    value={pointsToRedeem}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      if (rawValue === "") {
                        setPointsToRedeem("");
                        return;
                      }
                      const nextValue = Math.min(
                        Number(rawValue),
                        maxRedeemPoints,
                      );
                      setPointsToRedeem(String(nextValue));
                    }}
                    placeholder="Nhập số điểm"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Tối đa {maxRedeemPoints.toLocaleString("vi-VN")} điểm.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <Sparkles className="text-alpha-orange" size={20} />
                Sản phẩm đi kèm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {productResponse?.map((product) => {
                const quantity = quantities[product.id] || 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {product.pictureUrl ? (
                        <img
                          src={product.pictureUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold text-slate-800 truncate">
                          {product.name}
                        </h4>
                        <span className="text-alpha-orange font-black">
                          {product.unitPrice.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        className="cursor-pointer"
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, -1)}
                        disabled={quantity === 0}
                      >
                        <Minus size={14} />
                      </Button>
                      <div className="w-10 text-center font-black text-slate-800">
                        {quantity}
                      </div>
                      <Button
                        className="cursor-pointer"
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!productResponse?.length && (
                <div className="text-sm text-slate-500 text-center py-8">
                  Chưa có sản phẩm nào để chọn.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
          <div className="h-2 bg-alpha-orange" />
          <CardHeader className="space-y-4">
            <div className="flex gap-4">
              <div className="w-28 h-40 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                {movie?.thumbnailUrl ? (
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <CardTitle className="text-2xl text-slate-800 leading-tight">
                  {movie?.title || "Phim đang đặt"}
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {layout?.projection || "2D"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {
                      ALL_TRANSLATION.find(
                        (t) => t.value === layout?.translation,
                      )?.label
                    }
                  </span>
                  {movie?.duration ? (
                    <span className="rounded-full bg-blue-100 text-blue-600 px-3 py-1 flex items-center gap-1">
                      <Film size={12} />
                      {movie.duration}p
                    </span>
                  ) : null}
                  {movie?.ageType ? (
                    <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1">
                      {movie.ageType}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-alpha-orange" />
                    <span className="font-semibold text-slate-800">
                      {layout?.cinemaName || "Rạp chiếu"}
                    </span>
                    <span className="text-alpha-blue">
                      - Phòng {layout?.roomName || "Phòng"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={15} className="text-alpha-orange" />
                    <span className="font-semibold text-slate-800">Suất:</span>
                    <span>
                      {layout?.startTime
                        ? `${formatHHmm(layout.startTime)} - ${formatDDMMYYYY(layout.startTime)}`
                        : "Chưa xác định"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <BookingCountdown
              expiresAt={session?.expiresAt}
              label="Phiên thanh toán"
            />
            <div className="text-sm text-slate-500">
              Tóm tắt đơn đặt vé trước khi sáng bước xác nhận.
            </div>
          </CardHeader>
          <CardContent className="space-y-5 overflow-y-auto pr-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <Star size={14} className="text-alpha-orange" />
                Ghế đã chọn
              </div>
              <div className="flex flex-wrap gap-2">
                {session.seats.map((seat) => (
                  <span
                    key={seat.seatId}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                Chi tiết giá
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span>Vé</span>
                  <span className="font-bold">
                    {session.seatSubtotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Sản phẩm</span>
                  <span className="font-bold">
                    {productSubtotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Mã giảm giá</span>
                  <span className="font-bold">
                    {promotionCode
                      ? `${promotionCode} (-${discountPercent}%)`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Điểm dùng</span>
                  <span className="font-bold">
                    {redeemPoints.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                Sản phẩm đã chọn
              </div>
              {selectedProducts.length ? (
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">
                          {product.name} x{product.quantity}
                        </div>
                        <div className="text-xs text-slate-500">
                          {product.unitPrice.toLocaleString("vi-VN")} đ / sản
                          phẩm
                        </div>
                      </div>
                      <div className="font-bold text-alpha-blue shrink-0">
                        {product.subtotal.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Chưa chọn sản phẩm nào.
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">
                Tổng tạm tính
              </span>
              <span className="text-xl font-black text-alpha-orange">
                {totalBeforeDiscount.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center gap-3">
              <Button
                variant="outline"
                onClick={() => void goBackToBooking()}
                className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer hover:text-alpha-blue"
              >
                <ArrowLeft size={16} />
                Quay lại
              </Button>

              <Button
                onClick={handleContinue}
                disabled={submitting}
                className="bg-alpha-orange text-white hover:bg-orange-600 cursor-pointer"
              >
                {submitting ? "Đang cập nhật..." : "Xác nhận thông tin"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
