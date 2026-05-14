import { Activity, ExternalLink } from "lucide-react";
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
import type { ServiceHealth } from "@/types/dashboard";
import { formatDateTime } from "../../../utils/dashboardFormat";

interface SystemHealthPanelProps {
  services: ServiceHealth[];
  isLoading?: boolean;
  detailPath?: string;
}

const statusConfig: Record<ServiceHealth["status"], { label: string; className: string }> = {
  UP: { label: "UP", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  DOWN: { label: "DOWN", className: "border-rose-200 bg-rose-50 text-rose-700" },
  DEGRADED: { label: "DEGRADED", className: "border-amber-200 bg-amber-50 text-amber-700" },
};

export function SystemHealthPanel({
  services,
  isLoading,
  detailPath,
}: SystemHealthPanelProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Activity size={19} className="text-lime-600" />
              Sức khỏe hệ thống
            </CardTitle>
            <CardDescription>Trạng thái service, response time và error rate mới nhất</CardDescription>
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
        {services.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {services.map((service) => {
              const status = statusConfig[service.status];

              return (
                <div key={service.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-800">
                        {service.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDateTime(service.lastChecked)}
                      </div>
                    </div>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-white p-2">
                      <div className="font-semibold text-slate-500">Response</div>
                      <div className="mt-1 font-black text-slate-900">
                        {service.responseTimeMs ?? "-"}ms
                      </div>
                    </div>
                    <div className="rounded-md bg-white p-2">
                      <div className="font-semibold text-slate-500">Error rate</div>
                      <div className="mt-1 font-black text-slate-900">
                        {service.errorRate ?? 0}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Chưa có dữ liệu sức khỏe hệ thống.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
