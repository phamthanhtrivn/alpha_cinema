import React from 'react';
import { Plus, Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface BaseManagementLayoutProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  filterContent?: React.ReactNode;
  children: React.ReactNode;
}

const BaseManagementLayout: React.FC<BaseManagementLayoutProps> = ({
  title,
  subtitle,
  onAdd,
  addLabel = 'THÊM MỚI',
  searchPlaceholder = 'Tìm kiếm...',
  filterContent,
  children
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 font-medium">{subtitle}</p>}
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl px-6 py-6 shadow-lg shadow-sky-100 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Content Card using Shadcn UI Card */}
      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden border-none ring-1 ring-slate-100">
        {/* Advanced Filters Slot */}
        {filterContent && (
          <div className="p-4 border-b border-slate-50 bg-slate-50/10">
            {filterContent}
          </div>
        )}

        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row gap-3 items-center justify-end bg-slate-50/30">

          {/* Nút làm mới */}
          <Button
            variant="ghost"
            className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 hover:bg-white h-10 px-4 transition-all"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>

          {/* Nút filter */}
          <Button
            variant="ghost"
            className={`font-bold text-xs uppercase tracking-widest h-10 px-4 transition-all`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
        </div>

        <CardContent className="p-0">
          {children}
        </CardContent>

        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/10">
          <span>0 kết quả</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase text-slate-400 border-slate-100" disabled>
              Trang trước
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase text-slate-400 border-slate-100" disabled>
              Trang sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BaseManagementLayout;
