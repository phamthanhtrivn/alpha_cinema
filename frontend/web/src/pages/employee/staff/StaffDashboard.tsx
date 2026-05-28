/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, LayoutDashboard } from "lucide-react";

import { DashboardFilter } from "@/components/employee/dashboard/DashboardFilter";
import { DashboardSectionToolbar } from "@/components/employee/dashboard/DashboardSectionToolbar";
import { DashboardTabs } from "@/components/employee/dashboard/DashboardTabs";
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

type StaffSectionKey = "revenue" | "orders" | "products" | "movies" | "schedules";
type StaffSectionFilters = Record<StaffSectionKey, DashboardFilterState>;
type StaffDashboardTabKey = "sales" | "products" | "movies";

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
  "all-time": "Tất cả thời gian",
};

const staffMetricPath = (metric: OverviewMetric) => {
  if (metric.id.includes("schedule") || metric.id.includes("ticket")) return "/employee/staff/movies";
  return "/employee/staff/sell";
};

const createStaffSectionFilters = (
  filters: DashboardFilterState,
  cinemaId: string,
): StaffSectionFilters => ({
  revenue: { ...filters, cinemaId },
  orders: { ...filters, cinemaId },
  products: { ...filters, cinemaId },
  movies: { ...filters, cinemaId },
  schedules: { ...filters, cinemaId },
});

const staffDashboardTabs = [
  { value: "sales", label: "Doanh số" },
  { value: "products", label: "Sản phẩm" },
  { value: "movies", label: "Phim & suất chiếu" },
] satisfies { value: StaffDashboardTabKey; label: string }[];

const staffTabSections: Record<StaffDashboardTabKey, StaffSectionKey[]> = {
  sales: ["revenue", "orders"],
  products: ["products"],
  movies: ["movies", "schedules"],
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

const filterRows = (
  filters: DashboardFilterState,
  cinemaLabel: string,
  employeeName: string,
) => [
  {
    "Khoang thoi gian": rangeLabels[filters.range],
    Nam: filters.year,
    Thang: filters.month,
    Tuan: filters.week,
    Rap: cinemaLabel,
    "Nhan vien": employeeName,
  },
];

const overviewRows = (data: AdminDashboardData) =>
  data.overview.map((metric) => ({
    "Chi so": metric.title,
    "Gia tri": metric.value,
    "Dinh dang": metric.format,
    "Xu huong": metric.trend ? `${metric.trend.value}% ${metric.trend.label}` : "",
  }));

const exportFullDashboardReport = (
  data: AdminDashboardData,
  filters: DashboardFilterState,
  cinemaLabel: string,
  employeeName: string,
) => {
  downloadExcelReport("staff-dashboard-report", [
    { title: "Bộ lọc tổng", rows: filterRows(filters, cinemaLabel, employeeName) },
    { title: "Tổng quan", rows: overviewRows(data) },
    { title: "Doanh thu theo kỳ", rows: data.revenue.series },
    { title: "Trạng thái đơn hàng", rows: [data.orders.statuses] },
    { title: "Phương thức thanh toán", rows: data.orders.paymentMethods },
    { title: "Đơn gần đây", rows: data.orders.recentOrders },
    { title: "Top sản phẩm", rows: data.products.topProducts },
    { title: "Top phim theo doanh thu", rows: data.movies.topRevenue },
    { title: "Top phim theo vé bán", rows: data.movies.topTickets },
    { title: "Suất chiếu", rows: data.schedules },
  ]);
};

const useStaffSectionData = (
  sectionKey: StaffSectionKey,
  filters: DashboardFilterState,
  cinemaId: string,
  employeeId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["staff-dashboard-section", sectionKey, filters, employeeId],
    queryFn: () => dashboardService.getStaffDashboard({ ...filters, cinemaId }, employeeId),
    enabled: Boolean(cinemaId && employeeId) && enabled,
  });

