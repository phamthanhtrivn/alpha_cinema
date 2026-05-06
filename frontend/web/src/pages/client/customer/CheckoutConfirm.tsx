import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Loader2,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock3,
  AlertCircle,
  Film,
} from "lucide-react";
import { BookingProgressBar } from "@/components/client/BookingProgressBar";
import {
  BookingCountdown,
  useBookingCountdown,
} from "@/components/client/BookingCountdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutService } from "@/services/checkout.service";
import { showScheduleService } from "@/services/show-schedule.service";
import { movieService } from "@/services/movie.service";
import type { BookingLayoutDTO } from "@/types/booking";
import { formatDDMMYYYY, formatHHmm } from "@/utils/formatTime";
import type {
  CheckoutSessionResponse,
  CheckoutConfirmResponse,
} from "@/types/checkout";
import { ALL_TRANSLATION } from "@/types/movie";
import { PAYMENT_METHODS } from "@/constants/payment.constant";

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

type LocationState = {
  session?: CheckoutSessionResponse;
  movieId?: string;
};

export const CheckoutConfirm = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSession = (location.state as LocationState | null)?.session;
  const movieId =
    searchParams.get("movieId") ||
    (location.state as LocationState | null)?.movieId ||
    undefined;
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutConfirmResponse | null>(null);

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["checkout-confirm-session", sessionId],
    queryFn: () =>
      checkoutService.getSession(sessionId!).then((res) => res.data),
    enabled: !!sessionId && !initialSession,
  });

  const { data: layout } = useQuery<BookingLayoutDTO>({
    queryKey: ["checkout-confirm-layout", id],
    queryFn: async () => {
      const response = await showScheduleService.getBookingLayout(id!);
      return (response as unknown as ApiResponse<BookingLayoutDTO>).data;
    },
    enabled: !!id,
  });

  const { data: movie } = useQuery<MovieDetail>({
    queryKey: ["checkout-confirm-movie", movieId],
    queryFn: async () => {
      const response = await movieService.clientGetDetailMovie(movieId!);
      return (response as unknown as ApiResponse<MovieDetail>).data;
    },
    enabled: !!movieId,
  });

  const session = initialSession || sessionData;
  const { isExpired: isSessionExpired } = useBookingCountdown(
    session?.expiresAt,
  );
  const subtotal =
    (session?.seatSubtotal ?? 0) + (session?.productSubtotal ?? 0);
  const discountPercent =
    session?.promotionDiscount && subtotal
      ? Math.round((session.promotionDiscount / subtotal) * 100)
      : 0;
  const seatRows = useMemo(() => session?.seats ?? [], [session]);
  const productRows = useMemo(() => session?.items ?? [], [session]);

  const handleConfirm = async () => {
    if (!sessionId || !session) return;

    try {
      setSubmitting(true);
      const response = await checkoutService.confirmSession(sessionId, {
        paymentMethod,
      });

      if (!response.success) {
        toast.error(response.message || "Không thể xác nhận đơn hàng.");
        return;
      }

      setResult(response.data);
      if (response.data.paymentUrl) {
        window.location.assign(response.data.paymentUrl);
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Không thể xác nhận đơn hàng."
          : "Không thể xác nhận đơn hàng.";
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
            onClick={() => navigate("/")}
            className="bg-alpha-blue text-white cursor-pointer hover:bg-blue-600"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-alpha-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-slate-900">
      <BookingProgressBar currentStep={2} />

      <div className="max-w-300 mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="h-2 bg-alpha-orange" />
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <CheckCircle2 className="text-green-600" size={20} />
              Tóm tắt đơn hàng
            </CardTitle>
            <BookingCountdown
              expiresAt={session?.expiresAt}
              label="Phiên thanh toán"
            />
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
                <div className="text-2xl font-black text-slate-800 leading-tight">
                  {movie?.title || "Phim đang đặt"}
                </div>
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
                    <span>- Phòng {layout?.roomName || "Phòng"}</span>
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
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Ghế
                </div>
                <div className="mt-2 font-bold text-slate-800">
                  {seatRows.map((seat) => seat.seatNumber).join(", ")}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Sản phẩm
                </div>
                <div className="mt-2 font-bold text-slate-800">
                  {productRows.length
                    ? productRows
                        .map((item) => `${item.productName} x${item.quantity}`)
                        .join(", ")
                    : "Không chọn sản phẩm"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {seatRows.map((seat) => (
                <div
                  key={seat.seatId}
                  className="flex justify-between items-center rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <span className="font-semibold">Ghế {seat.seatNumber}</span>
                    <div className="text-xs text-slate-500">Vé</div>
                  </div>
                  <span className="font-bold text-alpha-orange">
                    {seat.finalPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              ))}
              {productRows.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <span className="font-semibold">
                      {item.productName} x{item.quantity}
                    </span>
                    <div className="text-xs text-slate-500">Sản phẩm</div>
                  </div>
                  <span className="font-bold text-alpha-blue">
                    {item.subtotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex justify-between gap-4">
                <span>Tổng vé</span>
                <span className="font-bold">
                  {session.seatSubtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Tổng sản phẩm</span>
                <span className="font-bold">
                  {session.productSubtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Giảm giá mã</span>
                <span className="font-bold text-green-700">
                  -{session.promotionDiscount.toLocaleString("vi-VN")} đ{" "}
                  {discountPercent > 0 ? `(-${discountPercent}%)` : ""}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Mã giảm giá</span>
                <span className="font-bold">
                  {session.promotionCode || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Giảm giá điểm</span>
                <span className="font-bold text-green-700">
                  -{session.pointDiscount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between text-lg">
                <span className="font-black">Cần thanh toán</span>
                <span className="font-black text-alpha-orange">
                  {session.totalPayment.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sticky top-24 h-fit lg:max-w-sm w-full lg:justify-self-end">
          <div className="h-2 bg-alpha-blue" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <CreditCard size={20} className="text-alpha-blue" />
              Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">
                Phương thức thanh toán
              </label>

              {/* Scroll container */}
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? "border-alpha-orange bg-orange-50"
                        : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {/* radio */}
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-orange-500 w-4 h-4"
                    />

                    {/* logo */}
                    <img
                      src={method.img}
                      alt={method.label}
                      className="w-10 h-10 object-contain"
                    />

                    {/* content */}
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-slate-800">
                        {method.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {method.desc}
                      </span>
                    </div>

                    {/* check icon */}
                    {paymentMethod === method.value && (
                      <span className="text-alpha-orange font-bold">✓</span>
                    )}
                  </label>
                ))}
              </div>

              {/* hidden input để submit form nếu cần */}
              <input type="hidden" name="paymentMethod" value={paymentMethod} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tổng vé</span>
                <span className="font-bold">
                  {session.seatSubtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng sản phẩm</span>
                <span className="font-bold">
                  {session.productSubtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá mã</span>
                <span className="font-bold text-green-700">
                  -{session.promotionDiscount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá điểm</span>
                <span className="font-bold text-green-700">
                  -{session.pointDiscount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between text-lg">
                <span className="font-black">Cần thanh toán</span>
                <span className="font-black text-alpha-orange">
                  {session.totalPayment.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {result?.paymentUrl && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                Đang chuyển đến cổng thanh toán...
              </div>
            )}

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full bg-alpha-orange text-white hover:bg-orange-600 cursor-pointer"
            >
              {submitting ? "Đang xác nhận..." : "Xác nhận và thanh toán"}{" "}
              <ArrowRight size={16} />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() =>
                navigate(
                  `/booking/${id}/checkout/${sessionId}${movieId ? `?movieId=${movieId}` : ""}`,
                )
              }
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
