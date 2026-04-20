import React from 'react';
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'neutral',
  className = ''
}) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100',
    info: 'bg-sky-50 text-sky-600 hover:bg-sky-50 border-sky-100',
    warning: 'bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-100',
    error: 'bg-rose-50 text-rose-600 hover:bg-rose-50 border-rose-100',
    neutral: 'bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200'
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${styles[type]} ${className} border h-auto shadow-none`}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
