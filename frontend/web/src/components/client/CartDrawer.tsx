import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleCart,
  setCartOpen,
  selectCartItems,
  selectCartIsOpen,
  selectCartLoading,
  selectCartTotalPrice,
  updateCartItemThunk,
  removeCartItemThunk,
  clearCartThunk,
  fetchCart,
} from "@/store/slices/cartSlice";
import { Trash2, X, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store";

const CartDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const isOpen = useSelector(selectCartIsOpen);
  const loading = useSelector(selectCartLoading);
  const totalPrice = useSelector(selectCartTotalPrice);
  const { user } = useSelector((state: any) => state.auth);

  // Tự động fetch giỏ hàng từ Redis khi đăng nhập và mở ngăn kéo
  useEffect(() => {
    if (user && isOpen) {
      dispatch(fetchCart());
    }
  }, [user, isOpen, dispatch]);

  // Ngăn chặn cuộn trang chính khi giỏ hàng đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    dispatch(setCartOpen(false));
  };

  const handleIncrement = (productId: string, currentQty: number, stockQty: number | null) => {
    if (stockQty !== null && currentQty >= stockQty) {
      toast.warning(`Chỉ còn ${stockQty} sản phẩm trong kho`);
      return;
    }
    dispatch(updateCartItemThunk({ productId, quantity: currentQty + 1 }))
      .unwrap()
      .catch((err) => toast.error(err || "Thao tác thất bại"));
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      handleRemoveItem(productId);
      return;
    }
    dispatch(updateCartItemThunk({ productId, quantity: currentQty - 1 }))
      .unwrap()
      .catch((err) => toast.error(err || "Thao tác thất bại"));
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeCartItemThunk(productId))
      .unwrap()
      .then(() => toast.success("Đã xóa sản phẩm khỏi giỏ hàng"))
      .catch((err) => toast.error(err || "Xóa sản phẩm thất bại"));
  };

  const handleClearCart = () => {
    dispatch(clearCartThunk())
      .unwrap()
      .then(() => toast.success("Đã xóa sạch giỏ hàng"))
      .catch((err) => toast.error(err || "Thao tác thất bại"));
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống");
      return;
    }
    toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua sắm!");
    dispatch(clearCartThunk());
    dispatch(setCartOpen(false));
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-999 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={handleClose}
      />

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-1000 flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 bg-alpha-blue" />
            <h2 className="text-lg font-medium text-slate-800 tracking-wide">
              Sản phẩm | Giỏ hàng
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Items Section */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-4 relative">
          {loading && items.length === 0 ? (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#034EA2]" size={36} />
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-100">
              <ShoppingCart size={54} className="text-slate-300 mb-4 animate-pulse" />
              <p className="text-slate-500 font-semibold text-base mb-2">Giỏ hàng của bạn đang trống</p>
              <p className="text-slate-400 text-xs mb-6 max-w-[240px]">Hãy thêm những sản phẩm lưu niệm đặc sắc để làm phong phú bộ sưu tập của bạn nhé!</p>
              <button
                onClick={handleClose}
                className="py-2.5 px-6 border-2 border-alpha-orange text-alpha-orange hover:bg-alpha-orange/5 font-bold text-xs rounded-md shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map((item: any) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl border border-slate-100 p-4 flex gap-4 shadow-sm relative group hover:shadow-md transition-all duration-300"
              >
                {/* Product Image */}
                <div className="w-[76px] h-[76px] rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                  <img src={item.pictureUrl || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800 text-sm line-clamp-1 pr-6 mb-1">
                      {item.name}
                    </h3>
                  </div>

                  {/* Quantity controls & Price */}
                  <div className="flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white h-7">
                      <button
                        type="button"
                        className="w-7 h-full flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-r border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs cursor-pointer"
                        onClick={() => handleDecrement(item.productId, item.quantity)}
                      >
                        -
                      </button>
                      <span className="w-9 text-center text-xs font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="w-7 h-full flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-l border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs cursor-pointer"
                        onClick={() => handleIncrement(item.productId, item.quantity, item.stockQty)}
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline">
                      <span className="text-sm font-semibold text-alpha-orange">
                        {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs font-semibold text-alpha-orange ml-0.5 underline">đ</span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer (Corresponds to Column 2 in picture) */}
        <div className="sticky bottom-0 bg-[#fbfbfc] border-t border-slate-150 p-5 space-y-4 shrink-0 shadow-inner z-10">
          <div className="space-y-2 text-sm">
            {/* Total Item Price */}
            <div className="flex justify-between items-center text-slate-700 text-sm">
              <span>Tổng tiền</span>
              <div className="flex items-baseline">
                <span>{totalPrice.toLocaleString("vi-VN")}</span>
                <span className="ml-0.5 underline">đ</span>
              </div>
            </div>
            {/* Total Paid Amount */}
            <div className="flex justify-between items-center text-slate-800 text-base">
              <span>Số tiền thanh toán</span>
              <div className="flex items-baseline text-alpha-orange text-lg">
                <span>{totalPrice.toLocaleString("vi-VN")}</span>
                <span className="ml-0.5 underline decoration-2">đ</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className={`flex-1 py-3 text-sm font-medium text-white rounded-md shadow-sm transition-all duration-300 text-center block ${items.length === 0
                ? "bg-slate-200 cursor-not-allowed shadow-none"
                : "bg-alpha-orange hover:bg-[#e05621] hover:shadow-md active:scale-[0.98] cursor-pointer"
                }`}
            >
              Đặt hàng
            </button>
            <button
              onClick={handleClearCart}
              disabled={items.length === 0}
              className={`flex-1 py-3 bg-white border border-slate-200 text-slate-500 text-sm font-medium rounded-md shadow-sm transition-all duration-300 text-center block ${items.length === 0
                ? "opacity-50 cursor-not-allowed shadow-none"
                : "hover:bg-slate-50 active:scale-[0.98] hover:text-slate-700 cursor-pointer"
                }`}
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
