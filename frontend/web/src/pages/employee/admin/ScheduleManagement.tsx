import React, { useState } from "react";
import type { Mode } from "@/components/employee/BaseFormModal";
import { Calendar, Clock, Film, MapPin, Tag } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import { showScheduleService } from "@/services/show-schedule.service";
import { cinemaService } from "@/services/cinema.service";
import { movieService } from "@/services/movie.service";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/employee/FilterSelect";
import { Button } from "@/components/ui/button";
import { ALL_PROJECTION, ALL_TRANSLATION } from "@/types/movie";
import type { ShowScheduleResDTO } from "@/types/show-schedule";
import { toast } from "react-toastify";
import BaseFormModal, { type FieldConfig } from "@/components/employee/BaseFormModal";

const RoomName: React.FC<{ roomId: string; cinemaId: string }> = ({ roomId, cinemaId }) => {
  const { data: roomsData } = useQuery({
    queryKey: ["rooms-options", cinemaId],
    queryFn: () => cinemaService.getRoomOptions(cinemaId),
    enabled: !!cinemaId,
    staleTime: 5 * 60 * 1000,
  });
  const room = roomsData?.data?.find((r: any) => r.id === roomId);
  return <>{room ? room.label : roomId}</>;
};

const ScheduleManagement: React.FC = () => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<any>({
    movieId: undefined,
    cinemaId: undefined,
    roomId: undefined,
    projectionType: undefined,
    translationType: undefined,
    status: undefined,
    date: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    movieId: undefined,
    cinemaId: undefined,
    roomId: undefined,
    projectionType: undefined,
    translationType: undefined,
    status: undefined,
    date: undefined,
  });

  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== "")
    );
  };

  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["schedules", currentPage, appliedFilters],
    queryFn: () => showScheduleService.searchSchedules(buildParams()),
  });

  const schedules = schedulesData?.data?.content || [];
  const totalItems = schedulesData?.data?.totalElements || 0;

  const { data: cinemasData } = useQuery({
    queryKey: ["cinemas-options"],
    queryFn: cinemaService.getCinemaOptions,
  });

  const cinemas = cinemasData?.data || [];

  const { data: roomsData } = useQuery({
    queryKey: ["rooms-options", filters.cinemaId],
    queryFn: () => cinemaService.getRoomOptions(filters.cinemaId),
    enabled: !!filters.cinemaId,
  });
  const rooms = roomsData?.data || [];

  const [movieSearchText, setMovieSearchText] = useState("");
  const [debouncedMovieText, setDebouncedMovieText] = useState("");
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMovieText(movieSearchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [movieSearchText]);

  const { data: moviesData } = useQuery({
    queryKey: ["movies-options", debouncedMovieText],
    queryFn: () => movieService.suggestMovies(debouncedMovieText, 5),
    enabled: debouncedMovieText.length > 0 && isMovieDropdownOpen,
  });
  const movieOptions = moviesData?.data || [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingMovieTitle, setEditingMovieTitle] = useState("");
  const [formMode, setFormMode] = useState<Mode>("add");
  const [form, setForm] = useState({
    movieId: "",
    cinemaId: "",
    roomId: "",
    startTime: "",
    translationType: "",
    status: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);



  const { data: selectedMovieData } = useQuery({
    queryKey: ["movie-detail-form", form.movieId],
    queryFn: () => movieService.getMovieById(form.movieId),
    enabled: !!form.movieId,
  });

  const selectedMovie = selectedMovieData?.data;
  const translationOptions = selectedMovie?.supportedTranslation
    ? ALL_TRANSLATION.filter(t => selectedMovie.supportedTranslation.includes(t.value)).map(t => ({ label: t.label, value: t.value }))
    : [];

  const { data: roomsFormData } = useQuery({
    queryKey: ["rooms-options-form", form.cinemaId, selectedMovie?.supportedProjection],
    queryFn: () => cinemaService.getRoomOptions(form.cinemaId, selectedMovie?.supportedProjection),
    enabled: !!form.cinemaId,
  });

  const roomsFormOptions = (roomsFormData?.data || []).map((r: any) => ({
    label: r.label,
    value: r.id,
  }));

  const makeFormFields = (movieInitialLabel?: string): FieldConfig[] => [
    {
      name: "movieId",
      label: "Phim",
      type: "autocomplete",
      fetchOptions: async (q) => {
        const res = await movieService.suggestMovies(q, 5);
        return (res?.data || []).map((item: any) => ({
          label: item.label,
          value: item.id
        }));
      },
      placeholder: "Tìm kiếm phim...",
      initialLabel: movieInitialLabel,
    },
    {
      name: "cinemaId",
      label: "Rạp chiếu",
      type: "select",
      options: cinemas.map((c: any) => ({ label: c.label, value: c.id })),
      placeholder: "Chọn rạp chiếu...",
    },
    {
      name: "roomId",
      label: "Phòng chiếu",
      type: "select",
      options: roomsFormOptions,
      placeholder: !form.cinemaId ? "Vui lòng chọn rạp trước" : "Chọn phòng chiếu...",
      disabled: !form.cinemaId,
    },
    {
      name: "translationType",
      label: "Loại dịch thuật",
      type: "select",
      options: translationOptions,
      placeholder: form.movieId ? "Chọn loại dịch thuật..." : "Vui lòng chọn phim trước",
      disabled: !form.movieId || translationOptions.length === 0,
    },
    {
      name: "startTime",
      label: "Thời gian bắt đầu",
      type: "datetime-local",
    },
  ];

  const addFormFields = makeFormFields();

  const editFormFields: FieldConfig[] = [
    ...makeFormFields(editingMovieTitle),
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { label: "Hoạt động", value: true },
        { label: "Vô hiệu hóa", value: false },
      ],
      placeholder: "Chọn trạng thái...",
    },
  ];

  const handleFormChange = (name: string, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "cinemaId" && value !== prev.cinemaId) {
        newForm.roomId = "";
      }
      if (name === "movieId" && value !== prev.movieId) {
        newForm.translationType = "";
        newForm.roomId = ""; // Reset room since projections filter changes
      }
      return newForm;
    });
  };

  const resetForm = () => {
    setForm({
      movieId: "",
      cinemaId: "",
      roomId: "",
      startTime: "",
      translationType: "",
      status: true,
    });
    setErrors({});
    setEditingScheduleId(null);
    setEditingMovieTitle("");
  };

  const handleCreate = async () => {
    try {
      setLoadingSubmit(true);
      setErrors({});
      const res = await showScheduleService.createSchedule(form);
      if (res.success || res.id) {
        toast.success(res.message || "Thêm lịch chiếu thành công!");
        setIsAddOpen(false);
        resetForm();
        refetch();
      } else {
        toast.error(res.message || "Lỗi tạo lịch chiếu!");
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || "Lỗi tạo lịch chiếu!");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (schedule: ShowScheduleResDTO) => {
    setFormMode("update");
    setEditingScheduleId(schedule.id);
    setEditingMovieTitle(schedule.movieTitle || "");
    setForm({
      movieId: schedule.movieId,
      cinemaId: schedule.cinemaId,
      roomId: schedule.roomId,
      startTime: schedule.startTime,
      translationType: schedule.translationType,
      status: schedule.status,
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingScheduleId) return;
    try {
      setLoadingSubmit(true);
      setErrors({});
      const res = await showScheduleService.updateSchedule(editingScheduleId, form);
      if (res.success || res.id) {
        toast.success(res.message || "Cập nhật lịch chiếu thành công!");
        setIsEditOpen(false);
        resetForm();
        refetch();
      } else {
        toast.error(res.message || "Lỗi cập nhật lịch chiếu!");
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || "Lỗi cập nhật lịch chiếu!");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      movieId: undefined,
      cinemaId: undefined,
      roomId: undefined,
      projectionType: undefined,
      translationType: undefined,
      status: undefined,
      date: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
    setMovieSearchText("");
  };

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="space-y-2 relative">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phim</label>
        <Input
          placeholder="Nhập tên phim..."
          value={movieSearchText}
          onChange={(e) => {
            setMovieSearchText(e.target.value);
            setIsMovieDropdownOpen(true);
            if (e.target.value === "") {
              setFilters({ ...filters, movieId: undefined });
            }
          }}
          onFocus={() => setIsMovieDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsMovieDropdownOpen(false), 200)}
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
        {isMovieDropdownOpen && movieOptions.length > 0 && (
          <div className="absolute top-[70px] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-50 p-1">
            {movieOptions.map((m: any) => (
              <div
                key={m.id}
                className="px-3 py-2 hover:bg-sky-50 cursor-pointer text-xs font-bold text-slate-600 rounded-lg transition-colors"
                onClick={() => {
                  setFilters({ ...filters, movieId: m.id });
                  setMovieSearchText(m.label);
                  setIsMovieDropdownOpen(false);
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày chiếu</label>
        <Input
          type="date"
          value={filters.date || ""}
          onChange={(e) => setFilters({ ...filters, date: e.target.value || undefined })}
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình chiếu</label>
        <FilterSelect
          placeholder="Tất cả loại"
          options={["Tất cả", ...ALL_PROJECTION]}
          value={filters.projectionType || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, projectionType: value === "Tất cả" ? undefined : value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại dịch thuật</label>
        <FilterSelect
          placeholder="Tất cả dịch thuật"
          options={["Tất cả", ...ALL_TRANSLATION.map(t => t.label)]}
          value={filters.translationType ? ALL_TRANSLATION.find(t => t.value === filters.translationType)?.label : "Tất cả"}
          onChange={(label) => {
            const selected = ALL_TRANSLATION.find(t => t.label === label);
            setFilters({ ...filters, translationType: selected?.value || undefined });
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rạp</label>
        <FilterSelect
          placeholder="Tất cả rạp"
          options={[{ label: "Tất cả", value: "Tất cả" }, ...cinemas.map((c: any) => ({ label: c.label, value: c.id }))]}
          value={filters.cinemaId || "Tất cả"}
          onChange={(val) => setFilters({ ...filters, cinemaId: val === "Tất cả" ? undefined : val, roomId: undefined })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phòng chiếu</label>
        <FilterSelect
          placeholder="Tất cả phòng"
          options={[{ label: "Tất cả", value: "Tất cả" }, ...rooms.map((r: any) => ({ label: r.label, value: r.id }))]}
          value={filters.roomId || "Tất cả"}
          onChange={(val) => setFilters({ ...filters, roomId: val === "Tất cả" ? undefined : val })}
          disabled={!filters.cinemaId}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", "Đang chiếu", "Kết thúc"]}
          value={filters.status === undefined ? "Tất cả" : filters.status ? "Đang chiếu" : "Kết thúc"}
          onChange={(value) => {
            let statusVal = undefined;
            if (value === "Đang chiếu") statusVal = true;
            if (value === "Kết thúc") statusVal = false;
            setFilters({ ...filters, status: statusVal });
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

  return (
    <>
      <BaseManagementLayout
        title="Quản lý Lịch chiếu"
        subtitle="Quản lý lịch chiếu theo phim, rạp và phòng chiếu."
        onAdd={() => setIsAddOpen(true)}
        addLabel="THÊM LỊCH CHIẾU"
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
        <ManagementTable
          headers={[
            "Phim",
            "Thông tin kĩ thuật",
            "Thời gian chiếu",
            "Địa điểm",
            "Trạng thái",
            "Hành động",
          ]}
          isLoading={isLoading}
        >
          {schedules?.map((schedule: ShowScheduleResDTO) => (
            <TableRow
              key={schedule.id}
              className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50 relative overflow-hidden"
            >
              {/* Cell: Movie Title & Poster */}
              <TableCell className="px-8 py-5">
                <div className="flex items-center space-x-5">
                  <div className="relative group/poster">
                    <div className="w-14 h-20 bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200/50 group-hover:border-sky-200 transition-all group-hover:shadow-md flex items-center justify-center">
                      {schedule.movieThumbnailUrl ? (
                        <img
                          src={schedule.movieThumbnailUrl}
                          alt={schedule.movieTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="text-slate-300" size={20} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="font-black text-slate-800 group-hover:text-sky-600 transition-colors text-base tracking-tight">
                      {schedule.movieTitle || "N/A"}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Cell: Technical Info */}
              <TableCell className="px-8 py-5">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100/50">
                    <Tag size={12} className="mr-2 text-sky-400" />
                    {schedule.projectionType}
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-500 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100/50">
                    {ALL_TRANSLATION.find(t => t.value === schedule.translationType)?.label || schedule.translationType}
                  </div>
                </div>
              </TableCell>

              {/* Cell: Schedule Time */}
              <TableCell className="px-8 py-5">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm font-bold text-slate-700">
                    <Calendar size={14} className="mr-2 text-sky-500" />
                    {schedule.startTime ? new Date(schedule.startTime).toLocaleDateString("vi-VN") : "N/A"}
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-500 ml-1">
                    <Clock size={12} className="mr-2 text-slate-400" />
                    {schedule.startTime ? new Date(schedule.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    {" - "}
                    {schedule.endTime ? new Date(schedule.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </div>
                </div>
              </TableCell>

              {/* Cell: Location */}
              <TableCell className="px-8 py-5">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm font-bold text-slate-700">
                    <MapPin size={14} className="mr-2 text-rose-400" />
                    Rạp: {cinemas.find((c: any) => c.id === schedule.cinemaId)?.label || schedule.cinemaId || "N/A"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pl-6 uppercase tracking-widest">
                    Phòng: {schedule.roomId ? <RoomName roomId={schedule.roomId} cinemaId={schedule.cinemaId} /> : "N/A"}
                  </div>
                </div>
              </TableCell>

              {/* Cell: Status */}
              <TableCell className="px-8 py-5">
                <StatusBadge
                  status={schedule.status ? "Hoạt động" : "Vô hiệu hóa"}
                  type={schedule.status ? "success" : "neutral"}
                />
              </TableCell>

              {/* Cell: Actions */}
              <TableCell className="px-8 py-5 text-right">
                <TableActions
                  onEdit={() => handleEdit(schedule)}
                  onDelete={() => alert("Chưa hỗ trợ xóa lịch chiếu")}
                />
              </TableCell>
            </TableRow>
          ))}
        </ManagementTable>
      </BaseManagementLayout>

      <BaseFormModal
        mode="add"
        open={isAddOpen}
        onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
        title="Thêm lịch chiếu mới"
        fields={addFormFields}
        values={form}
        onChange={handleFormChange}
        onSubmit={handleCreate}
        onCancel={() => { setIsAddOpen(false); resetForm(); }}
        errors={errors}
        loading={loadingSubmit}
      />

      <BaseFormModal
        mode="update"
        open={isEditOpen}
        onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}
        title="Cập nhật lịch chiếu"
        fields={editFormFields}
        values={form}
        onChange={handleFormChange}
        onSubmit={handleUpdate}
        onCancel={() => { setIsEditOpen(false); resetForm(); }}
        errors={errors}
        loading={loadingSubmit}
      />
    </>
  );
};

export default ScheduleManagement;
