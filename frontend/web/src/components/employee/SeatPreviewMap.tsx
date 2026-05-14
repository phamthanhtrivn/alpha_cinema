import React from "react";

const ROW_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

type SeatItem = {
  id: string;
  rowName: string;
  columnName: string;
  seatTypeName: string;
  seatTypeId: string;
  status: string;
};

interface SeatPreviewMapProps {
  rowsObj: Record<string, SeatItem[]>;
  uniqueSeatTypes: string[];
  selectedSeats: string[];
  onToggleSeat: (seatCode: string) => void;
  seatLoading?: boolean;
}

const SeatPreviewMap: React.FC<SeatPreviewMapProps> = ({
  rowsObj,
  uniqueSeatTypes,
  selectedSeats,
  onToggleSeat,
  seatLoading = false,
}) => {
  const sortedRowKeys = ROW_ORDER.filter((row) => rowsObj[row]).concat(
    Object.keys(rowsObj).filter((row) => !ROW_ORDER.includes(row)).sort()
  );

  const getSeatStyle = (seat: SeatItem | undefined, isSelected: boolean) => {
    const baseClass =
      "h-9 rounded text-xs font-semibold flex items-center justify-center transition-all shadow-sm border-b-[4px] ";

    const widthClass = seat?.seatTypeName.toLowerCase().includes("couple") ? "w-[82px]" : "w-9";

    let colorClass = "";
    if (!seat) {
      colorClass = "bg-white text-slate-400 border-2 border-dashed border-slate-300";
    } else if (seat.status !== "AVAILABLE") {
      colorClass = "bg-slate-200 text-slate-500 border-slate-300 opacity-70 cursor-not-allowed";
    } else {
      const typeName = seat.seatTypeName.toLowerCase();
      if (typeName.includes("vip")) {
        colorClass = "bg-amber-400 text-amber-950 border-amber-500";
      } else if (typeName.includes("couple")) {
        colorClass = "bg-pink-400 text-pink-950 border-pink-500";
      } else {
        colorClass = "bg-sky-200 text-sky-800 border-sky-300";
      }
    }

    if (isSelected && seat?.status === "AVAILABLE") {
      return `${baseClass}${widthClass} ${colorClass} ring-4 ring-sky-500 ring-opacity-50 scale-105 z-10`;
    }

    return `${baseClass}${widthClass} ${colorClass} hover:opacity-80`;
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-6 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          Màn hình trung tâm
        </div>
        <div className="h-10 w-[80%] max-w-3xl rounded-[50%] border-t-4 border-sky-400 shadow-[0_-8px_20px_-5px_rgba(56,189,248,0.3)]" />
      </div>

      <div className="mx-auto mb-10 flex min-w-max flex-col items-center gap-2.5 overflow-x-auto pb-4 pt-2">
        {sortedRowKeys.map((rowName) => (
          <div key={rowName} className="flex items-center gap-2.5">
            <div className="w-6 text-center font-bold text-slate-500">{rowName}</div>

            <div className="flex gap-2.5">
              {rowsObj[rowName]
                .slice()
                .sort((left, right) => Number(left.columnName) - Number(right.columnName))
                .map((seat) => {
                const seatCode = `${seat.rowName}${seat.columnName}`;
                const isSelected = selectedSeats.includes(seatCode);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.status !== "AVAILABLE"}
                    onClick={() => onToggleSeat(seatCode)}
                    className={getSeatStyle(seat, isSelected)}
                    title={`Ghế: ${seat.rowName}${seat.columnName} - Loại: ${seat.seatTypeName} - Trạng thái: ${seat.status === "AVAILABLE" ? "Có thể chọn" : "Ghế đã bị đặt"}`}
                  >
                    {seat.columnName}
                  </button>
                );
              })}
            </div>

            <div className="w-6 text-center font-bold text-slate-500">{rowName}</div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-7 h-2 w-full max-w-3xl rounded-full bg-linear-to-r from-orange-200 via-orange-500 to-orange-200" />
      <p className="mt-2 text-center text-sm font-black uppercase tracking-[0.3em] text-slate-400">Màn hình</p>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-slate-200 border-b-4 border-slate-300 opacity-70" /> Ghế đã bị đặt
        </span>
        {uniqueSeatTypes.map((typeName) => {
          const typeNameLower = typeName.toLowerCase();
          const legendClass = typeNameLower.includes("vip")
            ? "bg-amber-400 border-amber-500"
            : typeNameLower.includes("couple")
            ? "bg-pink-400 border-pink-500"
            : "bg-sky-200 border-sky-300";

          return (
            <span key={typeName} className="flex items-center gap-2">
              <span className={`h-4 w-4 rounded border-b-4 ${legendClass}`} /> {typeName}
            </span>
          );
        })}
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded ring-2 ring-sky-500 bg-white" /> Đang chọn
        </span>
      </div>

      {seatLoading && <p className="mt-4 text-center text-sm font-semibold text-slate-500">Đang tải sơ đồ ghế...</p>}
    </div>
  );
};

export type { SeatItem };
export default SeatPreviewMap;
