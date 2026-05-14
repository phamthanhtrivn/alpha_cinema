import type { TrendDirection } from "@/types/dashboard";

export const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const trendClassName: Record<TrendDirection, string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  flat: "text-slate-600 bg-slate-100",
};

export const formatMetricValue = (
  value: number,
  format: "currency" | "number" | "percent",
) => {
  if (format === "currency") return formatVnd(value);
  if (format === "percent") return `${value}%`;
  return formatNumber(value);
};
