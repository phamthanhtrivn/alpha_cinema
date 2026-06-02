import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/Layout";
import { movieService } from "@/services/movie.service";
import MovieHorizontalCard from "@/components/client/MovieHorizontalCard";
import NowShowingMovies from "@/components/client/NowShowingMovies";
import { Pagination } from "@/components/common/Pagination";
import { Film, Loader2 } from "lucide-react";
import { ALL_GENRES } from "@/types/movie";

const CinematicGenres: React.FC = () => {
  const [genre, setGenre] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<string>("premiereDate,desc");
  const [page, setPage] = useState<number>(0);
  const size = 6; // Hiển thị 6 phim mỗi trang

  useEffect(() => {
    const titleParts = [];
    if (genre) {
      titleParts.push(`Phim ${genre}`);
    } else {
      titleParts.push("Thể loại phim");
    }
    if (nationality) {
      titleParts.push(nationality);
    }
    if (year) {
      titleParts.push(`năm ${year}`);
    }
    document.title = `${titleParts.join(" - ")} | Alpha Cinema`;
  }, [genre, nationality, year]);

  // Tự động cuộn lên đầu trang khi chuyển trang hoặc thay đổi bộ lọc
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, genre, nationality, year, status, sort]);

  // Reset page về 0 khi bộ lọc thay đổi
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value);
    setPage(0);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNationality(e.target.value);
    setPage(0);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(0);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["public-movies-filter", page, genre, nationality, year, status, sort],
    queryFn: () => {
      // Tách sort thành field và direction nếu được chỉ định
      let sortParam = sort || undefined;

      return movieService.clientGetMovie(
        {
          genre: genre || undefined,
          nationality: nationality || undefined,
          releaseYear: year ? parseInt(year, 10) : undefined,
          releaseStatus: status || undefined,
        },
        size,
        page
      ).then((res: any) => {
        // Nếu backend hỗ trợ sort qua params, ta gửi thêm sort
        // Với Spring Pageable, ta có thể truyền trực tiếp qua URL. clientGetMovie nhận params từ dto.
        // Tuy nhiên vì clientGetMovie nhận MovieSearchDTO nên chúng ta có thể truyền sort bằng cách gán thêm vào request nếu cần.
        // Để linh hoạt, movieService.clientGetMovie(dto, size, page) gọi `apiClient.get('/movies/public', { params: { ...dto, size, page } })`
        // Chúng ta có thể bổ sung sort vào tham số request.
        // Để gửi sort cùng, ta có thể truyền nó trong object:
        return movieService.clientGetMovie(
          {
            genre: genre || undefined,
            nationality: nationality || undefined,
            releaseYear: year ? parseInt(year, 10) : undefined,
            releaseStatus: status || undefined,
            // Ép kiểu sort vào dto hoặc truyền trực tiếp
            ...({ sort: sortParam } as any)
          },
          size,
          page
        );
      });
    },
  });

  const movies = data?.data?.content || data?.content || [];
  const totalPages = data?.data?.totalPages || data?.totalPages || 0;

  // Tạo danh sách năm lọc (từ năm nay lùi về trước)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white py-10 min-h-[80vh]">
      <Container>
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-10">

            {/* LEFT COLUMN: Movies list & Filters */}
            <div className="flex-1 space-y-6">

              {/* Category Title */}
              <div className="border-l-4 border-alpha-blue pl-4 mb-4">
                <h2 className="text-slate-800 font-medium text-lg tracking-wider">Phim Điện Ảnh</h2>
              </div>

              {/* Filters row & Divider line */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col-5 items-center gap-3">
                  {/* Filter Genre */}
                  <select
                    value={genre}
                    onChange={handleGenreChange}
                    className="hover:cursor-pointer min-w-36 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs"
                  >
                    <option value="">Thể Loại (Tất cả)</option>
                    {ALL_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  {/* Filter Nationality */}
                  <select
                    value={nationality}
                    onChange={handleNationalityChange}
                    className="hover:cursor-pointer min-w-36 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs"
                  >
                    <option value="">Quốc Gia (Tất cả)</option>
                    <option value="Mỹ">Mỹ</option>
                    <option value="Việt Nam">Việt Nam</option>
                    <option value="Hàn Quốc">Hàn Quốc</option>
                    <option value="Trung Quốc">Trung Quốc</option>
                    <option value="Nhật Bản">Nhật Bản</option>
                    <option value="Anh">Anh</option>
                    <option value="Pháp">Pháp</option>
                    <option value="Thái Lan">Thái Lan</option>
                  </select>

                  {/* Filter Year */}
                  <select
                    value={year}
                    onChange={handleYearChange}
                    className="hover:cursor-pointer min-w-28 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs"
                  >
                    <option value="">Năm (Tất cả)</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {/* Filter Status */}
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="hover:cursor-pointer min-w-36 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs"
                  >
                    <option value="">Đang chiếu / Sắp chiếu</option>
                    <option value="NOW_SHOWING">Đang Chiếu</option>
                    <option value="UPCOMING">Sắp Chiếu</option>
                  </select>

                  {/* Sort By Option */}
                  <select
                    value={sort}
                    onChange={handleSortChange}
                    className="hover:cursor-pointer min-w-36 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs ml-auto"
                  >
                    <option value="premiereDate,desc">Mới nhất</option>
                    <option value="totalReviews,desc">Xem nhiều nhất</option>
                    <option value="avgRating,desc">Đánh giá tốt nhất</option>
                  </select>
                </div>

                {/* Thin Blue Line Divider */}
                <div className="h-[2px] bg-alpha-blue w-full" />
              </div>

              {/* Movies Content list */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-alpha-blue" size={40} />
                </div>
              ) : movies.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-100 shadow-xs">
                  <Film size={48} className="mx-auto text-slate-300 mb-3 opacity-60" />
                  <p className="text-slate-400 font-extrabold text-base">
                    Hiện chưa có phim nào phù hợp với bộ lọc đã chọn.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movies.map((movie: any) => (
                    <MovieHorizontalCard key={movie.id} movie={movie} />
                  ))}

                  {/* Pagination */}
                  <div className="flex justify-center pt-4">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={(p) => setPage(p)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar (Phim đang chiếu) */}
            <div className="hidden lg:block w-[32%] shrink-0 pl-8">
              <div className="border-l-4 border-alpha-blue pl-4 mb-4">
                <h2 className="text-slate-800 font-medium text-lg tracking-wider">Phim Đang Chiếu</h2>
              </div>
              <NowShowingMovies />
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default CinematicGenres;
