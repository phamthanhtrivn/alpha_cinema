import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { paymentService } from "@/services/payment.service";

export const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-result", token],
    queryFn: () =>
      paymentService.getPaymentResult(token!).then((res) => res.data),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (result?.success && token) {
      navigate(`/payment/success?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
    }
  }, [navigate, result, token]);

  if (!token) {
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
      <Card className="mx-auto max-w-2xl border-red-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div className="h-2 bg-red-500" />
        <CardContent className="space-y-6 p-8 text-center">
          <AlertCircle className="mx-auto text-red-500" size={72} />
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">
              Thanh toán chưa thành công
            </h1>
            <p className="text-slate-500">
              Giao dịch không hoàn tất hoặc đã hết hạn. Bạn có thể kiểm tra lại
              lịch sử đơn hàng.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm">
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-slate-400">
              <ReceiptText size={16} />
              Thông tin giao dịch
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Mã đơn hàng</span>
                <span className="font-bold text-slate-900">
                  {result.orderId}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trạng thái</span>
                <span className="font-bold text-red-600">{result.status}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phương thức</span>
                <span className="font-bold text-slate-900">
                  {result.method || "-"}
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
