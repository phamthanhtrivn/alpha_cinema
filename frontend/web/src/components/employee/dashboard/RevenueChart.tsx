import { BarChart3, ExternalLink, Package, Ticket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueAnalytics } from "@/types/dashboard";
import { formatNumber, formatPercent, formatVnd } from "../../../utils/dashboardFormat";

interface RevenueChartProps {
  data?: RevenueAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

export function RevenueChart({ data, isLoading, detailPath }: RevenueChartProps) {
  if (isLoading) return <Skeleton className="h-[420px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu doanh thu.
        </CardContent>
      </Card>
    );
  }

  const sortedSeries = data.series ? [...data.series].sort((a, b) => {
    const numA = parseInt(a.label.replace(/\\D/g, ''));
    const numB = parseInt(b.label.replace(/\\D/g, ''));
    if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
    }
    return a.label.localeCompare(b.label);
  }) : [];

  const chartSeries = sortedSeries.length
    ? sortedSeries
    : data.totalRevenue > 0
      ? [
          {
            label: "Tổng doanh thu",
            revenue: data.totalRevenue,
            tickets: data.totalTickets,
            products: data.totalProducts,
          },
        ]
      : [];
  const maxRevenue = Math.max(...chartSeries.map((point) => point.revenue), 1);
  const formatBarValue = (value: number) => {
    if (value >= 1_000_000_000) return `${formatNumber(value / 1_000_000_000)} tỷ`;
    if (value >= 1_000_000) return `${formatNumber(value / 1_000_000)} tr`;
    return formatVnd(value);
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <BarChart3 size={19} className="text-sky-600" />
              Phân tích doanh thu
            </CardTitle>
            <CardDescription>
              Doanh thu, vé bán và sản phẩm theo bộ lọc hiện tại
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {detailPath && (
              <Button asChild variant="outline" size="sm">
                <Link to={detailPath}>
                  <ExternalLink size={14} />
                  Chi tiết
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <TrendingUp size={14} /> Doanh thu
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatVnd(data.totalRevenue)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Ticket size={14} /> Vé bán
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatNumber(data.totalTickets)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Package size={14} /> Combo/sản phẩm
            </div>
            <div className="mt-1 text-lg font-black text-slate-900">
              {formatNumber(data.totalProducts)}
            </div>
          </div>
        </div>

        <div className="h-64 rounded-lg border border-slate-100 bg-slate-50 p-4">
          {chartSeries.length ? (
            <div className="flex h-full items-end gap-2">
              {chartSeries.map((point) => {
              const barHeight = Math.max((point.revenue / maxRevenue) * 100, 8);

              return (
                <div key={point.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div className="flex min-h-0 flex-1 items-end pt-7">
                    <div className="relative h-full w-full rounded-t-md bg-sky-100">
                      <div
                        className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
                        style={{ bottom: `calc(${barHeight}% + 6px)` }}
                      >
                        {formatBarValue(point.revenue)}
                      </div>
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-md bg-sky-500"
                        style={{ height: `${barHeight}%` }}
                        title={`${point.label}: ${formatVnd(point.revenue)}`}
                      />
                    </div>
                  </div>
                  <div className="text-center text-xs font-bold text-slate-500">
                    {point.label}
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              Chưa có dữ liệu doanh thu theo kỳ.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
