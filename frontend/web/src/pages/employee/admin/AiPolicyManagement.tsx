import { useCallback, useEffect, useMemo, useState } from "react";
import { DatabaseZap, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import BaseFormModal, { type FieldConfig } from "@/components/employee/BaseFormModal";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import { FilterSelect } from "@/components/employee/FilterSelect";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  aiPolicyService,
  type AiPolicy,
  type AiPolicyRequest,
  type AiPolicySearchParams,
} from "@/services/ai-policy.service";

const pageSize = 6;

type PolicyForm = {
  title: string;
  topic: string;
  content: string;
  active: boolean | string;
};

const emptyForm: PolicyForm = {
  title: "",
  topic: "general",
  content: "",
  active: true,
};

const emptyFilters = {
  keyword: "",
  topic: "",
  source: "",
  activeValue: "ALL",
};

const policyFields: FieldConfig[] = [
  {
    name: "title",
    label: "Tiêu đề",
    type: "text",
    placeholder: "Ví dụ: Chính sách hoàn vé",
  },
  {
    name: "topic",
    label: "Topic",
    type: "text",
    placeholder: "refund, booking, loyalty...",
  },
  {
    name: "active",
    label: "Trạng thái",
    type: "select",
    options: [
      { label: "Đang dùng", value: "true" },
      { label: "Đã tắt", value: "false" },
    ],
  },
  {
    name: "content",
    label: "Nội dung policy",
    type: "textarea",
    placeholder: "Nhập nội dung policy, điều kiện áp dụng, ngoại lệ...",
  },
];

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const toPolicyForm = (policy: AiPolicy) => ({
  title: policy.title,
  topic: policy.topic,
  content: policy.content,
  active: String(policy.active),
});

const toPolicyRequest = (form: PolicyForm): AiPolicyRequest => ({
  title: form.title.trim(),
  topic: form.topic.trim(),
  content: form.content.trim(),
  active: form.active === true || form.active === "true",
});

const buildSearchParams = (
  filters: typeof emptyFilters,
): AiPolicySearchParams => ({
  keyword: filters.keyword.trim() || undefined,
  topic: filters.topic.trim() || undefined,
  source: filters.source.trim() || undefined,
  active:
    filters.activeValue === "ACTIVE"
      ? true
      : filters.activeValue === "INACTIVE"
        ? false
        : undefined,
});

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseError = error as { response?: { data?: { message?: string } } };
  return responseError.response?.data?.message || fallback;
};

