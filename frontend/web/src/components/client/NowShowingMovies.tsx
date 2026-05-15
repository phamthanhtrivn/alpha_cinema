import React from "react";
import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/services/movie.service";
import { ReleaseStatus, type MoviePublic } from "@/types/movie";
import { Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const NowShowingMovies: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["movies-now-showing-sidebar"],
    queryFn: () =>
      movieService.clientGetMovie({ releaseStatus: ReleaseStatus.NOW_SHOWING }, 5).then((res) => {
        return (res.data?.content || res.content || []).slice(0, 5) as MoviePublic[];
      }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-alpha-blue" size={24} />
      </div>
    );
  }

  const movies = data || [];

  if (movies.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={`/movie/${movie.id}`}
          className="group block overflow-hidden"
        >
          <div className="relative aspect-16/10 rounded-sm overflow-hidden shadow-md">
            <img
              src={movie.bannerUrl || movie.thumbnailUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Rating Overlay */}
            <div className="absolute bottom-10 right-2 bg-black/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-white/10">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold">{movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "N/A"}</span>
            </div>

            {/* Age Badge */}
            <div className="absolute bottom-2 right-2 bg-alpha-orange/90 text-white text-sm font-bold px-2 py-1 rounded shadow-lg">
              {movie.ageType}
            </div>
          </div>
          <h4 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-alpha-blue transition-colors line-clamp-2 leading-snug">
            {movie.title}
          </h4>
        </Link>
      ))}
    </div>
  );
};

export default NowShowingMovies;
