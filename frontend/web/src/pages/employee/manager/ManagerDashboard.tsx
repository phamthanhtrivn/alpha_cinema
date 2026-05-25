/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, LayoutDashboard } from "lucide-react";

import { DashboardFilter } from "@/components/employee/dashboard/DashboardFilter";
import { DashboardSectionToolbar } from "@/components/employee/dashboard/DashboardSectionToolbar";
import { DashboardTabs } from "@/components/employee/dashboard/DashboardTabs";
import { EmployeeStats } from "@/components/employee/dashboard/EmployeeStats";
import { MoviePerformance } from "@/components/employee/dashboard/MoviePerformance";
import { OrderPaymentStats } from "@/components/employee/dashboard/OrderPaymentStats";
import { OverviewStats } from "@/components/employee/dashboard/OverviewStats";
import { ProductStats } from "@/components/employee/dashboard/ProductStats";
import { RevenueChart } from "@/components/employee/dashboard/RevenueChart";
import { ShowScheduleOverview } from "@/components/employee/dashboard/ShowScheduleOverview";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { selectAuth } from "@/store/slices/authSlice";
import type {
  AdminDashboardData,
  DashboardFilterState,
  DashboardRange,
  OverviewMetric,
} from "@/types/dashboard";

type ManagerSectionKey = "revenue" | "movies" | "schedules" | "orders" | "products" | "employees";
type ManagerSectionFilters = Record<ManagerSectionKey, DashboardFilterState>;
type ManagerDashboardTabKey = "finance" | "movies" | "products" | "employees";

interface ScrollableDashboardPanelProps {
  children: ReactNode;
  minWidth?: string;
  maxHeight?: string;
}

