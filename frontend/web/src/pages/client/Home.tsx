import React, { useState } from 'react';
import { Container, Section } from '../../components/common/Layout';
import MovieItem from '../../components/client/MovieCard';
import { movieService } from '../../services/movie.service';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type Tab = 'NOW_SHOWING' | 'UPCOMING';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('NOW_SHOWING');

  const { data: movies = [], isLoading, isFetching } = useQuery({
    queryKey: ['movies', activeTab],
    queryFn: () => movieService.clientGetMovie(activeTab, '').then(res => res.data.content),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <Section className="bg-slate-50 py-24">
        <Container className="text-center">
          <span className="text-alpha-blue font-bold tracking-widest uppercase text-xs">Phim hot tuần này</span>
          <h1 className="text-5xl md:text-7xl font-black mt-4 mb-8 tracking-tighter text-slate-900 leading-tight">MUA VÉ XEM PHIM <br className="hidden md:block" /> TRỰC TUYẾN</h1>
          <div className="flex justify-center space-x-4">
            <button className="bg-alpha-blue text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-blue-100 hover:scale-105 transition-transform">XEM PHIM NGAY</button>
            <button className="border-2 border-slate-200 text-slate-800 px-10 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors">TÌM RẠP CHIẾU</button>
          </div>
        </Container>
      </Section>

      {/* Movie Section */}
      <Section className="py-20">
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
