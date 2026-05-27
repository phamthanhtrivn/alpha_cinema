import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { seatTypeService } from "@/services/seat-type.service";
import { seatService } from "@/services/seat.service";
import { toast } from "react-toastify";

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Palette màu gán theo thứ tự index của loại ghế (không phụ thuộc tên)
const SEAT_TYPE_PALETTES = [
  { bg: 'bg-sky-200',    text: 'text-sky-800',    border: 'border-sky-300',    active: 'bg-sky-200 text-sky-800 border-b-[4px] border-sky-300' },
  { bg: 'bg-amber-400',  text: 'text-amber-950',  border: 'border-amber-500',  active: 'bg-amber-400 text-amber-950 border-b-[4px] border-amber-500' },
  { bg: 'bg-pink-400',   text: 'text-pink-950',   border: 'border-pink-500',   active: 'bg-pink-400 text-pink-950 border-b-[4px] border-pink-500' },
  { bg: 'bg-green-300',  text: 'text-green-900',  border: 'border-green-400',  active: 'bg-green-300 text-green-900 border-b-[4px] border-green-400' },
  { bg: 'bg-purple-300', text: 'text-purple-900', border: 'border-purple-400', active: 'bg-purple-300 text-purple-900 border-b-[4px] border-purple-400' },
];

// Nhận diện ghế đôi bằng nhiều từ khóa, không phụ thuộc ngôn ngữ
const isCoupleType = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('couple') || n.includes('đôi') || n.includes('doi') || n.includes('double');
};

