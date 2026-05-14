import { CreditCard, ExternalLink, ReceiptText, ShieldCheck } from "lucide-react";
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
import type { OrderPaymentAnalytics } from "@/types/dashboard";
import { formatNumber, formatPercent, formatVnd } from "../../../utils/dashboardFormat";
import { RecentOrdersTable } from "./RecentOrdersTable";

interface OrderPaymentStatsProps {
  data?: OrderPaymentAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

export function OrderPaymentStats({ data, isLoading, detailPath }: OrderPaymentStatsProps) {
  if (isLoading) return <Skeleton className="h-[520px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu đơn hàng và thanh toán.
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    { label: "PAID", value: data.statuses.paid, className: "text-emerald-700 bg-emerald-50" },
    { label: "PENDING", value: data.statuses.pending, className: "text-amber-700 bg-amber-50" },
    { label: "CANCELLED", value: data.statuses.cancelled, className: "text-slate-700 bg-slate-100" },
    { label: "EXPIRED", value: data.statuses.expired, className: "text-slate-700 bg-slate-100" },
    { label: "REFUNDED", value: data.statuses.refunded, className: "text-violet-700 bg-violet-50" },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <ReceiptText size={19} className="text-emerald-600" />
              Đơn hàng và thanh toán
            </CardTitle>
            <CardDescription>
              Trạng thái đơn, tỷ lệ thanh toán và đơn hàng gần đây
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck size={14} />
              Tỷ lệ thanh toán thành công
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatPercent(data.successRate)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:grid-cols-5">
            {statusItems.map((item) => (
              <div key={item.label} className={`rounded-md p-3 ${item.className}`}>
                <div className="text-[10px] font-black uppercase">
                  {item.label}
                </div>
                <div className="mt-1 text-xl font-black">
                  {formatNumber(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {data.paymentMethods.map((method) => (
            <div
              key={method.method}
              className="rounded-md border border-slate-100 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <CreditCard size={14} className="text-sky-600" />
                  {method.method}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {formatPercent(method.successRate)}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {formatNumber(method.orders)} đơn
              </div>
              <div className="mt-1 text-base font-black text-slate-900">
                {formatVnd(method.revenue)}
              </div>
            </div>
          ))}
        </div>

        <RecentOrdersTable orders={data.recentOrders} />
      </CardContent>
    </Card>
  );
}
