import React from "react";

interface MovieWithSchedules {
  movie: {
    id: string;
    title: string;
    ageType: {
      name: string;
    };
    thumbnailUrl: string;
    supportedProjection: string[];
    supportedTranslation: string[];
  };
}

interface SelectedSchedule {
  roomId: string;
  roomNumber: number;
}

interface SeatItem {
  id: string;
  rowName: string;
  columnName: string;
  seatTypeName: string;
  status: string;
}

interface TicketSummaryPanelProps {
  selectedMovieData?: MovieWithSchedules;
  selectedSchedule?: SelectedSchedule;
  selectedScheduleTime: string;
  selectedScheduleDate: string;
  selectedSeatDetails: SeatItem[];
  selectedSeats: string[];
  ticketTotal: number;
  snackTotal: number;
  total: number;
  step: "seat" | "food" | "payment" | "ticket";
  onPreviousStep: () => void;
  onNextStep: () => void;
  onComplete?: () => void;
  canComplete?: boolean;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const TicketSummaryPanel: React.FC<TicketSummaryPanelProps> = ({
  selectedMovieData,
  selectedSchedule,
  selectedScheduleTime,
  selectedScheduleDate,
  selectedSeatDetails,
  selectedSeats,
  ticketTotal,
  snackTotal,
  total,
  step,
  onPreviousStep,
  onNextStep,
  onComplete,
  canComplete,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {selectedMovieData && (
        <>
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <img
              src={selectedMovieData.movie.thumbnailUrl}
              alt={selectedMovieData.movie.title}
              className="h-24 w-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-xl font-black text-slate-800">{selectedMovieData.movie.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedMovieData.movie.supportedProjection.join(" / ")} -{" "}
                {selectedMovieData.movie.supportedTranslation.join(" / ")}
              </p>
              <span className="mt-2 inline-flex rounded-md bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                {selectedMovieData.movie.ageType.name}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-b border-slate-100 py-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Phòng chiếu</span> - Phòng {selectedSchedule?.roomNumber}
            </p>
            <p>
              Suất: {" "}
              <span className="font-bold text-slate-800">{selectedScheduleTime}</span>
              {" - "}
              {selectedScheduleDate}
            </p>
            <p>
              Ghế: {" "}
              {selectedSeatDetails.length > 0 ? (
                <span className="font-bold text-slate-800">{selectedSeats.join(", ")}</span>
              ) : (
                <span className="italic text-slate-400">Vui lòng chọn ghế...</span>
              )}
            </p>
          </div>

          <div className="space-y-2 border-b border-slate-100 py-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Tiền vé</span>
              <span className="font-bold text-slate-800">{formatCurrency(ticketTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Thức ăn</span>
              <span className="font-bold text-slate-800">{formatCurrency(snackTotal)}</span>
            </div>
          </div>

          <div className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800">Tổng cộng</span>
              <span className="text-3xl font-black text-orange-500">{formatCurrency(total)}</span>
            </div>
          </div>

          {step !== "ticket" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onPreviousStep}
                disabled={step === "seat"}
                className="rounded-xl border border-slate-300 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Quay lại
              </button>

              {step !== "payment" ? (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="rounded-xl bg-orange-400 py-3 font-bold text-white hover:bg-orange-500"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onComplete}
                  disabled={!canComplete}
                  className="rounded-xl bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Hoàn tất bán vé
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketSummaryPanel;
