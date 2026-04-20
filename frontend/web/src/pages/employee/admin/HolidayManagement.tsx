/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type { HolidayFilterParams } from "@/types/holiday";
import { ticketService } from "@/services/ticket.service";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/employee/FilterSelect";
import type { FieldConfig } from "@/components/employee/BaseFormModal";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import BaseFormModal from "@/components/employee/BaseFormModal";
import ManagementTable from "@/components/employee/ManagementTable";
import ViewModal from "@/components/employee/ViewModal";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";

const HolidayManagement: React.FC = () => {
  const pageSize = 5;

  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    status: true,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<HolidayFilterParams>({
    id: undefined,
    name: undefined,
    startDateFrom: undefined,
    startDateTo: undefined,
    endDateFrom: undefined,
    endDateTo: undefined,
    status: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<HolidayFilterParams>({
    id: undefined,
    name: undefined,
    startDateFrom: undefined,
    startDateTo: undefined,
    endDateFrom: undefined,
    endDateTo: undefined,
    status: undefined,
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

  const handleFetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await ticketService.getAllHolidays(buildParams());

      if (res.success) {
        setHolidays(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Error fetching holidays");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching holidays");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      id: undefined,
      name: undefined,
      startDateFrom: undefined,
      startDateTo: undefined,
      endDateFrom: undefined,
      endDateTo: undefined,
      status: undefined,
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
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setErrors({});
    setIsAddOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const holiday = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
      };

      const res = await ticketService.createHoliday(holiday);

      if (res.success) {
        toast.success("Thêm ngày lễ thành công");
        handleFetchHolidays();

        setForm({
          name: "",
          startDate: "",
          endDate: "",
          description: "",
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

      toast.error("Thiếu thông tin ngày lễ!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleView = (holiday: any) => {
    setViewData(holiday);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Bạn có muốn xóa ngày lễ này?",
      text: "Bạn sẽ không thể khôi phục lại ngày lễ này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await ticketService.deleteHoliday(id);

          if (res.success) {
            toast.success("Ngày lễ đã được xóa thành công");
            handleFetchHolidays();
          } else {
            toast.error(res.message || "Lỗi khi xóa ngày lễ");
          }
        } catch (error) {
          console.log(error);
          toast.error("Lỗi khi xóa ngày lễ");
        }
      }
    });
  };

  const handleEdit = (holiday: any) => {
    setSelectedHoliday(holiday);
    setUpdateForm({
      name: holiday.name,
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      description: holiday.description,
      status: holiday.status,
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

      const holiday = {
        name: updateForm.name,
        startDate: updateForm.startDate,
        endDate: updateForm.endDate,
        description: updateForm.description,
        status: updateForm.status,
      };

      const res = await ticketService.updateHoliday(
        selectedHoliday.id,
        holiday,
      );

      if (res.success) {
        toast.success("Cập nhật thành công");
        handleFetchHolidays();
        setIsUpdateOpen(false);
        setSelectedHoliday(null);
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
    handleFetchHolidays();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ID */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          ID ngày lễ
        </label>
        <Input
          placeholder="Nhập ID..."
          value={filters.id || ""}
          onChange={(e) =>
            setFilters({ ...filters, id: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ngày bắt đầu từ
        </label>
        <Input
          type="date"
          placeholder="Nhập ngày bắt đầu từ..."
          value={filters.startDateFrom || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              startDateFrom: e.target.value || undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ngày bắt đầu đến
        </label>
        <Input
          type="date"
          placeholder="Nhập ngày bắt đầu đến..."
          value={filters.startDateTo || ""}
          onChange={(e) =>
            setFilters({ ...filters, startDateTo: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tên ngày lễ
        </label>
        <Input
          placeholder="Nhập tên..."
          value={filters.name || ""}
          onChange={(e) =>
            setFilters({ ...filters, name: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ngày kết thúc từ
        </label>
        <Input
          type="date"
          placeholder="Nhập ngày kết thúc từ..."
          value={filters.endDateFrom || ""}
          onChange={(e) =>
            setFilters({ ...filters, endDateFrom: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ngày kết thúc đến
        </label>
        <Input
          type="date"
          placeholder="Nhập ngày kết thúc đến..."
          value={filters.endDateTo || ""}
          onChange={(e) =>
            setFilters({ ...filters, endDateTo: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Trạng thái
        </label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", "Hoạt động", "Tạm ngưng"]}
          value={
            filters.status === undefined
              ? "Tất cả"
              : filters.status
                ? "Hoạt động"
                : "Tạm ngưng"
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

  const holidayFields: FieldConfig[] = [
    {
      name: "name",
      label: "Tên ngày lễ",
      type: "text",
      placeholder: "Nhập tên...",
    },
    {
      name: "startDate",
      label: "Ngày bắt đầu",
      type: "date",
      placeholder: "Chọn ngày bắt đầu...",
    },
    {
      name: "endDate",
      label: "Ngày kết thúc",
      type: "date",
      placeholder: "Chọn ngày kết thúc...",
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả...",
    },
  ];

  const holidayUpdateFields: FieldConfig[] = [
    {
      name: "name",
      label: "Tên ngày lễ",
      type: "text",
      placeholder: "Nhập tên...",
    },
    {
      name: "startDate",
      label: "Ngày bắt đầu",
      type: "date",
      placeholder: "Chọn ngày bắt đầu...",
    },
    {
      name: "endDate",
      label: "Ngày kết thúc",
      type: "date",
      placeholder: "Chọn ngày kết thúc...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Tạm ngừng", value: false },
      ],
      placeholder: "Chọn trạng thái...",
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả...",
    },
  ];

  const productViewFields = [
    {
      key: "id",
      label: "Mã ngày lễ",
    },
    {
      key: "name",
      label: "Tên ngày lễ",
    },
    {
      key: "startDate",
      label: "Ngày bắt đầu",
      render: (val: string) => val && new Date(val).toLocaleDateString("vi-VN"),
    },
    {
      key: "endDate",
      label: "Ngày kết thúc",
      render: (val: string) => val && new Date(val).toLocaleDateString("vi-VN"),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (val: string) => val || "Không có mô tả",
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
          {val ? "Hoạt động" : "Tạm ngừng"}
        </span>
      ),
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Ngày lễ"
      subtitle="Quản lý các ngày lễ và sự kiện đặc biệt."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM NGÀY LỄ"
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
        title="Thêm ngày lễ"
        fields={holidayFields}
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
        title="Cập nhật ngày lễ"
        fields={holidayUpdateFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdate}
        onCancel={() => {
          setIsUpdateOpen(false);
          selectedHoliday(null);
        }}
        errors={errors}
        loading={loadingSubmit}
      />

      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết ngày lễ"
        data={viewData}
        fields={productViewFields}
      />

      <ManagementTable
        headers={[
          "Ngày lễ",
          "Ngày bắt đầu",
          "Ngày kết thúc",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {holidays.map((holiday) => (
          <TableRow
            key={holiday.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* Product Info */}
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-bold text-slate-800">{holiday.name}</p>
                  <p className="text-xs text-slate-400">{holiday.id}</p>
                </div>
              </div>
            </TableCell>

            {/* Start Date */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {holiday.startDate
                ? new Date(holiday.startDate).toLocaleDateString("vi-VN")
                : "-"}
            </TableCell>

            {/* End Date */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {holiday.endDate
                ? new Date(holiday.endDate).toLocaleDateString("vi-VN")
                : "-"}
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              <StatusBadge
                status={holiday.status ? "Hoạt động" : "Tạm ngừng"}
                type={holiday.status ? "success" : "error"}
              />
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(holiday)}
                onEdit={() => handleEdit(holiday)}
                onDelete={() => handleDelete(holiday.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default HolidayManagement;
