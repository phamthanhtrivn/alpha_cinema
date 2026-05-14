import {
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Percent,
  Receipt,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetric } from "@/types/dashboard";
import { formatMetricValue } from "../../../utils/dashboardFormat";

interface OverviewStatsProps {
  metrics: OverviewMetric[];
  isLoading?: boolean;
  getDetailPath?: (metric: OverviewMetric) => string;
}

const metricIcons: Record<string, LucideIcon> = {
  "today-revenue": CircleDollarSign,
  "tickets-sold": Ticket,
  "total-orders": Receipt,
  "paid-orders": CheckCircle2,
  "failed-orders": CreditCard,
  "seat-occupancy": Percent,
  "new-users": Users,
  "active-promotions": BadgePercent,
  "today-schedules": CalendarDays,
};

const fallbackMetricIcons = [
  CircleDollarSign,
  Ticket,
  Receipt,
  CreditCard,
  CalendarDays,
];

export function OverviewStats({ metrics, isLoading, getDetailPath }: OverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!metrics.length) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu tổng quan.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metricIcons[metric.id] ?? fallbackMetricIcons[index % fallbackMetricIcons.length];

        const card = (
          <Card className="h-full border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {metric.title}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatMetricValue(metric.value, metric.format)}
                  </p>
                </div>
                <div className="rounded-md bg-sky-50 p-2 text-sky-600">
                  <Icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );

        const detailPath = getDetailPath?.(metric);

        return detailPath ? (
          <Link key={metric.id} to={detailPath} className="block h-full">
            {card}
          </Link>
        ) : (
          <div key={metric.id}>{card}</div>
        );
      })}
    </div>
  );
}
