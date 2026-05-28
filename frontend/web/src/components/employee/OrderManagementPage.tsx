import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  Film,
  Package,
  ReceiptText,
  ScanLine,
  Store,
  Ticket,
  UserRound,
} from "lucide-react";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import { FilterSelect } from "@/components/employee/FilterSelect";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cinemaService } from "@/services/cinema.service";
import { orderService } from "@/services/order.service";
import { formatDDMMYYYY, formatHHmm } from "@/utils/formatTime";
import {
  ORDER_STATUS_BADGE_TYPES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
} from "@/constants/order.constants";
import type {
  OrderSearchParams,
  OrderPaymentStatus,
  PaymentMethod,
  OrderStatus,
  OrderSummary,
} from "@/types/order";
import { ALL_PROJECTION_OPTIONS, ALL_TRANSLATION } from "@/types/movie";

type OrderScope = "ADMIN" | "MANAGER";

type OrderFilterState = {
  keyword: string;
  orderId: string;
  customerId: string;
  employeeId: string;
  cinemaId: string;
  status: OrderStatus | "ALL";
  fromDate: string;
  toDate: string;
  minTotalPayment: string;
  maxTotalPayment: string;
  paymentMethod: PaymentMethod | "ALL";
  paymentStatus: OrderPaymentStatus | "ALL";
  paymentCode: string;
  providerTransactionId: string;
};

const DEFAULT_FILTERS: OrderFilterState = {
  keyword: "",
  orderId: "",
  customerId: "",
  employeeId: "",
  cinemaId: "",
  status: "ALL",
  fromDate: "",
  toDate: "",
  minTotalPayment: "",
  maxTotalPayment: "",
  paymentMethod: "ALL",
  paymentStatus: "ALL",
  paymentCode: "",
  providerTransactionId: "",
};

const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod | "ALL" }[] = [
  { label: "Tất cả phương thức", value: "ALL" },
  { label: "VNPAY", value: "VNPAY" },
  { label: "MOMO", value: "MOMO" },
  { label: "Tiền mặt", value: "CASH" },
];

