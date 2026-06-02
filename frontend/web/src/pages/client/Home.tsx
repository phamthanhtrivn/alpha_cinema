import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Section } from '../../components/common/Layout';
import MovieItem from '../../components/client/MovieCard';
import { movieService } from '../../services/movie.service';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ScheduleSearchBar from '../../components/client/ScheduleSearchBar';
import BannerSlider from '../../components/client/BannerSlider';
import { Button } from '@/components/ui/button';
import TrailerModal from '../../components/client/TrailerModel';

type Tab = 'NOW_SHOWING' | 'UPCOMING';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('NOW_SHOWING');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  useEffect(() => {
    document.title = "Alpha Cinema | Hệ thống rạp chiếu phim mới";
  }, []);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', activeTab],
    queryFn: () => movieService.clientGetMovie({ releaseStatus: activeTab }, 8).then(res => res.data.content),
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
              <h2 className="text-lg font-semibold text-slate-700 uppercase">Phim</h2>
              <div className="h-1 w-16 bg-alpha-blue mt-1"></div>
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
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 justify-items-center">
                {movies.map((movie: any) => (
                  <MovieItem
                    key={movie.id}
                    movie={movie}
                    onWatchTrailer={(url) => {
                      setCurrentTrailerUrl(url);
                      setIsTrailerOpen(true);
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/movies')}
                  className="px-8 py-3 rounded-sm border-2 border-alpha-blue text-alpha-blue font-bold hover:bg-alpha-blue hover:text-white transition-all duration-300 uppercase text-sm tracking-widest shadow-lg shadow-blue-50"
                >
                  Xem thêm
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      <Section className="border-t-5 border-slate-100 py-16">
        <Container>
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-slate-700 uppercase">Trang chủ</h2>
            <div className="h-1 w-16 bg-alpha-blue mt-1"></div>
          </div>

          <div className="space-y-5 text-slate-700">
            <div className="space-y-4">
              <p className="text-justify leading-relaxed text-sm">
                Chào mừng bạn đến với <strong>Alpha Cinema</strong> – một biểu tượng mới trong thế giới điện ảnh, nơi hội tụ giữa công nghệ hiện đại và trải nghiệm giải trí đỉnh cao. Dù là một thương hiệu trẻ đầy năng động, Alpha Cinema đã nhanh chóng khẳng định vị thế là một trong những điểm đến được yêu thích nhất nhờ sự kết hợp hoàn hảo giữa hệ thống rạp chuẩn quốc tế và chất lượng dịch vụ dẫn đầu.
              </p>
              <p className="font-medium text-alpha-blue text-sm italic">
                Tại Alpha Cinema, chúng tôi không chỉ chiếu phim, chúng tôi tạo ra những khoảnh khắc đáng nhớ.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                🚀 Trải nghiệm đặt vé "Một Chạm"
              </h3>
              <p className="text-sm leading-relaxed text-justify">
                Việc sở hữu tấm vé xem phim bom tấn giờ đây trở nên dễ dàng hơn bao giờ hết trên nền tảng <strong>alphacinema.vn</strong>. Giao diện hiện đại giúp bạn tối ưu hóa việc chọn lựa:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Mua vé linh hoạt:</strong> Tùy chọn theo Phim, theo Rạp hoặc theo Ngày chiếu chỉ với vài thao tác.</p>
                <p><strong>Xác nhận tức thì:</strong> Ngay sau khi đặt vé thành công, hệ thống thông báo thông minh của chúng tôi sẽ gửi xác nhận qua tin nhắn và email ngay lập tức.</p>
                <p><strong>Vào rạp thần tốc:</strong> Không cần xếp hàng chờ đợi, bạn chỉ cần quét mã QR tại cổng kiểm soát để bước thẳng vào không gian điện ảnh của riêng mình.</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                🎬 Góc Điện Ảnh – Nơi kết nối những tâm hồn yêu phim
              </h3>
              <p className="text-sm leading-relaxed text-justify">
                Nếu bạn còn băn khoăn về việc chọn phim, hãy ghé thăm mục <strong>Bình Luận Phim</strong>. Tại đây, Alpha Cinema tự hào sở hữu hệ thống đánh giá chân thực nhất:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Đánh giá minh bạch:</strong> Những bài review được kiểm duyệt kỹ lưỡng để đảm bảo tính khách quan và văn minh, giúp bạn có cái nhìn chuẩn xác nhất trước khi quyết định.</p>
                <p><strong>Dữ liệu chuyên sâu:</strong> Khám phá kho lưu trữ khổng lồ về diễn viên, đạo diễn và những bài viết phân tích điện ảnh chuyên sâu, giúp bạn nâng tầm kiến thức và niềm đam mê.</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                🎁 Ưu đãi không giới hạn
              </h3>
              <p className="text-sm leading-relaxed text-justify">
                Alpha Cinema luôn biết cách chiều lòng khán giả bằng những chương trình khuyến mãi "cực hời": Giảm giá vé định kỳ, tặng combo bắp nước hoặc những phần quà độc quyền từ các siêu phẩm điện ảnh thế giới và Việt Nam. Chương trình khách hàng thân thiết với những đặc quyền ưu tiên chưa từng có.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                🌟 Tầm nhìn tương lai
              </h3>
              <p className="text-sm leading-relaxed text-justify">
                Với mục tiêu mang đến những trải nghiệm sớm nhất và chất lượng nhất, Alpha Cinema không ngừng cập nhật lịch chiếu hàng giờ, hàng ngày. Chúng tôi cam kết mang những bộ phim bom tấn nóng hổi nhất từ Hollywood đến màn ảnh Việt với tốc độ nhanh nhất.
              </p>
            </div>
          </div>
        </Container>
      </Section>
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={currentTrailerUrl}
      />
    </div>
  );
};

export default Home;
