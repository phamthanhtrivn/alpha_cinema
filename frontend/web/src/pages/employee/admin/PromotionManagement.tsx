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
import { promotionService } from "@/services/promotion.service";
import type { Promotion, PromotionFilterParams } from "@/types/promotion";
import {formatDateTimeLocal} from "@/utils/formatTime";

const PromotionManagement: React.FC = () => {
  const pageSize = 5;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    code: "",
    discount: 0,
    startDate: "",
    endDate: "",
    quantity: 0,
    status: true,
  });

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    id : "",
    code: "",
    discount: 0,
    startDate: "",
    endDate: "",
    quantity: 0,
    status: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<PromotionFilterParams>({
    code: undefined,
    sortBy: "createdAt",
    direction: "desc",
  });

  const [appliedFilters, setAppliedFilters] = useState<PromotionFilterParams>({
    code: undefined,
    sortBy: "createdAt",
    direction: "desc",
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

  const handleFetchPromotions = async () => {
    try {
      setLoading(true);

      const res = await promotionService.getAllPromotions(buildParams());

      if (res.success) {
        setPromotions(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Lỗi tải danh sách khuyến mãi");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      code: undefined,
      sortBy: "createdAt",
      direction: "desc",
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

      const res = await promotionService.createPromotion(addForm);

      if (res.success) {
        toast.success("Thêm khuyến mãi thành công");
        handleFetchPromotions();
        setAddForm({
          code: "",
          discount: 0,
          startDate: "",
          endDate: "",
          quantity: 0,
          status: true,
        });
        setIsAddOpen(false);
      } else {
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

  const handleView = (promotion: Promotion) => {
    setViewData(promotion);
    setIsViewOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setUpdateForm({
      id: promotion.id,
      code: promotion.code,
      discount: promotion.discount,
      startDate: formatDateTimeLocal(promotion.startDate),
      endDate: formatDateTimeLocal(promotion.endDate),
      quantity: promotion.quantity,
      status: promotion.status,
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

      const res = await promotionService.updatePromotion(updateForm);
      

      if (res.success) {
        toast.success("Cập nhật khuyến mãi thành công");
        handleFetchPromotions();
        setIsUpdateOpen(false);
      }
      else {
        toast.error(res.message || "Lỗi cập nhật!");
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
    handleFetchPromotions();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Mã khuyến mãi
        </label>
        <Input
          placeholder="Nhập mã..."
          value={filters.code || ""}
          onChange={(e) =>
            setFilters({ ...filters, code: e.target.value || undefined })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Sắp xếp theo
        </label>
        <FilterSelect
          placeholder="Chọn trường sắp xếp"
          options={[
            { label: "Ngày tạo", value: "createdAt" },
            { label: "Mã code", value: "code" },
            { label: "Giảm giá", value: "discount" },
            { label: "Ngày bắt đầu", value: "startDate" },
            { label: "Ngày kết thúc", value: "endDate" },
            { label: "Số lượng", value: "quantity" },
          ]}
          value={filters.sortBy}
          onChange={(value) => setFilters({ ...filters, sortBy: value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Thứ tự
        </label>
        <FilterSelect
          placeholder="Chọn hướng"
          options={[
            { label: "Giảm dần", value: "desc" },
            { label: "Tăng dần", value: "asc" },
          ]}
          value={filters.direction}
          onChange={(value) => setFilters({ ...filters, direction: value })}
        />
      </div>

      <div className="flex items-end gap-3 md:col-span-1">
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

  const promotionViewFields = [
    { key: "id", label: "Mã ID" },
    { key: "code", label: "Mã khuyến mãi" },
    { key: "discount", label: "Giảm giá (%)", render: (val: number) => `${val}%` },
    { key: "startDate", label: "Ngày bắt đầu", render: (val: string) => formatDateTimeLocal(val) },
    { key: "endDate", label: "Ngày kết thúc", render: (val: string) => formatDateTimeLocal(val) },
    { key: "quantity", label: "Số lượng ban đầu" },
    { key: "remainingQuantity", label: "Số lượng còn lại" },
    { key: "createdAt", label: "Ngày tạo", render: (val: string) => formatDateTimeLocal(val) },
    {
      key: "status",
      label: "Trạng thái",
      render: (val: boolean) => (
        <StatusBadge
          status={val ? "Hoạt động" : "Ngừng hoạt động"}
          type={val ? "success" : "error"}
        />
      ),
    },
  ];

  const promotionUpdateFields: FieldConfig[] = [
    {
      name: "code",
      label: "Mã khuyến mãi",
      type: "text",
      placeholder: "Nhập mã khuyến mãi...",
    },
    {
      name: "discount",
      label: "Giảm giá (%)",
      type: "number",
      placeholder: "Nhập % giảm giá...",
    },
    {
      name: "startDate",
      label: "Ngày bắt đầu",
      type: "datetime-local",
    },
    {
      name: "endDate",
      label: "Ngày kết thúc",
      type: "datetime-local",
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number",
      placeholder: "Nhập số lượng...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Ngừng hoạt động", value: false },
      ],
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Khuyến mãi"
      subtitle="Quản lý các chương trình ưu đãi và mã giảm giá."
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
        title="Thêm khuyến mãi mới"
        fields={promotionUpdateFields}
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
        title="Cập nhật khuyến mãi"
        fields={promotionUpdateFields}
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
        title="Chi tiết khuyến mãi"
        data={viewData}
        fields={promotionViewFields}
      />

      <ManagementTable
        headers={[
          "Mã Code",
          "Giảm giá",
          "Thời hạn",
          "Số lượng",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {promotions.map((promotion) => (
          <TableRow
            key={promotion.id}
            className="group hover:bg-slate-50/80 transition"
          >
            <TableCell className="px-6 py-4 font-bold text-sky-600">
              {promotion.code}
            </TableCell>

            <TableCell className="px-6 py-4">
              <span className="font-semibold text-slate-800">
                {promotion.discount}%
              </span>
            </TableCell>

            <TableCell className="px-6 py-4">
              <div className="flex flex-col text-xs text-slate-600">
                <span>Từ: {formatDateTimeLocal(promotion.startDate)}</span>
                <span>Đến: {formatDateTimeLocal(promotion.endDate)}</span>
              </div>
            </TableCell>

            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {promotion.remainingQuantity} / {promotion.quantity}
              </span>
            </TableCell>

            <TableCell className="px-6 py-4">
              <StatusBadge
                status={promotion.status ? "Hoạt động" : "Ngừng hoạt động"}
                type={promotion.status ? "success" : "error"}
              />
            </TableCell>

            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(promotion)}
                onEdit={() => handleEdit(promotion)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default PromotionManagement;

