import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/common/Layout";
import { productService } from "@/services/product.service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { addToCartThunk, setCartOpen } from "@/store/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";

interface ProductListDTO {
  id: string;
  name: string;
  unitPrice: number;
  pictureUrl: string;
  stockQty: number | null;
}

const StarShop: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    document.title = "Alpha Shop | Alpha Cinema";
  }, []);

  const { data: products = [], isLoading: loading } = useQuery<ProductListDTO[]>({
    queryKey: ["souvenir-products"],
    queryFn: () => productService.getSouvenirProducts().then((res: any) => res.data || []),
  });

  const addToCart = async (productId: string, name: string) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    dispatch(addToCartThunk({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success(`Đã thêm "${name}" vào giỏ hàng`);
      })
      .catch((err) => {
        toast.error(err || "Thêm vào giỏ hàng thất bại");
      });
  };

  const handleBuyNow = async (productId: string, name: string) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thanh toán");
      return;
    }

    dispatch(addToCartThunk({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        dispatch(setCartOpen(true));
      })
      .catch((err) => {
        toast.error(err || "Thao tác mua ngay thất bại");
      });
  };

  const filteredProducts = products;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-6">
          <span className="hover:text-alpha-blue cursor-pointer" onClick={() => window.location.href = "/"}>Trang chủ</span>
          <span>/</span>
          <span className="text-slate-600">Alpha Shop</span>
        </div>

        {/* Tab Header Section */}
        <div className="border-b border-slate-200 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-[#034EA2]" />
            <h1 className="text-xl font-medium uppercase tracking-tight">STAR SHOP</h1>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034EA2]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <ShoppingCart size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold">Không có sản phẩm nào được bán</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stockQty !== null && product.stockQty <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-md overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Image & Title Container Link */}
                  <Link to={`/star-shop/product/${product.id}`} className="block overflow-hidden relative aspect-square bg-slate-50 border-b border-slate-100">
                    <img
                      src={product.pictureUrl || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                          HẾT HÀNG
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-2 flex flex-col flex-1 justify-between">
                    <div>
                      <Link to={`/star-shop/product/${product.id}`} className="hover:no-underline">
                        <h3 className="text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-[#034EA2] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[#f26b38] font-medium text-lg">
                          {product.unitPrice.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>

                    {/* Buttons Action */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleBuyNow(product.id, product.name)}
                        disabled={isOutOfStock}
                        className={`text-xs text-white shadow-sm transition-all duration-300 ${isOutOfStock
                          ? "bg-slate-300 cursor-not-allowed shadow-none"
                          : "bg-[#f26b38] hover:bg-[#e05621] hover:shadow-md active:scale-95 cursor-pointer"
                          }`}
                      >
                        Mua ngay
                      </Button>
                      <Button
                        onClick={() => addToCart(product.id, product.name)}
                        disabled={isOutOfStock}
                        className={`text-xs border-2 transition-all duration-300 flex items-center justify-center gap-1.5 ${isOutOfStock
                          ? "border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-[#f26b38] text-[#f26b38] hover:bg-[#f26b38]/5 active:scale-95 cursor-pointer"
                          }`}
                      >
                        <ShoppingCart size={16} />
                        <span>Thêm giỏ hàng</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default StarShop;
