import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Star,
  Gift,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cinemaService } from "@/services/cinema.service";
import { userService } from "@/services/user.service";
import { checkoutService } from "@/services/checkout.service";
import {
  selectCartItems,
  selectCartTotalPrice,
  clearCartThunk,
} from "@/store/slices/cartSlice";
import type { AppDispatch } from "@/store";
import type { Cinema } from "@/types/cinema";

export const CartCheckout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch Cart data from Redux store
  const cartItems = useSelector(selectCartItems);
  const cartTotalPrice = useSelector(selectCartTotalPrice);

  // States
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isLoadingCinemas, setIsLoadingCinemas] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Toàn quốc");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MOMO"); // Default to MoMo

  // Promo & Loyalty accordion states
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPercent: number } | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch User profile to get Star points
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["customer-profile-checkout"],
    queryFn: () => userService.getProfile(),
  });
  const profile = profileResponse?.data;
  const availablePoints = profile?.loyaltyPoint ?? 0;

  // Fetch active cinemas list
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setIsLoadingCinemas(true);
        const res = await cinemaService.getAllCinemasansPage({
          page: 0,
          size: 100,
          status: true,
        });
        if (res.success) {
          setCinemas(res.data.content);
        } else {
          toast.error("Không thể tải danh sách rạp chiếu");
        }
      } catch (error) {
        console.error("Failed to fetch cinemas:", error);
        toast.error("Không thể tải danh sách rạp chiếu");
      } finally {
        setIsLoadingCinemas(false);
      }
    };
    fetchCinemas();
  }, []);

  // Dynamically extract unique cities from cinema addresses
  const citiesList = useMemo(() => {
    const extracted = cinemas.map((c) => {
      const addr = c.address.toLowerCase();
      if (
        addr.includes("hồ chí minh") ||
        addr.includes("hcm") ||
        addr.includes("tphcm") ||
        addr.includes("sài gòn")
      ) {
        return "TP. Hồ Chí Minh";
      }
      if (addr.includes("hà nội") || addr.includes("ha noi")) {
        return "Hà Nội";
      }
      if (addr.includes("đà nẵng") || addr.includes("da nang")) {
        return "Đà Nẵng";
      }
      if (addr.includes("cần thơ") || addr.includes("can tho")) {
        return "Cần Thơ";
      }
      if (addr.includes("nha trang") || addr.includes("khánh hòa")) {
        return "Nha Trang";
      }
      // Fallback: extract the city after the last comma
      const parts = c.address.split(",");
      return parts[parts.length - 1]?.trim() || "Khác";
    });
    return ["Toàn quốc", ...Array.from(new Set(extracted))];
  }, [cinemas]);

  // Filter cinemas based on selected city
  const filteredCinemas = useMemo(() => {
    if (selectedCity === "Toàn quốc") return cinemas;
    return cinemas.filter((c) => {
      const addr = c.address.toLowerCase();
      if (selectedCity === "TP. Hồ Chí Minh") {
        return (
          addr.includes("hồ chí minh") ||
          addr.includes("hcm") ||
          addr.includes("tphcm") ||
          addr.includes("sài gòn")
        );
      }
      if (selectedCity === "Hà Nội") return addr.includes("hà nội") || addr.includes("ha noi");
      if (selectedCity === "Đà Nẵng") return addr.includes("đà nẵng") || addr.includes("da nang");
      if (selectedCity === "Cần Thơ") return addr.includes("cần thơ") || addr.includes("can tho");
      if (selectedCity === "Nha Trang") return addr.includes("nha trang") || addr.includes("khánh hòa");
      return c.address.includes(selectedCity);
    });
  }, [cinemas, selectedCity]);

  // Calculate pricing discounts
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    return Math.round((cartTotalPrice * appliedVoucher.discountPercent) / 100);
  }, [appliedVoucher, cartTotalPrice]);

  const pointsDiscount = useMemo(() => {
    const pointsNum = Number(pointsToRedeem) || 0;
    // 1 point = 1,000 VND
    return pointsNum * 1000;
  }, [pointsToRedeem]);

  const totalPayment = useMemo(() => {
    const calculated = cartTotalPrice - voucherDiscount - pointsDiscount;
    return Math.max(calculated, 0);
  }, [cartTotalPrice, voucherDiscount, pointsDiscount]);

  const maxRedeemPoints = useMemo(() => {
    const payableBeforePoints = Math.max(cartTotalPrice - voucherDiscount, 0);
    return Math.min(availablePoints, Math.floor(payableBeforePoints / 1000));
  }, [availablePoints, cartTotalPrice, voucherDiscount]);

  // Trigger Voucher Code application
  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      toast.info("Vui lòng nhập mã giảm giá");
      return;
    }

    // Mock validation for premium touch
    if (code === "ALPHACINEMA" || code === "DISCOUNT10") {
      setAppliedVoucher({ code, discountPercent: 10 });
      toast.success("Áp dụng mã giảm giá 10% thành công!");
    } else if (code === "DISCOUNT20") {
      setAppliedVoucher({ code, discountPercent: 20 });
      toast.success("Áp dụng mã giảm giá 20% thành công!");
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.info("Đã hủy bỏ mã giảm giá");
  };

  // Submit payment order
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống");
      return;
    }
    if (!selectedCinemaId) {
      toast.warning("Vui lòng chọn nơi nhận hàng trước khi thanh toán");
      return;
    }
    if (!paymentMethod) {
      toast.warning("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setSubmitting(true);

      // Build payload for product-only checkout compatible with backend CartCheckoutService
      const payload = {
        totalPayment: totalPayment,
        showScheduleId: "", // Empty for concession only
        seats: [], // Empty for concession only
        products: cartItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        promotionCode: appliedVoucher?.code || "",
        pointsToRedeem: Number(pointsToRedeem) || 0,
        paymentMethod: paymentMethod,
      };

      // Thanh toán qua MoMo/VNPAY dành riêng cho khách hàng mua sản phẩm từ giỏ hàng
      const response = await checkoutService.checkoutCartByMomo(payload, selectedCinemaId);

      if (response.success && response.data) {
        // Clear customer cart since order was successfully created
        await dispatch(clearCartThunk());

        if (response.data.paymentUrl) {
          // Redirect to payment portal
          window.location.assign(response.data.paymentUrl);
        } else {
          // Zero payment or paid with points
          toast.success("Thanh toán thành công bằng điểm Star!");
          navigate("/payment/success");
        }
      } else {
        toast.error(response.message || "Không thể khởi tạo phiên thanh toán.");
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Đã xảy ra lỗi trong quá trình thanh toán.";
      toast.error(errMsg);
      console.error("Checkout payment error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent accessing directly with empty cart
  if (cartItems.length === 0 && !submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md px-6 py-12 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
          <ShoppingBag className="text-slate-300 mx-auto" size={56} />
          <h2 className="text-xl font-bold text-slate-800">Giỏ hàng trống</h2>
          <p className="text-slate-500 text-sm">
            Giỏ hàng của bạn hiện tại không có sản phẩm nào. Vui lòng thêm bắp nước hoặc quà lưu niệm vào giỏ hàng trước khi thanh toán.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-alpha-blue hover:bg-blue-600 text-white font-semibold rounded-2xl px-6 h-12 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Quay lại mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-slate-900 font-sans">
      {/* Navigation Header */}
      <div className="max-w-360 mx-auto px-4 pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-alpha-blue transition-all duration-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại cửa hàng
        </Button>
      </div>

      <div className="max-w-360 mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-8">
        {/* Left Column: Checkout Details */}
        <div className="space-y-6">
          {/* Payment Method Selector */}
          <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <div className="h-2 bg-alpha-orange" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                <CreditCard className="text-alpha-orange" size={22} />
                Chọn phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* MoMo selection card */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === "MOMO"
                    ? "border-alpha-orange bg-orange-50/50 shadow-sm"
                    : "border-slate-200 hover:border-orange-200 hover:bg-slate-50/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="accent-orange-500 w-5 h-5 shrink-0"
                  />
                  <img
                    src="https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0"
                    alt="Ví điện tử MoMo"
                    className="w-12 h-12 object-contain rounded-xl shadow-xs"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-slate-800 text-base">Ví Điện Tử MoMo</span>
                    <span className="text-xs text-slate-500 truncate">
                      Thanh toán nhanh chóng qua ứng dụng Ví điện tử MoMo
                    </span>
                  </div>
                  {paymentMethod === "MOMO" && (
                    <span className="text-alpha-orange font-bold text-lg shrink-0">✓</span>
                  )}
                </label>

                {/* VNPAY selection card */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === "VNPAY"
                    ? "border-alpha-orange bg-orange-50/50 shadow-sm"
                    : "border-slate-200 hover:border-orange-200 hover:bg-slate-50/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="accent-orange-500 w-5 h-5 shrink-0"
                  />
                  <img
                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                    alt="VNPAY"
                    className="w-12 h-12 object-contain rounded-xl shadow-xs"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-slate-800 text-base">Cổng thanh toán VNPAY</span>
                    <span className="text-xs text-slate-500 truncate">
                      Thanh toán qua Thẻ ATM, QR Code ngân hàng, Visa/Master/JCB
                    </span>
                  </div>
                  {paymentMethod === "VNPAY" && (
                    <span className="text-alpha-orange font-bold text-lg shrink-0">✓</span>
                  )}
                </label>
              </div>

              <div className="text-xs font-semibold text-slate-400 mt-2">
                (*) Vui lòng chọn nơi nhận hàng trước khi thanh toán
              </div>
            </CardContent>
          </Card>

          {/* Promotions Collapsible accordions */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Khuyến mãi
            </h3>

            {/* Voucher panel */}
            <div className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsVoucherOpen(!isVoucherOpen)}
                className="w-full flex items-center justify-between p-4 font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gift className="text-alpha-orange" size={18} />
                  <span>Mã voucher</span>
                </div>
                {isVoucherOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isVoucherOpen && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                      <div>
                        <span className="font-bold text-green-800 mr-2">
                          Mã đã áp dụng: {appliedVoucher.code}
                        </span>
                        <span className="text-green-600">(-{appliedVoucher.discountPercent}%)</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleRemoveVoucher}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
                      >
                        Hủy áp dụng
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Nhập mã voucher (Ví dụ: ALPHACINEMA, DISCOUNT20)"
                        className="rounded-xl border-slate-200 bg-white h-11 focus:ring-alpha-blue focus:border-alpha-blue transition-all"
                      />
                      <Button
                        onClick={handleApplyVoucher}
                        className="bg-alpha-orange text-white font-bold h-11 px-5 rounded-xl cursor-pointer hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Nhập các mã voucher của hệ thống để nhận ưu đãi lên đến 20% cho đơn hàng của bạn.
                  </p>
                </div>
              )}
            </div>

            {/* Star points panel */}
            <div className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsPointsOpen(!isPointsOpen)}
                className="w-full flex items-center justify-between p-4 font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Star className="text-alpha-orange animate-pulse" size={18} />
                  <span>Sử dụng điểm Star</span>
                </div>
                {isPointsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isPointsOpen && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  {isLoadingProfile ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="animate-spin text-alpha-blue" size={16} />
                      <span>Đang tải số điểm khả dụng...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-wider text-blue-500 mb-1">
                            Điểm Star hiện có
                          </div>
                          <div className="text-3xl font-black text-alpha-blue">
                            {availablePoints} điểm
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 max-w-[200px]">
                          Mỗi 1 điểm có giá trị tương đương 1.000đ khi thanh toán đơn hàng.
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600">
                          Nhập số điểm muốn đổi (Tối đa {maxRedeemPoints} điểm)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={maxRedeemPoints}
                            value={pointsToRedeem}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              if (val === "") {
                                setPointsToRedeem("");
                                return;
                              }
                              const numVal = Math.min(Number(val), maxRedeemPoints);
                              setPointsToRedeem(String(numVal));
                            }}
                            placeholder="Ví dụ: 50"
                            className="rounded-xl border-slate-200 bg-white h-11 focus:ring-alpha-blue focus:border-alpha-blue transition-all"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setPointsToRedeem(String(maxRedeemPoints))}
                            className="border-slate-200 text-slate-700 h-11 px-4 rounded-xl cursor-pointer hover:bg-slate-100 active:scale-95 transition-all font-semibold"
                          >
                            Dùng tối đa
                          </Button>
                        </div>
                        {pointsToRedeem && (
                          <p className="text-xs text-green-700 font-bold">
                            ✓ Bạn sẽ được giảm giá: {(Number(pointsToRedeem) * 1000).toLocaleString("vi-VN")} đ
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pickup location Section */}
          <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <div className="h-2 bg-alpha-blue" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                <MapPin className="text-alpha-blue animate-bounce" size={22} />
                Nơi nhận hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCinemas ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="animate-spin text-alpha-blue" size={32} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* City dropdown */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block ml-1">
                      Thành phố:
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedCinemaId(""); // Reset cinema on city change
                      }}
                      className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-alpha-blue focus:border-alpha-blue cursor-pointer transition-all duration-300"
                    >
                      {citiesList.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cinema dropdown */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block ml-1">
                      Nơi nhận hàng:
                    </label>
                    <select
                      value={selectedCinemaId}
                      onChange={(e) => setSelectedCinemaId(e.target.value)}
                      className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-alpha-blue focus:border-alpha-blue cursor-pointer transition-all duration-300"
                    >
                      <option value="">-- Chọn rạp nhận hàng --</option>
                      {filteredCinemas.map((cinema) => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="text-xs font-semibold text-slate-400">
                (*) Vui lòng chọn nơi nhận hàng trước khi thanh toán
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary (Consistent with Mockup design) */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden bg-white sticky top-8">
            <div className="h-2 bg-alpha-orange" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-800 uppercase tracking-wide">
                <ShoppingBag className="text-alpha-orange" size={20} />
                Tóm tắt đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product items in cart */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item: any) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0 relative">
                      <img
                        src={item.pictureUrl || "/placeholder.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div className="font-bold text-slate-800 text-sm truncate pr-2">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">SL: {item.quantity}</div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-xs text-slate-400">
                          {item.unitPrice.toLocaleString("vi-VN")} đ / SP
                        </span>
                        <span className="font-black text-alpha-orange">
                          {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing calculations */}
              <div className="border-t border-slate-100 pt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Tổng tiền</span>
                  <span className="font-bold text-slate-800">
                    {cartTotalPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-green-700">
                    <span>Mã giảm giá ({appliedVoucher.code})</span>
                    <span className="font-bold">-{voucherDiscount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Điểm Star ({pointsToRedeem}đ)</span>
                    <span className="font-bold">-{pointsDiscount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-baseline text-slate-800">
                  <span className="font-black text-base">Số tiền thanh toán</span>
                  <span className="font-black text-2xl text-alpha-orange">
                    {totalPayment.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-12 rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    Hủy
                  </Button>

                  <Button
                    type="button"
                    onClick={handlePayment}
                    disabled={submitting || cartItems.length === 0}
                    className="flex-1 bg-alpha-orange text-white font-bold h-12 rounded-xl cursor-pointer hover:bg-orange-600 active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      "Thanh Toán"
                    )}
                  </Button>
                </div>

                {/* Display dynamic alert under buttons like Mockup */}
                {!selectedCinemaId ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 font-semibold animate-pulse">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Chọn rạp nhận hàng trước khi thanh toán</span>
                  </div>
                ) : paymentMethod === "VNPAY" ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-orange-50 border border-orange-200 p-3.5 text-xs text-orange-700 font-semibold">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Vui lòng chọn Ví MoMo để tiến hành thanh toán bắp nước</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
