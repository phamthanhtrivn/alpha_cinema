import { OrderStatus } from "@/types/order";

export const ORDER_STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Chờ thanh toán", value: OrderStatus.PENDING_PAYMENT },
  { label: "Đã thanh toán", value: OrderStatus.PAID },
  { label: "Đã xác nhận", value: OrderStatus.CONFIRMED },
  { label: "Thất bại", value: OrderStatus.FAILED },
  { label: "Hết hạn", value: OrderStatus.EXPIRED },
  { label: "Đã hủy", value: OrderStatus.CANCELLED },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [OrderStatus.PENDING_PAYMENT]: "Chờ thanh toán",
  [OrderStatus.PAID]: "Đã thanh toán",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.FAILED]: "Thất bại",
  [OrderStatus.EXPIRED]: "Hết hạn",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const ORDER_STATUS_BADGE_TYPES: Record<string, "success" | "info" | "warning" | "error" | "neutral"> = {
  [OrderStatus.PENDING_PAYMENT]: "warning",
  [OrderStatus.PAID]: "info",
  [OrderStatus.CONFIRMED]: "success",
  [OrderStatus.FAILED]: "error",
  [OrderStatus.EXPIRED]: "neutral",
  [OrderStatus.CANCELLED]: "error",
};
