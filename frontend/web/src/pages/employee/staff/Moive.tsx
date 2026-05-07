
import React, { useState, useEffect } from 'react';
import { Clock, Star } from 'lucide-react';
import { showScheduleService } from '@/services/show-schedule.service';
import { toast } from 'react-toastify';

interface AgeType {
  id: string;
  name: string;
  description: string;
}

interface Actor {
  id: string;
  fullName: string;
  avatarUrl: string;
}

interface Movie {
  id: string;
  title: string;
  duration: number;
  premiereDate: string;
  description: string;
  thumbnailUrl: string;
  ageType: AgeType;
  genre: string[];
  actors: Actor[];
  avgRating: number;
}

const mockMovies: Movie[] = [];

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl aspect-2/3 shadow-2xl cursor-pointer group">
      {/* Background Image */}
      <img
        src={movie.thumbnailUrl}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.85]"
      />

      {/* Overlay with Info */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
        <div className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          {(movie.genre ?? []).slice(0, 2).join(" • ")}
        </div>
        <div>
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{movie.title}</h3>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{movie.duration} phút</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{movie.avgRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Rating Tag */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-[#a35126] text-white px-3 py-1 rounded-md font-bold text-lg shadow-lg border border-white/10">
          {movie.ageType?.name ?? 'Không xác định'}
        </div>
      </div>
    </div>
  );
};

const Moive: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(mockMovies);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await showScheduleService.getMovies_and_schedules();
        console.log(response);
        const moviesData = Array.isArray(response.data) 
          ? response.data.map((item : any) => item.movie)
          : (response?.data ?? []);
        console.log(moviesData);
        setMovies(moviesData);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        toast.error('Không thể tải danh sách phim');
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 md:p-12">
      {/* Header */}
      <div className="max-w-400 mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">
            PHIM ĐANG <span className="text-[#f26b38]">CHIẾU</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-1 w-20 bg-[#f26b38] rounded-full" />
            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">
              Today's Schedule • {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">
            {movies.length} PHIM ĐANG CHIẾU
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="max-w-400 mx-auto flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#f26b38]"></div>
            <p className="text-gray-400 text-sm font-medium">Đang tải danh sách phim...</p>
          </div>
        </div>
      ) : movies.length > 0 ? (
        <div className="max-w-400 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="max-w-400 mx-auto flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm font-medium">Không có phim nào đang chiếu</p>
        </div>
      )}
      
      {/* Footer Decoration */}
      <div className="max-w-400 mx-auto mt-20 pt-10 border-t border-white/5 flex justify-center">
        <p className="text-gray-600 text-sm font-medium">ALPHA CINEMA - TRẢI NGHIỆM ĐIỆN ẢNH ĐỈNH CAO</p>
      </div>
    </div>
  );
};

export default Moive;
