import React from "react";

interface PaymentSelectionProps {
  paymentMethod: "cash" | "bank_qr" | null;
  onSelectPaymentMethod: (paymentMethod: "cash" | "bank_qr") => void;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({ paymentMethod, onSelectPaymentMethod }) => {
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
          onClick={() => onSelectPaymentMethod("bank_qr")}
          className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
            paymentMethod === "bank_qr"
              ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-100"
              : "border-slate-300 bg-white text-slate-700 hover:border-orange-500"
          }`}
        >
          Quét QR ngân hàng
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Phương thức đã chọn: <span className="font-bold text-slate-700">{paymentMethod ? (paymentMethod === "cash" ? "Thanh toán tiền mặt tại quầy" : "Quét QR ngân hàng") : "Chưa chọn"}</span>
      </p>
      <p className="text-sm text-slate-500">
        Sau khi nhận thanh toán thành công, bấm <span className="font-bold">Hoàn tất bán vé</span> để kết thúc.
      </p>
    </div>
  );
};

export default PaymentSelection;
