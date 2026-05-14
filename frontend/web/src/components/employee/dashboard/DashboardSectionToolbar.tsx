import { CalendarDays, FileSpreadsheet, RefreshCw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardFilterState, DashboardRange } from "@/types/dashboard";

interface DashboardSectionToolbarProps {
  title: string;
  value: DashboardFilterState;
  onChange: (value: DashboardFilterState) => void;
  onRefresh?: () => void;
  onExport: () => void;
  isExportDisabled?: boolean;
  isRefreshing?: boolean;
  cinemaOptions?: { id: string; label: string }[];
  isCinemaLoading?: boolean;
  hideCinemaFilter?: boolean;
}

const rangeOptions: { value: DashboardRange; label: string }[] = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "all-time", label: "Tất cả" },
];

export function DashboardSectionToolbar({
  title,
  value,
  onChange,
  onRefresh,
  onExport,
  isExportDisabled,
  isRefreshing,
  cinemaOptions = [],
  isCinemaLoading,
  hideCinemaFilter,
}: DashboardSectionToolbarProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="flex max-w-full flex-col gap-3 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-800">
        <SlidersHorizontal size={16} className="text-sky-600" />
        <span className="truncate">{title}</span>
      </div>

      <div className="grid min-w-[520px] grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:min-w-max lg:items-center">
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
          <SelectTrigger className="h-9 lg:w-36">
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
          <SelectTrigger className="h-9 lg:w-28">
            <SelectValue placeholder="Kỳ" />
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
          <SelectTrigger className="h-9 lg:w-24">
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
          <SelectTrigger className="h-9 lg:w-28">
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
          <SelectTrigger className="h-9 lg:w-24">
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
          disabled={!onRefresh || isRefreshing}
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin" : undefined} />
          Reload
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={onExport}
          disabled={isExportDisabled}
        >
          <FileSpreadsheet size={15} />
          Excel
        </Button>

        <div className="hidden items-center gap-1 text-xs font-semibold text-slate-400 lg:flex">
          <CalendarDays size={13} />
          Lọc riêng
        </div>
      </div>
    </div>
  );
}
