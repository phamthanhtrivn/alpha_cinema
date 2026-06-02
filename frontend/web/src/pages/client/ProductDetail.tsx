import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "@/components/common/Layout";
import { productService } from "@/services/product.service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { addToCartThunk, setCartOpen } from "@/store/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [quantity, setQuantity] = useState<number>(1);

  const { data: product = null, isLoading: loading } = useQuery<Product | null>({
    queryKey: ["product-detail", id],
    queryFn: () => productService.getProductById(id!).then((res: any) => res.data || null),
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      const stock = product.stockQty;
      if (stock !== null && stock <= 0) {
        setQuantity(0);
      } else {
        setQuantity(1);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | Alpha Shop`;
    }
  }, [product?.name]);
  const handleIncrement = () => {
    if (!product) return;
    const maxStock = product.stockQty;
    if (maxStock !== null && quantity >= maxStock) {
      toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    const val = parseInt(e.target.value, 10);
    const maxStock = product.stockQty;

    if (isNaN(val) || val < 1) {
      setQuantity(1);
      return;
    }

    if (maxStock !== null && val > maxStock) {
      toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho`);
      setQuantity(maxStock);
      return;
    }

    setQuantity(val);
  };

  const addToCart = async () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (!product) return;

    dispatch(addToCartThunk({ productId: product.id, quantity }))
      .unwrap()
      .then(() => {
        toast.success(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng`);
      })
      .catch((err) => {
        toast.error(err || "Thêm vào giỏ hàng thất bại");
      });
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thanh toán");
      return;
    }
    if (!product) return;

    dispatch(addToCartThunk({ productId: product.id, quantity }))
      .unwrap()
      .then(() => {
        dispatch(setCartOpen(true));
      })
      .catch((err) => {
        toast.error(err || "Thao tác mua ngay thất bại");
      });
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#034EA2]" size={40} />
          <p className="text-slate-500 font-semibold text-sm">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Container>
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold text-lg mb-4">Không tìm thấy sản phẩm!</p>
            <Button
              onClick={() => navigate("/star-shop")}
              className="bg-[#034EA2] hover:bg-[#023e80] text-white"
            >
              Quay lại cửa hàng
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const isOutOfStock = product.stockQty !== null && product.stockQty <= 0;

  return (
    <div className="bg-white min-h-screen py-8">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-8">
          <span className="hover:text-alpha-blue cursor-pointer" onClick={() => navigate("/")}>
            Trang chủ
          </span>
          <span>/</span>
          <span className="hover:text-alpha-blue cursor-pointer" onClick={() => navigate("/star-shop")}>
            Alpha Shop
          </span>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          {/* Left Column: Gallery */}
          <div className="md:col-span-3 flex flex-col items-center">
            {/* Large Image View */}
            <div className="w-full aspect-4/3 overflow-hidden bg-slate-50 border border-alpha-orange rounded-lg shadow-sm relative group flex items-center justify-center">
              <img
                src={product.pictureUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white font-black text-sm uppercase tracking-widest px-6 py-2.5 rounded-full shadow-lg">
                    HẾT HÀNG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="md:col-span-5 flex flex-col justify-start">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-medium text-slate-800 leading-snug mb-3 tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-8 flex items-baseline">
              <span className="text-2xl font-medium text-alpha-orange">
                {product.unitPrice.toLocaleString("vi-VN")}
              </span>
              <span className="text-2xl font-medium text-alpha-orange ml-1 underline decoration-2">đ</span>
            </div>

            {/* Quantity Picker & Stock Info */}
            <div className="flex items-center gap-6 mb-8">
              <span className="text-slate-800 font-medium text-sm">Số lượng:</span>
              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-10 bg-white">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  className="w-10 h-full flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-r border-slate-200 disabled:opacity-40 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
                  onClick={handleDecrement}
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isOutOfStock}
                  className="w-14 h-full text-center text-sm font-semibold text-slate-700 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="button"
                  disabled={isOutOfStock || (product.stockQty !== null && quantity >= product.stockQty)}
                  className="w-10 h-full flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-l border-slate-200 disabled:opacity-40 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
                  onClick={handleIncrement}
                >
                  +
                </button>
              </div>

              {/* Stock display */}
              {product.stockQty !== null && (
                <span className="text-xs font-semibold text-slate-400">
                  {product.stockQty > 0 ? `Còn lại ${product.stockQty} sản phẩm` : "Hết hàng trong kho"}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-6 px-8 text-sm font-semibold rounded-md shadow-sm transition-all duration-300 sm:w-[180px] ${isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-alpha-orange hover:bg-[#e05621] text-white hover:shadow-md active:scale-[0.98] cursor-pointer"
                  }`}
              >
                Mua ngay
              </Button>
              <Button
                onClick={addToCart}
                disabled={isOutOfStock}
                className={`py-6 px-8 text-sm font-semibold border-2 rounded-md shadow-sm transition-all duration-300 sm:w-[180px] flex items-center justify-center gap-2 ${isOutOfStock
                  ? "border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border-alpha-orange text-alpha-orange hover:bg-[#f26b38]/5 active:scale-[0.98] cursor-pointer"
                  }`}
              >
                <ShoppingCart size={18} />
                <span>Thêm vào giỏ hàng</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description */}
        <div className="pt-12">
          {/* Header */}
          <div className="flex items-center gap-3 border-l-4 border-[#034EA2] pl-3 mb-6">
            <h2 className="text-base font-semibold text-slate-700 tracking-wide uppercase">
              MÔ TẢ SẢN PHẨM
            </h2>
          </div>

          {/* Product Description Body */}
          <div className="lg:w-[80%] sm:w-full text-slate-600 leading-relaxed text-sm whitespace-pre-line space-y-4">
            {product.description ? (
              product.description
            ) : (
              <span className="text-slate-400 italic">Chưa có thông tin mô tả chi tiết cho sản phẩm này.</span>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetail;
