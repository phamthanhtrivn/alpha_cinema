import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterSelectProps {
  label: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-white border-slate-200 rounded-lg h-9 text-xs font-bold text-slate-600 focus:ring-sky-400 focus:ring-offset-0 shadow-none">
          <SelectValue placeholder={`Chọn ${label}`} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs font-bold text-slate-600 focus:bg-sky-50 focus:text-sky-600 rounded-lg"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
