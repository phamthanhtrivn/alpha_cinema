import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/slices/authSlice";
import { reviewService } from "@/services/review.service";
import { ReviewType, type ReviewResponseDTO } from "@/types/review";
import { Star, User, Calendar, CheckCircle2, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatFullDateTime, formatRelativeTime } from "@/utils/formatTime";
import { Pagination } from "@/components/common/Pagination";
import { ReviewGallery, ReviewImageGrid } from "./MovieReviewImages";
import WriteReviewModal from "./WriteReviewModal";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface MovieReviewsProps {
  movieId: string;
  movieName: string;
  avgRating: number;
  totalReviews: number;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}

const MovieReviews = ({ movieId, movieName, avgRating, totalReviews }: MovieReviewsProps) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(selectAuth);

  const { data, isLoading } = useQuery<{ data: PageResponse<ReviewResponseDTO> }>({
    queryKey: ["movie-reviews", movieId, page],
    queryFn: () => reviewService.getReviewsByMovieId(movieId, page),
    enabled: !!movieId,
  });

  const { data: checkData } = useQuery({
    queryKey: ["check-review", movieId, user?.id],
    queryFn: () => reviewService.checkUserReviewed(movieId),
    enabled: !!user?.id && !!movieId,
  });

  const hasReviewed = checkData?.data || false;

  const reviews = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Lấy tất cả ảnh từ các review trong trang hiện tại
  const allReviewImages = reviews.flatMap(r => r.pictures || []);

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return "Xuất sắc";
    if (rating >= 7) return "Rất tốt";
    if (rating >= 5) return "Khá tốt";
    return "Cần cải thiện";
  };

  const renderReviewTypeBadge = (type: ReviewType) => {
    switch (type) {
      case ReviewType.VIEWED:
        return (
          <span className="flex items-center gap-1 font-medium text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={10} />
            Đã xem phim
          </span>
        );
      case ReviewType.PURCHASED:
        return (
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
            Đã mua vé
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
            Chưa mua vé
          </span>
        );
    }
  };

  if (isLoading) {
    return <div className="mt-8 text-slate-500 italic">Đang tải đánh giá...</div>;
  }

  return (
    <div className="mt-12 mb-10">
      <div className="flex justify-between items-center mb-6 pl-4 border-l-4 border-alpha-blue">
        <h2 className="text-slate-800 font-medium text-lg uppercase m-0">
          Đánh giá phim <span className="text-alpha-orange font-semibold">{movieName}</span>
        </h2>
        {isAuthenticated ? (
          <Button
            disabled={hasReviewed}
            onClick={() => setIsReviewModalOpen(true)}
            className={`px-4 py-2 rounded-sm font-medium text-sm transition-colors ${hasReviewed
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-alpha-blue text-white hover:bg-alpha-blue/60 shadow-sm"
              }`}
          >
            {hasReviewed ? "Bạn đã đánh giá rồi" : "Viết đánh giá"}
          </Button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-alpha-blue text-white rounded-sm font-medium text-sm hover:bg-alpha-blue/60 shadow-sm"
          >
            Viết đánh giá
          </Link>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {/* Tổng quan điểm số + Gallery ảnh (Chỉ hiện khi có đánh giá) */}
        {totalReviews > 0 && (
          <div className="flex flex-col md:flex-row border-b border-slate-100">
            {/* Tổng quan (Bên Trái) */}
            <div className="p-6 flex flex-row gap-6 items-center border-b md:border-b-0 md:border-r border-slate-100 md:border-slate-200">
              <div className="flex items-center gap-2">
                <Star size={30} className="text-alpha-orange fill-alpha-orange shrink-0" />
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{avgRating}</span>
                  <span className="text-sm text-slate-400 font-normal">/10</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold text-xl leading-tight">{getRatingLabel(avgRating)}</span>
                <div className="text-sm text-slate-500 mt-0.5">({totalReviews} đánh giá)</div>
              </div>
            </div>

            {/* Gallery ảnh review (Bên Phải) */}
            <div className="flex-1 p-6 flex items-center overflow-hidden">
              <ReviewGallery images={allReviewImages} onImageClick={setSelectedImgIndex} />
            </div>
          </div>
        )}

        {/* Danh sách đánh giá */}
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">
            Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên đánh giá!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 transition-colors hover:bg-slate-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-alpha-blue/10 flex items-center justify-center text-alpha-blue">
                      <User size={20} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 mb-0.5">
                        <h4 className="font-semibold text-base text-slate-900">{review.customerName}</h4>
                        {renderReviewTypeBadge(review.reviewType)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock size={12} />
                        <span>{formatRelativeTime(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-alpha-orange px-3 py-1 rounded-sm">
                    <Star size={14} className="text-white fill-white mr-1" />
                    <span className="font-bold text-white">{review.rating}</span>
                  </div>
                </div>

                <p className="text-slate-800 text-[15px] leading-relaxed mb-4">
                  {review.comment}
                </p>

                <ReviewImageGrid
                  images={review.pictures}
                  allImages={allReviewImages}
                  onImageClick={setSelectedImgIndex}
                />
              </div>
            ))}

            {/* Pagination Component */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImgIndex !== null && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/78 flex flex-col items-center justify-between p-4 md:p-8">
          {/* Header Lightbox */}
          <div className="w-full flex justify-between items-center text-white">
            <span className="text-sm font-medium">{selectedImgIndex + 1} / {allReviewImages.length}</span>
            <button
              onClick={() => setSelectedImgIndex(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={32} />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative w-full flex-1 flex items-center justify-center group">
            {selectedImgIndex > 0 && (
              <button
                className="absolute left-0 p-4 text-white/50 hover:text-white transition-colors z-10"
                onClick={() => setSelectedImgIndex((prev) => (prev! > 0 ? prev! - 1 : allReviewImages.length - 1))}
              >
                <ChevronLeft size={64} />
              </button>
            )}

            <img
              src={allReviewImages[selectedImgIndex]}
              className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm"
              alt="Full view"
            />

            {selectedImgIndex < allReviewImages.length - 1 && (
              <button
                className="absolute right-0 p-4 text-white/50 hover:text-white transition-colors z-10"
                onClick={() => setSelectedImgIndex((prev) => (prev! < allReviewImages.length - 1 ? prev! + 1 : 0))}
              >
                <ChevronRight size={64} />
              </button>
            )}
          </div>

          {/* Thumbnails Carousel (Bottom) */}
          <div className="w-full max-w-4xl overflow-x-auto flex justify-center gap-3 p-4 scrollbar-hide">
            {allReviewImages.map((img, idx) => (
              <div
                key={idx}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 cursor-pointer border-2 transition-all rounded-md overflow-hidden ${selectedImgIndex === idx ? 'border-alpha-orange scale-110' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                onClick={() => setSelectedImgIndex(idx)}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        movieId={movieId}
        movieName={movieName}
      />
    </div>
  );
};

export default MovieReviews;
