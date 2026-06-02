import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { clearCartThunk } from "@/store/slices/cartSlice";
import type { AppDispatch } from "@/store";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { paymentService, type PaymentResult } from "@/services/payment.service";

type PaymentResultState = {
  paymentResult?: PaymentResult;
  allowPaymentResultPage?: boolean;
};

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const state = location.state as PaymentResultState | null;
  const stateResult = state?.allowPaymentResultPage
    ? state.paymentResult
    : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-result", token],
    queryFn: () =>
      paymentService.getPaymentResult(token!).then((res) => res.data),
    enabled: !!token && !stateResult,
    retry: false,
  });

  const result = useMemo(() => stateResult || data, [data, stateResult]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    document.title = "Thanh toán thành công | Alpha Cinema";
  }, []);

  useEffect(() => {
    if (result && !result.success && token) {
      navigate(`/payment/failed?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
    }
  }, [navigate, result, token]);

  useEffect(() => {
    if (result && result.success) {
      const isCartCheckout = sessionStorage.getItem("isCartCheckout");
      if (isCartCheckout === "true") {
        void dispatch(clearCartThunk());
        sessionStorage.removeItem("isCartCheckout");
      }
    }
  }, [result, dispatch]);

  if (!token && !stateResult) {
    return <Navigate to="/" replace />;
  }

  if (isError) {
    return <Navigate to="/" replace />;
  }

  if (isLoading || !result) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-alpha-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 px-4 py-14">
      <Card className="mx-auto max-w-2xl border-green-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div className="h-2 bg-green-500" />
        <CardContent className="space-y-6 p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-500" size={72} />
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">
              Thanh toán thành công
            </h1>
            <p className="text-slate-500">
              Đơn hàng của bạn đã được ghi nhận. Vé sẽ xuất hiện trong lịch sử
              đặt vé.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm">
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-slate-400">
              <ReceiptText size={16} />
              Thông tin thanh toán
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Mã đơn hàng</span>
                <span className="font-bold text-slate-900">
                  {result.orderId}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phương thức</span>
                <span className="font-bold text-slate-900">
                  {result.method || "POINTS"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Số tiền</span>
                <span className="font-bold text-alpha-orange">
                  {result.amount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() =>
                navigate("/profile?tab=history", { replace: true })
              }
              className="bg-alpha-orange text-white hover:bg-orange-600"
            >
              Xem lịch sử đơn hàng
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/", { replace: true })}
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