const CinemaSeatEditModal = ({ isOpen, onClose, roomId, capacity, existingSeats, onSaveSuccess }: any) => {
  const [seatTypes, setSeatTypes] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{ rowName: string, columnName: string }[]>([]);
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSeatTypes();
      setSelectedSeats([]);
      setSelectedSeatTypeId('');
      setSelectedStatus(true);
    }
  }, [isOpen]);

  const fetchSeatTypes = async () => {
    try {
      const res = await seatTypeService.getAllSeatTypes();
      if (res?.success || res?.data) {
        setSeatTypes(res.data || res);
      } else if (Array.isArray(res)) {
        setSeatTypes(res);
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể tải danh sách loại ghế");
    }
  };

  const colsCount = useMemo(() => {
    if (!capacity) return 10;
    return Math.floor(capacity / 10);
  }, [capacity]);


  // Create a map for quick lookup
  const seatsMap = useMemo(() => {
    const map = new Map<string, any>();
    if (existingSeats && Array.isArray(existingSeats)) {
      existingSeats.forEach(seat => {
        map.set(`${seat.rowName}-${seat.columnName}`, seat);
      });
    }
    return map;
  }, [existingSeats]);

  const handleSeatClick = (row: string, col: number) => {
    const colStr = col.toString();
    const index = selectedSeats.findIndex(s => s.rowName === row && s.columnName === colStr);
    if (index >= 0) {
      // Remove
      setSelectedSeats(prev => prev.filter((_, i) => i !== index));
    } else {
      // Add
      setSelectedSeats(prev => [...prev, { rowName: row, columnName: colStr }]);
    }
  };

  // Map seatTypeId -> palette index (xây dựng từ danh sách seatTypes)
  const typeColorMap = useMemo(() => {
    const map = new Map<string, typeof SEAT_TYPE_PALETTES[0]>();
    seatTypes.forEach((type: any, idx: number) => {
      map.set(type.id, SEAT_TYPE_PALETTES[idx % SEAT_TYPE_PALETTES.length]);
    });
    return map;
  }, [seatTypes]);

  const getSeatStyle = (seat: any, isSelected: boolean) => {
    const baseClass = 'h-9 rounded text-xs font-semibold flex items-center justify-center cursor-pointer transition-all shadow-sm ';

    // Width dựa theo tên loại ghế (nhận diện ghế đôi)
    const widthClass = (seat && isCoupleType(seat.seatType?.name || '')) ? 'w-[82px]' : 'w-9';

    // Colors
    let colorClass = '';
    if (!seat) {
      colorClass = 'bg-white text-slate-400 border-2 border-dashed border-slate-300';
    } else if (!seat.status) {
      colorClass = 'bg-slate-200 text-slate-500 border-b-[4px] border-slate-300 opacity-70';
    } else {
      const palette = typeColorMap.get(seat.seatType?.id) ?? SEAT_TYPE_PALETTES[0];
      colorClass = palette.active;
    }

    if (isSelected) {
      return baseClass + widthClass + ' ' + colorClass + ' ring-4 ring-sky-500 ring-opacity-50 scale-105 z-10';
    }
    return baseClass + widthClass + ' ' + colorClass + ' hover:opacity-80';
  };

  const handleSave = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 ghế");
      return;
    }
    if (!selectedSeatTypeId) {
      toast.warning("Vui lòng chọn loại ghế");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        roomId: roomId,
        seatTypeId: selectedSeatTypeId,
        status: selectedStatus,
        seatItems: selectedSeats
      };

      const res = await seatService.createAndUpdateSeat(payload);
      if (res?.success !== false) { // Assuming success if no explicit false
        toast.success("Cập nhật ghế thành công");
        setSelectedSeats([]);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error(res?.message || "Lỗi cập nhật ghế");
      }
    } catch (error) {
      console.log(error);
      toast.error("Đã xảy ra lỗi khi lưu");
    } finally {
      setIsSaving(false);
    }
  };

  const selectAllRow = (row: string) => {
    const newSelected = [...selectedSeats];
    for (let c = 1; c <= colsCount; c++) {
      const colStr = c.toString();
      const exists = newSelected.some(s => s.rowName === row && s.columnName === colStr);
      if (!exists) {
        newSelected.push({ rowName: row, columnName: colStr });
      }
    }
    setSelectedSeats(newSelected);
  };

  const selectAllCol = (col: number) => {
    const colStr = col.toString();
    const newSelected = [...selectedSeats];
    for (const row of ROWS) {
      const exists = newSelected.some(s => s.rowName === row && s.columnName === colStr);
      if (!exists) {
        newSelected.push({ rowName: row, columnName: colStr });
      }
    }
    setSelectedSeats(newSelected);
  };


  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-[1200px] w-full max-h-[95vh] rounded-2xl p-0 bg-white overflow-hidden flex flex-col border-0">
        
        {/* HEADER */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Chỉnh sửa Sơ đồ phòng chiếu
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sơ đồ ghế */}
          <div className="flex-1 p-6 sm:p-8 bg-slate-50/50 overflow-auto border-r border-slate-100 custom-scrollbar">
            {/* Khu vực Màn Hình */}
            <div className="mb-16 flex flex-col items-center">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-6 bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm">
                Màn hình trung tâm
              </div>
              <div className="w-[80%] max-w-3xl h-10 border-t-4 border-sky-400 rounded-[50%] shadow-[0_-8px_20px_-5px_rgba(56,189,248,0.3)]"></div>
            </div>

            {/* Các Nút Chọn Cột */}
            <div className="flex flex-col gap-2.5 min-w-max mx-auto mb-10 items-center overflow-x-auto pb-4 pt-2">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6"></div>
                <div className="flex gap-2.5">
                  {Array.from({ length: colsCount }).map((_, cIndex) => {
                    const colNum = cIndex + 1;
                    return (
                      <div 
                        key={`col-${colNum}`} 
                        onClick={() => selectAllCol(colNum)}
                        className="w-9 text-center text-xs font-bold text-sky-600 cursor-pointer hover:bg-sky-100 py-1 rounded"
                        title={`Chọn cột ${colNum}`}
                      >
                        {colNum}
                      </div>
                    );
                  })}
                </div>
                <div className="w-6"></div>
              </div>

              {/* Lưới ghế */}
              {ROWS.map(rowName => (
                <div key={rowName} className="flex items-center gap-2.5">
                  
                  {/* Tên Hàng Trái (Bấm để chọn cả hàng) */}
                  <div 
                    className="w-6 font-bold text-sky-600 text-center cursor-pointer hover:bg-sky-100 rounded py-1"
                    onClick={() => selectAllRow(rowName)}
                    title={`Chọn hàng ${rowName}`}
                  >
                    {rowName}
                  </div>

                  {/* Các ghế */}
                  <div className="flex gap-2.5">
                    {Array.from({ length: colsCount }).map((_, cIndex) => {
                      const colNum = cIndex + 1;
                      const colStr = colNum.toString();
                      const seatKey = `${rowName}-${colStr}`;
                      const seat = seatsMap.get(seatKey);
                      const isSelected = selectedSeats.some(s => s.rowName === rowName && s.columnName === colStr);

                      return (
                        <div
                          key={seatKey}
                          onClick={() => handleSeatClick(rowName, colNum)}
                          className={getSeatStyle(seat, isSelected)}
                          title={`Ghế: ${rowName}${colStr} - Loại: ${seat?.seatType?.name || 'Chưa tạo'}`}
                        >
                          {colNum}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Tên Hàng Phải */}
                  <div className="w-6 font-bold text-slate-400 text-center">
                    {rowName}
                  </div>
                </div>
              ))}
            </div>

            {/* Chú thích màu sắc - dynamic theo seat types từ API */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-4 rounded-sm bg-white border-2 border-dashed border-slate-300"></div>
                <span className="text-sm font-semibold text-slate-600">Chưa tạo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-4 rounded-sm bg-slate-200 border-b-[4px] border-slate-300 opacity-70"></div>
                <span className="text-sm font-semibold text-slate-600">Ngừng HD</span>
              </div>
              {seatTypes.map((type: any) => {
                const palette = typeColorMap.get(type.id) ?? SEAT_TYPE_PALETTES[0];
                return (
                  <div key={type.id} className="flex items-center gap-3">
                    <div className={`w-8 h-4 rounded-sm border-b-[4px] ${palette.bg} ${palette.border}`}></div>
                    <span className="text-sm font-semibold text-slate-600">{type.name}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3">
                <div className="w-8 h-4 rounded-sm ring-2 ring-sky-500 bg-white"></div>
                <span className="text-sm font-semibold text-slate-600">Đang chọn ({selectedSeats.length})</span>
              </div>
            </div>

          </div>

          {/* Panel Chỉnh Sửa */}
          <div className="w-80 bg-white p-6 flex flex-col border-l border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Thông tin cập nhật</h3>

            <div className="mb-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Loại ghế
              </label>
              <div className="flex flex-col gap-2">
                {seatTypes.map((type: any) => (
                  <label key={type.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      name="seatType" 
                      value={type.id}
                      checked={selectedSeatTypeId === type.id}
                      onChange={(e) => setSelectedSeatTypeId(e.target.value)}
                      className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Trạng thái
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="seatStatus" 
                    checked={selectedStatus === true}
                    onChange={() => setSelectedStatus(true)}
                    className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Hoạt động</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="radio" 
                    name="seatStatus" 
                    checked={selectedStatus === false}
                    onChange={() => setSelectedStatus(false)}
                    className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Ngừng hoạt động</span>
                </label>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-12"
                onClick={onClose}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button 
                className="flex-1 rounded-xl h-12 bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handleSave}
                disabled={isSaving || selectedSeats.length === 0 || !selectedSeatTypeId}
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CinemaSeatEditModal;