const PAYMENT_STATUS_OPTIONS: { label: string; value: OrderPaymentStatus | "ALL" }[] = [
  { label: "Tất cả thanh toán", value: "ALL" },
  { label: "Đang chờ", value: "PENDING" },
  { label: "Thành công", value: "SUCCESS" },
  { label: "Thất bại", value: "FAILED" },
  { label: "Hết hạn", value: "EXPIRED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  PENDING: "Đang chờ",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};

interface OrderManagementPageProps {
  scope: OrderScope;
  title: string;
  subtitle: string;
}

const currency = (value?: number) => (value ?? 0).toLocaleString("vi-VN");

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const buildParams = (
  filters: OrderFilterState,
  currentPage: number,
  pageSize: number,
): OrderSearchParams => {
  const status = filters.status === "ALL" ? undefined : filters.status;
  const paymentMethod = filters.paymentMethod === "ALL" ? undefined : filters.paymentMethod;
  const paymentStatus = filters.paymentStatus === "ALL" ? undefined : filters.paymentStatus;

  return {
    keyword: filters.keyword.trim() || undefined,
    orderId: filters.orderId.trim() || undefined,
    customerId: filters.customerId.trim() || undefined,
    employeeId: filters.employeeId.trim() || undefined,
    cinemaId: filters.cinemaId.trim() || undefined,
    status,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    minTotalPayment: filters.minTotalPayment
      ? Number(filters.minTotalPayment)
      : undefined,
    maxTotalPayment: filters.maxTotalPayment
      ? Number(filters.maxTotalPayment)
      : undefined,
    paymentMethod,
    paymentStatus,
    paymentCode: filters.paymentCode.trim() || undefined,
    providerTransactionId: filters.providerTransactionId.trim() || undefined,
    page: currentPage - 1,
    size: pageSize,
    sortBy: "createdAt",
    direction: "desc",
  };
};

const OrderManagementPage: React.FC<OrderManagementPageProps> = ({
  scope,
  title,
  subtitle,
}) => {
  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<OrderFilterState>(DEFAULT_FILTERS);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: cinemasResponse } = useQuery({
    queryKey: ["order-cinemas"],
    queryFn: () => cinemaService.getCinemaOptions(),
    enabled: scope === "ADMIN",
  });

  const cinemas = cinemasResponse?.data || [];

  const orderParams = useMemo(
    () => buildParams(appliedFilters, currentPage, pageSize),
    [appliedFilters, currentPage],
  );

  const {
    data: ordersResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orders", scope, currentPage, appliedFilters],
    queryFn: () => orderService.getOrders(orderParams),
  });

  const orders = ordersResponse?.data?.content || [];
  const totalItems = ordersResponse?.data?.totalElements || 0;

  const { data: detailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ["order-detail", selectedOrderId],
    queryFn: () => orderService.getOrderDetail(selectedOrderId as string),
    enabled: isDetailOpen && !!selectedOrderId,
  });

  const selectedOrder = detailResponse?.data || null;

  const hasActiveFilters = Object.entries(appliedFilters).some(
    ([key, value]) => {
      if (key === "status") return value !== "ALL";
      return value !== "";
    },
  );

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const handleRefresh = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handleView = (order: OrderSummary) => {
    setSelectedOrderId(order.id);
    setIsDetailOpen(true);
  };

  const FilterContent = (
    <ManagementFilterBar
      onRefresh={handleRefresh}
      isFilterActive={hasActiveFilters}
      rightContent={
        <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-sm">
          <Store size={14} className="text-sky-500" />
          {scope === "ADMIN" ? "Xem toàn bộ hệ thống" : "Chỉ rạp đang quản lý"}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Từ khóa nhanh
          </label>
          <Input
            placeholder="Mã đơn, khách hàng, nhân viên, rạp..."
            value={filters.keyword}
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã đơn hàng
          </label>
          <Input
            placeholder="Nhập mã đơn..."
            value={filters.orderId}
            onChange={(e) =>
              setFilters({ ...filters, orderId: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã khách hàng
          </label>
          <Input
            placeholder="Nhập mã khách hàng..."
            value={filters.customerId}
            onChange={(e) =>
              setFilters({ ...filters, customerId: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã nhân viên
          </label>
          <Input
            placeholder="Nhập mã nhân viên..."
            value={filters.employeeId}
            onChange={(e) =>
              setFilters({ ...filters, employeeId: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        {scope === "ADMIN" && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Rạp chiếu
            </label>
            <FilterSelect
              placeholder="Tất cả rạp"
              options={[
                { label: "Tất cả rạp", value: "ALL" },
                ...cinemas.map((cinema: any) => ({
                  label:
                    cinema.label ||
                    (cinema.address
                      ? `${cinema.name} - ${cinema.address}`
                      : cinema.name),
                  value: cinema.id || cinema.value,
                })),
              ]}
              value={filters.cinemaId || "ALL"}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  cinemaId: value === "ALL" ? "" : value,
                })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Trạng thái
          </label>
          <FilterSelect
            placeholder="Tất cả trạng thái"
            options={ORDER_STATUS_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={filters.status}
            onChange={(value) =>
              setFilters({
                ...filters,
                status: value === "ALL" ? "ALL" : (value as OrderStatus),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Phương thức thanh toán
          </label>
          <FilterSelect
            placeholder="Tất cả phương thức"
            options={PAYMENT_METHOD_OPTIONS}
            value={filters.paymentMethod}
            onChange={(value) =>
              setFilters({
                ...filters,
                paymentMethod: value === "ALL" ? "ALL" : (value as PaymentMethod),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Trạng thái thanh toán
          </label>
          <FilterSelect
            placeholder="Tất cả thanh toán"
            options={PAYMENT_STATUS_OPTIONS}
            value={filters.paymentStatus}
            onChange={(value) =>
              setFilters({
                ...filters,
                paymentStatus: value === "ALL" ? "ALL" : (value as OrderPaymentStatus),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã thanh toán
          </label>
          <Input
            placeholder="Nhập mã thanh toán..."
            value={filters.paymentCode}
            onChange={(e) =>
              setFilters({ ...filters, paymentCode: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Mã giao dịch NCC
          </label>
          <Input
            placeholder="Nhập mã giao dịch..."
            value={filters.providerTransactionId}
            onChange={(e) =>
              setFilters({ ...filters, providerTransactionId: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Từ ngày
          </label>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Đến ngày
          </label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Thanh toán từ
          </label>
          <Input
            type="number"
            min={0}
            placeholder="Nhập số tiền..."
            value={filters.minTotalPayment}
            onChange={(e) =>
              setFilters({ ...filters, minTotalPayment: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Thanh toán đến
          </label>
          <Input
            type="number"
            min={0}
            placeholder="Nhập số tiền..."
            value={filters.maxTotalPayment}
            onChange={(e) =>
              setFilters({ ...filters, maxTotalPayment: e.target.value })
            }
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>

        <div className="xl:col-span-4 flex flex-wrap items-center gap-3 pt-2">
          <Button
            className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
          <Button
            variant="outline"
            className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Làm mới
          </Button>
        </div>
      </div>
    </ManagementFilterBar>
  );

  return (
    <BaseManagementLayout
      title={title}
      subtitle={subtitle}
      filterContent={FilterContent}
      totalItems={totalItems}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      <ManagementTable
        headers={[
          "Đơn hàng",
          "Khách hàng",
          "Rạp / Phim",
          "Suất chiếu",
          "Trạng thái",
          "Thanh toán",
          "Tổng thanh toán",
          "Hành độnng",
        ]}
        isLoading={isLoading}
      >
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="group hover:bg-sky-50/30 border-slate-50"
          >
            <TableCell className="px-8 py-6 align-top">
              <div className="space-y-1">
                <div className="font-black text-slate-800">{order.id}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-widest">
                  {formatDateTime(order.createdAt)}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <ReceiptText size={12} />
                  {order.showScheduleId || "Không có suất"}
                </div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <div className="space-y-1 max-w-55">
                <div className="font-semibold text-slate-800 truncate">
                  {order.customerName || order.customerId || "Khách vãng lai"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {order.customerEmail || "-"}
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-widest truncate">
                  NV: {order.employeeName || order.employeeId || "-"}
                </div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <div className="space-y-1 max-w-65">
                <div className="font-bold text-slate-800 truncate">
                  {order.cinemaName || order.cinemaId || "-"}
                </div>
                <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <Film size={12} className="shrink-0" />
                  {order.movieTitle || "-"}
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-widest truncate">
                  {order.roomName || "-"}
                </div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-sky-500" />
                  <span>
                    {order.showStartTime
                      ? `${formatHHmm(order.showStartTime)} - ${formatDDMMYYYY(order.showStartTime)}`
                      : "-"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">
                  {ALL_PROJECTION_OPTIONS.find(
                    (item) => item.value === order.projectionType,
                  )?.label || "-"}
                  •{" "}
                  {ALL_TRANSLATION.find(
                    (item) => item.value === order.translationType,
                  )?.label || "-"}
                </div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <StatusBadge
                status={ORDER_STATUS_LABELS[order.status] || order.status}
                type={ORDER_STATUS_BADGE_TYPES[order.status] || "neutral"}
              />
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                <div>Ghế: {order.seatCount}</div>
                <div>Sản phẩm: {order.productCount}</div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <CreditCard size={14} className="text-sky-500" />
                  {order.paymentMethod || "-"}
                </div>
                <div className="text-xs font-bold text-emerald-600">
                  {order.paymentStatus
                    ? PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus
                    : "-"}
                </div>
                <div className="max-w-40 truncate text-[11px] text-slate-400">
                  {order.paymentCode || order.providerTransactionId || "-"}
                </div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top text-right">
              <div className="font-black text-slate-900 text-lg">
                {currency(order.totalPayment)} đ
              </div>
              <div className="text-xs text-slate-500 mt-1 space-y-1">
                <div>Vé: {currency(order.totalPrice)} đ</div>
                <div>Giảm điểm: {currency(order.pointDiscount)} đ</div>
                <div>KM: {currency(order.promotionDiscount)} đ</div>
              </div>
            </TableCell>

            <TableCell className="px-8 py-6 align-top">
              <TableActions onView={() => handleView(order)} />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>

      {isError && (
        <div className="p-6 flex items-center gap-3 text-rose-600">
          <AlertCircle size={18} />
          <span>Không tải được danh sách đơn hàng. Vui lòng thử lại.</span>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            className="ml-auto"
          >
            Tải lại
          </Button>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-295 w-[96vw] max-h-[92vh] overflow-hidden p-0 rounded-4xl border-slate-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="h-2 bg-sky-500" />
          <div className="max-h-[calc(92vh-8px)] overflow-y-auto">
            <DialogHeader className="px-6 md:px-8 pt-6 pb-4 border-b border-slate-100 bg-linear-to-r from-sky-50 to-white">
              <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Chi tiết đơn hàng {selectedOrder?.id || ""}
              </DialogTitle>
              <div className="text-sm text-slate-500">
                Xem đầy đủ thông tin đơn, suất chiếu, ghế và sản phẩm đã chọn.
              </div>
            </DialogHeader>

            <div className="p-6 md:p-8 space-y-6">
              {isDetailLoading && (
                <div className="min-h-80 flex items-center justify-center text-slate-400 font-semibold">
                  Đang tải chi tiết...
                </div>
              )}

              {!isDetailLoading && selectedOrder && (
                <>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="rounded-[1.75rem] border-slate-100 shadow-sm bg-slate-50/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                          <ReceiptText className="text-sky-500" size={18} />
                          Thông tin đơn hàng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-600">
                        <DetailLine
                          label="Trạng thái"
                          value={
                            <StatusBadge
                              status={
                                ORDER_STATUS_LABELS[selectedOrder.status] ||
                                selectedOrder.status
                              }
                              type={
                                ORDER_STATUS_BADGE_TYPES[
                                  selectedOrder.status
                                ] || "neutral"
                              }
                            />
                          }
                        />
                        <DetailLine
                          label="Tổng tiền vé"
                          value={`${currency(selectedOrder.totalPrice)} đ`}
                        />
                        <DetailLine
                          label="Giảm bằng điểm"
                          value={`${currency(selectedOrder.pointDiscount)} đ`}
                        />
                        <DetailLine
                          label="Giảm bằng mã"
                          value={`${currency(selectedOrder.promotionDiscount)} đ`}
                        />
                        <DetailLine
                          label="Tổng thanh toán"
                          value={
                            <span className="font-black text-slate-900">
                              {currency(selectedOrder.totalPayment)} đ
                            </span>
                          }
                        />
                        <DetailLine
                          label="Phương thức"
                          value={selectedOrder.paymentMethod || "-"}
                        />
                        <DetailLine
                          label="Trạng thái thanh toán"
                          value={
                            selectedOrder.paymentStatus
                              ? PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus] || selectedOrder.paymentStatus
                              : "-"
                          }
                        />
                        <DetailLine
                          label="Số tiền payment"
                          value={
                            selectedOrder.paymentAmount != null
                              ? `${currency(selectedOrder.paymentAmount)} ${selectedOrder.paymentCurrency || "VND"}`
                              : "-"
                          }
                        />
                        <DetailLine
                          label="Mã payment"
                          value={selectedOrder.paymentCode || "-"}
                        />
                        <DetailLine
                          label="Mã giao dịch NCC"
                          value={selectedOrder.providerTransactionId || "-"}
                        />
                        <DetailLine
                          label="Thanh toán lúc"
                          value={formatDateTime(selectedOrder.paidAt)}
                        />
                        <DetailLine
                          label="Payment hết hạn"
                          value={formatDateTime(selectedOrder.paymentExpiredAt)}
                        />
                        <DetailLine
                          label="Điểm đã dùng"
                          value={`${selectedOrder.pointsRedeemed} điểm`}
                        />
                        <DetailLine
                          label="Mã khuyến mãi"
                          value={selectedOrder.promotionCode || "-"}
                        />
                        <DetailLine
                          label="QR thanh toán"
                          value={
                            selectedOrder.qrCode ? (
                              <div className="mt-2 bg-white p-2 rounded-xl border-2 border-slate-50 shadow-inner inline-flex items-center justify-center w-32 h-32">
                                <QRCodeSVG value={selectedOrder.qrCode} size={112} />
                              </div>
                            ) : (
                              "-"
                            )
                          }
                        />
                        <DetailLine
                          label="Tạo lúc"
                          value={formatDateTime(selectedOrder.createdAt)}
                        />
                        <DetailLine
                          label="Cập nhật lúc"
                          value={formatDateTime(selectedOrder.updatedAt)}
                        />
                      </CardContent>
                    </Card>

                    <Card className="rounded-[1.75rem] border-slate-100 shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                          <UserRound className="text-sky-500" size={18} />
                          Khách hàng và nhân viên
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-600">
                        <DetailLine
                          label="Khách hàng"
                          value={
                            selectedOrder.customerName ||
                            selectedOrder.customerId ||
                            "-"
                          }
                        />
                        <DetailLine
                          label="Email"
                          value={selectedOrder.customerEmail || "-"}
                        />
                        <DetailLine
                          label="Số điện thoại"
                          value={selectedOrder.customerPhone || "-"}
                        />
                        <DetailLine
                          label="Mã khách hàng"
                          value={selectedOrder.customerId || "-"}
                        />
                        <DetailLine
                          label="Mã nhân viên"
                          value={selectedOrder.employeeId || "-"}
                        />
                      </CardContent>
                    </Card>

                    <Card className="rounded-[1.75rem] border-slate-100 shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                          <Film className="text-sky-500" size={18} />
                          Suất chiếu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-600">
                        <DetailLine
                          label="Phim"
                          value={selectedOrder.movieTitle || "-"}
                        />
                        <DetailLine
                          label="Mã suất chiếu"
                          value={selectedOrder.showScheduleId || "-"}
                        />
                        <DetailLine
                          label="Rạp"
                          value={
                            selectedOrder.cinemaName ||
                            selectedOrder.cinemaId ||
                            "-"
                          }
                        />
                        <DetailLine
                          label="Địa chỉ rạp"
                          value={selectedOrder.cinemaAddress || "-"}
                        />
                        <DetailLine
                          label="Phòng"
                          value={
                            selectedOrder.roomNumber
                              ? `Phòng ${selectedOrder.roomNumber}`
                              : selectedOrder.roomName || "-"
                          }
                        />
                        <DetailLine
                          label="Bắt đầu"
                          value={
                            selectedOrder.showStartTime
                              ? `${formatHHmm(selectedOrder.showStartTime)} - ${formatDDMMYYYY(selectedOrder.showStartTime)}`
                              : "-"
                          }
                        />
                        <DetailLine
                          label="Kết thúc"
                          value={formatDateTime(selectedOrder.showEndTime)}
                        />
                        <DetailLine
                          label="Loại chiếu"
                          value={selectedOrder.projectionType || "-"}
                        />
                        <DetailLine
                          label="Dịch thuật"
                          value={
                            ALL_TRANSLATION.find(
                              (item) =>
                                item.value === selectedOrder.translationType,
                            )?.label || "-"
                          }
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="rounded-[1.75rem] border-slate-100 shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                          <Ticket className="text-sky-500" size={18} />
                          Ghế đã chọn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOrder.seats.length ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {selectedOrder.seats.map((seat, index) => (
                              <div
                                key={`${seat.seatId || seat.seatNumber || index}`}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-black text-slate-800 text-lg">
                                    {seat.seatNumber || "-"}
                                  </div>
                                  <div className="text-xs text-slate-400 uppercase tracking-widest">
                                    {seat.showSeatType || "Seat"}
                                  </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                  <div>Hàng: {seat.rowName || "-"}</div>
                                  <div>Cột: {seat.columnName || "-"}</div>
                                  <div>
                                    Giá vé: {currency(seat.ticketPrice)} đ
                                  </div>
                                  <div>
                                    Giá cuối: {currency(seat.finalPrice)} đ
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 text-center">
                            Không có dữ liệu ghế.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="rounded-[1.75rem] border-slate-100 shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                          <Package className="text-sky-500" size={18} />
                          Sản phẩm đi kèm
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOrder.products.length ? (
                          <div className="space-y-3">
                            {selectedOrder.products.map((product, index) => (
                              <div
                                key={`${product.productId || index}`}
                                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                                  {product.pictureUrl ? (
                                    <img
                                      src={product.pictureUrl}
                                      alt={product.productName || "Sản phẩm"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <ScanLine
                                      size={20}
                                      className="text-slate-300"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 truncate">
                                        {product.productName || "-"}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {product.quantity} x{" "}
                                        {currency(product.unitPrice)} đ
                                      </div>
                                    </div>
                                    <div className="font-black text-sky-600 shrink-0">
                                      {currency(product.subTotal)} đ
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 text-center">
                            Không có sản phẩm đi kèm.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BaseManagementLayout>
  );
};

type DetailLineProps = {
  label: string;
  value: React.ReactNode;
};

const DetailLine: React.FC<DetailLineProps> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-100 pb-2 last:border-0 last:pb-0">
    <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </div>
    <div className="text-right text-sm text-slate-700 font-medium wrap-break-word">
      {value}
    </div>
  </div>
);

export default OrderManagementPage;
