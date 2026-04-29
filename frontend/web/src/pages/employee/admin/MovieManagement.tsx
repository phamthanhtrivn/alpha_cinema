import React, { useEffect, useState } from "react";
import { Calendar, Clock, Star, PlayCircle, Film } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import { movieService } from "@/services/movie.service";
import { ReleaseStatus, type MovieSummaryResponse, ALL_GENRES, ALL_PROJECTION, ALL_TRANSLATION, ALL_STATUS } from "@/types/movie";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import BaseFormModal, { type FieldConfig } from "@/components/employee/BaseFormModal";
import { artistsService } from "@/services/artist.service";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/employee/FilterSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Info, User, Globe, MapPin, Tag } from "lucide-react";

const MovieManagement: React.FC = () => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [viewMovie, setViewMovie] = useState<any>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    duration: 0,
    premiereDate: "",
    producer: "",
    releaseYear: new Date().getFullYear(),
    description: "",
    trailerUrl: "",
    nationality: "",
    ageTypeId: "",
    actorIds: [] as string[],
    directorIds: [] as string[],
    releaseStatus: "UPCOMING",
    genre: [] as string[],
    supportedProjection: [] as string[],
    supportedTranslation: [] as string[],
    imageFile: null as any,
  });

  const [updateForm, setUpdateForm] = useState({
    title: "",
    duration: 0,
    premiereDate: "",
    producer: "",
    releaseYear: new Date().getFullYear(),
    description: "",
    trailerUrl: "",
    nationality: "",
    ageTypeId: "",
    actorIds: [] as string[],
    directorIds: [] as string[],
    releaseStatus: "UPCOMING",
    genre: [] as string[],
    supportedProjection: [] as string[],
    supportedTranslation: [] as string[],
    imageFile: null as any,
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState<any>({
    title: undefined,
    releaseStatus: undefined,
    nationality: undefined,
    ageTypeId: undefined,
    releaseYear: undefined,
    genre: undefined,
    projectionType: undefined,
    translationType: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    title: undefined,
    releaseStatus: undefined,
    nationality: undefined,
    ageTypeId: undefined,
    releaseYear: undefined,
    genre: undefined,
    projectionType: undefined,
    translationType: undefined,
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
    data: moviesData,
    isLoading,
    isError,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: ["movies", currentPage, appliedFilters],
    queryFn: () => movieService.getAllMovies(buildParams()),
  });

  // Extract the content and totalElements from the ApiResponse wrapper
  const movies = moviesData?.data?.content || [];
  const totalItems = moviesData?.data?.totalElements || 0;

  const { data: allArtists, refetch: refetchArtists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => artistsService.getArtists().then(res => res.data.content),
  });

  const { data: allAgeTypes } = useQuery({
    queryKey: ['ageTypes'],
    queryFn: () => movieService.getAgeTypes().then(res => res.data),
  });

  const handleRefresh = () => {
    const reset = {
      title: undefined,
      releaseStatus: undefined,
      nationality: undefined,
      ageTypeId: undefined,
      releaseYear: undefined,
      genre: undefined,
      projectionType: undefined,
      translationType: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên phim</label>
        <Input
          placeholder='Nhập tên phim...'
          value={filters.title || ""}
          onChange={(e) => setFilters({ ...filters, title: e.target.value || undefined })}
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
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Năm phát hành</label>
        <Input
          type="number"
          placeholder='Nhập năm phát hành...'
          value={filters.releaseYear || ""}
          onChange={(e) => setFilters({ ...filters, releaseYear: e.target.value || undefined })}
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", ...ALL_STATUS]}
          value={filters.releaseStatus || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, releaseStatus: value === "Tất cả" ? undefined : value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thể loại</label>
        <FilterSelect
          placeholder="Tất cả thể loại"
          options={["Tất cả", ...ALL_GENRES]}
          value={filters.genre || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, genre: value === "Tất cả" ? undefined : value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình chiếu</label>
        <FilterSelect
          placeholder="Tất cả loại hình chiếu"
          options={["Tất cả", ...ALL_PROJECTION]}
          value={filters.projectionType || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, projectionType: value === "Tất cả" ? undefined : value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại dịch thuật</label>
        <FilterSelect
          placeholder="Tất cả loại dịch thuật"
          options={["Tất cả", ...ALL_TRANSLATION.map(t => t.label)]}
          value={filters.translationType ? ALL_TRANSLATION.find(t => t.value === filters.translationType)?.label : "Tất cả"}
          onChange={(label) => {
            const selected = ALL_TRANSLATION.find(t => t.label === label);
            setFilters({ ...filters, translationType: selected?.value || undefined });
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ tuổi</label>
        <FilterSelect
          placeholder="Tất cả độ tuổi"
          options={["Tất cả", ...(allAgeTypes?.map((a: any) => a.name) || [])]}
          value={filters.ageTypeId ? allAgeTypes?.find((a: any) => a.id === filters.ageTypeId)?.name : "Tất cả"}
          onChange={(name) => {
            const selected = allAgeTypes?.find((a: any) => a.name === name);
            setFilters({ ...filters, ageTypeId: selected?.id || undefined });
          }}
        />
      </div>

      <div className="col-span-1 md:col-span-4 flex items-end gap-3 mt-2">
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

  const handleEdit = async (movie: any) => {
    try {
      const res = await movieService.getMovieById(movie.id);
      const fullMovie = res.data; // assuming standard success response wrapper like res.data

      setSelectedMovie(fullMovie);
      setUpdateForm({
        title: fullMovie.title || "",
        duration: fullMovie.duration || 0,
        premiereDate: fullMovie.premiereDate ? new Date(fullMovie.premiereDate).toISOString().split('T')[0] : "",
        producer: fullMovie.producer || "",
        releaseYear: fullMovie.releaseYear || new Date().getFullYear(),
        description: fullMovie.description || "",
        trailerUrl: fullMovie.trailerUrl || "",
        nationality: fullMovie.nationality || "",
        ageTypeId: fullMovie.ageType?.id || fullMovie.ageTypeId || "",
        actorIds: fullMovie.actors?.map((a: any) => a.id) || fullMovie.actorIds || [],
        directorIds: fullMovie.directors?.map((a: any) => a.id) || fullMovie.directorIds || [],
        releaseStatus: fullMovie.releaseStatus || "UPCOMING",
        genre: fullMovie.genre || [],
        supportedProjection: fullMovie.supportedProjection || [],
        supportedTranslation: fullMovie.supportedTranslation || [],
        imageFile: fullMovie.thumbnailUrl || null,
      });
      setIsUpdateOpen(true);
    } catch (e) {
      toast.error("Không thể tải thông tin chi tiết phim!");
    }
  };

  const handleView = async (movie: any) => {
    try {
      const res = await movieService.getMovieById(movie.id);
      setViewMovie(res.data);
      setIsViewOpen(true);
    } catch (e) {
      toast.error("Không thể tải thông tin chi tiết phim!");
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

      const res = await movieService.updateMovie(
        selectedMovie.id,
        payload,
        fileToUpload
      );

      if (res.success || res.id) { // Usually standard backend responds with the object or a success flag
        toast.success(res.message || "Cập nhật thành công");
        refetchMovies();
        refetchArtists();
        setIsUpdateOpen(false);
        setSelectedMovie(null);
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

      const { imageFile, ...movieData } = form;
      const res = await movieService.createMovie(movieData, imageFile instanceof File ? imageFile : undefined);

      if (res.success || res.id) {
        toast.success(res.message || "Thêm phim thành công");
        refetchMovies();
        refetchArtists();
        setIsAddOpen(false);
        setForm({
          title: "",
          duration: 0,
          premiereDate: "",
          producer: "",
          releaseYear: new Date().getFullYear(),
          description: "",
          trailerUrl: "",
          nationality: "",
          ageTypeId: "",
          actorIds: [],
          directorIds: [],
          releaseStatus: "UPCOMING",
          genre: [],
          supportedProjection: [],
          supportedTranslation: [],
          imageFile: null,
        });
      } else {
        toast.error(res.message || "Thêm phim thất bại");
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

  const movieUpdateFields: FieldConfig[] = [
    { name: "title", label: "Tên phim", type: "text", placeholder: "Nhập tên phim..." },
    { name: "duration", label: "Thời lượng (phút)", type: "number", placeholder: "Nhập thời lượng..." },
    { name: "premiereDate", label: "Ngày công chiếu", type: "date" },
    { name: "producer", label: "Nhà sản xuất", type: "text", placeholder: "Nhập nhà sản xuất..." },
    { name: "releaseYear", label: "Năm phát hành", type: "number", placeholder: "Nhập năm phát hành..." },
    { name: "description", label: "Mô tả", type: "textarea", placeholder: "Nhập mô tả..." },
    { name: "trailerUrl", label: "URL Trailer", type: "text", placeholder: "Nhập URL trailer..." },
    { name: "nationality", label: "Quốc gia", type: "text", placeholder: "Nhập quốc gia..." },
    {
      name: "ageTypeId", label: "Độ tuổi", type: "select",
      options: allAgeTypes?.map((a: any) => ({ label: a.name, value: a.id })) || [],
      placeholder: "Chọn độ tuổi..."
    },
    {
      name: "actorIds", label: "Diễn viên", type: "multi-select",
      options: allArtists?.map((a: any) => ({ label: a.name || a.fullName || a.id, value: a.id })) || [],
      placeholder: "Thêm diễn viên..."
    },
    {
      name: "directorIds", label: "Đạo diễn", type: "multi-select",
      options: allArtists?.map((a: any) => ({ label: a.name || a.fullName || a.id, value: a.id })) || [],
      placeholder: "Thêm đạo diễn..."
    },
    {
      name: "releaseStatus", label: "Trạng thái", type: "select", options: ALL_STATUS, placeholder: "Chọn trạng thái..."
    },
    { name: "genre", label: "Thể loại", type: "multi-select", options: ALL_GENRES, placeholder: "Thêm thể loại..." },
    { name: "supportedProjection", label: "Loại hình chiếu", type: "multi-select", options: ALL_PROJECTION, placeholder: "Thêm loại hình chiếu..." },
    { name: "supportedTranslation", label: "Loại dịch thuật", type: "multi-select", options: ALL_TRANSLATION, placeholder: "Thêm loại dịch thuật..." },
    { name: "imageFile", label: "Hình ảnh (Thumbnail)", type: "file", preview: true },
  ];

  return (
    <BaseManagementLayout
      title="Quản lý Phim"
      subtitle="Quản lý thư viện phim và lịch chiếu Alpha Cinema."
      onAdd={() => setIsAddOpen(true)}
      addLabel="THÊM PHIM MỚI"
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
        title="Thêm phim mới"
        fields={movieUpdateFields}
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
        title="Cập nhật thông tin phim"
        fields={movieUpdateFields}
        values={updateForm}
        onChange={handleUpdateFormChange}
        onSubmit={handleUpdate}
        onCancel={() => {
          setIsUpdateOpen(false);
          setSelectedMovie(null);
        }}
        errors={errors}
        loading={loadingSubmit}
      />

      {/* View Detail Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-none shadow-2xl bg-white">
          {viewMovie && (
            <div className="flex flex-col">
              {/* Header/Hero Section */}
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {viewMovie.thumbnailUrl ? (
                  <img
                    src={viewMovie.thumbnailUrl}
                    alt={viewMovie.title}
                    className="w-full h-full object-cover blur-sm brightness-50 scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row items-end gap-6">
                  <div className="w-32 h-48 md:w-44 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white flex-shrink-0 bg-slate-100">
                    {viewMovie.thumbnailUrl ? (
                      <img src={viewMovie.thumbnailUrl} alt={viewMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Film size={40} className="text-slate-300" /></div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-3 pb-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={viewMovie.releaseStatus}
                        type={
                          viewMovie.releaseStatus === ReleaseStatus.NOW_SHOWING
                            ? "success"
                            : viewMovie.releaseStatus === ReleaseStatus.UPCOMING
                              ? "info"
                              : "neutral"
                        }
                      />
                      <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star size={10} className="fill-white" /> {viewMovie.avgRating > 0 ? viewMovie.avgRating.toFixed(1) : "TBD"}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">{viewMovie.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {viewMovie.genre?.map((g: string) => (
                        <span key={g} className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold border border-sky-100 uppercase tracking-wider">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sky-600">
                      <Info size={18} />
                      <h3 className="font-black text-xs uppercase tracking-widest">Nội dung phim</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                      {viewMovie.description || "Chưa có mô tả cho phim này."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sky-600">
                        <User size={18} />
                        <h3 className="font-black text-xs uppercase tracking-widest">Đạo diễn</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {viewMovie.directors?.map((d: any) => (
                          <span key={d.id} className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-default">
                            {d.fullName || d.name}
                          </span>
                        )) || "N/A"}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sky-600">
                        <User size={18} />
                        <h3 className="font-black text-xs uppercase tracking-widest">Diễn viên</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {viewMovie.actors?.map((a: any) => (
                          <span key={a.id} className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-default">
                            {a.fullName || a.name}
                          </span>
                        )) || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sky-600">
                      <Tag size={18} />
                      <h3 className="font-black text-xs uppercase tracking-widest">Trailer</h3>
                    </div>
                    {viewMovie.trailerUrl ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={viewMovie.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors group"
                        >
                          <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                          Xem trailer trên Youtube
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Chưa có trailer.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-3xl p-6 space-y-6 border border-slate-100">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-4">Thông tin chi tiết</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-2"><Clock size={14} className="text-sky-400" /> Thời lượng</span>
                        <span className="text-slate-800 font-black tracking-tight">{viewMovie.duration} phút</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-2"><Calendar size={14} className="text-rose-400" /> Công chiếu</span>
                        <span className="text-slate-800 font-black tracking-tight">{viewMovie.premiereDate ? new Date(viewMovie.premiereDate).toLocaleDateString("vi-VN") : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-2"><Globe size={14} className="text-emerald-400" /> Quốc gia</span>
                        <span className="text-slate-800 font-black tracking-tight">{viewMovie.nationality || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-2"><Info size={14} className="text-purple-400" /> Độ tuổi</span>
                        <span className="text-slate-800 font-black tracking-tight underline decoration-purple-400 decoration-2 underline-offset-4">{viewMovie.ageType?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-2"><MapPin size={14} className="text-orange-400" /> Nhà sản xuất</span>
                        <span className="text-slate-800 font-black tracking-tight text-right max-w-[120px] truncate">{viewMovie.producer || "N/A"}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kỹ thuật chiếu</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewMovie.supportedProjection?.map((p: string) => (
                          <span key={p} className="text-[10px] font-black bg-slate-200 text-slate-600 px-3 py-1 rounded-lg">
                            {p}
                          </span>
                        ))}
                        {viewMovie.supportedTranslation?.map((t: string) => (
                          <span key={t} className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-lg">
                            {ALL_TRANSLATION.find(x => x.value === t)?.label || t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    onClick={() => setIsViewOpen(false)}
                  >
                    Đóng cửa sổ
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ManagementTable
        headers={[
          "Bộ phim / Thể loại",
          "Thông tin kĩ thuật",
          "Ngày công chiếu",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={isLoading}
      >
        {movies?.map((movie: MovieSummaryResponse) => (
          <TableRow
            key={movie.id}
            className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50 relative overflow-hidden"
          >
            {/* Cell: Poster & Title */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center space-x-5">
                <div className="relative group/poster">
                  <div className="w-14 h-20 bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200/50 group-hover:border-sky-200 transition-all group-hover:shadow-md flex items-center justify-center">
                    {movie.thumbnailUrl ? (
                      <img
                        src={movie.thumbnailUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="text-slate-300" size={20} />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-sky-600/0 group-hover/poster:bg-sky-600/10 transition-colors flex items-center justify-center rounded-xl">
                    <PlayCircle
                      className="text-white opacity-0 group-hover/poster:opacity-100 scale-50 group-hover/poster:scale-100 transition-all"
                      size={24}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-black text-slate-800 group-hover:text-sky-600 transition-colors text-base tracking-tight">
                    {movie.title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                      {movie.genre?.[0]}
                    </span>
                    {movie.genre?.length > 1 && (
                      <span className="text-[10px] font-medium text-slate-400">
                        +{movie.genre?.length - 1} khác
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TableCell>

            {/* Cell: Technical Info */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100/50">
                  <Clock size={12} className="mr-2 text-sky-400" />
                  {movie.duration} phút
                </div>
                <div className="flex items-center space-x-1 pl-1">
                  <Star
                    size={12}
                    className={
                      movie.avgRating && movie.avgRating > 0
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }
                  />
                  <span
                    className={`text-[11px] font-black ${movie.avgRating && movie.avgRating > 0
                      ? "text-slate-700"
                      : "text-slate-300 italic"
                      }`}
                  >
                    {movie.avgRating > 0
                      ? movie.avgRating.toFixed(1)
                      : "TBD"}
                  </span>
                  {movie.avgRating > 0 && (
                    <span className="text-[10px] text-slate-300 font-medium">
                      / 10
                    </span>
                  )}
                </div>
              </div>
            </TableCell>

            {/* Cell: Release Date */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm font-bold text-slate-600 italic tracking-tight">
                  <Calendar size={14} className="mr-2 text-slate-300" />
                  {movie.premiereDate ? new Date(movie.premiereDate).toLocaleDateString("vi-VN") : "N/A"}
                </div>
                <span className="text-[10px] text-slate-300 font-medium pl-6 uppercase tracking-widest">
                  Toàn quốc
                </span>
              </div>
            </TableCell>

            {/* Cell: Status */}
            <TableCell className="px-8 py-5">
              <StatusBadge
                status={movie.releaseStatus}
                type={
                  movie.releaseStatus === ReleaseStatus.NOW_SHOWING
                    ? "success"
                    : movie.releaseStatus === ReleaseStatus.UPCOMING
                      ? "info"
                      : "neutral"
                }
              />
            </TableCell>

            {/* Cell: Actions */}
            <TableCell className="px-8 py-5 text-right">
              <TableActions
                onView={() => handleView(movie)}
                onEdit={() => handleEdit(movie)}
                onDelete={() => alert("Delete movie")}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default MovieManagement;
