import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterSelectProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  placeholder,
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-white/50 border-slate-100 rounded-2xl h-11 text-xs font-bold text-slate-600 focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/20 transition-all shadow-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-sm p-1">
          {options.map((opt) => (
            <SelectItem
              key={opt}
              value={opt}
              className="text-xs font-bold text-slate-600 focus:bg-sky-50 focus:text-sky-600 rounded-xl py-2.5 transition-colors"
            >
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
