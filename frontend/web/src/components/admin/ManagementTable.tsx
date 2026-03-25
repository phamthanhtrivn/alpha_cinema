import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ManagementTableProps {
  headers: string[];
  children: React.ReactNode;
  minWidth?: string;
}

const ManagementTable: React.FC<ManagementTableProps> = ({
  headers,
  children,
  minWidth = '1200px'
}) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <Table className="w-full" style={{ minWidth }}>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            {headers.map((header, index) => (
              <TableHead 
                key={index} 
                className={`px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] h-auto ${index === headers.length - 1 ? 'text-right' : ''}`}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-50">
          {children}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManagementTable;
