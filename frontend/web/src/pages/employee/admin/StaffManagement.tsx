import React, { useEffect, useState } from "react";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import type { EmployeeFilterParams, EmployeeRole } from "@/types/employee";
import { employeeService } from "@/services/employee.service";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/employee/FilterSelect";
import { genderOptions } from "@/constants/customer.constants";
import type { Gender } from "@/types/customer";
import { employeeRoleOptions } from "@/constants/employee.contants";
import { Button } from "@/components/ui/button";

import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ViewModal from "@/components/employee/ViewModal";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import BaseFormModal, {
  type FieldConfig,
} from "@/components/employee/BaseFormModal";
import { TableRow, TableCell } from "@/components/ui/table";
import { cinemaService } from "../../../services/cinema.service";

const StaffManagement: React.FC = () => {
  const pageSize = 5;

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
    role: "MANAGER",
    cinemaId: "C001",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    role: "",
    cinemaId: "",
    status: true,
  });

  const [cinemas, setCinemas] = useState<any[]>([]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<EmployeeFilterParams>({
    id: undefined,
    fullName: undefined,
    email: undefined,
    phone: undefined,
    gender: undefined,
    status: undefined,
    role: undefined,
    cinemaId: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<EmployeeFilterParams>({
    id: undefined,
    fullName: undefined,
    email: undefined,
    phone: undefined,
    gender: undefined,
    status: undefined,
    role: undefined,
    cinemaId: undefined,
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

  const handleFetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await employeeService.getAllEmployees(buildParams());

      if (res.success) {
        setEmployees(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Lỗi khi tải danh sách nhân viên");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCinemas = async () => {
    try {
      const res = await cinemaService.getAllCinemas();
      if (res.success) {
        setCinemas(res.data);
      } else {
        toast.error(res.message || "Lỗi khi tải danh sách rạp");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tải danh sách rạp");
    }
  };

  const handleRefresh = () => {
    const reset = {
      id: undefined,
      fullName: undefined,
      email: undefined,
      phone: undefined,
      gender: undefined,
      status: undefined,
      role: undefined,
      cinemaId: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const handleFormChange = (name: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      role: "MANAGER",
      cinemaId: "C001",
    });
    setErrors({});
    setIsAddOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const res = await employeeService.createEmployee(form);

      if (res.success) {
        toast.success("Thêm nhân viên thành công");
        handleFetchEmployees();

        setForm({
          fullName: "",
          email: "",
          phone: "",
          gender: "MALE",
          dateOfBirth: "",
          role: "MANAGER",
          cinemaId: "C001",
        });
        setIsAddOpen(false);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (!data) {
        toast.error("Server không phản hồi!");
        return;
      }
      if (data.errors) {
        setErrors(data.errors);
        return;
      }

      if (data.message) {
        toast.error(data.message);
        return;
      }

      toast.error("Thiếu thông tin nhân viên!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleView = (employee: any) => {
    setViewData(employee);
    setIsViewOpen(true);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setUpdateForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender,
      dateOfBirth: employee.dateOfBirth,
      role: employee.role,
      cinemaId: employee.cinemaId,
      status: employee.status,
    });

    setIsUpdateOpen(true);
  };

  const handleUpdateFormChange = (name: string, value: any) => {
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const res = await employeeService.updateEmployee(
        selectedEmployee.id,
        updateForm,
      );

      if (res.success) {
        toast.success(res.message || "Cập nhật thành công");
        handleFetchEmployees();
        setIsUpdateOpen(false);
        setSelectedEmployee(null);
      }
    } catch (err: any) {
      const data = err.response?.data;

      if (!data) {
        toast.error("Server không phản hồi!");
        return;
      }

      if (data.errors) {
        setErrors(data.errors);
        return;
      }

      toast.error(data.message || "Lỗi cập nhật!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    handleFetchEmployees();
  }, [currentPage, appliedFilters]);

  useEffect(() => {
    handleFetchCinemas();
  }, []);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          ID Nhân viên
        </label>
        <Input
          placeholder="Nhập id nhân viên..."
          value={filters.id || ""}
          onChange={(e) =>
            setFilters({ ...filters, id: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tên nhân viên
        </label>
        <Input
          placeholder="Nhập tên..."
          value={filters.fullName || ""}
          onChange={(e) =>
            setFilters({ ...filters, fullName: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Email
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

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Số điện thoại
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

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Vai trò
        </label>
        <FilterSelect
          placeholder="Tất cả vai trò"
          options={employeeRoleOptions.map((item) => item.label)}
          value={
            filters.role
              ? employeeRoleOptions.find((item) => item.value === filters.role)
                  ?.label
              : "Tất cả"
          }
          onChange={(label) => {
            const selected = employeeRoleOptions.find(
              (item) => item.label === label,
            );

            setFilters({
              ...filters,
              role:
                selected?.value === "ALL"
                  ? undefined
                  : (selected?.value as EmployeeRole),
            });
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Rạp phim
        </label>
        <FilterSelect
          placeholder="Tất cả rạp"
          options={["Tất cả", ...cinemas.map((st) => st.name)]}
          value={
            cinemas.find((st) => st.id === filters.cinemaId)?.name || "Tất cả"
          }
          onChange={(value) =>
            setFilters({
              ...filters,
              cinemaId:
                value === "Tất cả"
                  ? undefined
                  : cinemas.find((st) => st.name === value)?.id,
            })
          }
        />
      </div>

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

      {/* Actions */}
      <div className="flex items-end gap-3">
        <Button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer"
          onClick={() => {
            setCurrentPage(1);
            setAppliedFilters(filters);
          }}
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
        <Button
          variant="outline"
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 transition-all cursor-pointer"
          onClick={handleRefresh}
        >
          Reset
        </Button>
      </div>
    </div>
  );

  const employeeFields: FieldConfig[] = [
    {
      name: "fullName",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nhập họ và tên...",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "Nhập email...",
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại...",
    },
    {
      name: "dateOfBirth",
      label: "Ngày sinh",
      type: "date",
    },
    {
      name: "gender",
      label: "Giới tính",
      type: "select",
      options: [
        { label: "Nam", value: "MALE" },
        { label: "Nữ", value: "FEMALE" },
        { label: "Khác", value: "OTHER" },
      ],
      placeholder: "Chọn giới tính...",
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      options: [
        { label: "Quản lý", value: "MANAGER" },
        { label: "Nhân viên", value: "STAFF" },
      ],
      placeholder: "Chọn vai trò...",
    },
    {
      name: "cinemaId",
      label: "Rạp phim",
      type: "select",
      options: cinemas.map((st) => ({ label: st.name, value: st.id })),
      placeholder: "Chọn rạp phim...",
    },
  ];

  const employeeUpdateFields: FieldConfig[] = [
    {
      name: "fullName",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nhập họ và tên...",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "Nhập email...",
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại...",
    },
    {
      name: "dateOfBirth",
      label: "Ngày sinh",
      type: "date",
    },
    {
      name: "gender",
      label: "Giới tính",
      type: "select",
      options: [
        { label: "Nam", value: "MALE" },
        { label: "Nữ", value: "FEMALE" },
        { label: "Khác", value: "OTHER" },
      ],
      placeholder: "Chọn giới tính...",
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      options: [
        { label: "Quản lý", value: "MANAGER" },
        { label: "Nhân viên", value: "STAFF" },
      ],
      placeholder: "Chọn vai trò...",
    },
    {
      name: "cinemaId",
      label: "Rạp phim",
      type: "select",
      options: cinemas.map((st) => ({ label: st.name, value: st.id })),
      placeholder: "Chọn rạp phim...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Bị khóa", value: false },
      ],
      placeholder: "Chọn trạng thái...",
    },
  ];

  const employeeViewFields = [
    {
      key: "id",
      label: "ID Nhân viên",
    },
    {
      key: "fullName",
      label: "Họ và tên",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Số điện thoại",
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
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString("vi-VN") : "-",
    },
    {
      key: "role",
      label: "Vai trò",
      render: (val: string) => (val === "MANAGER" ? "Quản lý" : "Nhân viên"),
    },
    {
      key: "cinemaId",
      label: "Rạp phim",
      render: (val: string) => cinemas.find((st) => st.id === val)?.name || "-",
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
      title="Quản lý Nhân viên"
      subtitle="Phân quyền và quản lý tài khoản nhân viên hệ thống."
      onAdd={() => setIsAddOpen(true)}
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
      <BaseFormModal
        mode="add"
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Thêm nhân viên mới"
        fields={employeeFields}
        values={form}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelForm}
        errors={errors}
        loading={loadingSubmit}
      />

      <BaseFormModal
        mode="update"
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        title="Cập nhật nhân viên"
        fields={employeeUpdateFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdate}
        onCancel={() => {
          setIsUpdateOpen(false);
          setSelectedEmployee(null);
        }}
        errors={errors}
        loading={loadingSubmit}
      />

      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết nhân viên"
        data={viewData}
        fields={employeeViewFields}
      />

      <ManagementTable
        headers={[
          "Nhân viên",
          "Vai trò",
          "Email",
          "Số điện thoại",
          "Rạp phim",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {employees.map((employee) => (
          <TableRow
            key={employee.id}
            className="group hover:bg-slate-50/80 transition"
          >
            <TableCell className="px-6 py-4">
              <div className="flex flex-col">
                <p className="font-semibold text-slate-800 leading-tight">
                  {employee.fullName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">
                    {employee.gender === "MALE"
                      ? "Nam"
                      : employee.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell className="px-6 py-4">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  employee.role === "MANAGER"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {employee.role === "MANAGER" ? "Quản lý" : "Nhân viên"}
              </span>
            </TableCell>

            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {employee.email}
            </TableCell>

            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {employee.phone}
            </TableCell>

            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {cinemas.find((st) => st.id === employee.cinemaId)?.name || "-"}
              </span>
            </TableCell>

            <TableCell className="px-6 py-4">
              <StatusBadge
                status={employee.status ? "Hoạt động" : "Bị khóa"}
                type={employee.status ? "success" : "error"}
              />
            </TableCell>

            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(employee)}
                onEdit={() => handleEdit(employee)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default StaffManagement;
