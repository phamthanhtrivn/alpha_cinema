import { ExternalLink, Package, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductAnalytics } from "@/types/dashboard";
import { formatNumber, formatPercent, formatVnd } from "../../../utils/dashboardFormat";

interface ProductStatsProps {
  data?: ProductAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

export function ProductStats({ data, isLoading, detailPath }: ProductStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu sản phẩm.
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.topProducts.map((product) => product.revenue), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Package size={19} className="text-fuchsia-600" />
              Sản phẩm
            </CardTitle>
            <CardDescription>Doanh thu combo, sản phẩm bán chạy và cảnh báo tồn kho</CardDescription>
          </div>
          {detailPath && (
            <Button asChild variant="outline" size="sm">
              <Link to={detailPath}>
                <ExternalLink size={14} />
                Chi tiết
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-slate-100 bg-fuchsia-50 p-3">
            <div className="text-xs font-bold text-fuchsia-700">Doanh thu</div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatVnd(data.totalRevenue)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-sky-50 p-3">
            <div className="flex items-center gap-1 text-xs font-bold text-sky-700">
              <ShoppingBasket size={13} />
              Đã bán
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.itemsSold)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-emerald-50 p-3">
            <div className="text-xs font-bold text-emerald-700">Attach rate</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatPercent(data.comboAttachRate)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-black text-slate-800">Top sản phẩm</div>
          {data.topProducts.map((product) => (
            <div key={product.id}>
              <div className="mb-2 flex items-center gap-3">
                {product.pictureUrl ? (
                  <a
                    href={product.pictureUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Xem ảnh sản phẩm"
                    className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={product.pictureUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400">
                    <Package size={18} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-bold text-slate-700">{product.name}</span>
                    <span className="shrink-0 font-black text-slate-900">{formatVnd(product.revenue)}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Đã bán {formatNumber(product.quantitySold)} sản phẩm
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-fuchsia-500"
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
