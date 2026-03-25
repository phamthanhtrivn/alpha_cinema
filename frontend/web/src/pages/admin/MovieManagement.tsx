import React from 'react';
import BaseManagementLayout from '@/components/admin/BaseManagementLayout';
import ManagementTable from '@/components/admin/ManagementTable';
import FilterSelect from '@/components/admin/FilterSelect';
import StatusBadge from '@/components/admin/StatusBadge';
import TableActions from '@/components/admin/TableActions';
import { Calendar, Clock } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';

const MovieManagement: React.FC = () => {
  const mockMovies = [
    { id: 1, title: 'Mai', genre: 'Tâm lý, Tình cảm', duration: '131 phút', releaseDate: '10/02/2024', status: 'Đang chiếu', rating: '8.5' },
    { id: 2, title: 'Gặp Lại Chị Bầu', genre: 'Hài, Gia đình', duration: '110 phút', releaseDate: '10/02/2024', status: 'Đang chiếu', rating: '7.9' },
    { id: 3, title: 'Kung Fu Panda 4', genre: 'Hoạt hình, Hành động', duration: '94 phút', releaseDate: '08/03/2024', status: 'Sắp chiếu', rating: 'TBD' },
    { id: 4, title: 'Dune: Hành Tinh Cát - Phần 2', genre: 'Hành động, Phiêu lưu', duration: '166 phút', releaseDate: '01/03/2024', status: 'Đang chiếu', rating: '9.1' },
    { id: 5, title: 'Quỷ Cẩu', genre: 'Kinh dị', duration: '92 phút', releaseDate: '29/12/2023', status: 'Ngừng chiếu', rating: '6.5' },
  ];

  const Filters = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FilterSelect
        label="Năm phát hành"
        options={[
          { label: 'Tất cả các năm', value: 'all' },
          { label: '2024', value: '2024' }
        ]}
      />
    </div>
  );

  return (
    <BaseManagementLayout
      title="Quản lý Phim"
      subtitle="Danh sách các bộ phim trong hệ thống Alpha Cinema."
      onAdd={() => console.log('Add movie')}
      addLabel="THÊM PHIM MỚI"
      filterContent={Filters}
    >
      <ManagementTable
        headers={['Phim / Thể loại', 'Thông tin', 'Ngày khởi chiếu', 'Trạng thái', 'Thao tác']}
        minWidth="1000px"
      >
        {mockMovies.map((movie) => (
          <TableRow key={movie.id} className="group hover:bg-slate-50/50 transition-all duration-200 border-slate-50">
            <TableCell className="px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-16 bg-slate-50 rounded-lg flex items-center justify-center text-[8px] text-slate-200 italic font-black uppercase border border-slate-100 group-hover:border-sky-100 shrink-0">
                  POSTER
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors truncate max-w-[200px]">{movie.title}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{movie.genre}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-xs text-slate-500 font-bold">
                  <Clock size={12} className="mr-1.5 text-slate-300" />
                  {movie.duration}
                </div>
                <div className="text-[10px] text-amber-500 font-black italic">
                  ★ {movie.rating} <span className="text-slate-300 font-normal">/ 10</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-5 text-sm font-bold text-slate-600 italic">
              <div className="flex items-center">
                <Calendar size={14} className="mr-2 text-slate-300" />
                {movie.releaseDate}
              </div>
            </TableCell>
            <TableCell className="px-6 py-5">
              <StatusBadge
                status={movie.status}
                type={movie.status === 'Đang chiếu' ? 'success' : movie.status === 'Sắp chiếu' ? 'info' : 'neutral'}
              />
            </TableCell>
            <TableCell className="px-6 py-5 text-right">
              <TableActions
                onView={() => { }}
                onEdit={() => { }}
                onDelete={() => { }}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>
    </BaseManagementLayout>
  );
};

export default MovieManagement;