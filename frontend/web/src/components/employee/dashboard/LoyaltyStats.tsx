import { Crown, ExternalLink, Sparkles, Star } from "lucide-react";
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
import type { LoyaltyAnalytics } from "@/types/dashboard";
import { formatNumber, formatVnd } from "../../../utils/dashboardFormat";

interface LoyaltyStatsProps {
  data?: LoyaltyAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

const tierColors = {
  MEMBER: "bg-sky-500",
  SILVER: "bg-slate-500",
  GOLD: "bg-amber-500",
};

const tierLabels = {
  MEMBER: "Member",
  SILVER: "Silver",
  GOLD: "Gold",
};

export function LoyaltyStats({ data, isLoading, detailPath }: LoyaltyStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu khách hàng.
        </CardContent>
      </Card>
    );
  }

  const maxMembers = Math.max(...data.tiers.map((tier) => tier.members), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Crown size={19} className="text-amber-500" />
              Khách hàng
            </CardTitle>
            <CardDescription>
              Điểm thưởng, hạng thành viên và khách hàng nổi bật
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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-100 bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <Sparkles size={14} />
              Điểm đã phát
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.pointsIssued)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-violet-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <Star size={14} />
              Điểm đã dùng
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.pointsRedeemed)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.tiers.map((tier) => (
            <div key={tier.tier}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{tierLabels[tier.tier]}</span>
                <span className="font-semibold text-slate-500">
                  {formatNumber(tier.members)} thành viên
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${tierColors[tier.tier]}`}
                  style={{ width: `${(tier.members / maxMembers) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-black text-slate-800">
            Top khách hàng
          </div>
          {data.topCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-3"
            >
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {customer.name}
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(customer.loyaltyPoint)} điểm
                </div>
              </div>
              <div className="text-sm font-black text-slate-900">
                {formatVnd(customer.totalSpending)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
