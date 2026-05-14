import { BadgePercent, ExternalLink, TicketPercent } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PromotionAnalytics, PromotionUsageItem } from "@/types/dashboard";
import { formatNumber, formatVnd } from "../../../utils/dashboardFormat";

interface PromotionStatsProps {
  data?: PromotionAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

const statusConfig: Record<
  PromotionUsageItem["status"],
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Đang chạy",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  UPCOMING: {
    label: "Sắp chạy",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  PAUSED: {
    label: "Tạm dừng",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export function PromotionStats({ data, isLoading, detailPath }: PromotionStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu khuyến mãi.
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    { label: "Đang chạy", value: data.statuses.active, className: "bg-emerald-50 text-emerald-700" },
    { label: "Sắp chạy", value: data.statuses.upcoming, className: "bg-sky-50 text-sky-700" },
    { label: "Hết hạn", value: data.statuses.expired, className: "bg-slate-100 text-slate-700" },
    { label: "Tạm dừng", value: data.statuses.paused, className: "bg-amber-50 text-amber-700" },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <BadgePercent size={19} className="text-rose-600" />
              Khuyến mãi
            </CardTitle>
            <CardDescription>
              Mã giảm giá, lượt áp dụng và doanh thu sau khuyến mãi
            </CardDescription>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-100 bg-rose-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
              <TicketPercent size={14} />
              Lượt áp dụng
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.ordersApplied)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-sky-50 p-3">
            <div className="text-xs font-bold text-sky-700">Tổng giảm</div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatVnd(data.totalDiscountValue)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs font-bold text-slate-500">Giảm TB</div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatVnd(data.averageDiscountValue)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {statusItems.map((item) => (
            <div key={item.label} className={`rounded-md p-3 ${item.className}`}>
              <div className="text-[11px] font-black">{item.label}</div>
              <div className="mt-1 text-xl font-black">
                {formatNumber(item.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-black text-slate-800">
            Top mã khuyến mãi
          </div>
          {data.topPromotions.map((promotion) => {
            const status = statusConfig[promotion.status];
            const usagePercent = promotion.quota > 0 ? (promotion.ordersUsed / promotion.quota) * 100 : 0;
            const remainingPercent = 100 - usagePercent;

            return (
              <div
                key={promotion.id}
                className="rounded-md border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">
                      {promotion.code}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatNumber(promotion.ordersUsed)} đơn · giảm{" "}
                      {formatVnd(promotion.discountValue)}
                    </div>
                  </div>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="bg-rose-500 transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                      <div
                        className="bg-emerald-400 transition-all"
                        style={{ width: `${remainingPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-3 whitespace-nowrap text-xs font-semibold text-slate-600">
                    {formatNumber(promotion.ordersUsed)}/{formatNumber(promotion.quota)}
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-slate-600">Đã dùng: {formatNumber(promotion.ordersUsed)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-600">Còn lại: {formatNumber(promotion.remaining)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
