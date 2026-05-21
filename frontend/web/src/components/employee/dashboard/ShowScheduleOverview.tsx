import { AlertTriangle, Armchair, Clock3, ExternalLink } from "lucide-react";
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
import type { ShowScheduleOccupancy } from "@/types/dashboard";
import { formatTime } from "../../../utils/dashboardFormat";

interface ShowScheduleOverviewProps {
  schedules: ShowScheduleOccupancy[];
  isLoading?: boolean;
  detailPath?: string;
}

const statusConfig: Record<
  ShowScheduleOccupancy["status"],
  { label: string; className: string }
> = {
  ON_SALE: {
    label: "Đang bán",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  NEAR_FULL: {
    label: "Gần hết ghế",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SOLD_OUT: {
    label: "Hết ghế",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  ENDED: {
    label: "Đã kết thúc",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

export function ShowScheduleOverview({
  schedules,
  isLoading,
  detailPath,
}: ShowScheduleOverviewProps) {
  if (isLoading) return <Skeleton className="h-[420px] rounded-lg" />;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Clock3 size={19} className="text-indigo-600" />
              Suất chiếu và ghế
            </CardTitle>
            <CardDescription>
              Theo dõi vận hành suất chiếu hôm nay và cảnh báo gần hết ghế
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
      <CardContent>
        {schedules.length ? (
          <div className="space-y-3">
            {[...schedules]
              .sort((a, b) => {
                const totalSeatsA = Math.max(a.totalSeats, a.soldSeats);
                const totalSeatsB = Math.max(b.totalSeats, b.soldSeats);

                const occupancyA =
                  totalSeatsA > 0 ? (a.soldSeats / totalSeatsA) * 100 : 0;

                const occupancyB =
                  totalSeatsB > 0 ? (b.soldSeats / totalSeatsB) * 100 : 0;

                return occupancyB - occupancyA;
              })
              .map((schedule) => {
                const totalSeats = Math.max(
                  schedule.totalSeats,
                  schedule.soldSeats,
                );
                const occupancy = Math.round(
                  totalSeats > 0 ? (schedule.soldSeats / totalSeats) * 100 : 0,
                );
                const status = statusConfig[schedule.status];

                return (
                  <div
                    key={schedule.id}
                    className="rounded-md border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900">
                          {schedule.movieTitle}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {schedule.cinemaName} · {schedule.roomName} ·{" "}
                          {formatTime(schedule.startTime)} -{" "}
                          {formatTime(schedule.endTime)}
                        </div>
                      </div>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Armchair size={13} />
                        {schedule.soldSeats}/{totalSeats} ghế
                      </span>
                      <span className="font-black text-slate-900">
                        {occupancy}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white">
                      <div
                        className={`h-2 rounded-full ${
                          occupancy >= 90
                            ? "bg-rose-500"
                            : occupancy >= 75
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                        }`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    {schedule.status === "NEAR_FULL" && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle size={13} />
                        Suất này sắp hết ghế, cần theo dõi lưu lượng thanh toán.
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Chưa có suất chiếu hôm nay.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