function ScrollableDashboardPanel({
  children,
  minWidth = "680px",
  maxHeight = "620px",
}: ScrollableDashboardPanelProps) {
  return (
    <div className="max-w-full overflow-auto rounded-lg" style={{ maxHeight }}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

const getWeekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);

const rangeLabels: Record<DashboardRange, string> = {
  week: "Tuần",
  month: "Tháng",
  year: "Năm",
  "all-time": "Toàn thời gian",
};

const managerMetricPath = (metric: OverviewMetric) => {
  if (metric.id.includes("revenue") || metric.id.includes("order")) return "/employee/manager/orders";
  if (metric.id.includes("ticket") || metric.id.includes("schedule") || metric.id.includes("seat")) {
    return "/employee/manager/schedules";
  }
  return "/employee/manager/dashboard";
};

const createManagerSectionFilters = (
  filters: DashboardFilterState,
  cinemaId: string,
): ManagerSectionFilters => ({
  revenue: { ...filters, cinemaId },
  movies: { ...filters, cinemaId },
  schedules: { ...filters, cinemaId },
  orders: { ...filters, cinemaId },
  products: { ...filters, cinemaId },
  employees: { ...filters, cinemaId },
});

const managerDashboardTabs = [
  { value: "finance", label: "Tài chính" },
  { value: "movies", label: "Phim & suất chiếu" },
  { value: "products", label: "Sản phẩm" },
  { value: "employees", label: "Nhân viên" },
] satisfies { value: ManagerDashboardTabKey; label: string }[];

const managerTabSections: Record<ManagerDashboardTabKey, ManagerSectionKey[]> = {
  finance: ["revenue", "orders"],
  movies: ["movies", "schedules"],
  products: ["products"],
  employees: ["employees"],
};

const sameFilters = (left: DashboardFilterState, right: DashboardFilterState) =>
  left.range === right.range &&
  left.year === right.year &&
  left.month === right.month &&
  left.week === right.week &&
  (left.cinemaId ?? "") === (right.cinemaId ?? "");

const escapeExcelCell = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const tableToHtml = (title: string, rows: object[]) => {
  if (!rows.length) return `<h2>${escapeExcelCell(title)}</h2><p>No data</p>`;

  const headers = Object.keys(rows[0] as Record<string, unknown>);
  return `
    <h2>${escapeExcelCell(title)}</h2>
    <table border="1">
      <thead>
        <tr>${headers.map((header) => `<th>${escapeExcelCell(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const record = row as Record<string, unknown>;
            return `<tr>${headers
              .map((header) => `<td>${escapeExcelCell(record[header])}</td>`)
              .join("")}</tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
};

const downloadExcelReport = (
  fileSlug: string,
  sections: { title: string; rows: object[] }[],
) => {
  const html = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>${sections.map((section) => tableToHtml(section.title, section.rows)).join("<br />")}</body>
    </html>
  `;
  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileSlug}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const filterRows = (filters: DashboardFilterState, cinemaLabel: string) => [
  {
    "Khoang thoi gian": rangeLabels[filters.range],
    Nam: filters.year,
    Thang: filters.month,
    Tuan: filters.week,
    Rap: cinemaLabel,
  },
];

const overviewRows = (data: AdminDashboardData) =>
  data.overview.map((metric) => ({
    "Chỉ số": metric.title,
    "Giá trị": metric.value,
    "Định dạng": metric.format,
    "Xu hướng": metric.trend ? `${metric.trend.value}% ${metric.trend.label}` : "",
  }));

const exportFullDashboardReport = (
  data: AdminDashboardData,
  filters: DashboardFilterState,
  cinemaLabel: string,
) => {
  downloadExcelReport("manager-dashboard-report", [
    { title: "Bộ lọc", rows: filterRows(filters, cinemaLabel) },
    { title: "Tổng quan", rows: overviewRows(data) },
    { title: "Doanh thu theo kỳ", rows: data.revenue.series },
    { title: "Top phim theo doanh thu", rows: data.movies.topRevenue },
    { title: "Top phim theo vé bán", rows: data.movies.topTickets },
    { title: "Suất chiếu", rows: data.schedules },
    { title: "Trạng thái đơn hàng", rows: [data.orders.statuses] },
    { title: "Phương thức thanh toán", rows: data.orders.paymentMethods },
    { title: "Đơn gần đây", rows: data.orders.recentOrders },
    { title: "Top sản phẩm", rows: data.products.topProducts },
    { title: "Sản phẩm sắp hết hàng", rows: data.products.lowStockProducts },
    { title: "Nhân viên theo vai trò", rows: data.employees.roles },
    { title: "Top nhân viên", rows: data.employees.topEmployees },
  ]);
};

const useManagerSectionData = (
  sectionKey: ManagerSectionKey,
  filters: DashboardFilterState,
  cinemaId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["manager-dashboard-section", sectionKey, filters],
    queryFn: () => dashboardService.getManagerDashboard({ ...filters, cinemaId }),
    enabled: Boolean(cinemaId) && enabled,
  });

export default function ManagerDashboard() {
  const auth = useSelector(selectAuth);
  const now = useMemo(() => new Date(), []);
  const cinemaId = auth.cinemaId || auth.user?.cinemaId || "";
  const cinemaLabel = auth.user?.cinemaName || auth.user?.cinema?.name || cinemaId || "Rap dang quan ly";
  const initialFilters = useMemo<DashboardFilterState>(
    () => ({
      range: "week",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      week: getWeekOfMonth(now),
      cinemaId,
    }),
    [cinemaId, now],
  );
  const [filters, setFilters] = useState<DashboardFilterState>(initialFilters);
  const [sectionFilters, setSectionFilters] = useState<ManagerSectionFilters>(
    createManagerSectionFilters(initialFilters, cinemaId),
  );
  const [activeTab, setActiveTab] = useState<ManagerDashboardTabKey>("finance");

  useEffect(() => {
    if (!cinemaId) return;
    setFilters((current) => ({ ...current, cinemaId }));
    setSectionFilters((current) => ({
      revenue: { ...current.revenue, cinemaId },
      movies: { ...current.movies, cinemaId },
      schedules: { ...current.schedules, cinemaId },
      orders: { ...current.orders, cinemaId },
      products: { ...current.products, cinemaId },
      employees: { ...current.employees, cinemaId },
    }));
  }, [cinemaId]);

  const scopedFilters = { ...filters, cinemaId };
  const activeSections = managerTabSections[activeTab];
  const shouldFetchSection = (sectionKey: ManagerSectionKey) =>
    activeSections.includes(sectionKey) && !sameFilters(sectionFilters[sectionKey], scopedFilters);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["manager-dashboard", scopedFilters],
    queryFn: () => dashboardService.getManagerDashboard(scopedFilters),
    enabled: Boolean(cinemaId),
  });

  const revenueQuery = useManagerSectionData("revenue", sectionFilters.revenue, cinemaId, shouldFetchSection("revenue"));
  const movieQuery = useManagerSectionData("movies", sectionFilters.movies, cinemaId, shouldFetchSection("movies"));
  const scheduleQuery = useManagerSectionData(
    "schedules",
    sectionFilters.schedules,
    cinemaId,
    shouldFetchSection("schedules"),
  );
  const orderQuery = useManagerSectionData("orders", sectionFilters.orders, cinemaId, shouldFetchSection("orders"));
  const productQuery = useManagerSectionData(
    "products",
    sectionFilters.products,
    cinemaId,
    shouldFetchSection("products"),
  );
  const employeeQuery = useManagerSectionData(
    "employees",
    sectionFilters.employees,
    cinemaId,
    shouldFetchSection("employees"),
  );
  const sectionKeys: ManagerSectionKey[] = ["revenue", "movies", "schedules", "orders", "products", "employees"];
  const sectionQueries = [revenueQuery, movieQuery, scheduleQuery, orderQuery, productQuery, employeeQuery];
  const activeSectionQueries = sectionQueries.filter((_, index) => shouldFetchSection(sectionKeys[index]));

  const revenueData = revenueQuery.data ?? data;
  const movieData = movieQuery.data ?? data;
  const scheduleData = scheduleQuery.data ?? data;
  const orderData = orderQuery.data ?? data;
  const productData = productQuery.data ?? data;
  const employeeData = employeeQuery.data ?? data;

  const overview = (data?.overview ?? []).filter(
    (metric) => !metric.id.includes("user") && !metric.id.includes("promotion"),
  );

  const cinemaOptions = [{ id: cinemaId || "N/A", label: cinemaLabel }];

  const handleGlobalFilterChange = (next: DashboardFilterState) => {
    const scoped = { ...next, cinemaId };
    setFilters(scoped);
    setSectionFilters(createManagerSectionFilters(scoped, cinemaId));
  };

  const refreshAll = () => {
    void Promise.all([refetch(), ...activeSectionQueries.map((query) => query.refetch())]);
  };

  const refreshSection = (sectionKey: ManagerSectionKey, refetchSection: () => unknown) => {
    if (sameFilters(sectionFilters[sectionKey], scopedFilters)) {
      void refetch();
      return;
    }

    void refetchSection();
  };

  const updateSectionFilters = (sectionKey: ManagerSectionKey, next: DashboardFilterState) => {
    setSectionFilters((current) => ({
      ...current,
      [sectionKey]: { ...next, cinemaId },
    }));
  };

  const exportSection = (
    title: string,
    fileSlug: string,
    sectionKey: ManagerSectionKey,
    sections: { title: string; rows: object[] }[],
  ) => {
    downloadExcelReport(fileSlug, [
      { title: `Bộ lọc ${title}`, rows: filterRows(sectionFilters[sectionKey], cinemaLabel) },
      ...sections,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-sky-600">
            <LayoutDashboard size={16} />
            Dashboard Quản lý rạp
          </div>
          <h1 className="text-2xl font-black text-slate-900">Tổng quan vận hành</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => data && exportFullDashboardReport(data, scopedFilters, cinemaLabel)}
          disabled={!data || isLoading}
        >
          <FileSpreadsheet size={16} />
          Excel báo cáo tổng
        </Button>
      </div>

      <DashboardFilter
        value={scopedFilters}
        onChange={handleGlobalFilterChange}
        onRefresh={refreshAll}
        isRefreshing={isFetching || activeSectionQueries.some((query) => query.isFetching)}
        cinemaOptions={cinemaOptions}
        isCinemaLoading={false}
        hideCinemaFilter
      />

      <OverviewStats metrics={overview} isLoading={isLoading} getDetailPath={managerMetricPath} />

      <DashboardTabs
        tabs={managerDashboardTabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "finance" && (
      <>
      <section className="space-y-3">
        <DashboardSectionToolbar
          title="Loc rieng: Doanh thu"
          value={sectionFilters.revenue}
          onChange={(next) => updateSectionFilters("revenue", next)}
          onRefresh={() => refreshSection("revenue", revenueQuery.refetch)}
          onExport={() =>
            revenueData &&
            exportSection("doanh thu", "manager-dashboard-revenue", "revenue", [
              {
                title: "Tổng hợp doanh thu",
                rows: [
                  {
                    "Doanh thu": revenueData.revenue.totalRevenue,
                    "Vé bán": revenueData.revenue.totalTickets,
                    "Sản phẩm": revenueData.revenue.totalProducts,
                  },
                ],
              },
              { title: "Doanh thu theo kỳ", rows: revenueData.revenue.series },
            ])
          }
          isExportDisabled={!revenueData || revenueQuery.isLoading}
          isRefreshing={revenueQuery.isFetching}
          cinemaOptions={cinemaOptions}
          hideCinemaFilter
        />
        <ScrollableDashboardPanel>
          <RevenueChart
            data={revenueData?.revenue}
            isLoading={revenueQuery.isLoading || (isLoading && !revenueData)}
            detailPath="/employee/manager/orders"
          />
        </ScrollableDashboardPanel>
      </section>

      <section className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Đơn hàng và thanh toán"
          value={sectionFilters.orders}
          onChange={(next) => updateSectionFilters("orders", next)}
          onRefresh={() => refreshSection("orders", orderQuery.refetch)}
          onExport={() =>
            orderData &&
            exportSection("đơn hàng", "manager-dashboard-orders", "orders", [
              { title: "Trạng thái đơn hàng", rows: [orderData.orders.statuses] },
              { title: "Phương thức thanh toán", rows: orderData.orders.paymentMethods },
              { title: "Đơn gần đây", rows: orderData.orders.recentOrders },
            ])
          }
          isExportDisabled={!orderData || orderQuery.isLoading}
          isRefreshing={orderQuery.isFetching}
          cinemaOptions={cinemaOptions}
          hideCinemaFilter
        />
        <ScrollableDashboardPanel>
          <OrderPaymentStats
            data={orderData?.orders}
            isLoading={orderQuery.isLoading || (isLoading && !orderData)}
            detailPath="/employee/manager/orders"
          />
        </ScrollableDashboardPanel>
      </section>
      </>
      )}

      {activeTab === "movies" && (
      <>
      <section className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Phim"
          value={sectionFilters.movies}
          onChange={(next) => updateSectionFilters("movies", next)}
          onRefresh={() => refreshSection("movies", movieQuery.refetch)}
          onExport={() =>
            movieData &&
            exportSection("phim", "manager-dashboard-movies", "movies", [
              { title: "Top phim theo doanh thu", rows: movieData.movies.topRevenue },
              { title: "Top phim theo vé bán", rows: movieData.movies.topTickets },
            ])
          }
          isExportDisabled={!movieData || movieQuery.isLoading}
          isRefreshing={movieQuery.isFetching}
          cinemaOptions={cinemaOptions}
          hideCinemaFilter
        />
        <ScrollableDashboardPanel>
          <MoviePerformance
            data={movieData?.movies}
            isLoading={movieQuery.isLoading || (isLoading && !movieData)}
            detailPath="/employee/manager/schedules"
          />
        </ScrollableDashboardPanel>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Suất chiếu"
            value={sectionFilters.schedules}
            onChange={(next) => updateSectionFilters("schedules", next)}
            onRefresh={() => refreshSection("schedules", scheduleQuery.refetch)}
            onExport={() =>
              scheduleData &&
              exportSection("suất chiếu", "manager-dashboard-schedules", "schedules", [
                { title: "Suất chiếu", rows: scheduleData.schedules },
              ])
            }
            isExportDisabled={!scheduleData || scheduleQuery.isLoading}
            isRefreshing={scheduleQuery.isFetching}
            cinemaOptions={cinemaOptions}
            hideCinemaFilter
          />
          <ScrollableDashboardPanel minWidth="560px">
            <ShowScheduleOverview
              schedules={scheduleData?.schedules ?? []}
              isLoading={scheduleQuery.isLoading || (isLoading && !scheduleData)}
              detailPath="/employee/manager/schedules"
            />
          </ScrollableDashboardPanel>
        </section>
      </div>
      </>
      )}

      {activeTab === "products" && (
        <section className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Sản phẩm"
            value={sectionFilters.products}
            onChange={(next) => updateSectionFilters("products", next)}
            onRefresh={() => refreshSection("products", productQuery.refetch)}
            onExport={() =>
              productData &&
              exportSection("sản phẩm", "manager-dashboard-products", "products", [
                { title: "Top sản phẩm", rows: productData.products.topProducts },
                { title: "Sản phẩm sắp hết hàng", rows: productData.products.lowStockProducts },
              ])
            }
            isExportDisabled={!productData || productQuery.isLoading}
            isRefreshing={productQuery.isFetching}
            cinemaOptions={cinemaOptions}
            hideCinemaFilter
          />
          <ScrollableDashboardPanel minWidth="560px">
            <ProductStats
              data={productData?.products}
              isLoading={productQuery.isLoading || (isLoading && !productData)}
            />
          </ScrollableDashboardPanel>
        </section>
      )}

      {activeTab === "employees" && (
      <section className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Nhân viên"
          value={sectionFilters.employees}
          onChange={(next) => updateSectionFilters("employees", next)}
          onRefresh={() => refreshSection("employees", employeeQuery.refetch)}
          onExport={() =>
            employeeData &&
            exportSection("nhân viên", "manager-dashboard-employees", "employees", [
              {
                title: "Nhân viên theo vai trò",
                rows: employeeData.employees.roles.filter((role) => role.role !== "ADMIN"),
              },
              {
                title: "Top nhân viên",
                rows: employeeData.employees.topEmployees.filter((employee) => employee.role !== "ADMIN"),
              },
            ])
          }
          isExportDisabled={!employeeData || employeeQuery.isLoading}
          isRefreshing={employeeQuery.isFetching}
          cinemaOptions={cinemaOptions}
          hideCinemaFilter
        />
        <ScrollableDashboardPanel>
          <EmployeeStats
            data={employeeData?.employees}
            isLoading={employeeQuery.isLoading || (isLoading && !employeeData)}
            detailPath="/employee/manager/staff"
            hiddenRoles={["ADMIN"]}
          />
        </ScrollableDashboardPanel>
      </section>
      )}
    </div>
  );
}
