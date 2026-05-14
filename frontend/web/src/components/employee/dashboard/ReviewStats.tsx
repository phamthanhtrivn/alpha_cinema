import { ExternalLink, MessageSquareWarning, Star } from "lucide-react";
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
import type { ReviewAnalytics } from "@/types/dashboard";
import { formatDateTime, formatNumber } from "../../../utils/dashboardFormat";

interface ReviewStatsProps {
  data?: ReviewAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

export function ReviewStats({ data, isLoading, detailPath }: ReviewStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu đánh giá.
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.ratingDistribution.map((item) => item.count), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Star size={19} className="text-amber-500" />
              Đánh giá
            </CardTitle>
            <CardDescription>Điểm trung bình, phản hồi chờ xử lý và đánh giá gần đây</CardDescription>
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
          <div className="rounded-md border border-slate-100 bg-amber-50 p-3">
            <div className="text-xs font-bold text-amber-700">Điểm TB</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {data.averageRating.toFixed(1)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs font-bold text-slate-500">Tổng đánh giá</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.totalReviews)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-rose-50 p-3">
            <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
              <MessageSquareWarning size={13} />
              Chờ xử lý
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.pendingReviews)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {data.ratingDistribution.map((item) => (
            <div key={item.rating} className="grid grid-cols-[44px_1fr_52px] items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">{item.rating} sao</span>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-right font-semibold text-slate-500">
                {formatNumber(item.count)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-black text-slate-800">Gần đây</div>
          {data.recentReviews.map((review) => (
            <div key={review.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-800">
                    {review.movieTitle}
                  </div>
                  <div className="text-xs text-slate-500">
                    {review.customerName} · {formatDateTime(review.createdAt)}
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-700">
                  {review.rating}/5
                </span>
              </div>
              <div className="mt-2 line-clamp-1 text-xs text-slate-600">
                {review.comment}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
