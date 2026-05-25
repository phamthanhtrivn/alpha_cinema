import React from "react";

interface PaymentSelectionProps {
  paymentMethod: "cash" | "momo" | null;
  onSelectPaymentMethod: (paymentMethod: "cash" | "momo") => void;
  momoPending?: boolean;
  momoPaymentUrl?: string | null;
  onCheckMomoStatus?: () => void;
  isCheckingMomo?: boolean;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  paymentMethod,
  onSelectPaymentMethod,
  momoPending,
  momoPaymentUrl,
  onCheckMomoStatus,
  isCheckingMomo,
}) => {
  const paymentLabel = paymentMethod
    ? paymentMethod === "cash"
      ? "Thanh toán tiền mặt tại quầy"
      : "MoMo"
    : "Chưa chọn";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-800">Thanh toán</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectPaymentMethod("cash")}
          className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
            paymentMethod === "cash"
              ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-100"
              : "border-slate-300 bg-white text-slate-700 hover:border-orange-500"
          }`}
        >
          Thanh toán tiền mặt tại quầy
        </button>
        <button
          type="button"
          onClick={() => onSelectPaymentMethod("momo")}
          className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
            paymentMethod === "momo"
              ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-100"
              : "border-slate-300 bg-white text-slate-700 hover:border-orange-500"
          }`}
        >
          Ví MoMo
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Phương thức đã chọn: <span className="font-bold text-slate-700">{paymentLabel}</span>
      </p>
      {momoPending && paymentMethod === "momo" && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <p className="font-semibold">Đang chờ khách thanh toán MoMo.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {momoPaymentUrl && (
              <a
                className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100"
                href={momoPaymentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mở lại trang thanh toán
              </a>
            )}
            <button
              type="button"
              onClick={onCheckMomoStatus}
              disabled={isCheckingMomo}
              className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingMomo ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
            </button>
          </div>
        </div>
      )}
      <p className="text-sm text-slate-500">
        Sau khi nhận thanh toán thành công, bấm <span className="font-bold">Hoàn tất bán vé</span> để kết thúc.
      </p>
    </div>
  );
};

export default PaymentSelection;
