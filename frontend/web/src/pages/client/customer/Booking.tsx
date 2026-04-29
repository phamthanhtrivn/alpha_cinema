import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { showScheduleService } from '@/services/show-schedule.service';
import { movieService } from '@/services/movie.service';
import { Loader2 } from 'lucide-react';
import { Container, Section } from '@/components/common/Layout';
import { BookingProgressBar } from '@/components/client/BookingProgressBar';
import type { BookingLayoutDTO, SeatResponseToProduct } from '@/types/booking';
import { ALL_TRANSLATION } from '@/types/movie';
import { formatHHmm } from '@/utils/formatTime';
import { Button } from '@/components/ui/button';

export const Booking = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const movieId = searchParams.get('movieId');
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState<SeatResponseToProduct[]>([]);

    // Reset selected seats when schedule changes
    useEffect(() => {
        setSelectedSeats([]);
    }, [id]);

    const { data: layout, isLoading, isError, isFetching: isFetchingLayout } = useQuery<BookingLayoutDTO>({
        queryKey: ['booking-layout', id],
        queryFn: () => showScheduleService.getBookingLayout(id!).then((res: any) => res.data),
        enabled: !!id,
    });

    const { data: movie, isLoading: isMovieLoading } = useQuery({
        queryKey: ['movie-detail', movieId],
        queryFn: () => movieService.clientGetDetailMovie(movieId!).then((res: any) => res.data),
        enabled: !!movieId,
    });

    const { data: showtimes } = useQuery({
        queryKey: ['showtimes-on-date', movieId, layout?.cinemaId, layout?.startTime],
        queryFn: () => {
            const date = new Date(layout!.startTime).toISOString().split('T')[0];
            return showScheduleService.getMovieShowtimeOnDate(movieId!, layout!.cinemaId, date).then((res: any) => res.data);
        },
        enabled: !!layout && !!movieId,
    });

    console.log(showtimes);

    // Group seats by row
    const seatMap = useMemo(() => {
        if (!layout?.seats) return {};
        const map: Record<string, SeatResponseToProduct[]> = {};
        layout.seats.forEach((seat) => {
            if (!map[seat.rowName]) {
                map[seat.rowName] = [];
            }
            map[seat.rowName].push(seat);
        });

        Object.keys(map).forEach((row) => {
            map[row].sort((a, b) => parseInt(a.columnName) - parseInt(b.columnName));
        });

        return map;
    }, [layout]);

    // Row A at the top
    const rows = useMemo(() => Object.keys(seatMap).sort(), [seatMap]);

    const toggleSeat = (seat: SeatResponseToProduct) => {
        if (seat.status !== 'AVAILABLE' || !seat.usable) return;

        setSelectedSeats((prev) => {
            const isSelected = prev.find((s) => s.seatId === seat.seatId);
            if (isSelected) {
                return prev.filter((s) => s.seatId !== seat.seatId);
            }
            return [...prev, seat];
        });
    };

    const getSeatClass = (seat: SeatResponseToProduct) => {
        const isSelected = selectedSeats.find((s) => s.seatId === seat.seatId);

        if (isSelected) {
            return 'bg-alpha-orange text-white border-alpha-orange shadow-md z-10 ring-2 ring-offset-1 ring-alpha-orange border-b-[3px] border-b-orange-700';
        }

        if (!seat.usable) {
            return 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 border-transparent border-b-[3px] border-b-slate-300';
        }

        if (['SOLD', 'LOCKED', 'CHECKED_IN', 'BOOKED'].includes(seat.status)) {
            return 'bg-red-500 text-white cursor-not-allowed border-transparent border-b-[3px] border-b-red-700';
        }

        const typeName = seat.seatType?.toLowerCase() || '';

        if (typeName.includes('vip')) {
            return 'bg-white text-slate-700 border-yellow-500 hover:bg-yellow-50 cursor-pointer shadow-sm border-b-[3px] border-b-yellow-600';
        }

        if (typeName.includes('đôi') || typeName.includes('couple')) {
            return 'bg-white text-slate-700 border-blue-500 hover:bg-blue-50 cursor-pointer shadow-sm border-b-[3px] border-b-blue-600';
        }

        // Default: Ghế đơn / Standard
        return 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-sm border-b-[3px] border-b-slate-400';
    };

    const getPrice = (type: string) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('vip')) return 120000;
        if (lowerType.includes('đôi') || lowerType.includes('couple')) return 170000;
        return 80000;
    };

    const groupedSeats = useMemo(() => {
        const groups: Record<string, SeatResponseToProduct[]> = {};
        selectedSeats.forEach(seat => {
            const type = seat.seatType;
            if (!groups[type]) groups[type] = [];
            groups[type].push(seat);
        });
        return groups;
    }, [selectedSeats]);

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + getPrice(seat.seatType), 0);

    if (isMovieLoading || (isLoading && !layout)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-alpha-blue" size={48} />
            </div>
        );
    }

    if (isError || !layout || !movie) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-slate-500 font-bold">Đã xảy ra lỗi khi tải sơ đồ ghế.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
            {/* 1. PROGRESS BAR - Reusable Component */}
            <BookingProgressBar currentStep={1} />

            <Section>
                <Container className="max-w-[1440px] flex flex-col lg:flex-row gap-6">
                    {/* --- LEFT: SEAT MAP & SHOWTIMES --- */}
                    <div className="flex-1 flex flex-col gap-8">
                        {/* Showtime Selection Card */}
                        <div className="bg-white rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-4">
                            <div className="flex items-center gap-8">
                                <span className="text-slate-700 font-bold text-sm shrink-0">Đổi suất chiếu</span>
                                <div className="flex flex-wrap gap-3">
                                    {showtimes?.map((st: { id: string, time: string }) => (
                                        <button
                                            key={st.id}
                                            onClick={() => {
                                                if (st.id !== id) {
                                                    navigate(`/booking/${st.id}?movieId=${movieId}`, { replace: true });
                                                }
                                            }}
                                            className={`px-5 py-2 rounded-md font-bold text-sm hover:cursor-pointer transition-all ${st.id === id
                                                ? 'bg-alpha-blue text-white shadow-blue-100 cursor-default'
                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-alpha-blue hover:text-alpha-blue'
                                                }`}
                                        >
                                            {formatHHmm(st.time)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Seat Map Card */}
                        <div className="bg-white rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-3 relative overflow-hidden">
                            {isFetchingLayout && (
                                <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
                                    <Loader2 className="animate-spin text-alpha-blue" size={40} />
                                </div>
                            )}
                            <div className="flex flex-col items-center">
                                {/* Screen Area at TOP - Enhanced Visibility */}
                                <div className="mb-10 flex flex-col items-center w-full">
                                    <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-6 px-6 py-2.5 rounded-full border border-slate-200 shadow-sm bg-white">
                                        Màn hình trung tâm
                                    </div>
                                    <div className="w-[80%] max-w-3xl h-10 border-t-[6px] border-alpha-blue rounded-[50%] shadow-[0_-5px_10px_0_rgba(3,78,162,0.4)] transition-all"></div>
                                </div>

                                {/* Seats Grid - Smaller size */}
                                <div className="overflow-x-auto w-full scrollbar-hide">
                                    <div className="min-w-[700px] flex flex-col items-center gap-2">
                                        {rows.map((rowName) => (
                                            <div key={rowName} className="flex items-center justify-between w-full px-4">
                                                <span className="w-8 shrink-0 text-center font-semibold text-slate-400 text-base">{rowName}</span>
                                                <div className="flex flex-1 justify-center gap-1.5">
                                                    {seatMap[rowName].map((seat) => (
                                                        <button
                                                            key={seat.seatId}
                                                            onClick={() => toggleSeat(seat)}
                                                            disabled={seat.status !== 'AVAILABLE' || !seat.usable}
                                                            className={`h-6 rounded text-[12px] font-semibold border transition-all flex items-center justify-center ${(seat.seatType?.toLowerCase() || '').includes('đôi') || (seat.seatType?.toLowerCase() || '').includes('couple') ? 'w-[54px]' : 'w-6'
                                                                } ${getSeatClass(seat)}`}
                                                        >
                                                            {seat.columnName}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="w-8 shrink-0 text-center font-semibold text-slate-400 text-base">{rowName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend - Clean & Integrated Style */}
                                <div className="mt-16 w-full pt-10 border-t border-slate-100 flex flex-wrap justify-center gap-x-12 gap-y-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded relative flex items-center justify-center border-b-[2px] border-b-red-700">
                                            <div className="w-3 h-[1px] bg-white/50 rotate-45 absolute"></div>
                                            <div className="w-3 h-[1px] bg-white/50 -rotate-45 absolute"></div>
                                        </div>
                                        <span>Đã bán</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-alpha-orange rounded border-b-[2px] border-b-orange-700 shadow-sm"></div>
                                        <span>Đang chọn</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border border-yellow-500 rounded border-b-[2px] border-b-yellow-600 shadow-sm"></div>
                                        <span>Ghế VIP</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border border-slate-300 rounded border-b-[2px] border-b-slate-400 shadow-sm"></div>
                                        <span>Ghế đơn</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-4 border border-blue-500 rounded border-b-[2px] border-b-blue-600 shadow-sm"></div>
                                        <span>Ghế đôi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: BOOKING INFO --- */}
                    <div className="w-full lg:w-[32%] shrink-0">
                        <div className="bg-white rounded-md shadow-[0_10px_40p x_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden sticky top-24">
                            <div className="h-2 bg-alpha-orange w-full"></div>

                            <div className="p-4">
                                {/* Movie Header */}
                                <div className="flex gap-6 mb-10">
                                    <div className="w-32 h-48 rounded-sm overflow-hidden shadow-xl shadow-slate-200 shrink-0">
                                        <img
                                            src={movie.thumbnailUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="font-semibold text-slate-800 text-xl leading-tight mb-4">
                                            {movie.title}
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            <div className="text-sm text-slate-800 flex items-center flex-wrap gap-2">
                                                <span>{layout.projection} {ALL_TRANSLATION.find(t => t.value === layout.translation)?.label}</span>
                                                <span>-</span>
                                                <span className="bg-alpha-orange text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
                                                    {movie.ageType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-4 mb-4 pb-4 border-b border-dashed border-slate-800 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm tracking-widest">Rạp phim</span>
                                        <p className="text-sm font-bold text-slate-700">
                                            {layout.cinemaName} - <span className="text-alpha-blue">RẠP {layout.roomName}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm tracking-widest">Suất chiếu</span>
                                        <p className="font-bold text-slate-700">
                                            <span className="text-slate-900">{new Date(layout.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="mx-2 text-slate-300">|</span>
                                            {new Date(layout.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Seat Summary Section */}
                                {selectedSeats.length > 0 && (
                                    <div className="space-y-4 mb-4 pb-4 border-b border-dashed">
                                        {Object.entries(groupedSeats).map(([type, seats]) => (
                                            <div key={type} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                                                    <span className="font-semibold">{seats.length}x <span className="font-normal">{type}</span></span>
                                                    <span className="text-slate-800 font-bold">{(seats.length * getPrice(type)).toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                <div className="text-sm ">
                                                    Ghế: <span className="font-semibold text-slate-800">{seats.map(s => `${s.rowName}${s.columnName}`).join(', ')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Payment Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-800">Tổng cộng</span>
                                        <span className="text-alpha-orange font-bold text-xl">
                                            {totalPrice.toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-row gap-3">
                                    <Button
                                        onClick={() => navigate(`/movie/${movieId}`)}
                                        className="w-full py-3 text-base hover:text-alpha-blue transition-colors hover:cursor-pointer"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        disabled={selectedSeats.length === 0}
                                        className={`w-full py-4 text-base transition-all hover:cursor-pointer ${selectedSeats.length > 0
                                            ? 'bg-alpha-orange text-white hover:bg-orange-600 active:scale-[0.98]'
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                    >
                                        Tiếp tục
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>
        </div>
    );
};