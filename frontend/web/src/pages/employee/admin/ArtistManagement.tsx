import React, { useState } from "react";
import { User, Calendar, MapPin } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import TableActions from "@/components/employee/TableActions";
import { artistsService } from "@/services/artist.service";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import BaseFormModal, { type FieldConfig } from "@/components/employee/BaseFormModal";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/employee/FilterSelect";
import { Button } from "@/components/ui/button";
import { ALL_ARTIST_TYPES, type ArtistResDTO } from "@/types/artist";

const ArtistManagement: React.FC = () => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    dateOfBirth: "",
    nationality: "",
    type: "ACTOR",
    imageFile: null as any,
  });

  const [updateForm, setUpdateForm] = useState({
    fullName: "",
    bio: "",
    dateOfBirth: "",
    nationality: "",
    type: "ACTOR",
    imageFile: null as any,
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState<any>({
    name: undefined,
    nationality: undefined,
    type: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    name: undefined,
    nationality: undefined,
    type: undefined,
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

  const {
    data: artistsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["artists", currentPage, appliedFilters],
    queryFn: () => artistsService.getArtists(buildParams()),
  });

  const artists = artistsData?.data?.content || [];
  const totalItems = artistsData?.data?.totalElements || 0;

  const handleRefresh = () => {
    const reset = {
      name: undefined,
      nationality: undefined,
      type: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên nghệ sĩ</label>
        <Input
          placeholder='Nhập tên nghệ sĩ...'
          value={filters.name || ""}
          onChange={(e) => setFilters({ ...filters, name: e.target.value || undefined })}
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quốc gia</label>
        <Input
          placeholder='Nhập quốc gia...'
          value={filters.nationality || ""}
          onChange={(e) => setFilters({ ...filters, nationality: e.target.value || undefined })}
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</label>
        <FilterSelect
          placeholder="Tất cả vai trò"
          options={["Tất cả", ...ALL_ARTIST_TYPES.map(t => t.label)]}
          value={filters.type ? ALL_ARTIST_TYPES.find(t => t.value === filters.type)?.label : "Tất cả"}
          onChange={(label) => {
            const selected = ALL_ARTIST_TYPES.find(t => t.label === label);
            setFilters({ ...filters, type: selected?.value || undefined });
          }}
        />
      </div>

      <div className="col-span-1 md:col-span-3 flex items-end gap-3 mt-2">
        <Button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer"
          onClick={() => {
            setCurrentPage(1);
            setAppliedFilters(filters);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Đang tìm..." : "Tìm kiếm"}
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

  const handleEdit = async (artist: any) => {
    try {
      const res = await artistsService.getArtistById(artist.id);
      const fullArtist = res.data;

      setSelectedArtist(fullArtist);
      setUpdateForm({
        fullName: fullArtist.fullName || "",
        bio: fullArtist.bio || "",
        dateOfBirth: fullArtist.dateOfBirth ? new Date(fullArtist.dateOfBirth).toISOString().split('T')[0] : "",
        nationality: fullArtist.nationality || "",
        type: fullArtist.type || "ACTOR",
        imageFile: fullArtist.avatarUrl || null,
      });
      setIsUpdateOpen(true);
    } catch (e) {
      toast.error("Không thể tải thông tin chi tiết nghệ sĩ!");
    }
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

      const { imageFile, ...payload } = updateForm;
      const fileToUpload = imageFile instanceof File ? imageFile : undefined;

      const res = await artistsService.updateArtist(
        selectedArtist.id,
        payload,
        fileToUpload
      );

      if (res.success || res.id || res.data) {
        toast.success(res.message || "Cập nhật thành công");
        refetch();
        setIsUpdateOpen(false);
        setSelectedArtist(null);
      } else {
        toast.error(res.message || "Cập nhật thất bại");
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

  const handleFormChange = (name: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});

      const { imageFile, ...artistData } = form;
      const res = await artistsService.createArtist(artistData, imageFile instanceof File ? imageFile : undefined);

      if (res.success || res.id || res.data) {
        toast.success(res.message || "Thêm nghệ sĩ thành công");
        refetch();
        setIsAddOpen(false);
        setForm({
          fullName: "",
          bio: "",
          dateOfBirth: "",
          nationality: "",
          type: "ACTOR",
          imageFile: null,
        });
      } else {
        toast.error(res.message || "Thêm nghệ sĩ thất bại");
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
      toast.error(data.message || "Lỗi thêm mới!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (artist: any) => {
    if (window.confirm(`Bạn có chắc muốn xoá nghệ sĩ ${artist.fullName}?`)) {
      try {
        await artistsService.deleteArtist(artist.id);
        toast.success("Xoá nghệ sĩ thành công");
        refetch();
      } catch (err) {
        toast.error("Xoá nghệ sĩ thất bại");
      }
    }
  };

  const artistFields: FieldConfig[] = [
    { name: "fullName", label: "Họ và tên", type: "text", placeholder: "Nhập họ tên nghệ sĩ..." },
    { name: "nationality", label: "Quốc gia", type: "text", placeholder: "Nhập quốc gia..." },
    { name: "dateOfBirth", label: "Ngày sinh", type: "date" },
    {
      name: "type", label: "Vai trò chính", type: "select",
      options: ALL_ARTIST_TYPES,
      placeholder: "Chọn vai trò..."
    },
    { name: "bio", label: "Tiểu sử", type: "textarea", placeholder: "Nhập tiểu sử..." },
    { name: "imageFile", label: "Ảnh đại diện (Avatar)", type: "file", preview: true },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Nghệ sĩ"
      subtitle="Danh sách diễn viên, đạo diễn và biên kịch."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM NGHỆ SĨ"
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
        title="Thêm nghệ sĩ mới"
        fields={artistFields}
        values={form}
        onChange={handleFormChange}
        onSubmit={handleCreate}
        onCancel={() => setIsAddOpen(false)}
        errors={errors}
        loading={loadingSubmit}
      />

      <BaseFormModal
        mode="update"
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        title="Cập nhật nghệ sĩ"
        fields={artistFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdate}
        onCancel={() => {
          setIsUpdateOpen(false);
          setSelectedArtist(null);
        }}
        errors={errors}
        loading={loadingSubmit}
      />

      <ManagementTable
        headers={[
          "Nghệ sĩ",
          "Vai trò",
          "Quốc gia",
          "Ngày sinh",
          "Hành động",
        ]}
        isLoading={isLoading}
      >
        {artists?.map((artist: ArtistResDTO) => (
          <TableRow
            key={artist.id}
            className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50 relative overflow-hidden"
          >
            {/* Cell: Avatar & Name */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-20 rounded-xl overflow-hidden shadow-sm border border-slate-200/50 flex items-center justify-center bg-slate-100 group-hover:border-sky-200 transition-all group-hover:shadow-md shrink-0">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-slate-300" size={20} />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-800 group-hover:text-sky-600 transition-colors text-sm tracking-tight">
                    {artist.fullName}
                  </span>
                </div>
              </div>
            </TableCell>

            {/* Cell: Role */}
            <TableCell className="px-8 py-5">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${artist.type === "DIRECTOR" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                {artist.type === "DIRECTOR" ? "Đạo diễn" : "Diễn viên"}
              </span>
            </TableCell>

            {/* Cell: Nationality */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center text-sm font-semibold text-slate-600">
                <MapPin size={14} className="mr-2 text-slate-400" />
                {artist.nationality || "N/A"}
              </div>
            </TableCell>

            {/* Cell: Date of Birth */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center text-sm font-semibold text-slate-600">
                <Calendar size={14} className="mr-2 text-slate-400" />
                {artist.dateOfBirth ? new Date(artist.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}
              </div>
            </TableCell>

            {/* Cell: Actions */}
            <TableCell className="px-8 py-5 text-right">
              <TableActions
                onView={() => alert("Xem chi tiết nghệ sĩ")}
                onEdit={() => handleEdit(artist)}
                onDelete={() => handleDelete(artist)}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default ArtistManagement;