const AiPolicyManagement = () => {
  const [policies, setPolicies] = useState<AiPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<AiPolicy | null>(null);
  const [updateForm, setUpdateForm] = useState(emptyForm);

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return policies.slice(startIndex, startIndex + pageSize);
  }, [policies, currentPage]);

  const fetchPolicies = useCallback(async (nextFilters: typeof emptyFilters) => {
    try {
      setLoading(true);
      const response = await aiPolicyService.getPolicies(buildSearchParams(nextFilters));
      if (response.success) {
        setPolicies(response.data);
        setCurrentPage(1);
        return;
      }
      toast.error(response.message || "Không thể tải danh sách policy AI.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách policy AI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPolicies(emptyFilters);
  }, [fetchPolicies]);

  const validateForm = (form: PolicyForm) => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề policy";
    if (!form.topic.trim()) nextErrors.topic = "Vui lòng nhập topic";
    if (!form.content.trim()) nextErrors.content = "Vui lòng nhập nội dung policy";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddFormChange = (name: string, value: unknown) => {
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateFormChange = (name: string, value: unknown) => {
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelAdd = () => {
    setAddForm(emptyForm);
    setErrors({});
    setIsAddOpen(false);
  };

  const handleCancelUpdate = () => {
    setSelectedPolicy(null);
    setUpdateForm(emptyForm);
    setErrors({});
    setIsUpdateOpen(false);
  };

  const handleAddSubmit = async () => {
    if (!validateForm(addForm)) return;

    try {
      setLoadingSubmit(true);
      const response = await aiPolicyService.createPolicy(toPolicyRequest(addForm));
      if (response.success) {
        toast.success("Thêm policy AI thành công.");
        handleCancelAdd();
        void fetchPolicies(filters);
      } else {
        toast.error(response.message || "Không thể thêm policy AI.");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể thêm policy AI."));
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (policy: AiPolicy) => {
    setSelectedPolicy(policy);
    setUpdateForm(toPolicyForm(policy));
    setErrors({});
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedPolicy || !validateForm(updateForm)) return;

    try {
      setLoadingSubmit(true);
      const response = await aiPolicyService.updatePolicy(
        selectedPolicy.id,
        toPolicyRequest(updateForm),
      );
      if (response.success) {
        toast.success("Cập nhật policy AI thành công.");
        handleCancelUpdate();
        void fetchPolicies(filters);
      } else {
        toast.error(response.message || "Không thể cập nhật policy AI.");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể cập nhật policy AI."));
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (policy: AiPolicy) => {
    const result = await Swal.fire({
      title: "Xóa policy AI?",
      text: `Policy "${policy.title}" sẽ bị xóa khỏi Vector DB (${policy.chunkCount} chunks).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa policy",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#94a3b8",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await aiPolicyService.deletePolicy(policy.id);
      if (response.success) {
        toast.success("Xóa policy AI thành công.");
        void fetchPolicies(filters);
        return;
      }
      toast.error(response.message || "Không thể xóa policy AI.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể xóa policy AI."));
    }
  };

  const handleRefresh = () => {
    setFilters(emptyFilters);
    void fetchPolicies(emptyFilters);
  };

  const handleApplyFilters = () => {
    void fetchPolicies(filters);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await aiPolicyService.syncPolicies();
      if (response.success) {
        toast.success(
          `Đã đồng bộ ${response.data.policyCount} policy, ${response.data.chunkCount} chunks vào Vector DB.`,
        );
        void fetchPolicies(filters);
        return;
      }
      toast.error(response.message || "Không thể đồng bộ policy AI.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể đồng bộ policy AI."));
    } finally {
      setSyncing(false);
    }
  };

  const FilterContent = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Input
        value={filters.keyword}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, keyword: event.target.value }))
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleApplyFilters();
          }
        }}
        placeholder="Tìm tiêu đề, nội dung..."
        className="h-11 rounded-2xl border-slate-100 bg-white/70 text-sm font-medium"
      />
      <Input
        value={filters.topic}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, topic: event.target.value }))
        }
        placeholder="Chủ đề"
        className="h-11 rounded-2xl border-slate-100 bg-white/70 text-sm font-medium"
      />
      <Input
        value={filters.source}
        onChange={(event) =>
          setFilters((prev) => ({ ...prev, source: event.target.value }))
        }
        placeholder="Nguồn"
        className="h-11 rounded-2xl border-slate-100 bg-white/70 text-sm font-medium"
      />
      <FilterSelect
        placeholder="Trạng thái"
        value={filters.activeValue}
        onChange={(value) =>
          setFilters((prev) => ({ ...prev, activeValue: value }))
        }
        options={[
          { label: "Tất cả", value: "ALL" },
          { label: "Đang dùng", value: "ACTIVE" },
          { label: "Đã tắt", value: "INACTIVE" },
        ]}
      />
      <Button
        type="button"
        onClick={handleApplyFilters}
        disabled={loading}
        className="h-11 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white"
      >
        {loading ? "Đang tìm..." : "Tìm kiếm"}
      </Button>
    </div>
  );

  return (
    <BaseManagementLayout
      title="Quản lý Policy AI"
      subtitle="Thêm, cập nhật và xóa chính sách AI đang lưu trong Vector DB."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM POLICY"
      totalItems={policies.length}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      filterContent={
        <ManagementFilterBar
          onRefresh={handleRefresh}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterActive={isFilterOpen}
          rightContent={
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSync()}
              disabled={syncing}
              className="h-12 rounded-2xl border-slate-100 bg-white/50 px-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-sky-600"
            >
              {syncing ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <DatabaseZap className="mr-2" size={16} />
              )}
              Đồng bộ
            </Button>
          }
        >
          {FilterContent}
        </ManagementFilterBar>
      }
    >
      <BaseFormModal
        mode="add"
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Thêm policy AI"
        fields={policyFields}
        values={addForm}
        onChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        onCancel={handleCancelAdd}
        errors={errors}
        loading={loadingSubmit}
      />

      <BaseFormModal
        mode="update"
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        title="Cập nhật policy AI"
        fields={policyFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdateSubmit}
        onCancel={handleCancelUpdate}
        errors={errors}
        loading={loadingSubmit}
      />

      <ManagementTable
        headers={[
          "Policy",
          "Topic",
          "Source",
          "Chunks",
          "Trạng thái",
          "Cập nhật",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {paginatedPolicies.map((policy) => (
          <TableRow
            key={policy.id}
            className="group border-slate-50 transition hover:bg-slate-50/80"
          >
            <TableCell className="px-8 py-5">
              <div className="max-w-xl">
                <p className="font-semibold leading-tight text-slate-800">
                  {policy.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                  {policy.content}
                </p>
              </div>
            </TableCell>

            <TableCell className="px-8 py-5">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {policy.topic}
              </span>
            </TableCell>

            <TableCell className="px-8 py-5 text-xs font-bold text-slate-500">
              {policy.source}
            </TableCell>

            <TableCell className="px-8 py-5 text-sm font-black text-slate-700">
              {policy.chunkCount}
            </TableCell>

            <TableCell className="px-8 py-5">
              <StatusBadge
                status={policy.active ? "Đang dùng" : "Đã tắt"}
                type={policy.active ? "success" : "neutral"}
              />
            </TableCell>

            <TableCell className="px-8 py-5 text-xs font-bold text-slate-500">
              {formatDateTime(policy.updatedAt)}
            </TableCell>

            <TableCell className="px-8 py-5 text-right">
              <TableActions
                onEdit={() => handleEdit(policy)}
                onDelete={() => void handleDelete(policy)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default AiPolicyManagement;
