/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, Trash2, Calendar, Film, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import BaseManagementLayout from '@/components/employee/BaseManagementLayout';
import ManagementFilterBar from '@/components/employee/ManagementFilterBar';
import ManagementTable from '@/components/employee/ManagementTable';
import StatusBadge from '@/components/employee/StatusBadge';
import { FilterSelect } from '@/components/employee/FilterSelect';
import { TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ViewModal from '@/components/employee/ViewModal';
import { reviewService } from '@/services/review.service';
import { movieService } from '@/services/movie.service';

const ReviewManagement: React.FC = () => {
  const pageSize = 10;

  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mặc định hiển thị các đánh giá PENDING
  const [filters, setFilters] = useState<any>({
    status: 'PENDING',
    movieId: undefined,
    reviewType: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    status: 'PENDING',
    movieId: undefined,
    reviewType: undefined,
  });

  // Tải danh sách phim bằng react-query
  const { data: moviesRes } = useQuery({
    queryKey: ['movies-all'],
    queryFn: () => movieService.getAllMovies({ size: 100 }),
  });
  const movies = moviesRes?.data?.content || [];

  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== "" && v !== "Tất cả")
    );
  };

  // Tải danh sách đánh giá bằng react-query
  const { data: reviewsRes, isLoading: loading } = useQuery({
    queryKey: ['reviews', currentPage, appliedFilters],
    queryFn: () => reviewService.getAllReviews(buildParams()),
  });
  const reviews = reviewsRes?.data?.content || [];
  const totalItems = reviewsRes?.data?.totalElements || 0;

  const handleRefresh = () => {
    const reset = {
      status: 'PENDING', // Reset về mặc định là PENDING
      movieId: undefined,
      reviewType: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };

  // Mutation phê duyệt
  const approveMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reviewService.updateReviewStatus(reviewId, "APPROVED", reason),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Duyệt bình luận thành công!");
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      } else {
        toast.error(res.message || "Phê duyệt thất bại!");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Lỗi hệ thống khi duyệt!");
    },
  });

  const handleApprove = (reviewId: string) => {
    Swal.fire({
      title: "Xác nhận duyệt bình luận",
      text: "Bạn có muốn phê duyệt hiển thị bình luận này không? Bạn có thể nhập lý do hoặc phản hồi (tùy chọn):",
      input: "text",
      inputPlaceholder: "Nhập lý do duyệt hoặc lời nhắn...",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Phê duyệt",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#94a3b8",
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value || "Đã phê duyệt";
        approveMutation.mutate({ reviewId, reason });
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setDeleteReason("");
    setDeleteError("");
    setIsDeleteOpen(true);
  };

  // Mutation ẩn/xóa vi phạm
  const deleteMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reviewService.deleteReview(reviewId, reason),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã xóa bình luận thành công!");
        setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      } else {
        toast.error(res.message || "Xóa thất bại!");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Lỗi hệ thống khi xóa!");
    },
  });

  const handleDeleteSubmit = () => {
    if (!deleteReason.trim()) {
      setDeleteError("Bạn phải nhập lý do để xóa bình luận!");
      return;
    }

    if (!deletingReviewId) return;

    deleteMutation.mutate({ reviewId: deletingReviewId, reason: deleteReason });
  };

  const getMovieTitle = (movieId: string) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.title : `Mã phim: ${movieId}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? "text-amber-400 fill-amber-400 animate-pulse duration-1000" : "text-slate-200"}
          />
        ))}
      </div>
    );
  };

  const handleView = (review: any) => {
    setSelectedReview(review);
    setIsViewOpen(true);
  };

  const reviewViewFields = [
    {
      key: "id",
      label: "Mã đánh giá",
    },
    {
      key: "customerName",
      label: "Khách hàng",
      render: (val: any, data: any) => (
        <span className="font-semibold text-slate-800">{val || `ID: ${data?.customerId || ''}`}</span>
      ),
    },
    {
      key: "reviewType",
      label: "Loại đánh giá",
      render: (val: string) => {
        if (val === "PURCHASED") return "Đã mua vé";
        if (val === "VIEWED") return "Đã xem phim";
        return "Chưa mua vé";
      },
    },
    {
      key: "movieId",
      label: "Phim",
      render: (val: string) => getMovieTitle(val),
    },
    {
      key: "rating",
      label: "Điểm số",
      render: (val: number) => {
        if (val === undefined || val === null) return "-";
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{val} / 10</span>
            {renderStars(val)}
          </div>
        );
      },
    },
    {
      key: "comment",
      label: "Nội dung bình luận",
      render: (val: string) => (
        <p className="italic text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">"{val}"</p>
      ),
    },
    {
      key: "pictures",
      label: "Hình ảnh kèm theo",
      render: (pics: string[]) => {
        if (!pics || pics.length === 0) return "Không có hình ảnh";
        return (
          <div className="flex flex-wrap gap-2 pt-1">
            {pics.map((pic: string, index: number) => (
              <div
                key={index}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in hover:border-sky-400 hover:scale-105 transition-all shadow-sm flex-shrink-0 bg-slate-50"
                onClick={() => setSelectedImage(pic)}
              >
                <img
                  src={pic}
                  alt="Review thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (val: string) => {
        if (val === "APPROVED") return "Đã duyệt";
        if (val === "HIDDEN") return "Bị ẩn";
        return "Chờ duyệt";
      },
    },
    {
      key: "moderationReason",
      label: "Lý do duyệt/ẩn/xóa",
      render: (val: string) => val || "-",
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (val: string) => val ? new Date(val).toLocaleString("vi-VN") : "N/A",
    },
  ];

  const statusOptions = [
    { label: "Tất cả", value: "Tất cả" },
    { label: "Chờ duyệt (PENDING)", value: "PENDING" },
    { label: "Đã duyệt (APPROVED)", value: "APPROVED" },
    { label: "Bị ẩn (HIDDEN)", value: "HIDDEN" },
  ];

  const typeOptions = [
    { label: "Tất cả loại", value: "Tất cả" },
    { label: "Đã mua vé (PURCHASED)", value: "PURCHASED" },
    { label: "Đã xem (VIEWED)", value: "VIEWED" },
    { label: "Chưa mua (NOT_PURCHASED)", value: "NOT_PURCHASED" },
  ];

  const movieOptions = [
    { label: "Tất cả phim", value: "Tất cả" },
    ...movies.map(m => ({ label: m.title, value: m.id }))
  ];

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Lọc theo Trạng thái */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Trạng thái duyệt
        </label>
        <FilterSelect
          placeholder="Lọc theo trạng thái"
          options={statusOptions}
          value={filters.status || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, status: value === "Tất cả" ? undefined : value })}
        />
      </div>

      {/* Lọc theo Loại đánh giá */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Loại đánh giá
        </label>
        <FilterSelect
          placeholder="Lọc theo loại"
          options={typeOptions}
          value={filters.reviewType || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, reviewType: value === "Tất cả" ? undefined : value })}
        />
      </div>

      {/* Lọc theo Phim */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Lọc theo phim
        </label>
        <FilterSelect
          placeholder="Chọn phim"
          options={movieOptions}
          value={filters.movieId || "Tất cả"}
          onChange={(value) => setFilters({ ...filters, movieId: value === "Tất cả" ? undefined : value })}
        />
      </div>

      {/* Hành động bộ lọc */}
      <div className="flex items-end gap-3">
        <button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          onClick={() => {
            setCurrentPage(1);
            setAppliedFilters(filters);
          }}
          disabled={loading}
        >
          Lọc dữ liệu
        </button>
        <button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 transition-all cursor-pointer"
          onClick={handleRefresh}
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <BaseManagementLayout
      title="Quản lý Đánh giá"
      subtitle="Theo dõi, duyệt ẩn bình luận và quản lý tiêu chuẩn đánh giá từ khách hàng."
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
      {/* Lightbox Dialog to view full image */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Hình ảnh bình luận"
              className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl ring-4 ring-white/10"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Xem chi tiết đánh giá */}
      {selectedReview && (
        <ViewModal
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Chi tiết đánh giá"
          data={selectedReview}
          fields={reviewViewFields}
        />
      )}

      {/* Modal nhập lý do xóa bình luận */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl p-6 bg-white/95 backdrop-blur-sm overflow-hidden border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="text-rose-500" size={20} />
              Xác nhận xóa bình luận
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng cung cấp lý do xóa bình luận này. Lý do này sẽ được lưu trữ trong hệ thống và hiển thị cho người dùng.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Lý do xóa vi phạm
              </label>
              <textarea
                placeholder="Nhập lý do chi tiết (ví dụ: Bình luận chứa nội dung thô tục, quảng cáo không đúng nơi quy định, spam...)..."
                value={deleteReason}
                onChange={(e) => {
                  setDeleteReason(e.target.value);
                  if (deleteError) setDeleteError("");
                }}
                className="w-full min-h-[100px] rounded-2xl border border-slate-100 bg-white/50 p-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
              />
              {deleteError && (
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                  {deleteError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="h-11 px-5 rounded-2xl font-bold text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer flex-1"
              disabled={deleteMutation.isPending}
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteSubmit}
              className="h-11 px-5 rounded-2xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all cursor-pointer flex-1 flex items-center justify-center gap-2"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xử lý..." : "Xác nhận xóa"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManagementTable
        headers={[
          "Khách hàng / Loại",
          "Phim",
          "Đánh giá",
          "Nội dung / Hình ảnh",
          "Trạng thái",
          "Lý do duyệt/ẩn",
          "Ngày gửi",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {reviews.map((review) => (
          <TableRow
            key={review.id}
            className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50 relative overflow-hidden"
          >
            {/* Khách hàng & Loại */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-1">
                <span className="font-black text-slate-800 text-sm tracking-tight">
                  {review.customerName || `Khách hàng: ${review.customerId}`}
                </span>
                <div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider
                    ${review.reviewType === "PURCHASED"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : review.reviewType === "VIEWED"
                        ? "bg-sky-50 text-sky-600 border border-sky-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {review.reviewType === "PURCHASED" && "Đã mua vé"}
                    {review.reviewType === "VIEWED" && "Đã xem phim"}
                    {review.reviewType === "NOT_PURCHASED" && "Chưa mua vé"}
                  </span>
                </div>
              </div>
            </TableCell>

            {/* Bộ phim */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                <Film size={14} className="text-slate-400 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{getMovieTitle(review.movieId)}</span>
              </div>
            </TableCell>

            {/* Điểm số */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-black text-slate-700">{review.rating} / 10</span>
                {renderStars(review.rating)}
              </div>
            </TableCell>

            {/* Nội dung comment & Hình ảnh */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-2 max-w-[280px]">
                <p className="text-xs font-medium text-slate-600 leading-relaxed break-words bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 italic">
                  "{review.comment}"
                </p>

                {review.pictures && review.pictures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {review.pictures.map((pic: string, index: number) => (
                      <div
                        key={index}
                        className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in hover:border-sky-400 hover:scale-105 transition-all shadow-sm flex-shrink-0 bg-slate-50"
                        onClick={() => setSelectedImage(pic)}
                      >
                        <img
                          src={pic}
                          alt="Review thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TableCell>

            {/* Trạng thái */}
            <TableCell className="px-8 py-5">
              <StatusBadge
                status={
                  review.status === "APPROVED"
                    ? "Đã duyệt"
                    : review.status === "HIDDEN"
                      ? "Bị ẩn"
                      : "Chờ duyệt"
                }
                type={
                  review.status === "APPROVED"
                    ? "success"
                    : review.status === "HIDDEN"
                      ? "error"
                      : "warning"
                }
              />
            </TableCell>

            {/* Lý do duyệt/ẩn */}
            <TableCell className="px-8 py-5">
              <span className="text-xs font-medium text-slate-500 italic max-w-[140px] truncate block" title={review.moderationReason}>
                {review.moderationReason || "-"}
              </span>
            </TableCell>

            {/* Ngày gửi */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center text-xs font-bold text-slate-500 italic tracking-tight whitespace-nowrap">
                <Calendar size={13} className="mr-1.5 text-slate-300" />
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "N/A"}
              </div>
            </TableCell>

            {/* Hành động */}
            <TableCell className="px-8 py-5 text-right">
              <div className="flex items-center justify-end gap-1.5">
                {/* Nút xem chi tiết */}
                <button
                  onClick={() => handleView(review)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                  title="Xem chi tiết"
                >
                  <Eye size={14} />
                </button>

                {/* Nút phê duyệt */}
                {review.status !== "APPROVED" && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                    title="Phê duyệt hiển thị"
                  >
                    <Check size={14} className="stroke-[3]" />
                  </button>
                )}

                {/* Nút xóa bình luận */}
                {review.status !== "HIDDEN" && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                    title="Xóa bình luận"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default ReviewManagement;
