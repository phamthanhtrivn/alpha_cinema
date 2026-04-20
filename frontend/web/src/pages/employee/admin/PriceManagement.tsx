/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type {
  DayType,
  ProjectionType,
  TicketFilterParams,
} from "@/types/ticket";
import { ticketService } from "@/services/ticket.service";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { seatTypeService } from "@/services/seat-type.service";
import type { SeatType } from "@/types/seat-type";
import {
  dayTypeOptions,
  projectionTypeOptions,
} from "@/constants/ticket.constant";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/employee/FilterSelect";
import type { FieldConfig } from "@/components/employee/BaseFormModal";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import BaseFormModal from "@/components/employee/BaseFormModal";
import ViewModal from "@/components/employee/ViewModal";
import ManagementTable from "@/components/employee/ManagementTable";
import TableActions from "@/components/employee/TableActions";
import StatusBadge from "@/components/employee/StatusBadge";

const PriceManagement: React.FC = () => {
  const pageSize = 5;

  const [tickets, setTickets] = useState<any[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    seatTypeId: "ST001",
    projectionType: "_2D",
    dayType: "WEEKDAY",
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    seatTypeId: "ST001",
    projectionType: "_2D",
    dayType: "WEEKDAY",
    price: "",
    status: true,
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<TicketFilterParams>({
    id: undefined,
    seatTypeId: undefined,
    projectionType: undefined,
    dayType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    status: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<TicketFilterParams>({
    id: undefined,
    seatTypeId: undefined,
    projectionType: undefined,
    dayType: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    status: undefined,
  });

  const handleFetchSeatTypes = async () => {
    try {
      const res = await seatTypeService.getAllSeatTypes();
      if (res.success) {
        setSeatTypes(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );
  };

  const handleFetchProducts = async () => {
    try {
      setLoading(true);

      const res = await ticketService.getAllTickets(buildParams());

      if (res.success) {
        setTickets(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Error fetching tickets");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      id: undefined,
      seatTypeId: undefined,
      projectionType: undefined,
      dayType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
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
      seatTypeId: "ST001",
      projectionType: "_2D",
      dayType: "WEEKDAY",
      price: "",
    });
    setErrors({});
    setIsAddOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const res = await ticketService.createTicket(form);

      if (res.success) {
        toast.success("Thêm vé thành công");
        handleFetchProducts();

        setForm({
          seatTypeId: "ST001",
          projectionType: "_2D",
          dayType: "WEEKDAY",
          price: "",
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

      toast.error("Thiếu thông tin vé!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleView = (product: any) => {
    setViewData(product);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Bạn có muốn xóa vé này?",
      text: "Bạn sẽ không thể khôi phục lại vé này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await ticketService.deleteTicket(id);

          if (res.success) {
            toast.success("Xóa vé thành công!");
            handleFetchProducts();
          } else {
            toast.error(res.message || "Lỗi khi xóa vé!");
          }
        } catch (error) {
          console.log(error);
          toast.error("Lỗi khi xóa vé!");
        }
      }
    });
  };

  const handleEdit = (ticket: any) => {
    setSelectedTicket(ticket);
    setUpdateForm({
      seatTypeId: ticket.seatTypeId,
      projectionType: ticket.projectionType,
      dayType: ticket.dayType,
      price: ticket.price,
      status: ticket.status,
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

      const res = await ticketService.updateTicket(
        selectedTicket.id,
        updateForm,
      );

      if (res.success) {
        toast.success("Cập nhật thành công");
        handleFetchProducts();
        setIsUpdateOpen(false);
        setSelectedTicket(null);
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
    handleFetchProducts();
  }, [currentPage, appliedFilters]);

  useEffect(() => {
    handleFetchSeatTypes();
  }, []);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ID */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          ID giá vé
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

      {/* Seat Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Loại ghế
        </label>
        <FilterSelect
          placeholder="Tất cả loại"
          options={["Tất cả", ...seatTypes.map((st) => st.name)]}
          value={
            seatTypes.find((st) => st.id === filters.seatTypeId)?.name ||
            "Tất cả"
          }
          onChange={(value) =>
            setFilters({
              ...filters,
              seatTypeId:
                value === "Tất cả"
                  ? undefined
                  : seatTypes.find((st) => st.name === value)?.id,
            })
          }
        />
      </div>

      {/* Day Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Loại ngày
        </label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={dayTypeOptions.map((dt) => dt.label) || []}
          value={
            dayTypeOptions.find((dt) => dt.value === filters.dayType)?.label ||
            "Tất cả"
          }
          onChange={(value) => {
            setFilters({
              ...filters,
              dayType:
                value === "Tất cả"
                  ? undefined
                  : (dayTypeOptions.find((dt) => dt.label === value)
                      ?.value as DayType),
            });
          }}
        />
      </div>

      {/* Projection Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Hình thức chiếu
        </label>
        <FilterSelect
          placeholder="Tất cả hình thức chiếu"
          options={projectionTypeOptions.map((pt) => pt.label) || []}
          value={
            projectionTypeOptions.find(
              (pt) => pt.value === filters.projectionType,
            )?.label || "Tất cả"
          }
          onChange={(value) => {
            setFilters({
              ...filters,
              projectionType:
                value === "Tất cả"
                  ? undefined
                  : (projectionTypeOptions.find((pt) => pt.label === value)
                      ?.value as ProjectionType),
            });
          }}
        />
      </div>

      {/* Min Price */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Giá từ
        </label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Max Price */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Giá đến
        </label>
        <Input
          type="number"
          placeholder="100000"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            })
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
          options={["Tất cả", "Hoạt động", "Ngừng"]}
          value={
            filters.status === undefined
              ? "Tất cả"
              : filters.status
                ? "Hoạt động"
                : "Ngừng"
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

  const productFields: FieldConfig[] = [
    {
      name: "seatTypeId",
      label: "Loại ghế",
      type: "select",
      options:
        seatTypes.length > 0
          ? seatTypes.map((st) => ({ label: st.name, value: st.id }))
          : [],
    },
    {
      name: "projectionType",
      label: "Hình thức chiếu",
      type: "select",
      options: projectionTypeOptions.filter((pt) => pt.value !== "ALL") || [],
    },
    {
      name: "dayType",
      label: "Loại ngày chiếu",
      type: "select",
      options: dayTypeOptions.filter((dt) => dt.value !== "ALL") || [],
    },
    {
      name: "price",
      label: "Giá",
      type: "number",
      placeholder: "Nhập giá...",
    },
  ];

  const productUpdateFields: FieldConfig[] = [
    {
      name: "seatTypeId",
      label: "Loại ghế",
      type: "select",
      options: seatTypes.map((st) => ({ label: st.name, value: st.id })) || [],
    },
    {
      name: "projectionType",
      label: "Hình thức chiếu",
      type: "select",
      options: projectionTypeOptions.filter((pt) => pt.value !== "ALL") || [],
    },
    {
      name: "dayType",
      label: "Loại ngày chiếu",
      type: "select",
      options: dayTypeOptions.filter((dt) => dt.value !== "ALL") || [],
    },
    {
      name: "price",
      label: "Giá",
      type: "number",
      placeholder: "Nhập giá...",
    },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Ngừng", value: false },
      ],
      placeholder: "Chọn trạng thái...",
    },
  ];

  const productViewFields = [
    {
      key: "id",
      label: "Mã sản phẩm",
    },
    {
      key: "seatTypeId",
      label: "Loại ghế",
    },
    {
      key: "projectionType",
      label: "Hình thức chiếu",
    },
    {
      key: "dayType",
      label: "Loại ngày chiếu",
    },
    {
      key: "price",
      label: "Giá",
      render: (val: number) => val?.toLocaleString("vi-VN") + " ₫",
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
          {val ? "Hoạt động" : "Ngừng"}
        </span>
      ),
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Giá vé"
      subtitle="Cấu hình bảng giá theo loại ghế, suất chiếu, ngày lễ và hình thức chiếu."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM GIÁ VÉ"
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
        title="Thêm giá vé mới"
        fields={productFields}
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
        title="Cập nhật giá vé"
        fields={productUpdateFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdate}
        onCancel={() => {
          setIsUpdateOpen(false);
          selectedTicket(null);
        }}
        errors={errors}
        loading={loadingSubmit}
      />

      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết giá vé"
        data={viewData}
        fields={productViewFields}
      />

      <ManagementTable
        headers={[
          "Loại ghế",
          "Suất chiếu",
          "Ngày áp dụng",
          "Giá",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {tickets.map((ticket) => (
          <TableRow
            key={ticket.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* Seat Type */}
            <TableCell className="px-6 py-4">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  {seatTypes.find((st) => st.id === ticket.seatTypeId)?.name ||
                    ticket.seatTypeId}
                </span>
                <span className="text-xs text-slate-400">ID: {ticket.id}</span>
              </div>
            </TableCell>

            {/* Projection Type */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {projectionTypeOptions.find(
                  (pt) => pt.value === ticket.projectionType,
                )?.label || ticket.projectionType}
              </span>
            </TableCell>

            {/* Day Type */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {dayTypeOptions.find((dt) => dt.value === ticket.dayType)
                  ?.label || ticket.dayType}
              </span>
            </TableCell>

            {/* Price */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {ticket.price.toLocaleString()} đ
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              <StatusBadge
                status={ticket.status ? "Hoạt động" : "Ngừng"}
                type={ticket.status ? "success" : "error"}
              />
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(ticket)}
                onEdit={() => handleEdit(ticket)}
                onDelete={() => handleDelete(ticket.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default PriceManagement;
