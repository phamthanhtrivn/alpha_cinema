import { ExternalLink, UserCheck, UserCog, Users } from "lucide-react";
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
import type { EmployeeAnalytics } from "@/types/dashboard";
import { formatNumber, formatVnd } from "../../../utils/dashboardFormat";

interface EmployeeStatsProps {
  data?: EmployeeAnalytics;
  isLoading?: boolean;
  detailPath?: string;
  hiddenRoles?: EmployeeAnalytics["roles"][number]["role"][];
}

const roleClassName: Record<string, string> = {
  ADMIN: "border-violet-200 bg-violet-50 text-violet-700",
  MANAGER: "border-sky-200 bg-sky-50 text-sky-700",
  STAFF: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function EmployeeStats({ data, isLoading, detailPath, hiddenRoles = [] }: EmployeeStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu nhân viên.
        </CardContent>
      </Card>
    );
  }

  const visibleRoles = data.roles.filter((role) => !hiddenRoles.includes(role.role));
  const visibleTopEmployees = data.topEmployees.filter((employee) => !hiddenRoles.includes(employee.role));
  const hiddenRoleTotal = data.roles
    .filter((role) => hiddenRoles.includes(role.role))
    .reduce((total, role) => total + role.total, 0);
  const totalEmployees = Math.max(data.totalEmployees - hiddenRoleTotal, 0);
  const activeEmployees = Math.min(data.activeEmployees, totalEmployees);
  const inactiveEmployees = Math.max(totalEmployees - activeEmployees, 0);
  const maxRoleCount = Math.max(...visibleRoles.map((role) => role.total), 1);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <UserCog size={19} className="text-teal-600" />
              Nhân viên
            </CardTitle>
            <CardDescription>Nhân sự đang hoạt động, vai trò và hiệu suất xử lý đơn</CardDescription>
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
          <div className="rounded-md border border-slate-100 bg-teal-50 p-3">
            <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
              <Users size={13} />
              Tổng
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(totalEmployees)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-emerald-50 p-3">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <UserCheck size={13} />
              Hoạt động
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(activeEmployees)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs font-bold text-slate-500">Tạm nghỉ</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(inactiveEmployees)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {visibleRoles.map((role) => (
            <div key={role.role}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <Badge variant="outline" className={roleClassName[role.role]}>
                  {role.role}
                </Badge>
                <span className="font-semibold text-slate-500">
                  {formatNumber(role.total)} người
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-teal-500"
                  style={{ width: `${(role.total / maxRoleCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-black text-slate-800">Top xử lý đơn</div>
          {visibleTopEmployees.length ? (
            visibleTopEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 p-3"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-bold text-slate-800" title={employee.name}>
                      {employee.name || employee.id}
                    </div>
                    <Badge variant="outline" className={roleClassName[employee.role] ?? "border-slate-200 bg-white text-slate-600"}>
                      {employee.role}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Mã NV: {employee.id}
                  </div>
                  <div className="text-xs text-slate-500">
                    {employee.cinemaName} · {formatNumber(employee.ordersHandled)} đơn
                  </div>
                </div>
                <div className="text-right text-sm font-black text-slate-900">
                  {formatVnd(employee.revenueHandled)}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Chưa có dữ liệu nhân viên cho rạp này.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
