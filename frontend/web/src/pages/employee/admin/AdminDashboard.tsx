/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileSpreadsheet, LayoutDashboard } from "lucide-react";

import { AiChatbotStats } from "@/components/employee/dashboard/AiChatbotStats";
import { DashboardFilter } from "@/components/employee/dashboard/DashboardFilter";
import { DashboardSectionToolbar } from "@/components/employee/dashboard/DashboardSectionToolbar";
import { DashboardTabs } from "@/components/employee/dashboard/DashboardTabs";
import { EmployeeStats } from "@/components/employee/dashboard/EmployeeStats";
import { LoyaltyStats } from "@/components/employee/dashboard/LoyaltyStats";
import { MoviePerformance } from "@/components/employee/dashboard/MoviePerformance";
import { OrderPaymentStats } from "@/components/employee/dashboard/OrderPaymentStats";
import { OverviewStats } from "@/components/employee/dashboard/OverviewStats";
import { ProductStats } from "@/components/employee/dashboard/ProductStats";
import { PromotionStats } from "@/components/employee/dashboard/PromotionStats";
import { RevenueChart } from "@/components/employee/dashboard/RevenueChart";
import { ReviewStats } from "@/components/employee/dashboard/ReviewStats";
import { ShowScheduleOverview } from "@/components/employee/dashboard/ShowScheduleOverview";
import { Button } from "@/components/ui/button";
import { cinemaService } from "@/services/cinema.service";
import { dashboardService } from "@/services/dashboard.service";
import type {
  AdminDashboardData,
  DashboardFilterState,
  DashboardRange,
  DashboardSectionKey,
  OverviewMetric,
} from "@/types/dashboard";

type SectionFilters = Record<DashboardSectionKey, DashboardFilterState>;
type AdminDashboardTabKey = "finance" | "movies" | "customers" | "operations" | "ai";

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
    <div
      className="max-w-full overflow-auto rounded-lg"
      style={{ maxHeight }}
    >
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

const detailRoutes = {
  orders: "/employee/admin/orders",
  movies: "/employee/admin/movies",
  schedules: "/employee/admin/schedules",
  customers: "/employee/admin/customers",
  products: "/employee/admin/products",
  promotions: "/employee/admin/promotions",
  reviews: "/employee/admin/reviews",
  staff: "/employee/admin/staff",
  ai: "/employee/admin/ai",
  dashboard: "/employee/admin/dashboard",
};

const fallbackCinemaOptions = [
  { id: "C001", label: "Alpha Quận 1" },
  { id: "C002", label: "Alpha Thủ Đức" },
  { id: "C003", label: "Alpha Gò Vấp" },
  { id: "C004", label: "Alpha Quận 7" },
];

const rangeLabels: Record<DashboardRange, string> = {
  week: "Tuần",
  month: "Tháng",
  year: "Năm",
  "all-time": "Toàn thời gian",
};

const metricDetailPath = (metric: OverviewMetric) => {
  if (metric.id.includes("promotion")) return detailRoutes.promotions;
  if (metric.id.includes("revenue") || metric.id.includes("order")) return detailRoutes.orders;
  if (metric.id.includes("ticket") || metric.id.includes("schedule") || metric.id.includes("seat")) {
    return detailRoutes.schedules;
  }
  if (metric.id.includes("user")) return detailRoutes.customers;
  return detailRoutes.dashboard;
};

const createSectionFilters = (filters: DashboardFilterState): SectionFilters => ({
  revenue: { ...filters },
  customers: { ...filters },
  employees: { ...filters },
  reviews: { ...filters },
  movies: { ...filters },
  products: { ...filters },
  schedules: { ...filters },
  orders: { ...filters },
  promotions: { ...filters },
});

const adminDashboardTabs = [
  { value: "finance", label: "Tài chính" },
  { value: "movies", label: "Phim & suất chiếu" },
  { value: "customers", label: "Khách hàng" },
  { value: "operations", label: "Vận hành" },
  { value: "ai", label: "AI" },
] satisfies { value: AdminDashboardTabKey; label: string }[];

const adminTabSections: Record<AdminDashboardTabKey, DashboardSectionKey[]> = {
  finance: ["revenue", "orders"],
  movies: ["movies", "schedules"],
  customers: ["customers", "reviews"],
  operations: ["products", "employees", "promotions"],
  ai: [],
};

const getWeekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);

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

const filterRows = (filters: DashboardFilterState, cinemaLabel: string) => [
  {
    "Khoảng thời gian": rangeLabels[filters.range],
    "Năm": filters.year,
    "Tháng": filters.month,
    "Tuần": filters.week,
    "Rạp": cinemaLabel,
  },
];

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
  downloadExcelReport("admin-dashboard-report", [
    { title: "Bộ lọc tổng", rows: filterRows(filters, cinemaLabel) },
    { title: "Tổng quan", rows: overviewRows(data) },
    { title: "Doanh thu theo kỳ", rows: data.revenue.series },
    { title: "Top phim theo doanh thu", rows: data.movies.topRevenue },
    { title: "Top phim theo vé bán", rows: data.movies.topTickets },
    { title: "Suất chiếu", rows: data.schedules },
    { title: "Trạng thái đơn hàng", rows: [data.orders.statuses] },
    { title: "Phương thức thanh toán", rows: data.orders.paymentMethods },
    { title: "Đơn gần đây", rows: data.orders.recentOrders },
    { title: "Hạng khách hàng", rows: data.loyalty.tiers },
    { title: "Top khách hàng", rows: data.loyalty.topCustomers },
    { title: "Đánh giá gần đây", rows: data.reviews.recentReviews },
    { title: "Phân bổ đánh giá", rows: data.reviews.ratingDistribution },
    { title: "Top sản phẩm", rows: data.products.topProducts },
    { title: "Sản phẩm sắp hết hàng", rows: data.products.lowStockProducts },
    { title: "Trạng thái khuyến mãi", rows: [data.promotions.statuses] },
    { title: "Top khuyến mãi", rows: data.promotions.topPromotions },
    { title: "Nhân viên theo vai trò", rows: data.employees.roles },
    { title: "Top nhân viên", rows: data.employees.topEmployees },
  ]);
};

const useDashboardSectionData = (
  sectionKey: DashboardSectionKey,
  filters: DashboardFilterState,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["admin-dashboard-section", sectionKey, filters],
    queryFn: () => dashboardService.getAdminDashboardSection(sectionKey, filters),
    enabled,
  });

