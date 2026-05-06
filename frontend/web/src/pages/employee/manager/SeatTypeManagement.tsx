/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ViewModal from "@/components/employee/ViewModal";
import ManagementTable from "@/components/employee/ManagementTable";
import TableActions from "@/components/employee/TableActions";
import BaseFormModal, {
  type FieldConfig,
} from "@/components/employee/BaseFormModal";
import { seatTypeService } from "@/services/seat-type.service";

interface SeatType {
  id: string;
  name: string;
  description: string;
}

interface SeatTypeFilterParams {
  name?: string;
}

const SeatTypeManagement: React.FC = () => {
  const pageSize = 5;

  // ─── State ──────────────────────────────────────────
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
  });

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<SeatTypeFilterParams>({
    name: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<SeatTypeFilterParams>({
    name: undefined,
  });

  // ─── Data fetching ──────────────────────────────────
  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );
  };

  const handleFetchSeatTypes = async () => {
    try {
      setLoading(true);

      const res = await seatTypeService.getAllSeatTypesAndPage(buildParams());

      if (res?.success) {
        setSeatTypes(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res?.message || "Lỗi tải danh sách loại ghế");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi tải danh sách loại ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      name: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  // ─── Form handlers ─────────────────────────────────
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
      const res = await seatTypeService.createSeatType(addForm);
      if (res?.success) {
        toast.success("Thêm loại ghế thành công");
        handleFetchSeatTypes();
        setAddForm({
          name: "",
          description: "",
        });
        setIsAddOpen(false);
      } else {
        toast.error(res?.message || "Lỗi thêm mới!");
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

  const handleView = (seatType: any) => {
    setViewData(seatType);
    setIsViewOpen(true);
  };

  const handleEdit = (seatType: any) => {
    setSelectedSeatType(seatType);
    setUpdateForm({
      name: seatType.name || "",
      description: seatType.description || "",
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

      const res = await seatTypeService.updateSeatType(
        selectedSeatType.id,
        updateForm,
      );

      if (res?.success) {
        toast.success("Cập nhật loại ghế thành công");
        handleFetchSeatTypes();
        setIsUpdateOpen(false);
      } else {
        toast.error(res?.message || "Lỗi cập nhật!");
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

  // ─── Effects ────────────────────────────────────────
  useEffect(() => {
    handleFetchSeatTypes();
  }, [currentPage, appliedFilters]);

  // ─── Filter content ─────────────────────────────────
  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Tên loại ghế */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tên loại ghế
        </label>
        <Input
          placeholder="Nhập tên loại ghế..."
          value={filters.name || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              name: e.target.value || undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-end gap-3 md:col-span-4">
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

  // ─── Field configs ──────────────────────────────────
  const seatTypeFormFields: FieldConfig[] = [
    {
      name: "name",
      label: "Tên loại ghế",
      type: "text",
      placeholder: "Nhập tên loại ghế...",
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả...",
    },
  ];

  const seatTypeViewFields = [
    {
      key: "id",
      label: "Mã loại ghế",
    },
    {
      key: "name",
      label: "Tên loại ghế",
    },
    {
      key: "description",
      label: "Mô tả",
      render: (val: string) => val || "Chưa có mô tả",
    },
  ];

  // ─── Render ─────────────────────────────────────────
  return (
    <BaseManagementLayout
      title="Quản lý Loại Ghế"
      subtitle="Quản lý các loại ghế ngồi tại rạp chiếu phim."
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
        title="Thêm loại ghế mới"
        fields={seatTypeFormFields}
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
        title="Cập nhật loại ghế"
        fields={seatTypeFormFields}
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
        title="Chi tiết loại ghế"
        data={viewData}
        fields={seatTypeViewFields}
      />

      <ManagementTable
        headers={["Mã loại ghế", "Tên loại ghế", "Mô tả", "Hành động"]}
        isLoading={loading}
      >
        {seatTypes.map((seatType) => (
          <TableRow
            key={seatType.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* ID */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {seatType.id}
            </TableCell>

            {/* Name */}
            <TableCell className="px-6 py-4">
              <span className="font-semibold text-slate-800 leading-tight">
                {seatType.name}
              </span>
            </TableCell>

            {/* Description */}
            <TableCell className="px-6 py-4">
              <span className="text-sm font-medium text-slate-500 line-clamp-2 max-w-xs">
                {seatType.description || (
                  <span className="italic text-slate-300">Chưa có mô tả</span>
                )}
              </span>
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(seatType)}
                onEdit={() => handleEdit(seatType)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default SeatTypeManagement;