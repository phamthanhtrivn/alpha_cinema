import React from 'react';
import "@/index.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type TicketData = {
  movie: string;
  room: string;
  seat: string;
  time: string;
  price: string;
  cinemaAddress?: string;
  snacks?: { name: string; qty: number; price: number }[];
  snackTotal?: string;
  cinemaName?: string;
  cinemaPhone?: string;
  auditoriumName?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketData?: TicketData;
}

const PointOfSaleComponent: React.FC<Props> = ({
  open,
  onOpenChange,
  ticketData
}) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-1.5rem,42rem)] rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-orange-600 px-6 py-5 text-white">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-wide">Quầy Thu Ngân</DialogTitle>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex justify-center">
            <div
              id="ticket-receipt"
              className="w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-slate-900 shadow-sm"
            >
              <div className="text-center">
                <h2 className="text-xl font-black tracking-wide">
                  {ticketData?.cinemaName || 'ALPHA CINEMA'}
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  {ticketData?.cinemaAddress || '123 Đường Tên Lửa, TP.HCM'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Hotline: {ticketData?.cinemaPhone || '1900 1234'}
                </p>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Vé xem phim
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Phim</span>
                  <span className="max-w-[70%] text-right font-medium text-slate-900">{ticketData?.movie}</span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Phòng</span>
                  <span className="font-medium text-slate-900">{ticketData?.room}</span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Ghế</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-base font-bold text-orange-700">
                    {ticketData?.seat}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Suất</span>
                  <span className="text-right font-medium text-slate-900">{ticketData?.time}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-900 px-4 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                    Tổng tiền
                  </span>
                  <span className="text-xl font-extrabold">{ticketData?.price}</span>
                </div>
              </div>

              {ticketData?.snacks && ticketData.snacks.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Đồ ăn kèm</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Chi tiết</p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <table className="w-full table-fixed text-sm">
                      <colgroup>
                        <col style={{ width: '58%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '26%' }} />
                      </colgroup>
                      <tbody>
                        {ticketData.snacks.map((s, idx) => (
                          <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                            <td className="px-3 py-3 pr-2 align-top text-slate-700 wrap-break-word">{s.name}</td>
                            <td className="px-1 py-3 text-center align-top text-slate-600">x{s.qty}</td>
                            <td className="px-3 py-3 text-right align-top font-semibold text-slate-900">
                              {(s.price * s.qty).toLocaleString('vi-VN')} VND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-900">
                    <span className="text-sm font-semibold">Tổng đồ ăn</span>
                    <span className="text-sm font-bold">{ticketData.snackTotal ?? ''}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                <p className="text-xs italic text-slate-600">Cảm ơn quý khách và chúc xem phim vui vẻ!</p>
                <p className="mt-1 text-[10px] text-slate-500">Hotline: 1900 1234</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PointOfSaleComponent;