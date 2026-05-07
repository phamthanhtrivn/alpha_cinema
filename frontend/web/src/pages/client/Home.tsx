import React, { useState } from 'react';
import { Container, Section } from '../../components/common/Layout';
import MovieItem from '../../components/client/MovieCard';
import { movieService } from '../../services/movie.service';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ScheduleSearchBar from '../../components/client/ScheduleSearchBar';
import BannerSlider from '../../components/client/BannerSlider';

type Tab = 'NOW_SHOWING' | 'UPCOMING';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('NOW_SHOWING');

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', activeTab],
    queryFn: () => movieService.clientGetMovie(activeTab, '').then(res => res.data.content),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-white">
      <BannerSlider />

      <ScheduleSearchBar />

      {/* Movie Section */}
      <Section>
        <Container>
          {/* Header + Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
            <div>
              <h2 className="text-lg font-black text-slate-700 uppercase">Phim</h2>
              <div className="h-1 w-16 bg-alpha-orange mt-1"></div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-full p-1 gap-1">
              <button
                onClick={() => setActiveTab('NOW_SHOWING')}
                className={`hover:cursor-pointer px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'NOW_SHOWING'
                  ? 'bg-alpha-blue text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Đang chiếu
              </button>
              <button
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'UPCOMING'
                  ? 'bg-alpha-blue text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Sắp chiếu
              </button>
            </div>
          </div>

          {/* Movie Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-alpha-blue" size={40} />
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-slate-400 font-bold text-lg">
                {activeTab === 'NOW_SHOWING' ? 'Hiện chưa có phim đang chiếu.' : 'Hiện chưa có phim sắp chiếu.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 justify-items-center">
              {movies.map((movie: any) => (
                <MovieItem key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default Home;
