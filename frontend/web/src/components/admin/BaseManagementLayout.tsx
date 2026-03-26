import React from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BaseManagementLayoutProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  filterContent?: React.ReactNode;
  children: React.ReactNode;
  // Pagination Props
  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const BaseManagementLayout: React.FC<BaseManagementLayoutProps> = ({
  title,
  subtitle,
  onAdd,
  addLabel = 'THÊM MỚI',
  filterContent,
  children,
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const getVisiblePages = () => {
    const pages = [];

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    // đảm bảo luôn đủ 3 page nếu có thể
    if (currentPage === 1) {
      end = Math.min(3, totalPages);
    } else if (currentPage === totalPages) {
      start = Math.max(1, totalPages - 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight italic">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 font-medium flex items-center">
              <span className="w-8 h-[2px] bg-sky-500 mr-3 rounded-full"></span>
              {subtitle}
            </p>
          )}
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl px-8 py-7 shadow-[0_10px_20px_-5px_rgba(2,132,199,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(2,132,199,0.4)] transition-all active:scale-95 group cursor-pointer"
          >
            <div className="bg-white/20 p-1.5 rounded-lg mr-3 group-hover:rotate-90 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            {addLabel}
          </Button>
        )}
      </div>

      {/* Content Card */}
      <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden ring-1 ring-slate-100/50">
        {/* Advanced Filters Slot */}
        {filterContent && (
          <div className="p-1 border-b border-slate-100 bg-slate-50/20">
            {filterContent}
          </div>
        )}

        <CardContent className="p-0">
          {children}
        </CardContent>

        {/* Improved Pagination Footer */}
        <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1.5 rounded-full">
              {totalItems} KẾT QUẢ
            </span>
            {totalItems > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                Trang {currentPage} / {totalPages || 1}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-10 w-10 p-0 rounded-xl text-slate-400 border-slate-100 hover:bg-white hover:text-sky-600 hover:border-sky-200 transition-all disabled:opacity-30 disabled:hover:border-slate-100"
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="flex items-center space-x-1 px-1">
              {getVisiblePages().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  className={`h-10 w-10 rounded-xl text-xs font-black transition-all cursor-pointer ${currentPage === pageNum
                    ? "bg-sky-600 shadow-md shadow-sky-100"
                    : "text-slate-400 hover:bg-white hover:text-sky-600"
                    }`}
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-10 w-10 p-0 rounded-xl text-slate-400 border-slate-100 hover:bg-white hover:text-sky-600 hover:border-sky-200 transition-all disabled:opacity-30 disabled:hover:border-slate-100 cursor-pointer"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BaseManagementLayout;
