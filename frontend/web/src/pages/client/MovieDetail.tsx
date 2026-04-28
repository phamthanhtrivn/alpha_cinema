import { useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
import { useState } from 'react';
import { showScheduleService } from '@/services/show-schedule.service';
import type { CinemaShowtime } from '@/types/show-schedule';
import { ALL_TRANSLATION } from '@/types/movie';
import { formatHHmm } from '@/utils/formatTime';

const MovieDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);

    const {
        data: movie,
        isLoading,
        isError,
    } = useQuery<MoviePublicDetail>({
        queryKey: ['movie-detail', id],
        queryFn: () => movieService.clientGetDetailMovie(id!).then((res: any) => res.data),
        enabled: !!id,
    });

    const generateDates = () => {
        const dates = [];
        const today = new Date();
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dateString = nextDate.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD để gửi API
            const dayName = i === 0 ? 'Hôm Nay' : days[nextDate.getDay()];
            const dateNum = `${String(nextDate.getDate()).padStart(2, '0')}/${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
            dates.push({ dateString, dayName, dateNum });
        }
        return dates;
    };

    const dateTabs = generateDates();
    const [selectedDate, setSelectedDate] = useState<string>(dateTabs[0].dateString);


    // Lấy dữ liệu Lịch chiếu theo Ngày
    const { data: showtimes, isFetching: isFetchingShowtimes } = useQuery<CinemaShowtime[]>({
        queryKey: ['movie-showtimes', id, selectedDate],
        queryFn: () => showScheduleService.getMovieShowtimes(id!, selectedDate).then((res: any) => res.data),
        enabled: !!id && !!selectedDate,
        staleTime: 5 * 60 * 1000,  // Dữ liệu "tươi" trong 5 phút → không refetch
        gcTime: 10 * 60 * 1000,    // Giữ cache 10 phút kể cả khi đổi ngày
        placeholderData: keepPreviousData,
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
            <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Nhà sản xuất:</span>
                <span className="font-medium text-slate-700">{movie.producer}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Thể loại:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.genre?.map(g => <span key={g} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{g}</span>)}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Đạo diễn:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.directors?.map(d => <span key={d.id} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{d.name}</span>)}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="w-[120px] shrink-0 text-slate-400 mb-1 sm:mb-0">Diễn viên:</span>
                <div className="flex flex-wrap gap-2">
                    {movie.actors?.map(a => <span key={a.id} className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600">{a.name}</span>)}
                </div>
            </div>
        </div>
    );


    return (
        <div className="bg-white min-h-screen pb-20 scrollbar-hide">
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
            <Section className="max-w-6xl mx-auto relative z-20">
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
                                    <div className="flex items-center gap-1.5"><Calendar size={16} color='orange' /> <span>{movie.premiereDate?.toString()}</span></div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Star size={20} fill="#f59e0b" className="text-orange-500" />
                                    <span className="text-xl font-black text-slate-800">{movie.avgRating}</span>
                                    <span className="text-slate-400 text-xs">(152 votes)</span>
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
                        {/* Lịch chiếu */}
                        <div className="mt-12">
                            <div className="border-l-4 border-alpha-blue pl-4 mb-6">
                                <h2 className="text-slate-800 font-medium text-lg">Lịch chiếu</h2>
                            </div>

                            {/* Thanh chọn ngày & Filter */}
                            <div className="border-b-2 border-alpha-blue mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                {/* Scroll ngang cho Tabs ngày */}
                                <div className="flex overflow-x-auto scrollbar-hide w-full md:w-auto">
                                    {dateTabs.map((tab) => {
                                        const isActive = selectedDate === tab.dateString;
                                        return (
                                            <button
                                                key={tab.dateString}
                                                onClick={() => setSelectedDate(tab.dateString)}
                                                className={`flex flex-col items-center justify-center min-w-[90px] px-4 py-3 cursor-pointer transition-colors ${isActive
                                                    ? 'bg-alpha-blue text-white rounded-t-md'
                                                    : 'bg-white text-slate-600 hover:text-alpha-blue'
                                                    }`}
                                            >
                                                <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{tab.dayName}</span>
                                                <span className={`text-sm ${isActive ? 'font-bold' : ''}`}>{tab.dateNum}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Dropdown bộ lọc (Mock UI) */}
                                <div className="flex gap-4 pb-2 w-full md:w-auto">
                                    <select className="border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-alpha-blue w-full md:w-auto">
                                        <option>Tất cả rạp</option>
                                        <option>Galaxy Tân Bình</option>
                                    </select>
                                </div>
                            </div>

                            {/* Danh sách rạp & Giờ chiếu */}
                            <div className="space-y-6 relative min-h-[100px]">
                                {/* Overlay loading khi đang fetch (không thay thế nội dung) */}
                                {isFetchingShowtimes && (
                                    <div className="absolute inset-0 bg-white/70 z-10 flex justify-center pt-10 rounded-lg">
                                        <Loader2 className="animate-spin text-alpha-blue" size={32} />
                                    </div>
                                )}

                                {!showtimes || showtimes.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 italic">
                                        Không có lịch chiếu nào vào ngày này.
                                    </div>
                                ) : (
                                    showtimes.map((cinema) => (
                                        <div key={cinema.cinemaId} className="border-b border-slate-100 pb-6 last:border-0">
                                            {/* Tên rạp */}
                                            <h3 className="text-slate-800 font-bold text-lg mb-4">
                                                {cinema.cinemaName}
                                            </h3>

                                            {/* Danh sách định dạng (2D/3D) */}
                                            <div className="space-y-4">
                                                {cinema.formats.map((format, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row md:items-center lg:items-center sm:items-start gap-2 sm:gap-6">
                                                        <span className="text-sm font-bold text-slate-700 w-32 shrink-0">
                                                            {format.projection} {ALL_TRANSLATION.find(t => t.value === format.translation)?.label || format.translation}
                                                        </span>
                                                        <div className="flex flex-wrap gap-3">
                                                            {format.showtimes.map((st) => (
                                                                <button
                                                                    key={st.id}
                                                                    className="border border-slate-200 rounded-md px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-700 hover:text-blue-700 transition-all bg-white shadow-sm hover:shadow-md active:scale-95"
                                                                    onClick={() => alert(`Chuyển đến trang chọn ghế suất chiếu: ${st.id}`)}
                                                                >
                                                                    {formatHHmm(st.time)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Sidebar (Chỉ hiện trên Desktop) */}
                    <div className="hidden lg:block w-[300px] shrink-0 pl-8">
                        <div className="border-l-4 border-alpha-blue pl-4 mb-6">
                            <h2 className="text-lg font-black uppercase text-slate-800">Phim đang chiếu</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 italic">Danh sách phim khác...</p>
                        </div>
                    </div>
                </Container>
            </Section>

            <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} trailerUrl={movie.trailerUrl} />
        </div>
    );
};

export default MovieDetail;
