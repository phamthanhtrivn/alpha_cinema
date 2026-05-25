import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container, Section } from "@/components/common/Layout";
import { artistsService } from "@/services/artist.service";
import { movieService } from "@/services/movie.service";
import NowShowingMovies from "@/components/client/NowShowingMovies";
import { User, Calendar, Globe, Loader2 } from "lucide-react";
import { formatDDMMYYYY } from "@/utils/formatTime";

const CinematicArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["public-artist-detail", id],
    queryFn: () => artistsService.getPublicArtistById(id!),
    enabled: !!id,
  });

  const { data: artistMoviesData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["public-artist-movies", id],
    queryFn: () => movieService.clientGetMovie({ artistId: id }, 10),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32 min-h-[60vh]">
        <Loader2 className="animate-spin text-alpha-blue" size={48} />
      </div>
    );
  }

  const artist = data?.data;
  const artistMovies = artistMoviesData?.data?.content || [];

  if (!artist) {
    return (
      <div className="bg-slate-50 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-400 font-extrabold text-lg">
          Không tìm thấy thông tin nghệ sĩ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white py-10 min-h-[80vh]">
      <Container>
        <div className="mx-auto max-w-7xl">
          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT COLUMN: Artist Details & Biography */}
            <div className="flex-1 space-y-7">
              {/* Header profile section */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Left: Avatar */}
                <div className="w-full md:w-[250px] shrink-0 aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                </div>

                {/* Right: Profile Info */}
                <div className="flex-1 space-y-4">
                  {/* Breadcrumbs */}
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Link to="/" className="hover:text-alpha-blue transition-colors">
                      Trang chủ
                    </Link>
                    <span>/</span>
                    <Link
                      to="/cinematic/actors-directors"
                      className="hover:text-alpha-blue transition-colors"
                    >
                      Diễn viên
                    </Link>
                    <span>/</span>
                    <span className="text-slate-500 font-semibold truncate">
                      {artist.fullName}
                    </span>
                  </div>

                  {/* Name & Role Tag */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-medium text-slate-800 tracking-tight">
                      {artist.fullName}
                    </h1>
                    {artist.type && (
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${artist.type === "ACTOR"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-purple-50 text-purple-600 border border-purple-100"
                        }`}>
                        {artist.type === "ACTOR" ? "Diễn viên" : "Đạo diễn"}
                      </span>
                    )}
                  </div>

                  {/* Bio summary block quote */}
                  {artist.bio && (
                    <p className="text-slate-600 text-sm italic leading-relaxed text-justify border-slate-200 py-1">
                      {artist.bio}
                    </p>
                  )}

                  {/* Metadata Table */}
                  <div className="grid grid-cols-1 gap-3 text-sm pt-2 border-t border-slate-100">
                    {artist.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-slate-500">Ngày sinh:</span>
                        <span>
                          {formatDDMMYYYY(artist.dateOfBirth)}
                        </span>
                      </div>
                    )}
                    {artist.nationality && (
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-slate-400" />
                        <span className="text-slate-500">Quốc tịch:</span>
                        <span>
                          {artist.nationality}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Phim Đã Tham Gia Section */}
              {artistMovies && artistMovies.length > 0 && (
                <div>
                  <div className="border-l-4 border-alpha-blue pl-4 mb-6">
                    <h2 className="text-slate-800 font-medium text-lg">Phim Đã Tham Gia</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {artistMovies.map((movie: any) => (
                      <div key={movie.id} className="flex gap-4 items-center">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="w-20 aspect-[2/3] shrink-0 rounded overflow-hidden bg-slate-100 border border-slate-100 shadow-xs cursor-pointer block hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={movie.thumbnailUrl || movie.bannerUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex flex-col min-w-0">
                          <Link
                            to={`/movie/${movie.id}`}
                            className="font-semibold text-sm text-slate-800 hover:text-alpha-blue transition-colors line-clamp-2 uppercase leading-snug"
                          >
                            {movie.title}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography Section */}
              <div>
                <div className="border-l-4 border-alpha-blue pl-4 mb-4">
                  <h2 className="text-slate-800 font-medium text-lg">Tiểu Sử</h2>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed text-justify whitespace-pre-line">
                  {artist.description || "Dữ liệu tiểu sử của nghệ sĩ này đang được cập nhật."}
                </p>
              </div>
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
      </Container >
    </div >
  );
};

export default CinematicArtistDetail;