export default function StaffDashboard() {
  const auth = useSelector(selectAuth);
  const now = useMemo(() => new Date(), []);
  const cinemaId = auth.cinemaId || auth.user?.cinemaId || "";
  const employeeId = auth.user?.id || auth.user?.userId || auth.user?.employeeId || "";
  const employeeName = auth.user?.fullName || auth.user?.name || employeeId || "Nhan vien";
  const cinemaLabel = auth.user?.cinemaName || auth.user?.cinema?.name || cinemaId || "Rap hien tai";
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
  const [sectionFilters, setSectionFilters] = useState<StaffSectionFilters>(
    createStaffSectionFilters(initialFilters, cinemaId),
  );
  const [activeTab, setActiveTab] = useState<StaffDashboardTabKey>("sales");

  useEffect(() => {
    if (!cinemaId) return;
    setFilters((current) => ({ ...current, cinemaId }));
    setSectionFilters((current) => ({
      revenue: { ...current.revenue, cinemaId },
      orders: { ...current.orders, cinemaId },
      products: { ...current.products, cinemaId },
      movies: { ...current.movies, cinemaId },
      schedules: { ...current.schedules, cinemaId },
    }));
  }, [cinemaId]);

  const scopedFilters = { ...filters, cinemaId };
  const activeSections = staffTabSections[activeTab];
  const shouldFetchSection = (sectionKey: StaffSectionKey) =>
    activeSections.includes(sectionKey) && !sameFilters(sectionFilters[sectionKey], scopedFilters);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["staff-dashboard", scopedFilters, employeeId],
    queryFn: () => dashboardService.getStaffDashboard(scopedFilters, employeeId),
    enabled: Boolean(cinemaId && employeeId),
  });

  const revenueQuery = useStaffSectionData(
    "revenue",
    sectionFilters.revenue,
    cinemaId,
    employeeId,
    shouldFetchSection("revenue"),
  );
  const orderQuery = useStaffSectionData(
    "orders",
    sectionFilters.orders,
    cinemaId,
    employeeId,
    shouldFetchSection("orders"),
  );
  const productQuery = useStaffSectionData(
    "products",
    sectionFilters.products,
    cinemaId,
    employeeId,
    shouldFetchSection("products"),
  );
  const movieQuery = useStaffSectionData(
    "movies",
    sectionFilters.movies,
    cinemaId,
    employeeId,
    shouldFetchSection("movies"),
  );
  const scheduleQuery = useStaffSectionData(
    "schedules",
    sectionFilters.schedules,
    cinemaId,
    employeeId,
    shouldFetchSection("schedules"),
  );
  const sectionKeys: StaffSectionKey[] = ["revenue", "orders", "products", "movies", "schedules"];
  const sectionQueries = [revenueQuery, orderQuery, productQuery, movieQuery, scheduleQuery];
  const activeSectionQueries = sectionQueries.filter((_, index) => shouldFetchSection(sectionKeys[index]));
  const hasActiveSectionError = activeSectionQueries.some((query) => query.isError);

  const revenueData = revenueQuery.data ?? data;
  const orderData = orderQuery.data ?? data;
  const productData = productQuery.data ?? data;
  const movieData = movieQuery.data ?? data;
  const scheduleData = scheduleQuery.data ?? data;

  const overview = (data?.overview ?? []).filter(
    (metric) =>
      metric.id.includes("revenue") ||
      metric.id.includes("ticket") ||
      metric.id.includes("order") ||
      metric.id.includes("schedule"),
  );

  const cinemaOptions = [{ id: cinemaId || "N/A", label: cinemaLabel }];

  const handleGlobalFilterChange = (next: DashboardFilterState) => {
    const scoped = { ...next, cinemaId };
    setFilters(scoped);
    setSectionFilters(createStaffSectionFilters(scoped, cinemaId));
  };

  const refreshAll = () => {
    void Promise.all([refetch(), ...activeSectionQueries.map((query) => query.refetch())]);
  };

  const refreshSection = (sectionKey: StaffSectionKey, refetchSection: () => unknown) => {
    if (sameFilters(sectionFilters[sectionKey], scopedFilters)) {
      void refetch();
      return;
    }

    void refetchSection();
  };

  const updateSectionFilters = (sectionKey: StaffSectionKey, next: DashboardFilterState) => {
    setSectionFilters((current) => ({
      ...current,
      [sectionKey]: { ...next, cinemaId },
    }));
  };

  const exportSection = (
    title: string,
    fileSlug: string,
    sectionKey: StaffSectionKey,
    sections: { title: string; rows: object[] }[],
  ) => {
    downloadExcelReport(fileSlug, [
      { title: `Bo loc ${title}`, rows: filterRows(sectionFilters[sectionKey], cinemaLabel, employeeName) },
      ...sections,
    ]);
  };

  if (!cinemaId || !employeeId) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-sky-600">
            <LayoutDashboard size={16} />
            Dashboard nhân viên
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hiệu suất ca làm việc</h1>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="text-base font-black">Thiếu thông tin nhân viên</h2>
          <p className="mt-2 text-sm font-medium">
            Không tìm thấy mã rạp hoặc mã nhân viên trong phiên đăng nhập. Vui lòng đăng nhập lại để tải dashboard đúng dữ liệu.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            onClick={() => window.location.reload()}
          >
            Tải lại phiên
          </Button>
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-sky-600">
            <LayoutDashboard size={16} />
            Dashboard nhân viên
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hiệu suất ca làm việc</h1>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <h2 className="text-base font-black">Không thể tải dữ liệu dashboard</h2>
          <p className="mt-2 text-sm font-medium">
            Hệ thống không thể tải dữ liệu cho dashboard nhân viên. Vui lòng kiểm tra server hoặc thử tải lại.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-red-300 bg-white text-red-900 hover:bg-red-100"
            onClick={() => void refetch()}
          >
            Tải lại dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-sky-600">
            <LayoutDashboard size={16} />
            Dashboard nhân viên
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hiệu suất ca làm việc</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => data && exportFullDashboardReport(data, scopedFilters, cinemaLabel, employeeName)}
          disabled={!data || isLoading}
        >
          <FileSpreadsheet size={16} />
          Excel tổng
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

      {hasActiveSectionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          Không thể tải dữ liệu theo bộ lọc riêng. Dashboard đang giữ dữ liệu thật gần nhất, không dùng dữ liệu giả.
        </div>
      )}

      <OverviewStats metrics={overview} isLoading={isLoading} getDetailPath={staffMetricPath} />

      <DashboardTabs
        tabs={staffDashboardTabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "sales" && (
      <>
      <section className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Doanh thu"
          value={sectionFilters.revenue}
          onChange={(next) => updateSectionFilters("revenue", next)}
          onRefresh={() => refreshSection("revenue", revenueQuery.refetch)}
          onExport={() =>
            revenueData &&
            exportSection("doanh thu", "staff-dashboard-revenue", "revenue", [
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
            detailPath="/employee/staff/sell"
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
            exportSection("don hang", "staff-dashboard-orders", "orders", [
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
          />
        </ScrollableDashboardPanel>
      </section>
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
              exportSection("san pham", "staff-dashboard-products", "products", [
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

      {activeTab === "movies" && (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Suất chiếu"
            value={sectionFilters.schedules}
            onChange={(next) => updateSectionFilters("schedules", next)}
            onRefresh={() => refreshSection("schedules", scheduleQuery.refetch)}
            onExport={() =>
              scheduleData &&
              exportSection("suat chieu", "staff-dashboard-schedules", "schedules", [
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
              detailPath="/employee/staff/movies"
            />
          </ScrollableDashboardPanel>
        </section>

        <section className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Phim gợi ý"
            value={sectionFilters.movies}
            onChange={(next) => updateSectionFilters("movies", next)}
            onRefresh={() => refreshSection("movies", movieQuery.refetch)}
            onExport={() =>
              movieData &&
              exportSection("phim", "staff-dashboard-movies", "movies", [
                { title: "Top doanh thu", rows: movieData.movies.topRevenue },
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
              detailPath="/employee/staff/movies"
            />
          </ScrollableDashboardPanel>
        </section>
      </div>
      )}
    </div>
  );
}
