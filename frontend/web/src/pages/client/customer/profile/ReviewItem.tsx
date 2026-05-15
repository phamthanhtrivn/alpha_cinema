import React from "react";
import { Star, Clock, Check, AlertCircle, XCircle, User, Eye } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatTime";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ReviewItemProps {
  review: any;
  movie?: any;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, movie }) => {
  return (
    <div className="p-4 border border-slate-100 rounded-md bg-white hover:border-alpha-orange/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-alpha-blue/10 flex items-center justify-center text-alpha-blue">
              <User size={20} />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800">
                {review.customerName}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Clock size={11} />
                <span>{formatRelativeTime(review.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={16} className="text-alpha-orange fill-alpha-orange" />
            <span className="text-[15px] font-bold ">
              {review.rating}/10
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${review.status === "APPROVED"
            ? "bg-green-50 text-green-600 border border-green-100"
            : review.status === "HIDDEN"
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
        >
          {review.status === "APPROVED" ? (
            <>
              <Check size={10} strokeWidth={3} />
              Đã duyệt
            </>
          ) : review.status === "HIDDEN" ? (
            <>
              <XCircle size={10} strokeWidth={3} />
              Bị ẩn đi do vi phạm quy định
            </>
          ) : (
            <>
              <AlertCircle size={10} strokeWidth={3} />
              Chờ duyệt
            </>
          )}
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {review.comment}
      </p>

      {review.pictures && review.pictures.length > 0 && (
        <div className="flex gap-2 mt-4">
          {review.pictures.map((pic: string, idx: number) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-md overflow-hidden bg-slate-100"
            >
              <img
                src={pic}
                alt="review"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="my-3 border-t border-slate-100" />

      <div className="flex items-center justify-between">
        {movie && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 max-w-[70%]">
              <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-slate-800 truncate">{movie.title}</h5>
              </div>
            </div>
            <Link to={`/movie/${movie.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-semibold border-alpha-blue/20 text-alpha-blue hover:bg-alpha-blue hover:text-white transition-all gap-1.5"
              >
                <Eye size={12} />
                Xem
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
