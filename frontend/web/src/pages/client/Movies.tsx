import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/services/movie.service';
import { Container, Section } from '@/components/common/Layout';
import { Loader2, Film } from 'lucide-react';
import { ReleaseStatus } from '@/types/movie';
import MovieItem from '@/components/client/MovieCard';
import { Pagination } from '@/components/common/Pagination';

const MoviesPage: React.FC = () => {
    const [nowShowingPage, setNowShowingPage] = useState(0);
    const [upcomingPage, setUpcomingPage] = useState(0);
    const pageSize = 12;

    // Fetch Now Showing Movies
    const { data: nowShowingData, isLoading: isLoadingNowShowing } = useQuery({
        queryKey: ['movies-page', 'NOW_SHOWING', nowShowingPage],
        queryFn: () => movieService.clientGetMovie({ releaseStatus: ReleaseStatus.NOW_SHOWING }, pageSize, nowShowingPage),
        staleTime: 1000 * 60 * 5,
    });

    // Fetch Upcoming Movies
    const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery({
        queryKey: ['movies-page', 'UPCOMING', upcomingPage],
        queryFn: () => movieService.clientGetMovie({ releaseStatus: ReleaseStatus.UPCOMING }, pageSize, upcomingPage),
        staleTime: 1000 * 60 * 5,
    });

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="mb-10">
            <h2 className="text-lg font-semibold text-slate-700 uppercase">{title}</h2>
            <div className="h-1 w-16 bg-alpha-blue mt-1"></div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* 1. NOW SHOWING SECTION */}
            <Section>
                <Container>
                    <SectionHeader title="Phim Đang Chiếu" />

                    {isLoadingNowShowing ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-alpha-blue" size={40} />
                        </div>
                    ) : nowShowingData?.data?.content?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {nowShowingData.data.content.map((movie: any) => (
                                    <MovieItem key={movie.id} movie={movie} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={nowShowingPage}
                                totalPages={nowShowingData.data.totalPages}
                                onPageChange={(page) => {
                                    setNowShowingPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Film size={48} className="mb-4 opacity-20" />
                            <p>Hiện không có phim đang chiếu</p>
                        </div>
                    )}
                </Container>
            </Section>

            {/* 2. UPCOMING SECTION */}
            <Section className="bg-slate-50/30">
                <Container>
                    <SectionHeader title="Phim Sắp Chiếu" />

                    {isLoadingUpcoming ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-alpha-blue" size={40} />
                        </div>
                    ) : upcomingData?.data?.content?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {upcomingData.data.content.map((movie: any) => (
                                    <MovieItem key={movie.id} movie={movie} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={upcomingPage}
                                totalPages={upcomingData.data.totalPages}
                                onPageChange={(page) => setUpcomingPage(page)}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Film size={48} className="mb-4 opacity-20" />
                            <p>Hiện không có phim sắp chiếu</p>
                        </div>
                    )}
                </Container>
            </Section>
        </div>
    );
};

export default MoviesPage;
