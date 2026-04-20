import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inbox } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface ManagementTableProps {
  headers: string[];
  children: React.ReactNode;
  isLoading?: boolean;
}

const ManagementTable: React.FC<ManagementTableProps> = ({
  headers,
  children,
  isLoading = false,
}) => {
  const rowCount = React.Children.count(children);

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <Table className="min-w-max">
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            {headers.map((header, index) => (
              <TableHead
                key={index}
                className={`px-8 py-5 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] h-auto ${index === headers.length - 1 ? "text-right" : ""}`}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-50">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-slate-50">
                {headers.map((_, j) => (
                  <TableCell key={j} className="px-8 py-6">
                    <Skeleton className="h-4 w-full bg-slate-100 rounded-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rowCount === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Inbox className="text-slate-200" size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      Không có dữ liệu
                    </p>
                    <p className="text-slate-300 text-xs italic">
                      Thử thay đổi bộ lọc hoặc thêm mới.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManagementTable;
