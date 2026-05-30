import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/Layout";
import { artistsService } from "@/services/artist.service";
import ArtistCard from "@/components/client/ArtistCard";
import NowShowingMovies from "@/components/client/NowShowingMovies";
import { Pagination } from "@/components/common/Pagination";
import { Users, Loader2 } from "lucide-react";

const CinematicActorsDirectors: React.FC = () => {
  const [nationality, setNationality] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const size = 10; // Hiển thị 5 nghệ sĩ mỗi trang giống ảnh mẫu

  // Cuộn lên đầu trang khi chuyển trang hoặc thay đổi bộ lọc
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, nationality, name]);

  // Reset page về 0 khi bộ lọc thay đổi
  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNationality(e.target.value);
    setPage(0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setPage(0);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["public-artists", page, nationality, name],
    queryFn: () =>
      artistsService.getPublicArtists({
        page,
        size,
        nationality: nationality || undefined,
        name: name || undefined,
      }),
  });

  const artists = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  return (
    <div className="bg-white py-10 min-h-[80vh]">
      <Container>
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT COLUMN: Artists list & Filters */}
            <div className="flex-1 space-y-6">
              {/* Category Title */}
              <div className="border-l-4 border-alpha-blue pl-4 mb-4">
                <h2 className="text-slate-800 font-medium text-lg">Diễn Viên / Đạo Diễn</h2>
              </div>

              {/* Filters & Divider Row */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Input Search Name */}
                  <input
                    type="text"
                    placeholder="Tìm theo tên nghệ sĩ..."
                    value={name}
                    onChange={handleNameChange}
                    className="bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs placeholder-slate-400 w-full sm:w-64"
                  />

                  {/* Filter Nationality */}
                  <select
                    value={nationality}
                    onChange={handleNationalityChange}
                    className="hover:cursor-pointer min-w-36 bg-white border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-alpha-orange shadow-xs w-full sm:w-auto"
                  >
                    <option value="">Quốc Gia (Tất cả)</option>
                    <option value="Mỹ">Mỹ</option>
                    <option value="Việt Nam">Việt Nam</option>
                    <option value="Hàn Quốc">Hàn Quốc</option>
                    <option value="Trung Quốc">Trung Quốc</option>
                    <option value="Anh">Anh</option>
                    <option value="Pháp">Pháp</option>
                  </select>
                </div>

                {/* Thin Blue Line Divider */}
                <div className="h-[2px] bg-alpha-blue w-full" />
              </div>

              {/* Artists Container */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-alpha-blue" size={40} />
                </div>
              ) : artists.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-100 shadow-xs">
                  <p className="text-slate-400 font-extrabold text-base">
                    Hiện chưa có dữ liệu nghệ sĩ phù hợp với bộ lọc này.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {artists.map((artist: any) => (
                    <ArtistCard key={artist.id} artist={artist} />
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
                <h2 className="text-slate-800 font-medium text-lg">Phim Đang Chiếu</h2>
              </div>
              <NowShowingMovies />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CinematicActorsDirectors;
