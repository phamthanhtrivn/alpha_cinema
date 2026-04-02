/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import BaseManagementLayout from "@/components/admin/BaseManagementLayout";
import ManagementTable from "@/components/admin/ManagementTable";
import StatusBadge from "@/components/admin/StatusBadge";
import TableActions from "@/components/admin/TableActions";
import ManagementFilterBar from "@/components/admin/ManagementFilterBar";
import { TableRow, TableCell } from "@/components/ui/table";
import { Package } from "lucide-react";
import { productService } from "@/services/product.service";
import { toast } from "react-toastify";
import type { ProductFilterParams, ProductType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/admin/FilterSelect";
import BaseFormModal, {
  type FieldConfig,
} from "@/components/admin/BaseFormModal";
import Swal from "sweetalert2";
import ViewModal from "@/components/admin/ViewModal";

const ProductManagement: React.FC = () => {
  const pageSize = 5;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    unitPrice: "",
    description: "",
    type: "SINGLE",
    imageFile: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilterParams>({
    id: undefined,
    name: undefined,
    type: undefined,
    status: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<ProductFilterParams>({
    id: undefined,
    name: undefined,
    type: undefined,
    status: undefined,
    minPrice: undefined,
    maxPrice: undefined,
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

  const handleFetchProducts = async () => {
    try {
      setLoading(true);

      const res = await productService.getAllProduct(buildParams());

      if (res.success) {
        setProducts(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res.message || "Error fetching products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      id: undefined,
      name: undefined,
      type: undefined,
      status: undefined,
      minPrice: undefined,
      maxPrice: undefined,
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
      unitPrice: "",
      description: "",
      type: "SINGLE",
      imageFile: null,
    });
    setIsAddOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const formPayload = new FormData();

      const product = {
        name: form.name,
        unitPrice: Number(form.unitPrice),
        description: form.description,
        type: form.type,
      };

      const productBlob = new Blob([JSON.stringify(product)], {
        type: "application/json",
      });

      formPayload.append("product", productBlob);

      if (form.imageFile) {
        formPayload.append("imageFile", form.imageFile);
      }

      const res = await productService.addProduct(formPayload);

      if (res.success) {
        toast.success("Thêm sản phẩm thành công");
        handleFetchProducts();

        setForm({
          name: "",
          unitPrice: "",
          description: "",
          type: "SINGLE",
          imageFile: null,
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

      toast.error("Thiếu thông tin sản phẩm!");
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
      title: "Bạn có muốn xóa sản phẩm này?",
      text: "Bạn sẽ không thể khôi phục lại sản phẩm này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await productService.deleteProduct(id);

          if (res.success) {
            toast.success("Product deleted successfully");
            handleFetchProducts();
          } else {
            toast.error(res.message || "Error deleting product");
          }
        } catch (error) {
          console.log(error);
          toast.error("Error deleting product");
        }
      }
    });
  };

  useEffect(() => {
    handleFetchProducts();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ID */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          ID sản phẩm
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

      {/* Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tên sản phẩm
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

      {/* Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Loại
        </label>
        <FilterSelect
          placeholder="Tất cả loại"
          options={["Tất cả", "SINGLE", "COMBO"]}
          value={filters.type || "Tất cả"}
          onChange={(value) =>
            setFilters({
              ...filters,
              type: value === "Tất cả" ? undefined : (value as ProductType),
            })
          }
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
      name: "name",
      label: "Tên sản phẩm",
      type: "text",
      placeholder: "Nhập tên...",
    },
    {
      name: "unitPrice",
      label: "Giá",
      type: "number",
      placeholder: "Nhập giá...",
    },
    {
      name: "type",
      label: "Loại",
      type: "select",
      options: [
        { label: "SINGLE", value: "SINGLE" },
        { label: "COMBO", value: "COMBO" },
      ],
    },
    {
      name: "imageFile",
      label: "Ảnh sản phẩm",
      type: "file",
      preview: true,
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
      label: "Mã sản phẩm",
    },
    {
      key: "name",
      label: "Tên sản phẩm",
    },
    {
      key: "unitPrice",
      label: "Giá",
      render: (val: number) => val?.toLocaleString("vi-VN") + " ₫",
    },
    {
      key: "type",
      label: "Loại",
      render: (val: string) => (val === "SINGLE" ? "Sản phẩm lẻ" : "Combo"),
    },
    {
      key: "pictureUrl",
      label: "Ảnh sản phẩm",
      render: (val: string) =>
        val ? (
          <img
            src={val}
            alt="product"
            className="w-24 h-24 object-cover rounded-md border"
          />
        ) : (
          "Không có ảnh"
        ),
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
          {val ? "Hoạt động" : "Ngừng"}
        </span>
      ),
    },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Sản phẩm"
      subtitle="Quản lý bắp, nước, combo và các dịch vụ đi kèm."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM SẢN PHẨM"
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
        title="Thêm sản phẩm"
        fields={productFields}
        values={form}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelForm}
        errors={errors}
        loading={loadingSubmit}
      />

      <ViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết sản phẩm"
        data={viewData}
        fields={productViewFields}
      />

      <ManagementTable
        headers={["Sản phẩm", "Giá", "Loại", "Trạng thái", "Hành động"]}
        isLoading={loading}
      >
        {products.map((product) => (
          <TableRow
            key={product.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* Product Info */}
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  {product.pictureUrl ? (
                    <img
                      src={product.pictureUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="text-slate-300" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.id}</p>
                </div>
              </div>
            </TableCell>

            {/* Price */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {product.unitPrice.toLocaleString()} đ
            </TableCell>

            {/* Type */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                {product.type}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              <StatusBadge
                status={product.status ? "Hoạt động" : "Ngừng"}
                type={product.status ? "success" : "neutral"}
              />
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={() => handleView(product)}
                onEdit={() => console.log("edit", product.id)}
                onDelete={() => handleDelete(product.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default ProductManagement;
