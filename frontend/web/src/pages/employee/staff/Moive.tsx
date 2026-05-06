import React from "react";

interface Movie {
  id: string;
  ageRating: string;
  image: string;
}

const mockMovies: Movie[] = [
  {
    id: "1",
    ageRating: "T16",
    image: "https://cdn.galaxycine.vn/media/2026/4/20/heo-nam-mong-2_1776693195637.jpg",
  },
  {
    id: "2",
    ageRating: "T18",
    image: "https://cdn.galaxycine.vn/media/2026/4/20/500_1776651063174.jpg",
  },
  {
    id: "3",
    ageRating: "T16",
    image: "https://cdn.galaxycine.vn/media/2026/3/24/phi-phong-500_1774326781870.jpg",
  },
  {
    id: "4",
    ageRating: "P",
    image: "https://cdn.galaxycine.vn/media/2026/4/16/dttm8-500_1776310073954.jpg",
  },
  {
    id: "5",
    ageRating: "T13",
    image: "https://cdn.galaxycine.vn/media/2026/3/27/anh-hung-500_1774584875759.jpg",
  },
  {
    id: "6",
    ageRating: "T16",
    image: "https://cdn.galaxycine.vn/media/2026/4/6/con-ca-cau-co-500_1775458864686.jpg",
  },
];

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[2/3] shadow-2xl cursor-pointer">
      {/* Background Image */}
      <img
        src={movie.image}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 brightness-[0.95]"
      />

      {/* Age Rating Tag */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-[#a35126] text-white px-3 py-1 rounded-md font-bold text-lg shadow-lg border border-white/10">
          {movie.ageRating}
        </div>
      </div>

      
    </div>
  );
};

const Moive = () => {
  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 md:p-12">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black  tracking-tighter mb-2">
            PHIM ĐANG <span className="text-[#f26b38]">CHIẾU</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-1 w-20 bg-[#f26b38] rounded-full" />
            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">
              Today's Schedule • {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">
            GIAO DIỆN NHÂN VIÊN
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {mockMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      
      {/* Footer Decoration */}
      <div className="max-w-[1600px] mx-auto mt-20 pt-10 border-t border-white/5 flex justify-center">
        <p className="text-gray-600 text-sm font-medium">ALPHA CINEMA - TRẢI NGHIỆM ĐIỆN ẢNH ĐỈNH CAO</p>
      </div>
    </div>
  );
};

export default Moive;
