import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// Palette màu gán theo thứ tự index của loại ghế (không phụ thuộc tên)
const SEAT_TYPE_PALETTES = [
  { bg: "bg-sky-200",   text: "text-sky-800",   border: "border-sky-300",   legend: "bg-sky-200" },
  { bg: "bg-amber-400", text: "text-amber-950", border: "border-amber-500", legend: "bg-amber-400" },
  { bg: "bg-pink-400",  text: "text-pink-950",  border: "border-pink-500",  legend: "bg-pink-400" },
  { bg: "bg-green-300", text: "text-green-900", border: "border-green-400", legend: "bg-green-300" },
  { bg: "bg-purple-300",text: "text-purple-900",border: "border-purple-400",legend: "bg-purple-300" },
];

// Nhận diện ghế đôi (couple) bằng nhiều từ khóa, không phụ thuộc ngôn ngữ
const isCoupleType = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("couple") || n.includes("đôi") || n.includes("doi") || n.includes("double");
};

const CinemaRoomPreviewModal = ({ rawData, isOpen, onClose }: any) => {
  const { rowsObj, uniqueSeatTypes, typeColorMap } = useMemo(() => {
    if (!rawData || rawData.length === 0)
      return { rowsObj: {}, uniqueSeatTypes: [], typeColorMap: new Map() };

    const grouped: any = {};
    const typesMap = new Map();

    rawData.forEach((seat: any) => {
      if (!grouped[seat.rowName]) {
        grouped[seat.rowName] = [];
      }
      grouped[seat.rowName].push(seat);

      if (!typesMap.has(seat.seatType.id)) {
        typesMap.set(seat.seatType.id, seat.seatType);
      }
    });

    Object.keys(grouped).forEach((row) => {
      grouped[row].sort(
        (a: any, b: any) => parseInt(a.columnName) - parseInt(b.columnName),
      );
    });

    // Gán màu theo index thứ tự xuất hiện
    const colorMap = new Map<string, typeof SEAT_TYPE_PALETTES[0]>();
    Array.from(typesMap.values()).forEach((type, idx) => {
      colorMap.set(type.id, SEAT_TYPE_PALETTES[idx % SEAT_TYPE_PALETTES.length]);
    });

    return {
      rowsObj: grouped,
      uniqueSeatTypes: Array.from(typesMap.values()),
      typeColorMap: colorMap,
    };
  }, [rawData]);

  // ==========================================
  // 2. CẤP MÀU GHẾ (dynamic, không hardcode tên)
  // ==========================================
  const getSeatClasses = (seatTypeId: string, status: boolean = true) => {
    if (!status) {
      return "bg-slate-200 text-slate-400 border-slate-300 opacity-70";
    }
    const palette = typeColorMap.get(seatTypeId) ?? SEAT_TYPE_PALETTES[0];
    return `${palette.bg} ${palette.text} ${palette.border}`;
  };

  const sortedRowKeys = Object.keys(rowsObj).sort();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
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
            {sortedRowKeys.map((rowName) => (
              <div key={rowName} className="flex items-center gap-2.5">
                {/* Tên Hàng Trái */}
                <div className="w-6 font-bold text-slate-500 text-center">
                  {rowName}
                </div>

                {/* Các ghế */}
                <div className="flex gap-2.5">
                  {rowsObj[rowName].map((seat: any) => {
                    const typeName = seat.seatType.name;
                    const isCouple = isCoupleType(typeName);
                    const widthClass = isCouple ? "w-[82px]" : "w-9";

                    return (
                      <div
                        key={seat.id}
                        className={`
                          ${widthClass} h-9 rounded text-xs font-semibold 
                          border-b-[4px] flex items-center justify-center cursor-default shadow-sm
                          ${getSeatClasses(seat.seatType.id, seat.status)}
                        `}
                        title={`Ghế: ${rowName}${seat.columnName} - Loại: ${typeName} - Trạng thái: ${seat.status ? "Hoạt động" : "Ngừng hoạt động"}`}
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
                <span className="text-sm font-bold text-slate-800">
                  Ngừng HD
                </span>
              </div>
            </div>
            {uniqueSeatTypes.map((type) => {
              const palette = typeColorMap.get(type.id) ?? SEAT_TYPE_PALETTES[0];
              return (
                <div key={type.id} className="flex items-center gap-3">
                  <div className={`w-8 h-4 rounded-sm border-b-[3px] ${palette.legend} ${palette.border}`}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                      {type.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CinemaRoomPreviewModal;
