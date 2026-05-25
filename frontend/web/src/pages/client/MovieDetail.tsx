import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../../services/movie.service';
import { Container, Section } from '../../components/common/Layout';
import type { MoviePublicDetail } from '../../types/movie';
import {
    Clock,
    Calendar,
    Star,
    Play,
    Loader2,
} from 'lucide-react';
import TrailerModal from '@/components/client/TrailerModel';
import MovieShowtimes from '@/components/client/MovieShowtimes';
import MovieReviews from '@/components/client/MovieReviews';
import { useState, useRef } from 'react';
import { showScheduleService } from '@/services/show-schedule.service';
import { formatDDMMYYYY } from '@/utils/formatTime';
import NowShowingMovies from '@/components/client/NowShowingMovies';

const MovieDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
    const reviewsRef = useRef<HTMLDivElement>(null);

    const scrollToReviews = () => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const {
        data: movie,
        isLoading,
        isError,
    } = useQuery<MoviePublicDetail>({
        queryKey: ['movie-detail', id],
        queryFn: () => movieService.clientGetDetailMovie(id!).then((res: any) => res.data),
        enabled: !!id,
    });

    const { data: availableDates } = useQuery<string[]>({
        queryKey: ['available-dates', id],
        queryFn: () => showScheduleService.getAvailableDateOnMovie(id!).then((res: any) => res.data),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-alpha-dark flex items-center justify-center">
                <Loader2 className="animate-spin text-alpha-orange" size={48} />
            </div>
        );
    }

    if (isError || !movie) {
        return (
            <div className="min-h-screen bg-alpha-dark flex items-center justify-center">
                <p className="text-white text-lg">Không tìm thấy phim.</p>
            </div>
        );
    }

    const MovieMetadata = () => (
        <div className="space-y-4 text-sm w-full mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Nhà sản xuất:</span>
                <span className="font-medium text-slate-700">{movie.producer}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Thể loại:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.genre?.map(g => <span key={g} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{g}</span>)}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Đạo diễn:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.directors?.map(d => <span key={d.id} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{d.fullName}</span>)}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Diễn viên:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.actors?.map(a => <span key={a.id} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{a.fullName}</span>)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* SECTION 1: HERO BANNER */}
            <div className="w-full bg-black">
                <div className="max-w-6xl mx-auto relative h-[400px] md:h-[500px]">
                    <img src={movie.bannerUrl} className="w-full h-full object-contain" alt="banner" />
                    <div className="absolute inset-0 z-10">
                        <div className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-black via-black/60 to-transparent" />
                        <div className="absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-black via-black/60 to-transparent" />
                    </div>
                    <button onClick={() => setIsTrailerOpen(true)} className="absolute inset-0 m-auto w-16 h-16 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 transition-all group z-20">
                        <Play fill="white" className="text-white group-hover:scale-110 transition-transform" size={32} />
                    </button>
                </div>
            </div>

            {/* 2. MAIN CONTENT SECTION */}
            <Section className="mx-auto relative z-20">
                <Container className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1">

                        {/* KHỐI LUÔN NẰM NGANG (Row) */}
                        <div className="flex flex-row gap-6 md:gap-8">

                            {/* Cột 1.1: Thumbnail */}
                            <div className="w-[120px] sm:w-[160px] md:w-[250px] lg:w-[300px] shrink-0 -mt-16 md:-mt-32 z-10">
                                <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white bg-slate-900">
                                    <img src={movie.thumbnailUrl} alt={movie.title} className="w-full aspect-2/3 object-cover" />
                                </div>
                            </div>

                            {/* Cột 1.2: Thông tin cơ bản */}
                            <div className="flex-1 pt-2 md:pt-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                        {movie.title}
                                    </h1>
                                    <span className="bg-orange-400 text-white px-2 py-0.5 rounded text-base font-semibold shrink-0">
                                        {movie.ageType}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-1.5"><Clock size={16} color='orange' /> <span>{movie.duration} Phút</span></div>
                                    <div className="flex items-center gap-1.5"><Calendar size={16} color='orange' /> <span>{formatDDMMYYYY(movie.premiereDate?.toString())}</span></div>
                                </div>

                                <div
                                    className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity w-fit"
                                    onClick={scrollToReviews}
                                >
                                    <Star size={20} fill="#f59e0b" className="text-orange-500" />
                                    <span className="text-xl font-black text-slate-800">{movie.avgRating}</span>
                                    <span className="text-slate-400 text-xs">({movie.totalReviews} votes)</span>
                                </div>

                                <div className="text-sm">
                                    <span className="text-slate-400 mr-2">Quốc gia:</span>
                                    <span className="font-medium text-slate-700">{movie.nationality}</span>
                                </div>

                                {/* VỊ TRÍ 1: Khi màn hình đủ rộng (lg), Metadata sẽ hiện ở đây */}
                                <div className="hidden lg:block">
                                    <MovieMetadata />
                                </div>
                            </div>
                        </div>

                        {/* VỊ TRÍ 2: Khi màn hình thu nhỏ, Metadata sẽ bị "đá" xuống đây */}
                        <div className="lg:hidden">
                            <MovieMetadata />
                        </div>

                        {/* Nội dung phim */}
                        <div className="mt-8">
                            <div className="border-l-4 border-alpha-blue pl-4 mb-4">
                                <h2 className="text-slate-800 font-medium text-lg">Nội dung phim</h2>
                            </div>
                            <p className="text-slate-600 text-justify text-sm leading-relaxed">
                                {movie.description}
                            </p>
                        </div>

                        {/* Lịch chiếu - Chỉ hiển thị nếu có ngày chiếu khả dụng */}
                        {availableDates && availableDates.length > 0 && (
                            <MovieShowtimes movieId={id!} availableDates={availableDates} />
                        )}

                        {/* Đánh giá phim */}
                        <div ref={reviewsRef}>
                            <MovieReviews
                                movieId={id!}
                                movieName={movie.title}
                                avgRating={movie.avgRating}
                                totalReviews={movie.totalReviews}
                            />
                        </div>
                    </div>

                    {/* CỘT PHẢI: Sidebar (Chỉ hiện trên Desktop) */}
                    <div className="hidden lg:block w-[32%] shrink-0 pl-8">
                        <div className="border-l-4 border-alpha-blue pl-4 mb-6">
                            <h2 className="text-lg font-black uppercase text-slate-800">Phim đang chiếu</h2>
                        </div>
                        <NowShowingMovies />
                    </div>
                </Container>
            </Section>

            <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} trailerUrl={movie.trailerUrl} />
        </div>
    );
};

export default MovieDetail;
