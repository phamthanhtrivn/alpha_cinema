import React from "react";
import type { Product } from "@/types/product";


interface FoodSelectionProps {
  products?: Product[];
  quantities: Record<string, number>;
  onUpdateQuantity: (id: string, delta: number) => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

interface DisplayItem {
  id: string;
  name: string;
  price: number;
  pictureUrl?: string;
  description?: string;
  type?: string;
  isProduct: boolean;
  stockQty?: number | null;
}

const FoodSelection: React.FC<FoodSelectionProps> = ({
  products = [],
  quantities,
  onUpdateQuantity,
}) => {
  // Combine snacks and products
  const allItems: DisplayItem[] = [
    ...products.map(p => ({ 
      id: p.id, 
      name: p.name, 
      price: p.unitPrice, 
      pictureUrl: p.pictureUrl, 
      description: p.description, 
      type: p.type, 
      isProduct: true,
      stockQty: p.stockQty
    }))
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-800">Chọn thức ăn & đồ uống</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allItems.map((item) => {
          const qty = quantities[item.id] ?? 0;
          return (
            <div
              key={item.id}
              className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg transition-shadow"
            >
              {item.isProduct && item.pictureUrl ? (
                <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.pictureUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.type && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {item.type}
                    </span>
                  )}
                </div>
              ) : null}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 line-clamp-2">{item.name}</p>
                  {item.isProduct && item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-semibold text-orange-600">{formatCurrency(item.price)}</p>
                    {item.type === "SOUVENIR" && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-sm ${
                        (item.stockQty ?? 0) > 0 
                          ? "bg-slate-100 text-slate-600" 
                          : "bg-red-50 text-red-600"
                      }`}>
                        Tồn: {item.stockQty ?? 0}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="h-7 w-7 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-slate-700">{qty}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.type === "SOUVENIR" && qty >= (item.stockQty ?? 0)) {
                          return;
                        }
                        onUpdateQuantity(item.id, 1);
                      }}
                      disabled={item.type === "SOUVENIR" && qty >= (item.stockQty ?? 0)}
                      className={`h-7 w-7 rounded-md border border-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold ${
                        item.type === "SOUVENIR" && qty >= (item.stockQty ?? 0)
                          ? "opacity-40 cursor-not-allowed bg-slate-100"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      +
                    </button>
                  </div>
                  {qty > 0 && (
                    <span className="text-xs font-semibold text-orange-600">
                      {formatCurrency(item.price * qty)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {allItems.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Không có sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default FoodSelection;
