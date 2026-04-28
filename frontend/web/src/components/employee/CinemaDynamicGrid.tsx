import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const CinemaRoomPreviewModal = ({ rawData, isOpen, onClose } : any) => {
  console.log("rawData", rawData);
  const { rowsObj, uniqueSeatTypes } = useMemo(() => {
    if (!rawData || rawData.length === 0) return { rowsObj: {}, uniqueSeatTypes: [] };

    const grouped : any = {};
    const typesMap = new Map();

    rawData.forEach((seat : any) => {
      if (!grouped[seat.rowName]) {
        grouped[seat.rowName] = [];
      }
      grouped[seat.rowName].push(seat);

      if (!typesMap.has(seat.seatType.id)) {
        typesMap.set(seat.seatType.id, seat.seatType);
      }
    });

    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a : any, b : any) => parseInt(a.columnName) - parseInt(b.columnName));
    });

    return {
      rowsObj: grouped,
      uniqueSeatTypes: Array.from(typesMap.values())
    };
  }, [rawData]);


  // ==========================================
  // 2. CẤP MÀU GHẾ
  // ==========================================
  const getSeatStyle = (typeName : string, status: boolean = true) => {
    if (status === false) {
      return 'bg-slate-200 text-slate-400 border-slate-300 opacity-70';
    }

    const nameLower = typeName.toLowerCase();
    
    if (nameLower.includes('vip')) {
      return 'bg-amber-400 text-amber-950 border-amber-500';
    }
    if (nameLower.includes('couple')) {
      return 'bg-pink-400 text-pink-950 border-pink-500';
    }
    return 'bg-sky-200 text-sky-800 border-sky-300';
  };

  const sortedRowKeys = Object.keys(rowsObj).sort();

  console.log("sortedRowKeys", sortedRowKeys);

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-[1024px] w-full max-h-[90vh] rounded-2xl p-0 bg-white overflow-hidden flex flex-col border-0">
        
        {/* HEADER */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Sơ đồ phòng chiếu
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 sm:p-8 bg-white overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Khu vực Màn Hình */}
          <div className="mb-20 flex flex-col items-center">
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-6 bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm">
              Màn hình trung tâm
            </div>
            {/* Đường cong màn hình đơn giản và đẹp */}
            <div className="w-[80%] max-w-3xl h-10 border-t-4 border-sky-400 rounded-[50%] shadow-[0_-8px_20px_-5px_rgba(56,189,248,0.3)]"></div>
          </div>

          {/* Sơ đồ ghế */}
          <div className="flex flex-col gap-2.5 min-w-max mx-auto mb-10 items-center overflow-x-auto pb-4 pt-2">
            {sortedRowKeys.map(rowName => (
              <div key={rowName} className="flex items-center gap-2.5">
                
                {/* Tên Hàng Trái */}
                <div className="w-6 font-bold text-slate-500 text-center">
                  {rowName}
                </div>

                {/* Các ghế */}
                <div className="flex gap-2.5">
                  {rowsObj[rowName].map((seat : any) => {
                    const typeName = seat.seatType.name;
                    const isCouple = typeName.toLowerCase().includes('couple');
                    const widthClass = isCouple ? 'w-[82px]' : 'w-9';

                    return (
                      <div
                        key={seat.id}
                        className={`
                          ${widthClass} h-9 rounded text-xs font-semibold 
                          border-b-[4px] flex items-center justify-center cursor-default shadow-sm
                          ${getSeatStyle(typeName, seat.status)}
                        `}
                        title={`Ghế: ${rowName}${seat.columnName} - Loại: ${typeName} - Trạng thái: ${seat.status ? 'Hoạt động' : 'Ngừng hoạt động'}`}
                      >
                        {seat.columnName}
                      </div>
                    );
                  })}
                </div>
                
                {/* Tên Hàng Phải */}
                <div className="w-6 font-bold text-slate-500 text-center">
                  {rowName}
                </div>
              </div>
            ))}
          </div>

          {/* Chú thích động */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-8 p-4 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-4 rounded-sm bg-slate-200 opacity-70"></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">Ngừng HD</span>
              </div>
            </div>
            {uniqueSeatTypes.map(type => (
              <div key={type.id} className="flex items-center gap-3">
                <div className={`w-8 h-4 rounded-sm ${getSeatStyle(type.name, true).split(' ')[0]}`}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{type.name}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CinemaRoomPreviewModal;