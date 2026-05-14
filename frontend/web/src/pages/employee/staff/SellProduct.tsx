import React, { useCallback, useEffect, useMemo, useState } from "react";
import FoodSelection from "../../../components/employee/FoodSelection";
import PaymentSelection from "../../../components/employee/PaymentSelection";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { cinemaService } from "@/services/cinema.service";
import type { Product } from "@/types/product";
import { toast } from "react-toastify";
import PointOfSaleComponent from "@/components/employee/PointOfSaleComponent";
import { useSelector } from "react-redux";

type Step = "food" | "payment" | "ticket";
type PaymentMethod = "cash" | "bank_qr";

const STEP_CONFIG: Array<{ id: Step; label: string }> = [
  { id: "food", label: "Chọn thức ăn" },
  { id: "payment", label: "Thanh toán" },
  { id: "ticket", label: "In vé" },
];

const SellProduct: React.FC = () => {
  const [step, setStep] = useState<Step>("food");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    "cash",
  );
  const [posOpen, setPosOpen] = useState(false);
  const [cinema, setCinema] = useState<{ address?: string; phone?: string } | undefined>(undefined);

  const cinemaId = useSelector(
    (state: { auth: { cinemaId?: string } }) => state.auth.cinemaId,
  );

  const fetchCinemaInfo = useCallback(async () => {
    if (!cinemaId) return;

    try {
      const response = await cinemaService.getCinemaInfo(cinemaId);
      if (response?.data) {
        setCinema(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cinema info:", error);
    }
  }, [cinemaId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProductsWithoutPagination();
        const productsData = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        setProducts(productsData.filter((p: Product) => p.status === true));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    void fetchCinemaInfo();
  }, [fetchCinemaInfo]);

  const snackTotal = useMemo(() => {
    let total = 0;
    products.forEach((product) => {
      const qty = quantities[product.id] ?? 0;
      total += product.unitPrice * qty;
    });
    return total;
  }, [quantities, products]);

  const total = snackTotal;

  const resetSellingFlow = () => {
    setStep("food");
    setQuantities({});
    setPaymentMethod("cash");
  };

  const nextStep = () => {
    if (step === "food") {
      // Check if user selected at least one product
      const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
      if (totalItems === 0) {
        toast.error("Vui lòng chọn ít nhất một sản phẩm");
        return;
      }
      setStep("payment");
      return;
    }

    if (step === "payment") {
      setStep("ticket");
    }
  };

  const previousStep = () => {
    if (step === "payment") {
      setStep("food");
      return;
    }

    if (step === "ticket") {
      setStep("payment");
      return;
    }
  };

  const handleComplete = async () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        totalPayment: total,
        showScheduleId: "", // Empty as we don't have schedule for product only
        seats: [], // Empty as we're not selling tickets
        products: products
          .filter((p) => (quantities[p.id] ?? 0) > 0)
          .map((p) => ({
            productId: p.id,
            quantity: quantities[p.id],
            price: p.unitPrice,
          })),
      };

      const req = await orderService.checkoutEmployee(payload);
      if (req.success) {
        toast.success("Thanh toán thành công");
        setStep("ticket");
      } else {
        toast.error("Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const posTicketData = {
    movie: "Bán sản phẩm",
    room: "",
    seat: "",
    time: new Date().toLocaleString("vi-VN"),
    price: `${total.toLocaleString("vi-VN")} VND`,
    cinemaName: "ALPHA CINEMA",
    cinemaPhone: cinema?.phone || "",
    cinemaAddress: cinema?.address || "123 Đường Tên Lửa, TP.HCM",
    auditoriumName: "",
    snacks: products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({
        name: p.name,
        qty: quantities[p.id],
        price: p.unitPrice,
      })),
    snackTotal: `${snackTotal.toLocaleString("vi-VN")} VND`,
  };

  return (
    <div className="space-y-6 pb-6 px-4 sm:px-6">
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500"></div>
            <p className="text-sm font-semibold text-slate-500">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-3 shadow-sm sm:rounded-2xl sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3">
              {STEP_CONFIG.map((item, index) => {
                const currentIndex = STEP_CONFIG.findIndex(
                  (stepItem) => stepItem.id === step,
                );
                const isActive = item.id === step;
                const isDone = index < currentIndex;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-3 ${
                      isActive
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black sm:h-8 sm:w-8 sm:text-xs ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {step === "food" && (
                <FoodSelection
                  products={products}
                  quantities={quantities}
                  onUpdateQuantity={updateQuantity}
                />
              )}

              {step === "payment" && (
                <PaymentSelection
                  paymentMethod={paymentMethod}
                  onSelectPaymentMethod={setPaymentMethod}
                />
              )}

              {step === "ticket" && (
                <div className="space-y-6 text-center py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Thanh toán thành công!
                    </h2>
                    <p className="mt-2 text-slate-500">
                      Đơn hàng đã được lưu vào hệ thống.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPosOpen(true)}
                      className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 shadow-sm"
                    >
                      In hóa đơn
                    </button>
                    <button
                      type="button"
                      onClick={resetSellingFlow}
                      className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:border-orange-500"
                    >
                      Bán sản phẩm mới
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-800">
                  Tóm tắt đơn hàng
                </h3>
              </div>

              {/* Products list */}
              <div className="space-y-3 max-h-75 overflow-y-auto">
                {products
                  .filter((p) => (quantities[p.id] ?? 0) > 0)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b border-slate-200 pb-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.unitPrice.toLocaleString("vi-VN")} VND ×{" "}
                          {quantities[product.id]}
                        </p>
                      </div>
                      <p className="font-bold text-slate-800">
                        {(
                          product.unitPrice * (quantities[product.id] ?? 0)
                        ).toLocaleString("vi-VN")}{" "}
                        VND
                      </p>
                    </div>
                  ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tổng tiền:</span>
                  <span className="font-bold text-slate-800">
                    {total.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                {step !== "food" && step !== "ticket" ? (
                  <button
                    type="button"
                    onClick={previousStep}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-orange-500 hover:bg-slate-50"
                  >
                    ← Quay lại
                  </button>
                ) : null}

                {step === "food" && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading}
                  >
                    Tiếp theo →
                  </button>
                )}

                {step === "payment" && (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading || !paymentMethod}
                  >
                    Hoàn tất
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <PointOfSaleComponent
        open={posOpen}
        onOpenChange={setPosOpen}
        ticketData={posTicketData}
      />
    </div>
  );
};

export default SellProduct;
