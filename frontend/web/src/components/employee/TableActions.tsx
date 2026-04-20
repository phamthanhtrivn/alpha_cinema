import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
}

const TableActions: React.FC<TableActionsProps> = ({
  onEdit,
  onDelete,
  onView,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
    >
      {onView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          className="h-9 w-9 text-slate-400 hover:text-sky-600 hover:bg-white hover:border hover:border-slate-100 rounded-lg transition-all cursor-pointer"
          title="Xem chi tiết"
        >
          <Eye size={18} />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-9 w-9 text-slate-400 hover:text-amber-600 hover:bg-white hover:border hover:border-slate-100 rounded-lg transition-all cursor-pointer"
          title="Chỉnh sửa"
        >
          <Edit size={18} />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-white hover:border hover:border-slate-100 rounded-lg transition-all cursor-pointer"
          title="Xóa"
        >
          <Trash2 size={18} />
        </Button>
      )}
    </div>
  );
};

export default TableActions;