const AdminDashboard = () => {
  const now = useMemo(() => new Date(), []);
  const initialFilters = useMemo<DashboardFilterState>(
    () => ({
      range: "week",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      week: getWeekOfMonth(now),
    }),
    [now],
  );
  const [filters, setFilters] = useState<DashboardFilterState>(initialFilters);
  const [sectionFilters, setSectionFilters] = useState<SectionFilters>(() =>
    createSectionFilters(initialFilters),
  );
  const [activeTab, setActiveTab] = useState<AdminDashboardTabKey>("finance");

  const { data: cinemaOptionsData, isLoading: isCinemaLoading } = useQuery({
    queryKey: ["dashboard-cinema-options"],
    queryFn: cinemaService.getCinemaOptions,
  });

  const {
    data: dashboardData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard", filters],
    queryFn: () => dashboardService.getAdminDashboard(filters),
  });

  const activeSections = adminTabSections[activeTab];
  const shouldFetchSection = (sectionKey: DashboardSectionKey) =>
    activeSections.includes(sectionKey) && !sameFilters(sectionFilters[sectionKey], filters);

  const revenueQuery = useDashboardSectionData("revenue", sectionFilters.revenue, shouldFetchSection("revenue"));
  const customerQuery = useDashboardSectionData("customers", sectionFilters.customers, shouldFetchSection("customers"));
  const employeeQuery = useDashboardSectionData("employees", sectionFilters.employees, shouldFetchSection("employees"));
  const reviewQuery = useDashboardSectionData("reviews", sectionFilters.reviews, shouldFetchSection("reviews"));
  const movieQuery = useDashboardSectionData("movies", sectionFilters.movies, shouldFetchSection("movies"));
  const productQuery = useDashboardSectionData("products", sectionFilters.products, shouldFetchSection("products"));
  const scheduleQuery = useDashboardSectionData("schedules", sectionFilters.schedules, shouldFetchSection("schedules"));
  const orderQuery = useDashboardSectionData("orders", sectionFilters.orders, shouldFetchSection("orders"));
  const promotionQuery = useDashboardSectionData(
    "promotions",
    sectionFilters.promotions,
    shouldFetchSection("promotions"),
  );
  const sectionKeys: DashboardSectionKey[] = [
    "revenue",
    "customers",
    "employees",
    "reviews",
    "movies",
    "products",
    "schedules",
    "orders",
    "promotions",
  ];
  const sectionQueries = [
    revenueQuery,
    customerQuery,
    employeeQuery,
    reviewQuery,
    movieQuery,
    productQuery,
    scheduleQuery,
    orderQuery,
    promotionQuery,
  ];
  const activeSectionQueries = sectionQueries.filter((_, index) => shouldFetchSection(sectionKeys[index]));
  const isAnyDashboardFetching = isFetching || activeSectionQueries.some((query) => query.isFetching);

  const revenueData = revenueQuery.data ?? dashboardData;
  const customerData = customerQuery.data ?? dashboardData;
  const employeeData = employeeQuery.data ?? dashboardData;
  const reviewData = reviewQuery.data ?? dashboardData;
  const movieData = movieQuery.data ?? dashboardData;
  const productData = productQuery.data ?? dashboardData;
  const scheduleData = scheduleQuery.data ?? dashboardData;
  const orderData = orderQuery.data ?? dashboardData;
  const promotionData = promotionQuery.data ?? dashboardData;

  const cinemaOptions = useMemo(() => {
    const options = cinemaOptionsData?.data ?? [];
    const normalized = options
      .map((cinema: any) => ({
        id: cinema.id ?? cinema.value ?? cinema.cinemaId,
        label: cinema.label ?? cinema.name ?? cinema.cinemaName,
      }))
      .filter((cinema: { id?: string; label?: string }) => cinema.id && cinema.label);

    return normalized.length ? normalized : fallbackCinemaOptions;
  }, [cinemaOptionsData]);

  const getCinemaLabel = (filterValue: DashboardFilterState) =>
    cinemaOptions.find((cinema: { id: string; label: string }) => cinema.id === filterValue.cinemaId)?.label ??
    "Tất cả rạp";

  const handleGlobalFilterChange = (nextFilters: DashboardFilterState) => {
    setFilters(nextFilters);
    setSectionFilters(createSectionFilters(nextFilters));
  };

  const handleSectionFilterChange = (
    sectionKey: DashboardSectionKey,
    nextFilters: DashboardFilterState,
  ) => {
    setSectionFilters((current) => ({
      ...current,
      [sectionKey]: nextFilters,
    }));
  };

  const handleGlobalRefresh = () => {
    void refetch();
    activeSectionQueries.forEach((query) => {
      void query.refetch();
    });
  };

  const refreshSection = (sectionKey: DashboardSectionKey, refetchSection: () => unknown) => {
    if (sameFilters(sectionFilters[sectionKey], filters)) {
      void refetch();
      return;
    }

    void refetchSection();
  };

  const exportSection = (
    title: string,
    fileSlug: string,
    sectionKey: DashboardSectionKey,
    sections: { title: string; rows: object[] }[],
  ) => {
    const sectionFilter = sectionFilters[sectionKey];
    downloadExcelReport(fileSlug, [
      { title: `Bộ lọc ${title}`, rows: filterRows(sectionFilter, getCinemaLabel(sectionFilter)) },
      ...sections,
    ]);
  };

  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-6 scroll-auto">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-sky-600">
            <LayoutDashboard size={16} />
            Cinema operations
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
            Bảng điều khiển quản trị
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thống kê khách hàng, nhân viên, đánh giá, phim, sản phẩm, suất chiếu,
            đơn hàng và khuyến mãi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              dashboardData &&
              exportFullDashboardReport(dashboardData, filters, getCinemaLabel(filters))
            }
            disabled={!dashboardData || isLoading}
          >
            <FileSpreadsheet size={16} />
            Xuất Excel tổng
          </Button>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Hôm nay: {todayLabel}
          </div>
        </div>
      </div>

      <DashboardFilter
        value={filters}
        onChange={handleGlobalFilterChange}
        onRefresh={handleGlobalRefresh}
        isRefreshing={isAnyDashboardFetching}
        cinemaOptions={cinemaOptions}
        isCinemaLoading={isCinemaLoading}
      />

      {isError && (
        <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={16} />
            Không thể tải dữ liệu dashboard. Vui lòng thử lại.
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Tải lại
          </Button>
        </div>
      )}

      <OverviewStats
        metrics={dashboardData?.overview ?? []}
        isLoading={isLoading}
        getDetailPath={metricDetailPath}
      />

      <DashboardTabs
        tabs={adminDashboardTabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "finance" && (
      <>
      <div className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Doanh thu"
          value={sectionFilters.revenue}
          onChange={(next) => handleSectionFilterChange("revenue", next)}
          onRefresh={() => refreshSection("revenue", revenueQuery.refetch)}
          onExport={() =>
            revenueData &&
            exportSection("doanh thu", "dashboard-revenue", "revenue", [
              { title: "Tóm tắt doanh thu", rows: [{
                "Doanh thu": revenueData.revenue.totalRevenue,
                "Vé bán": revenueData.revenue.totalTickets,
                "Sản phẩm": revenueData.revenue.totalProducts,
              }] }
            ])
          }
          isExportDisabled={!revenueData || revenueQuery.isLoading}
          isRefreshing={revenueQuery.isFetching}
          cinemaOptions={cinemaOptions}
          isCinemaLoading={isCinemaLoading}
        />
        <ScrollableDashboardPanel minWidth="760px" maxHeight="620px">
          <RevenueChart
            data={revenueData?.revenue}
            isLoading={revenueQuery.isLoading || (isLoading && !revenueData)}
            detailPath={detailRoutes.orders}
          />
        </ScrollableDashboardPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-5">
          <DashboardSectionToolbar
            title="Lọc riêng: Đơn hàng"
            value={sectionFilters.orders}
            onChange={(next) => handleSectionFilterChange("orders", next)}
            onRefresh={() => refreshSection("orders", orderQuery.refetch)}
            onExport={() =>
              orderData &&
              exportSection("đơn hàng", "dashboard-orders", "orders", [
                { title: "Trạng thái đơn hàng", rows: [orderData.orders.statuses] },
                { title: "Phương thức thanh toán", rows: orderData.orders.paymentMethods },
                { title: "Đơn gần đây", rows: orderData.orders.recentOrders },
              ])
            }
            isExportDisabled={!orderData || orderQuery.isLoading}
            isRefreshing={orderQuery.isFetching}
            cinemaOptions={cinemaOptions}
            isCinemaLoading={isCinemaLoading}
          />
          <ScrollableDashboardPanel minWidth="820px" maxHeight="700px">
            <OrderPaymentStats
              data={orderData?.orders}
              isLoading={orderQuery.isLoading || (isLoading && !orderData)}
              detailPath={detailRoutes.orders}
            />
          </ScrollableDashboardPanel>
        </div>
      </div>
      </>
      )}

      {activeTab === "movies" && (
      <>
      <div className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Phim"
          value={sectionFilters.movies}
          onChange={(next) => handleSectionFilterChange("movies", next)}
          onRefresh={() => refreshSection("movies", movieQuery.refetch)}
          onExport={() =>
            movieData &&
            exportSection("phim", "dashboard-movies", "movies", [
              { title: "Tóm tắt phim", rows: [{
                "Đang chiếu": movieData.movies.nowShowing,
                "Sắp chiếu": movieData.movies.comingSoon,
              }] },
              { title: "Top phim theo doanh thu", rows: movieData.movies.topRevenue },
              { title: "Top phim theo vé bán", rows: movieData.movies.topTickets },
            ])
          }
          isExportDisabled={!movieData || movieQuery.isLoading}
          isRefreshing={movieQuery.isFetching}
          cinemaOptions={cinemaOptions}
          isCinemaLoading={isCinemaLoading}
        />
        <ScrollableDashboardPanel minWidth="760px" maxHeight="720px">
          <MoviePerformance
            data={movieData?.movies}
            isLoading={movieQuery.isLoading || (isLoading && !movieData)}
            detailPath={detailRoutes.movies}
          />
        </ScrollableDashboardPanel>
      </div>

      <div className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Suất chiếu"
          value={sectionFilters.schedules}
          onChange={(next) => handleSectionFilterChange("schedules", next)}
          onRefresh={() => refreshSection("schedules", scheduleQuery.refetch)}
          onExport={() =>
            scheduleData &&
            exportSection("suất chiếu", "dashboard-schedules", "schedules", [
              { title: "Suất chiếu", rows: scheduleData.schedules },
            ])
          }
          isExportDisabled={!scheduleData || scheduleQuery.isLoading}
          isRefreshing={scheduleQuery.isFetching}
          cinemaOptions={cinemaOptions}
          isCinemaLoading={isCinemaLoading}
        />
        <ScrollableDashboardPanel minWidth="520px" maxHeight="640px">
          <ShowScheduleOverview
            schedules={scheduleData?.schedules ?? []}
            isLoading={scheduleQuery.isLoading || (isLoading && !scheduleData)}
            detailPath={detailRoutes.schedules}
          />
        </ScrollableDashboardPanel>
      </div>
      </>
      )}

      {activeTab === "customers" && (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Khách hàng"
            value={sectionFilters.customers}
            onChange={(next) => handleSectionFilterChange("customers", next)}
            onRefresh={() => refreshSection("customers", customerQuery.refetch)}
            onExport={() =>
              customerData &&
              exportSection("khách hàng", "dashboard-customers", "customers", [
                { title: "Hạng khách hàng", rows: customerData.loyalty.tiers },
                { title: "Top khách hàng", rows: customerData.loyalty.topCustomers },
              ])
            }
            isExportDisabled={!customerData || customerQuery.isLoading}
            isRefreshing={customerQuery.isFetching}
            cinemaOptions={cinemaOptions}
            isCinemaLoading={isCinemaLoading}
          />
          <ScrollableDashboardPanel minWidth="560px" maxHeight="640px">
            <LoyaltyStats
              data={customerData?.loyalty}
              isLoading={customerQuery.isLoading || (isLoading && !customerData)}
              detailPath={detailRoutes.customers}
            />
          </ScrollableDashboardPanel>
        </div>

        <div className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Đánh giá"
            value={sectionFilters.reviews}
            onChange={(next) => handleSectionFilterChange("reviews", next)}
            onRefresh={() => refreshSection("reviews", reviewQuery.refetch)}
            onExport={() =>
              reviewData &&
              exportSection("đánh giá", "dashboard-reviews", "reviews", [
                { title: "Tóm tắt đánh giá", rows: [{
                  "Điểm trung bình": reviewData.reviews.averageRating,
                  "Tổng đánh giá": reviewData.reviews.totalReviews,
                  "Chờ xử lý": reviewData.reviews.pendingReviews,
                  "Đã xử lý": reviewData.reviews.resolvedReviews,
                }] },
                { title: "Phân bổ đánh giá", rows: reviewData.reviews.ratingDistribution },
                { title: "Đánh giá gần đây", rows: reviewData.reviews.recentReviews },
              ])
            }
            isExportDisabled={!reviewData || reviewQuery.isLoading}
            isRefreshing={reviewQuery.isFetching}
            cinemaOptions={cinemaOptions}
            isCinemaLoading={isCinemaLoading}
          />
          <ScrollableDashboardPanel minWidth="560px" maxHeight="640px">
            <ReviewStats
              data={reviewData?.reviews}
              isLoading={reviewQuery.isLoading || (isLoading && !reviewData)}
              detailPath={detailRoutes.reviews}
            />
          </ScrollableDashboardPanel>
        </div>
      </div>
      )}

      {activeTab === "operations" && (
      <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Sản phẩm"
            value={sectionFilters.products}
            onChange={(next) => handleSectionFilterChange("products", next)}
            onRefresh={() => refreshSection("products", productQuery.refetch)}
            onExport={() =>
              productData &&
              exportSection("sản phẩm", "dashboard-products", "products", [
                { title: "Tóm tắt sản phẩm", rows: [{
                  "Doanh thu": productData.products.totalRevenue,
                  "Đã bán": productData.products.itemsSold,
                  "Attach rate": productData.products.comboAttachRate,
                }] },
                { title: "Top sản phẩm", rows: productData.products.topProducts },
                { title: "Sản phẩm sắp hết hàng", rows: productData.products.lowStockProducts },
              ])
            }
            isExportDisabled={!productData || productQuery.isLoading}
            isRefreshing={productQuery.isFetching}
            cinemaOptions={cinemaOptions}
            isCinemaLoading={isCinemaLoading}
          />
          <ScrollableDashboardPanel minWidth="560px" maxHeight="640px">
            <ProductStats
              data={productData?.products}
              isLoading={productQuery.isLoading || (isLoading && !productData)}
              detailPath={detailRoutes.products}
            />
          </ScrollableDashboardPanel>
        </div>

        <div className="space-y-3">
          <DashboardSectionToolbar
            title="Lọc riêng: Nhân viên"
            value={sectionFilters.employees}
            onChange={(next) => handleSectionFilterChange("employees", next)}
            onRefresh={() => refreshSection("employees", employeeQuery.refetch)}
            onExport={() =>
              employeeData &&
              exportSection("nhân viên", "dashboard-employees", "employees", [
                { title: "Tóm tắt nhân viên", rows: [{
                  "Tổng nhân viên": employeeData.employees.totalEmployees,
                  "Đang hoạt động": employeeData.employees.activeEmployees,
                  "Tạm nghỉ": employeeData.employees.inactiveEmployees,
                }] },
                { title: "Nhân viên theo vai trò", rows: employeeData.employees.roles },
                { title: "Top nhân viên", rows: employeeData.employees.topEmployees },
              ])
            }
            isExportDisabled={!employeeData || employeeQuery.isLoading}
            isRefreshing={employeeQuery.isFetching}
            cinemaOptions={cinemaOptions}
            isCinemaLoading={isCinemaLoading}
          />
          <ScrollableDashboardPanel minWidth="560px" maxHeight="640px">
            <EmployeeStats
              data={employeeData?.employees}
              isLoading={employeeQuery.isLoading || (isLoading && !employeeData)}
              detailPath={detailRoutes.staff}
            />
          </ScrollableDashboardPanel>
        </div>
      </div>

      <div className="space-y-3">
        <DashboardSectionToolbar
          title="Lọc riêng: Khuyến mãi"
          value={sectionFilters.promotions}
          onChange={(next) => handleSectionFilterChange("promotions", next)}
          onRefresh={() => refreshSection("promotions", promotionQuery.refetch)}
          onExport={() =>
            promotionData &&
            exportSection("khuyến mãi", "dashboard-promotions", "promotions", [
              { title: "Tóm tắt khuyến mãi", rows: [{
                "Tổng khuyến mãi": promotionData.promotions.totalPromotions,
                "Lượt áp dụng": promotionData.promotions.ordersApplied,
                "Tổng giảm": promotionData.promotions.totalDiscountValue,
                "Giảm trung bình": promotionData.promotions.averageDiscountValue,
              }] },
              { title: "Trạng thái khuyến mãi", rows: [promotionData.promotions.statuses] },
              { title: "Top khuyến mãi", rows: promotionData.promotions.topPromotions },
            ])
          }
          isExportDisabled={!promotionData || promotionQuery.isLoading}
          isRefreshing={promotionQuery.isFetching}
          cinemaOptions={cinemaOptions}
          isCinemaLoading={isCinemaLoading}
        />
        <ScrollableDashboardPanel minWidth="760px" maxHeight="640px">
          <PromotionStats
            data={promotionData?.promotions}
            isLoading={promotionQuery.isLoading || (isLoading && !promotionData)}
            detailPath={detailRoutes.promotions}
          />
        </ScrollableDashboardPanel>
      </div>
      </>
      )}

      {/*
        AI chatbot stats sẽ làm sau theo yêu cầu.
        <AiChatbotStats data={dashboardData?.ai} isLoading={isLoading} detailPath={detailRoutes.customers} />
      */}
      {activeTab === "ai" && (
      <ScrollableDashboardPanel minWidth="760px" maxHeight="760px">
        <AiChatbotStats
          data={dashboardData?.ai}
          isLoading={isLoading}
          detailPath={detailRoutes.ai}
        />
      </ScrollableDashboardPanel>
      )}
    </div>
  );
};

export default AdminDashboard;
