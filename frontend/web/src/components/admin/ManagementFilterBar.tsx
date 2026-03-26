import React from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ManagementFilterBarProps {
  onSearch: (value: string) => void;
  searchValue: string;
  onRefresh: () => void;
  onToggleFilter?: () => void;
  isFilterActive?: boolean;
  searchPlaceholder?: string;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

const ManagementFilterBar: React.FC<ManagementFilterBarProps> = ({
  onSearch,
  searchValue,
  onRefresh,
  onToggleFilter,
  isFilterActive = false,
  searchPlaceholder = "Tìm kiếm nhanh...",
  rightContent,
  children
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
    onToggleFilter?.();
  };

  return (
    <div className="flex flex-col">
      {/* Main Bar */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={18} />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-12 pr-10 h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/20 transition-all font-medium text-slate-600 shadow-sm"
          />
          {searchValue && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="h-12 w-12 p-0 rounded-2xl border-slate-100 bg-white/50 hover:bg-white hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm cursor-pointer"
            title="Làm mới"
          >
            <RotateCcw size={18} />
          </Button>

          <Button
            onClick={toggleAdvanced}
            className={`h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer ${showAdvanced || isFilterActive
              ? "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 shadow-sky-100/20"
              : "bg-white/50 text-slate-500 border border-slate-100 hover:bg-white hover:text-sky-600"
              }`}
          >
            <Filter className={`mr-2 h-4 w-4 ${showAdvanced ? "animate-pulse" : ""}`} />
            Bộ lọc
            {(isFilterActive || showAdvanced) && <span className="ml-2 w-2 h-2 bg-sky-500 rounded-full"></span>}
          </Button>

          {rightContent}
        </div>
      </div>

      {/* Advanced Filters Expandable */}
      {showAdvanced && children && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 ring-1 ring-white/50">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementFilterBar;
