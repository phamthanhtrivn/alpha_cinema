import { CalendarDays, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardFilterState, DashboardRange } from "@/types/dashboard";

interface DashboardFilterProps {
  value: DashboardFilterState;
  onChange: (value: DashboardFilterState) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  cinemaOptions?: { id: string; label: string }[];
  isCinemaLoading?: boolean;
  hideCinemaFilter?: boolean;
}

const rangeOptions: { value: DashboardRange; label: string }[] = [
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm nay" },
  { value: "all-time", label: "Toàn thời gian" },
];

export function DashboardFilter({
  value,
  onChange,
  onRefresh,
  isRefreshing,
  cinemaOptions = [],
  isCinemaLoading,
  hideCinemaFilter,
}: DashboardFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <CalendarDays size={16} className="text-sky-600" />
        Bộ lọc tổng toàn dashboard
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {!hideCinemaFilter && (
        <Select
          value={value.cinemaId ?? "ALL"}
          onValueChange={(cinemaId) =>
            onChange({
              ...value,
              cinemaId: cinemaId === "ALL" ? undefined : cinemaId,
            })
          }
          disabled={isCinemaLoading}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Rạp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả rạp</SelectItem>
            {cinemaOptions.map((cinema) => (
              <SelectItem key={cinema.id} value={cinema.id}>
                {cinema.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        )}

        <Select
          value={value.range}
          onValueChange={(range) =>
            onChange({ ...value, range: range as DashboardRange })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            {rangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(value.year)}
          onValueChange={(year) => onChange({ ...value, year: Number(year) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(value.month)}
          onValueChange={(month) =>
            onChange({ ...value, month: Number(month) })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Tháng" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (month) => (
                <SelectItem key={month} value={String(month)}>
                  Tháng {month}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select
          value={String(value.week)}
          onValueChange={(week) => onChange({ ...value, week: Number(week) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Tuần" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, index) => index + 1).map((week) => (
              <SelectItem key={week} value={String(week)}>
                Tuần {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
