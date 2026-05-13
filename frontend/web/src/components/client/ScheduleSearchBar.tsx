import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../../services/movie.service';
import { showScheduleService } from '../../services/show-schedule.service';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatHHmm } from '@/utils/formatTime';

const ScheduleSearchBar: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMovieId, setSelectedMovieId] = useState<string>('');
    const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

    // 1. Get NOW_SHOWING movies (will reuse cache from Home page if available)
    const { data: movies = [] } = useQuery({
        queryKey: ['movies', 'NOW_SHOWING'],
        queryFn: () => movieService.clientGetMovie('NOW_SHOWING', '').then(res => res.data.content),
        staleTime: 1000 * 60 * 5,
    });

    // 2. Get Cinema Options based on Movie
    const { data: cinemas = [], isLoading: isLoadingCinemas } = useQuery({
        queryKey: ['cinemas-by-movie', selectedMovieId],
        queryFn: () => showScheduleService.getCinemaOptionByMovie(selectedMovieId).then(res => res.data),
        enabled: !!selectedMovieId,
    });

    // 3. Get Active Dates based on Movie and Cinema
    const { data: activeDates = [], isLoading: isLoadingDates } = useQuery({
        queryKey: ['active-dates', selectedMovieId, selectedCinemaId],
        queryFn: () => showScheduleService.getActiveDateForMovieCinema(selectedMovieId, selectedCinemaId).then(res => res.data),
        enabled: !!selectedMovieId && !!selectedCinemaId,
    });

    // 4. Get Showtimes based on Movie, Cinema, and Date
    const { data: showtimesResponse, isLoading: isLoadingShowtimes } = useQuery({
        queryKey: ['showtimes-quick', selectedMovieId, selectedCinemaId, selectedDate],
        queryFn: () => showScheduleService.getMovieShowtimeOnDate(selectedMovieId, selectedCinemaId, selectedDate).then(res => res.data),
        enabled: !!selectedMovieId && !!selectedCinemaId && !!selectedDate,
    });

    console.log('showtimes', showtimesResponse);

    const showtimes = showtimesResponse || [];

    // Reset dependent fields when parent changes
    useEffect(() => {
        setSelectedCinemaId('');
        setSelectedDate('');
        setSelectedShowtimeId('');
    }, [selectedMovieId]);

    useEffect(() => {
        setSelectedDate('');
        setSelectedShowtimeId('');
    }, [selectedCinemaId]);

    useEffect(() => {
        setSelectedShowtimeId('');
    }, [selectedDate]);

    const handleBooking = () => {
        if (selectedShowtimeId) {
            navigate(`/booking/${selectedShowtimeId}?movieId=${selectedMovieId}`);
        }
    };

    const StepNumber = ({ number }: { number: number }) => (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-alpha-orange text-white text-[10px] font-bold mr-2 shrink-0">
            {number}
        </div>
    );

    return (
        <div className="hidden md:block max-w-7xl mx-auto px-4 -mt-12 relative z-50">
            <div className="bg-white rounded-sm shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden border border-slate-100">

                {/* Step 1: Movie */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center px-4 py-4 h-full pointer-events-none">
                        <StepNumber number={1} />
                        <div className="flex-1 text-sm text-slate-700 truncate pr-6">
                            {movies.find((m: any) => m.id === selectedMovieId)?.title || 'Chọn phim'}
                        </div>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-alpha-blue transition-colors" />
                    </div>
                    <select
                        value={selectedMovieId}
                        onChange={(e) => setSelectedMovieId(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                        <option value="" disabled>Chọn phim</option>
                        {movies.map((movie: any) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                </div>

                {/* Step 2: Cinema */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center px-4 py-4 h-full pointer-events-none">
                        <StepNumber number={2} />
                        <div className={`flex-1 text-sm truncate pr-6 ${(!selectedMovieId || isLoadingCinemas) ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isLoadingCinemas ? 'Đang tải...' : (cinemas.find((c: any) => c.id === selectedCinemaId)?.label || 'Chọn rạp')}
                        </div>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-alpha-blue transition-colors" />
                    </div>
                    <select
                        value={selectedCinemaId}
                        onChange={(e) => setSelectedCinemaId(e.target.value)}
                        disabled={!selectedMovieId || isLoadingCinemas}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled>Chọn rạp</option>
                        {cinemas.map((cinema: any) => (
                            <option key={cinema.id} value={cinema.id}>{cinema.label}</option>
                        ))}
                    </select>
                </div>

                {/* Step 3: Date */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center px-4 py-4 h-full pointer-events-none">
                        <StepNumber number={3} />
                        <div className={`flex-1 text-sm truncate pr-6 ${(!selectedCinemaId || isLoadingDates) ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isLoadingDates ? 'Đang tải...' : (selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }) : 'Chọn ngày')}
                        </div>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-alpha-blue transition-colors" />
                    </div>
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={!selectedCinemaId || isLoadingDates}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled>Chọn ngày</option>
                        {activeDates.map((date: string) => (
                            <option key={date} value={date}>
                                {new Date(date).toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Step 4: Showtime */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center px-4 py-4 h-full pointer-events-none">
                        <StepNumber number={4} />
                        <div className={`flex-1 text-sm truncate pr-6 ${(!selectedDate || isLoadingShowtimes) ? 'text-slate-400' : 'text-slate-700'}`}>
                            {isLoadingShowtimes ? 'Đang tải...' : (showtimes.find((st: any) => st.id === selectedShowtimeId) ? formatHHmm(showtimes.find((st: any) => st.id === selectedShowtimeId).time) : 'Chọn suất')}
                        </div>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-alpha-blue transition-colors" />
                    </div>
                    <select
                        value={selectedShowtimeId}
                        onChange={(e) => setSelectedShowtimeId(e.target.value)}
                        disabled={!selectedDate || isLoadingShowtimes}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled>Chọn suất chiếu</option>
                        {showtimes.map((st: any) => (
                            <option key={st.id} value={st.id}>
                                {formatHHmm(st.time)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleBooking}
                    disabled={!selectedShowtimeId}
                    className="bg-alpha-orange text-white px-8 py-4 text-sm hover:bg-orange-600 disabled:bg-alpha-orange/40 disabled:text-slate-500 transition-all duration-300 flex items-center justify-center min-w-[180px]"
                >
                    {isLoadingShowtimes ? <Loader2 className="animate-spin" size={20} /> : 'Mua vé nhanh'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleSearchBar;
