import React from "react";
import { Star, Clock, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import type { MoviePublic } from "@/types/movie";

interface MovieHorizontalCardProps {
  movie: MoviePublic;
}

const MovieHorizontalCard: React.FC<MovieHorizontalCardProps> = ({ movie }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-5 border border-slate-100 p-2.5 rounded bg-white shadow-xs transition-all duration-300">
      {/* Left: Thumbnail/Poster */}
      <Link
        to={`/movie/${movie.id}`}
        className="w-full sm:w-36 aspect-[2/3] shrink-0 rounded overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center cursor-pointer"
      >
        <img
          src={movie.bannerUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Right: Info */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
        <div className="space-y-3">
          {/* Title */}
          <Link
            to={`/movie/${movie.id}`}
            className="font-bold text-base text-slate-800 hover:text-alpha-blue transition-colors line-clamp-2 uppercase leading-snug"
          >
            {movie.title}
          </Link>

          {/* Meta (Rating & Duration) */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Rating */}
            <div className="bg-orange-50 text-alpha-orange px-2.5 py-1 rounded flex items-center gap-1 font-bold border border-orange-100">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span>{movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "N/A"}</span>
            </div>

            {/* Duration */}
            {movie.duration > 0 && (
              <div className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded flex items-center gap-1 font-bold border border-slate-200">
                <Clock size={14} />
                <span>{movie.duration} phút</span>
              </div>
            )}

            {/* Age Rating Badge */}
            {movie.ageType && (
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase border border-red-200">
                {movie.ageType}
              </span>
            )}
          </div>

          {/* Description / Summary */}
          <p className="text-slate-500 text-xs leading-relaxed text-justify line-clamp-3">
            {movie?.description || "Chưa có tóm tắt nội dung phim."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieHorizontalCard;
