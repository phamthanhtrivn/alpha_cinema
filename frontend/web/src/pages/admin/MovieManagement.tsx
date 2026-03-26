import React, { useState, useEffect } from 'react';
import BaseManagementLayout from '@/components/admin/BaseManagementLayout';
import ManagementTable from '@/components/admin/ManagementTable';
import StatusBadge from '@/components/admin/StatusBadge';
import TableActions from '@/components/admin/TableActions';
import ManagementFilterBar from '@/components/admin/ManagementFilterBar';
import { Calendar, Clock, Star, PlayCircle, Film } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';

const MovieManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const mockMovies = [
    { id: 1, title: 'Mai', genre: 'Tâm lý, Tình cảm', duration: '131 phút', releaseDate: '10/02/2024', status: 'Đang chiếu', rating: '8.5', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=150&fit=crop' },
    { id: 2, title: 'Gặp Lại Chị Bầu', genre: 'Hài, Gia đình', duration: '110 phút', releaseDate: '10/02/2024', status: 'Đang chiếu', rating: '7.9', poster: '' },
    { id: 3, title: 'Kung Fu Panda 4', genre: 'Hoạt hình, Hành động', duration: '94 phút', releaseDate: '08/03/2024', status: 'Sắp chiếu', rating: 'TBD', poster: '' },
    { id: 4, title: 'Dune: Hành Tinh Cát - Phần 2', genre: 'Hành động, Phiêu lưu', duration: '166 phút', releaseDate: '01/03/2024', status: 'Đang chiếu', rating: '9.1', poster: '' },
    { id: 5, title: 'Quỷ Cẩu', genre: 'Kinh dị', duration: '92 phút', releaseDate: '29/12/2023', status: 'Ngừng chiếu', rating: '6.5', poster: '' },
  ];

  // Simulation loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredMovies = mockMovies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thể loại</label>
        <Input placeholder='Tìm kiếm theo thể loại' />
      </div> */}
    </div>
  );

  return (
    <BaseManagementLayout
      title="Quản lý Phim"
      subtitle="Quản lý thư viện phim và lịch chiếu Alpha Cinema."
      onAdd={() => console.log('Add movie')}
      addLabel="THÊM PHIM MỚI"
      totalItems={filteredMovies.length}
      currentPage={currentPage}
      pageSize={5}
      onPageChange={(p) => setCurrentPage(p)}
      filterContent={
        <ManagementFilterBar
          searchValue={search}
          onSearch={setSearch}
          onRefresh={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterActive={isFilterOpen}
        >
          {FilterContent}
        </ManagementFilterBar>
      }
    >
      <ManagementTable
        headers={['Bộ phim / Thể loại', 'Thông tin kĩ thuật', 'Ngày công chiếu', 'Trạng thái', 'Hành động']}
        isLoading={loading}
      >
        {filteredMovies.map((movie) => (
          <TableRow
            key={movie.id}
            className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50 relative overflow-hidden"
          >
            {/* Cell: Poster & Title */}
            <TableCell className="px-8 py-5">
              <div className="flex items-center space-x-5">
                <div className="relative group/poster">
                  <div className="w-14 h-20 bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200/50 group-hover:border-sky-200 transition-all group-hover:shadow-md flex items-center justify-center">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <Film className="text-slate-300" size={20} />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-sky-600/0 group-hover/poster:bg-sky-600/10 transition-colors flex items-center justify-center rounded-xl">
                    <PlayCircle className="text-white opacity-0 group-hover/poster:opacity-100 scale-50 group-hover/poster:scale-100 transition-all" size={24} />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-black text-slate-800 group-hover:text-sky-600 transition-colors text-base tracking-tight">
                    {movie.title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                      {movie.genre.split(',')[0]}
                    </span>
                    {movie.genre.split(',').length > 1 && (
                      <span className="text-[10px] font-medium text-slate-400">
                        +{movie.genre.split(',').length - 1} khác
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TableCell>

            {/* Cell: Technical Info */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-xs text-slate-500 font-bold bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100/50">
                  <Clock size={12} className="mr-2 text-sky-400" />
                  {movie.duration}
                </div>
                <div className="flex items-center space-x-1 pl-1">
                  <Star size={12} className={movie.rating === 'TBD' ? "text-slate-300" : "text-amber-400 fill-amber-400"} />
                  <span className={`text-[11px] font-black ${movie.rating === 'TBD' ? "text-slate-300 italic" : "text-slate-700"}`}>
                    {movie.rating}
                  </span>
                  {movie.rating !== 'TBD' && <span className="text-[10px] text-slate-300 font-medium">/ 10</span>}
                </div>
              </div>
            </TableCell>

            {/* Cell: Release Date */}
            <TableCell className="px-8 py-5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm font-bold text-slate-600 italic tracking-tight">
                  <Calendar size={14} className="mr-2 text-slate-300" />
                  {movie.releaseDate}
                </div>
                <span className="text-[10px] text-slate-300 font-medium pl-6 uppercase tracking-widest">Toàn quốc</span>
              </div>
            </TableCell>

            {/* Cell: Status */}
            <TableCell className="px-8 py-5">
              <StatusBadge
                status={movie.status}
                type={movie.status === 'Đang chiếu' ? 'success' : movie.status === 'Sắp chiếu' ? 'info' : 'neutral'}
              />
            </TableCell>

            {/* Cell: Actions */}
            <TableCell className="px-8 py-5 text-right">
              <TableActions
                onView={() => alert('View movie')}
                onEdit={() => alert('Edit movie')}
                onDelete={() => alert('Delete movie')}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default MovieManagement;