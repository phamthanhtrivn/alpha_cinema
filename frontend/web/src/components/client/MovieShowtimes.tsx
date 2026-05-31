import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { showScheduleService } from '@/services/show-schedule.service';
import { cinemaService } from '@/services/cinema.service';
import { formatHHmm } from '@/utils/formatTime';
import { ALL_TRANSLATION } from '@/types/movie';
import type { CinemaShowtime } from '@/types/show-schedule';
import { selectAuth } from '@/store/slices/authSlice';

interface MovieShowtimesProps {
    movieId: string;
    availableDates: string[];
}

const MovieShowtimes = ({ movieId, availableDates }: MovieShowtimesProps) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(selectAuth);

    const dateTabs = useMemo(() => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const todayStr = new Date().toISOString().split('T')[0];

        return availableDates.map(dateStr => {
            const date = new Date(dateStr);
            const dayName = dateStr === todayStr ? 'Hôm Nay' : days[date.getDay()];
            const dateNum = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            return { dateString: dateStr, dayName, dateNum };
        });
    }, [availableDates]);

    const [selectedDate, setSelectedDate] = useState<string>(dateTabs[0]?.dateString || '');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dateTabs.length > 0 && !selectedDate) {
            setSelectedDate(dateTabs[0].dateString);
        }
    }, [dateTabs, selectedDate]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -208, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 208, behavior: 'smooth' });
        }
    };

    // Cinema Filter
    const { data: cinemaOptions } = useQuery<{ id: string, label: string }[]>({
        queryKey: ['cinema-options'],
        queryFn: () => cinemaService.getCinemaOptions().then((res: any) => res.data),
    });

    const [selectedCinema, setSelectedCinema] = useState<string>('Tất cả rạp');

    // Lấy dữ liệu Lịch chiếu theo Ngày
    const { data: showtimes, isFetching: isFetchingShowtimes } = useQuery<CinemaShowtime[]>({
        queryKey: ['movie-showtimes', movieId, selectedDate],
        queryFn: () => showScheduleService.getMovieShowtimes(movieId, selectedDate).then((res: any) => res.data),
        enabled: !!movieId && !!selectedDate,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const filteredShowtimes = useMemo(() => {
        if (!showtimes) return [];
        if (selectedCinema === 'Tất cả rạp') return showtimes;
        return showtimes.filter(s => s.cinemaName === selectedCinema);
    }, [showtimes, selectedCinema]);

    const handleShowtimeClick = (showtimeId: string) => {
        const bookingPath = `/booking/${showtimeId}`;
        const bookingSearch = `?movieId=${movieId}`;

        if (!isAuthenticated) {
            navigate('/login', {
                state: {
                    from: {
                        pathname: bookingPath,
                        search: bookingSearch,
                    },
                },
            });
            return;
        }

        navigate(`${bookingPath}${bookingSearch}`);
    };

    return (
        <div id="showtimes" className="mt-12 scroll-mt-20">
            <div className="border-l-4 border-alpha-blue pl-4 mb-6">
                <h2 className="text-slate-800 font-medium text-lg">Lịch chiếu</h2>
            </div>

            {/* Thanh chọn ngày & Filter */}
            <div className="border-b-2 pb-2 border-alpha-blue mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                {/* Container giới hạn chiều ngang cố định và chứa 2 nút bấm Trái/Phải */}
                <div className="flex items-center gap-1 w-full md:max-w-[500px] lg:max-w-[580px] shrink-0">
                    {/* Nút mũi tên Trái */}
                    <button
                        onClick={scrollLeft}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0 cursor-pointer text-slate-700 mr-1"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Scroll ngang cho Tabs ngày */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 flex gap-2 custom-scrollbar overflow-x-auto scroll-smooth min-w-0"
                    >
                        {dateTabs.map((tab) => {
                            const isActive = selectedDate === tab.dateString;
                            return (
                                <button
                                    key={tab.dateString}
                                    onClick={() => setSelectedDate(tab.dateString)}
                                    className={`flex flex-col items-center rounded-md justify-center min-w-[96px] py-3 shrink-0 cursor-pointer transition-colors ${isActive
                                        ? 'bg-alpha-blue text-white'
                                        : 'bg-white text-slate-600 hover:text-alpha-blue'
                                        }`}
                                >
                                    <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{tab.dayName}</span>
                                    <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{tab.dateNum}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Nút mũi tên Phải */}
                    <button
                        onClick={scrollRight}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0 cursor-pointer text-slate-700 ml-1"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Dropdown bộ lọc */}
                <div className="flex gap-4 pb-2 w-full md:w-auto">
                    <select
                        className="border border-slate-300 rounded-xs px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-alpha-blue w-full md:w-auto"
                        value={selectedCinema}
                        onChange={(e) => setSelectedCinema(e.target.value)}
                    >
                        <option>Tất cả rạp</option>
                        {cinemaOptions?.map(cinema => (
                            <option key={cinema.id} value={cinema.label}>{cinema.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Danh sách rạp & Giờ chiếu */}
            <div className="space-y-6 relative min-h-[100px]">
                {/* Overlay loading khi đang fetch */}
                {isFetchingShowtimes && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex justify-center pt-10 rounded-lg">
                        <Loader2 className="animate-spin text-alpha-blue" size={32} />
                    </div>
                )}

                {filteredShowtimes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 italic">
                        Không có lịch chiếu nào vào ngày này.
                    </div>
                ) : (
                    filteredShowtimes.map((cinema) => (
                        <div key={cinema.cinemaId} className="border-b border-slate-100 pb-6 last:border-0">
                            {/* Tên rạp */}
                            <h3 className="text-slate-800 font-medium mb-4">
                                {cinema.cinemaName}
                            </h3>

                            {/* Danh sách định dạng (2D/3D) */}
                            <div className="space-y-4">
                                {cinema.formats.map((format, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row md:items-center lg:items-center sm:items-start gap-2 sm:gap-6">
                                        <span className="text-sm text-slate-700 w-32 shrink-0">
                                            {format.projection} {ALL_TRANSLATION.find(t => t.value === format.translation)?.label || format.translation}
                                        </span>
                                        <div className="flex flex-wrap gap-3">
                                            {format.showTimes.map((st) => (
                                                <button
                                                    key={st.id}
                                                    className="border hover:cursor-pointer border-slate-200 rounded-md px-5 py-2.5 text-sm text-slate-700 hover:bg-alpha-blue hover:text-white transition-all bg-white active:scale-95"
                                                    onClick={() => handleShowtimeClick(st.id)}
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
    );
};

export default MovieShowtimes;
