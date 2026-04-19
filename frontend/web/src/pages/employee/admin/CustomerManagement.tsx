/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import type {
  CustomerFilterParams,
  CustomerType,
  Gender,
} from "@/types/customer";
import { customerService } from "@/services/customer.service";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import {
  customerTypeOptions,
  genderOptions,
} from "@/constants/customer.constants";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/employee/FilterSelect";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ViewModal from "@/components/employee/ViewModal";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";

const CustomerManagement: React.FC = () => {
  const pageSize = 5;

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );
  const [editStatus, setEditStatus] = useState<boolean>(true);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<CustomerFilterParams>({
    fullName: undefined,
    email: undefined,
    phone: undefined,
    gender: undefined,
    status: undefined,
    customerType: undefined,
    minPoints: undefined,
    maxPoints: undefined,
    minTotalSpending: undefined,
    maxTotalSpending: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<CustomerFilterParams>({
    fullName: undefined,
    email: undefined,
    phone: undefined,
    gender: undefined,
    status: undefined,
    customerType: undefined,
    minPoints: undefined,
    maxPoints: undefined,
    minTotalSpending: undefined,
    maxTotalSpending: undefined,
  });

  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );
  };

  const handleFetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await customerService.getAllCustomers(buildParams());

      if (res.success) {
        setCustomers(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Error fetching customers");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      fullName: undefined,
      email: undefined,
      phone: undefined,
      gender: undefined,
      status: undefined,
      customerType: undefined,
      minPoints: undefined,
      maxPoints: undefined,
      minTotalSpending: undefined,
      maxTotalSpending: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const handleView = (customer: any) => {
    setViewData(customer);
    setIsViewOpen(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomerId(customer.id);
    setEditStatus(customer.status);
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
  };

  const handleUpdate = async (customerId: string) => {
    try {
      setLoadingSubmit(true);

      const res = await customerService.updateCustomerStatus(
        customerId,
        editStatus,
      );

      if (res.success) {
        toast.success("Cập nhật thành công");
        setEditingCustomerId(null);
        handleFetchCustomers();
      }
    } catch (err: any) {
      console.log(err);
      toast.error("Lỗi cập nhật!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    handleFetchCustomers();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* FullName */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Nhập họ tên khách hàng
        </label>
        <Input
          placeholder="Nhập họ tên..."
          value={filters.fullName || ""}
          onChange={(e) =>
            setFilters({ ...filters, fullName: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Nhập email khách hàng
        </label>
        <Input
          placeholder="Nhập email..."
          value={filters.email || ""}
          onChange={(e) =>
            setFilters({ ...filters, email: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Nhập số điện thoại khách hàng
        </label>
        <Input
          placeholder="Nhập số điện thoại..."
          value={filters.phone || ""}
          onChange={(e) =>
            setFilters({ ...filters, phone: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Giới tính
        </label>
        <FilterSelect
          placeholder="Tất cả giới tính"
          options={genderOptions.map((item) => item.label)}
          value={
            filters.gender
              ? genderOptions.find((item) => item.value === filters.gender)
                  ?.label
              : "Tất cả"
          }
          onChange={(label) => {
            const selected = genderOptions.find((item) => item.label === label);

            setFilters({
              ...filters,
              gender:
                selected?.value === "ALL"
                  ? undefined
                  : (selected?.value as Gender),
            });
          }}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Trạng thái
        </label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", "Hoạt động", "Bị khóa"]}
          value={
            filters.status === undefined
              ? "Tất cả"
              : filters.status
                ? "Hoạt động"
                : "Bị khóa"
          }
          onChange={(value) => {
            let status;
            if (value === "Tất cả") status = undefined;
            else if (value === "Hoạt động") status = true;
            else status = false;

            setFilters({ ...filters, status });
          }}
        />
      </div>

      {/* Customer type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Loại
        </label>
        <FilterSelect
          placeholder="Tất cả loại"
          options={customerTypeOptions.map((item) => item.label)}
          value={
            filters.customerType
              ? customerTypeOptions.find(
                  (item) => item.value === filters.customerType,
                )?.label
              : "Tất cả"
          }
          onChange={(label) => {
            const selected = customerTypeOptions.find(
              (item) => item.label === label,
            );

            setFilters({
              ...filters,
              customerType:
                selected?.value === "ALL"
                  ? undefined
                  : (selected?.value as CustomerType),
            });
          }}
        />
      </div>

      {/* Min Points */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Điểm từ
        </label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minPoints ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              minPoints: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Max Points */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Điểm đến
        </label>
        <Input
          type="number"
          placeholder="100000"
          value={filters.maxPoints ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxPoints: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Min Total Spending */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Số tiền đã chi từ
        </label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minTotalSpending ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              minTotalSpending: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Max Total Spending */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Số tiền đã chi đến
        </label>
        <Input
          type="number"
          placeholder="100000"
          value={filters.maxTotalSpending ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxTotalSpending: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-end gap-3">
        {" "}
        <Button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer"
          onClick={() => {
            setCurrentPage(1);
            setAppliedFilters(filters);
          }}
          disabled={loading}
        >
          {" "}
          {loading ? "Đang tìm..." : "Tìm kiếm"}{" "}
        </Button>{" "}
        <Button
          variant="outline"
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 transition-all cursor-pointer"
          onClick={handleRefresh}
        >
          {" "}
          Reset{" "}
        </Button>{" "}
      </div>
    </div>
  );

  const productViewFields = [
    {
      key: "id",
      label: "Mã khách hàng",
    },
    {
      key: "fullName",
      label: "Tên khách hàng",
    },
    {
      key: "phone",
      label: "Số điện thoại",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "gender",
      label: "Giới tính",
      render: (val: string) =>
        val === "MALE" ? "Nam" : val === "FEMALE" ? "Nữ" : "Khác",
    },
    {
      key: "dateOfBirth",
      label: "Ngày sinh",
      render: (val: string) => val && new Date(val).toLocaleDateString("vi-VN"),
    },
    {
      key: "loyaltyPoint",
      label: "Điểm thành viên",
      render: (val: number) => val?.toLocaleString("vi-VN"),
    },
    {
      key: "totalSpending",
      label: "Tổng chi tiêu",
      render: (val: number) => val?.toLocaleString("vi-VN") + " ₫",
    },
    {
      key: "customerType",
      label: "Loại khách hàng",
      render: (val: string) =>
        val === "MEMBER" ? "Thành viên" : val === "SILVER" ? "Bạc" : "Vàng",
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (val: string) =>
        val ? new Date(val).toLocaleString("vi-VN") : "-",
    },
    {
      key: "updatedAt",
      label: "Ngày cập nhật",
      render: (val: string) =>
        val ? new Date(val).toLocaleString("vi-VN") : "-",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (val: boolean) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            val ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {val ? "Hoạt động" : "Bị khóa"}
        </span>
      ),
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Khách hàng"
      subtitle="Quản lý thông tin khách hàng và các hoạt động liên quan."
      totalItems={totalItems}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(p) => setCurrentPage(p)}
      filterContent={
        <ManagementFilterBar
          onRefresh={handleRefresh}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterActive={isFilterOpen}
        >
          {FilterContent}
        </ManagementFilterBar>
      }
    >
      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết khách hàng"
        data={viewData}
        fields={productViewFields}
      />

      <ManagementTable
        headers={[
          "Khách hàng",
          "Phone",
          "Email",
          "Điểm thành viên",
          "Tổng chi tiêu",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {customers.map((customer) => (
          <TableRow
            key={customer.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* Customer Info */}
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Membership Avatar */}
                <div
                  className={`relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm
                    ${
                      customer.customerType === "GOLD"
                        ? "bg-linear-to-br from-yellow-200 via-yellow-300 to-yellow-400"
                        : customer.customerType === "SILVER"
                          ? "bg-linear-to-br from-gray-200 via-gray-300 to-gray-400"
                          : "bg-linear-to-br from-blue-200 via-blue-300 to-blue-400"
                    }`}
                >
                  {/* Overlay nhẹ */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

                  {/* Text */}
                  <span className="relative text-[11px] font-extrabold tracking-widest text-white drop-shadow-sm">
                    {customer.customerType === "GOLD" && "GLD"}
                    {customer.customerType === "SILVER" && "SLV"}
                    {customer.customerType === "MEMBER" && "MEM"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  {/* Name */}
                  <p className="font-semibold text-slate-800 leading-tight">
                    {customer.fullName}
                  </p>

                  {/* Gender + Badge */}
                  <div className="flex items-center gap-2 mt-1">
                    {/* Gender */}
                    <span className="text-xs text-slate-400">
                      {customer.gender === "MALE"
                        ? "Nam"
                        : customer.gender === "FEMALE"
                          ? "Nữ"
                          : "Khác"}
                    </span>

                    {/* Dot */}
                    <span className="text-slate-300">•</span>

                    {/* Customer Type Badge */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full
                      ${
                        customer.customerType === "GOLD"
                          ? "bg-yellow-100 text-yellow-700"
                          : customer.customerType === "SILVER"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {customer.customerType === "GOLD" && "Vàng"}
                      {customer.customerType === "SILVER" && "Bạc"}
                      {customer.customerType === "MEMBER" && "Thành viên"}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>

            {/* Phone */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {customer.phone}
            </TableCell>

            {/* Email */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {customer.email}
              </span>
            </TableCell>

            {/* Loyalty Points */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {customer.loyaltyPoint}
              </span>
            </TableCell>

            {/* Total Spent */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {customer.totalSpending.toLocaleString()} đ
              </span>
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              {editingCustomerId == customer.id ? (
                <FilterSelect
                  placeholder="Tất cả trạng thái"
                  options={["Hoạt động", "Bị khóa"]}
                  value={editStatus ? "Hoạt động" : "Bị khóa"}
                  onChange={(value) => {
                    setEditStatus(value === "Hoạt động");
                  }}
                />
              ) : (
                <StatusBadge
                  status={customer.status ? "Hoạt động" : "Bị khóa"}
                  type={customer.status ? "success" : "error"}
                />
              )}
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              {editingCustomerId == customer.id ? (
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(customer.id)}
                    className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm transition-all cursor-pointer"
                    disabled={loadingSubmit}
                  >
                    Cập nhật
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-gray-100 text-gray-700 shadow-sm transition-all cursor-pointer border border-gray-300"
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <TableActions
                  onView={() => handleView(customer)}
                  onEdit={() => handleEdit(customer)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default CustomerManagement;
