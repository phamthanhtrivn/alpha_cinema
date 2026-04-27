/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/employee/FilterSelect";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ViewModal from "@/components/employee/ViewModal";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import BaseFormModal, {
  type FieldConfig,
} from "@/components/employee/BaseFormModal";
import { cinemaService } from "@/services/cinema.service";
import type { CinemaFilterParams, Cinema } from "@/types/cinema";

const CinemaManagement: React.FC = () => {
  const pageSize = 5;

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    address: "",
    phone: "",
    status: true,
  });

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    address: "",
    phone: "",
    status: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<CinemaFilterParams>({
    name: undefined,
    address: undefined,
    phone: undefined,
    status: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<CinemaFilterParams>({
    name: undefined,
    address: undefined,
    phone: undefined,
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

  const handleFetchCinemas = async () => {
    try {
      setLoading(true);

      const res = await cinemaService.getAllCinemasansPage(buildParams());

      if (res.success) {
        setCinemas(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Lỗi tải danh sách rạp");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi tải danh sách rạp");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      name: undefined,
      address: undefined,
      phone: undefined,
      status: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const handleAddFormChange = (name: string, value: any) => {
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const res = await cinemaService.createCinema(addForm);

      console.log(res);

      if (res.success) {
        toast.success("Thêm rạp chiếu thành công");
        handleFetchCinemas();
        setAddForm({
          name: "",
          address: "",
          phone: "",
          status: true,
        });
        setIsAddOpen(false);
      }
      else {
        toast.error(res.message || "Lỗi thêm mới!");
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
      toast.error("Lỗi thêm mới!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleView = (cinema: any) => {
    setViewData(cinema);
    setIsViewOpen(true);
  };

  const handleEdit = (cinema: any) => {
    setSelectedCinema(cinema);
    setUpdateForm({
      name: cinema.name,
      address: cinema.address,
      phone: cinema.phone,
      status: cinema.status,
    });
    setErrors({});
    setIsUpdateOpen(true);
  };

  const handleUpdateFormChange = (name: string, value: any) => {
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const res = await cinemaService.updateCinema(
        selectedCinema.id,
        updateForm,
      );

      if (res.success) {
        toast.success("Cập nhật rạp chiếu thành công");
        handleFetchCinemas();
        setIsUpdateOpen(false);
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
      toast.error("Lỗi cập nhật!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    handleFetchCinemas();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tên rạp
        </label>
        <Input
          placeholder="Nhập tên rạp..."
          value={filters.name || ""}
          onChange={(e) =>
            setFilters({ ...filters, name: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Địa chỉ
        </label>
        <Input
          placeholder="Nhập địa chỉ..."
          value={filters.address || ""}
          onChange={(e) =>
            setFilters({ ...filters, address: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Phone */}
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

      {/* Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Trạng thái
        </label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", "Hoạt động", "Ngừng hoạt động"]}
          value={
            filters.status === undefined
              ? "Tất cả"
              : filters.status
                ? "Hoạt động"
                : "Ngừng hoạt động"
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
      <div className="flex items-end gap-3 md:col-span-2">
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

  const cinemaViewFields = [
    {
      key: "id",
      label: "Mã rạp",
    },
    {
      key: "name",
      label: "Tên rạp",
    },
    {
      key: "address",
      label: "Địa chỉ",
    },
    {
      key: "phone",
      label: "Số điện thoại",
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
          {val ? "Hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
  ];

  const cinemaUpdateFields: FieldConfig[] = [
    {
      name: "name",
      label: "Tên rạp",
      type: "text",
      placeholder: "Nhập tên rạp...",
    },
    {
      name: "address",
      label: "Địa chỉ",
      type: "text",
      placeholder: "Nhập địa chỉ...",
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Ngừng hoạt động", value: false },
      ],
      placeholder: "Chọn trạng thái...",
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Rạp phim"
      subtitle="Quản lý thông tin cụm rạp, phòng chiếu và tọa độ."
      totalItems={totalItems}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(p) => setCurrentPage(p)}
      onAdd={() => setIsAddOpen(true)}
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
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setErrors({});
        }}
        title="Thêm rạp chiếu mới"
        fields={cinemaUpdateFields}
        values={addForm}
        errors={errors}
        onChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        onCancel={() => setIsAddOpen(false)}
        loading={loadingSubmit}
      />

      <BaseFormModal
        mode="update"
        open={isUpdateOpen}
        onOpenChange={(open) => setIsUpdateOpen(open)}
        title="Cập nhật rạp chiếu"
        fields={cinemaUpdateFields}
        values={updateForm}
        errors={errors}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdateSubmit}
        onCancel={() => setIsUpdateOpen(false)}
        loading={loadingSubmit}
      />

      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết rạp"
        data={viewData}
        fields={cinemaViewFields}
      />

      <ManagementTable
        headers={[
          "Mã rạp",
          "Tên rạp",
          "Địa chỉ",
          "Số điện thoại",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {cinemas.map((cinema) => (
          <TableRow
            key={cinema.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* ID */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {cinema.id}
            </TableCell>

            {/* Name */}
            <TableCell className="px-6 py-4">
              <span className="font-semibold text-slate-800 leading-tight">
                {cinema.name}
              </span>
            </TableCell>

            {/* Address */}
            <TableCell className="px-6 py-4">
              <span className="text-sm text-slate-600">
                {cinema.address}
              </span>
            </TableCell>

            {/* Phone */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {cinema.phone}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              <StatusBadge
                status={cinema.status ? "Hoạt động" : "Ngừng hoạt động"}
                type={cinema.status ? "success" : "error"}
              />
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(cinema)}
                onEdit={() => handleEdit(cinema)}
              />
            </TableCell>
            
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default CinemaManagement;

