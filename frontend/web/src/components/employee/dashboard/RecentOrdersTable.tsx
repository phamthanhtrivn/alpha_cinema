import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentOrder } from "@/types/dashboard";
import { formatDateTime, formatVnd } from "../../../utils/dashboardFormat";

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

type OrderStatusConfig = {
  label: string;
  className: string;
};

const orderStatusConfig: Record<RecentOrder["status"], OrderStatusConfig> = {
  PAID: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  FAILED: {
    label: "Thất bại",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const fallbackStatusConfig: OrderStatusConfig = {
  label: "Không xác định",
  className: "border-slate-200 bg-slate-100 text-slate-600",
};

const getOrderStatusConfig = (status?: string | null): OrderStatusConfig => {
  if (!status) {
    return fallbackStatusConfig;
  }

  return (
    orderStatusConfig[status as RecentOrder["status"]] ?? {
      ...fallbackStatusConfig,
      label: status,
    }
  );
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (!orders.length) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        Chưa có đơn hàng gần đây.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã đơn</TableHead>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Phim / sản phẩm</TableHead>
          <TableHead>Thanh toán</TableHead>
          <TableHead className="text-right">Tổng tiền</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const status = getOrderStatusConfig(order.status);

          return (
            <TableRow key={order.id}>
              <TableCell className="font-bold text-slate-800">
                <div>{order.id}</div>
                <div className="text-xs font-normal text-slate-500">
                  {formatDateTime(order.createdAt)}
                </div>
              </TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell className="max-w-[180px] truncate">
                {order.movieTitle}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {order.paymentMethod}
                  </span>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right font-black text-slate-900">
                {formatVnd(order.totalPayment)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
