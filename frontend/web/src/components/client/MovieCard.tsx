import { Play, Ticket, Star } from 'lucide-react';
import type { MoviePublic } from '@/types/movie';
import { Link } from 'react-router-dom';

const MovieItem = ({ movie, onWatchTrailer }: { movie: MoviePublic; onWatchTrailer?: (url: string) => void }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Poster Container wrapped in Link to allow detail page navigation on click */}
            <Link to={`/movie/${movie.id}`} className="relative group aspect-2/3 overflow-hidden rounded-lg bg-slate-900 hover:cursor-pointer block">

                {/* Poster Image */}
                <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay Gradient (Lớp phủ tối để nổi bật text) */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/20 opacity-80" />

                {/* Hover Actions (Hiện ra khi di chuột vào) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <span className="flex items-center w-28 justify-center gap-2 bg-orange-600 hover:bg-orange-400 text-white px-4 py-2 rounded-lg border-2 border-transparent text-sm transition-all cursor-pointer">
                        <Ticket size={16} />
                        Mua vé
                    </span>

                    {/* Nút Trailer */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onWatchTrailer) {
                                onWatchTrailer(movie.trailerUrl);
                            } else {
                                window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
                            }
                        }}
                        className="flex items-center w-28 justify-center gap-2 border-2 border-white text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white hover:text-black transition-all cursor-pointer bg-transparent"
                    >
                        <Play size={16} fill="currentColor" />
                        Trailer
                    </button>
                </div>

                {/* Info Labels (Rating & Age) */}
                <div className="absolute bottom-2 right-1 flex flex-col items-end gap-2 z-10">
                    {/* Rating */}
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
                        <Star size={16} fill="#fbbf24" className="text-yellow-400" />
                        <span className="text-white font-semibold text-sm">{movie.avgRating}</span>
                    </div>

                    {/* Age Rating Tag */}
                    <div className="bg-orange-400 text-white px-3 py-1 rounded font-semibold text-sm">
                        {movie.ageType}
                    </div>
                </div>
            </Link>

            <Link to={`/movie/${movie.id}`} className="font-bold text-base truncate block hover:text-alpha-orange transition-colors">
                {movie.title}
            </Link>
        </div>
    );
};

export default MovieItem;