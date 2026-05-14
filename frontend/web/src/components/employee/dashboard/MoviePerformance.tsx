import { Clapperboard, ExternalLink, Film, Star, Ticket } from "lucide-react";
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
import type { MoviePerformanceData, MoviePerformanceItem } from "@/types/dashboard";
import { formatNumber, formatVnd } from "../../../utils/dashboardFormat";

interface MoviePerformanceProps {
  data?: MoviePerformanceData;
  isLoading?: boolean;
  detailPath?: string;
}

function MovieRow({ movie, mode }: { movie: MoviePerformanceItem; mode: "revenue" | "tickets" }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-800">
            {movie.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{formatNumber(movie.ticketsSold)} vé</span>
            <span>{movie.occupancyRate}% lấp đầy</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            movie.status === "NOW_SHOWING"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {movie.status === "NOW_SHOWING" ? "Đang chiếu" : "Sắp chiếu"}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {mode === "revenue" ? "Doanh thu" : "Vé bán"}
        </span>
        <span className="font-black text-slate-900">
          {mode === "revenue" ? formatVnd(movie.revenue) : formatNumber(movie.ticketsSold)}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-cyan-500"
          style={{ width: `${movie.occupancyRate}%` }}
        />
      </div>
    </div>
  );
}

export function MoviePerformance({ data, isLoading, detailPath }: MoviePerformanceProps) {
  if (isLoading) return <Skeleton className="h-[420px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu hiệu suất phim.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Film size={19} className="text-cyan-600" />
              Hiệu suất phim
            </CardTitle>
            <CardDescription>
              Xếp hạng doanh thu, vé bán và tỷ lệ lấp đầy theo phim
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
          <div className="rounded-md border border-slate-100 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clapperboard size={14} /> Đang chiếu
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.nowShowing)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Star size={14} /> Sắp chiếu
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.comingSoon)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Star size={15} className="text-amber-500" />
              Top doanh thu
            </div>
            {data.topRevenue.map((movie) => (
              <MovieRow key={movie.id} movie={movie} mode="revenue" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Ticket size={15} className="text-sky-500" />
              Top vé bán
            </div>
            {data.topTickets.map((movie) => (
              <MovieRow key={movie.id} movie={movie} mode="tickets" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
