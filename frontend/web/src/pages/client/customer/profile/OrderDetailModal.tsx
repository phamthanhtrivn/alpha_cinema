import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { type OrderHistoryItem } from '@/types/order';
import { ORDER_STATUS_LABELS } from '@/constants/order.constants';
import { ALL_TRANSLATION } from '@/types/movie';
import {
  X, Loader2, MapPin, Clock,
  Ticket, Coffee, CreditCard, Calendar,
  QrCode, AlertCircle, Film
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { AgeBadge } from './ProfileUIComponents';
import { Button } from '@/components/ui/button';

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PAID: 'bg-green-50 text-green-700 border border-green-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  FAILED: 'bg-red-50 text-red-700 border border-red-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border border-slate-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, isOpen, onClose }) => {
  const { data: order, isLoading, isError } = useQuery<OrderHistoryItem>({
    queryKey: ['order-detail', orderId],
    queryFn: () => orderService.getOrderHistoryDetail(orderId!).then(res => res.data),
    enabled: !!orderId && isOpen,
  });
  const orderStatusLabel = order
    ? ORDER_STATUS_LABELS[order.status] ?? order.status
    : '';
  const orderStatusClass = order
    ? STATUS_BADGE_CLASSES[order.status] ?? 'bg-slate-100 text-slate-600 border border-slate-200'
    : '';
  const scheduleSnapshot = order?.showScheduleSnapshot ?? null;
  const scheduleStartDate = scheduleSnapshot?.startTime
    ? new Date(scheduleSnapshot.startTime)
    : null;
  const scheduleEndDate = scheduleSnapshot?.endTime
    ? new Date(scheduleSnapshot.endTime)
    : null;
  const scheduleDateLabel = scheduleStartDate
    ? scheduleStartDate.toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      })
    : 'Chưa có ngày chiếu';
  const scheduleTimeLabel = scheduleStartDate
    ? scheduleStartDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    : 'Chưa có giờ chiếu';
  const scheduleEndTimeLabel = scheduleEndDate
    ? scheduleEndDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    : null;
  const scheduleTimeRangeLabel = scheduleEndTimeLabel
    ? `${scheduleTimeLabel} - ${scheduleEndTimeLabel}`
    : scheduleTimeLabel;
  const scheduleFormatLabel = scheduleSnapshot
    ? `${scheduleSnapshot.projectionType} · ${
        ALL_TRANSLATION.find(t => t.value === scheduleSnapshot.translationType)?.label ??
        scheduleSnapshot.translationType
      }`
    : 'Chưa có thông tin suất chiếu';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60  transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="text-alpha-blue" size={20} />
            Chi Tiết Vé Phim
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 gap-4">
              <Loader2 className="animate-spin text-alpha-blue" size={40} />
              <p className="text-slate-500 font-medium text-sm">Đang tải thông tin vé...</p>
            </div>
          ) : isError || !order ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-red-500 gap-3">
              <AlertCircle size={48} />
              <p className="font-bold">Không thể tải thông tin vé</p>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-2"
              >
                Đóng
              </Button>
            </div>
          ) : (
            <div className="p-4 md:p-6 flex flex-col gap-6 md:gap-8">

              {/* Ticket Body (Ticket visual) */}
              <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">

                {/* Movie Poster & Basic Info */}
                <div className="w-full md:w-40 bg-slate-50 border-b md:border-b-0 md:border-r border-dashed border-slate-200 p-4 shrink-0 flex md:flex-col gap-4 md:gap-0 items-center md:items-stretch">
                  <div className="w-20 md:w-full aspect-[2/3] rounded-sm overflow-hidden shadow-sm mb-0 md:mb-4 shrink-0">
                    {scheduleSnapshot?.movieThumbnailUrl ? (
                      <img
                        src={scheduleSnapshot.movieThumbnailUrl}
                        alt={scheduleSnapshot.movieTitle ?? 'Phim'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Film size={28} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    {scheduleSnapshot?.ageType && (
                      <AgeBadge ageType={scheduleSnapshot.ageType} />
                    )}
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 md:text-center">
                      {scheduleFormatLabel}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-5 md:p-6 relative">
                  {/* Decorative Ticket Notches */}
                  {/* Desktop notches (left side of info panel) */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full hidden md:block" />
                  <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full hidden md:block" />

                  {/* Mobile notches (at the junction of poster and info) */}
                  <div className="absolute top-0 left-0 -translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full md:hidden" style={{ left: '-10px' }} />
                  <div className="absolute top-0 right-0 -translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full md:hidden" style={{ right: '-10px' }} />

                  <div className="flex flex-col h-full">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 leading-tight mb-3">
                        {scheduleSnapshot?.movieTitle ?? 'Phim không xác định'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-600">Ngày chiếu</span>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Calendar size={14} className="text-alpha-blue" />
                            {scheduleDateLabel}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-600">Suất chiếu</span>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Clock size={14} className="text-alpha-blue" />
                            {scheduleTimeRangeLabel}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-xs font-medium text-slate-600">Rạp / Phòng</span>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <MapPin size={14} className="text-alpha-blue" />
                            {order.cinemaName} - Phòng {order.roomNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Centered */}
                    <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
                      <div className="bg-white p-2 rounded-xl border-2 border-slate-50 shadow-inner">
                        {order.qrCode ? (
                          <img src={order.qrCode} alt="QR Code" className="w-32 h-32" />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-slate-50 rounded">
                            <QrCode size={48} className="text-slate-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product & Payment details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left: Seats & Products */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col gap-6">
                  {/* Seats Section */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Ticket size={16} className="text-alpha-blue" />
                      Ghế đã đặt
                    </h5>
                    <div className="space-y-3">
                      {order.seats && order.seats.length > 0 ? (
                        order.seats.map((seat) => (
                          <div key={seat.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium">Ghế {seat.rowName}{seat.columnName}</span>
                            <span className="font-medium">{formatCurrency(seat.unitPrice)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không có thông tin ghế</p>
                      )}
                    </div>
                  </div>

                  {/* Products Section */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Coffee size={16} className="text-alpha-orange" />
                      Bắp nước & Combo
                    </h5>
                    <div className="space-y-3">
                      {order.products && order.products.length > 0 ? (
                        order.products.map((p, idx) => {
                          const productName =
                            p.name ?? p.productName ?? 'Sản phẩm đi kèm';
                          const quantity = p.quantity ?? 0;
                          const unitPrice = p.unitPrice ?? 0;
                          const lineTotal = p.subTotal ?? unitPrice * quantity;

                          return (
                            <div key={p.id ?? p.productId ?? idx} className="flex justify-between items-center gap-3 text-sm">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-700">{productName}</span>
                                <span className="text-xs text-slate-400">Số lượng: {quantity}</span>
                              </div>
                              <span className="font-bold text-slate-700 shrink-0">{formatCurrency(lineTotal)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không có bắp nước đính kèm</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Payment */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h5 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <CreditCard size={16} className="text-alpha-blue" />
                    Chi tiết thanh toán
                  </h5>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tạm tính</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(order.totalPrice)}</span>
                    </div>
                    {order.pointDiscount > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Giảm giá điểm</span>
                        <span className="font-semibold">-{formatCurrency(order.pointDiscount)}</span>
                      </div>
                    )}
                    {order.promotionDiscount > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Khuyến mãi</span>
                        <span className="font-semibold">-{formatCurrency(order.promotionDiscount)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center mt-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Tổng cộng</span>
                      <span className="text-lg font-black text-alpha-orange">{formatCurrency(order.totalPayment)}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Trạng thái</span>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${orderStatusClass}`}>
                        {orderStatusLabel}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-[11px] text-slate-400 text-center">
            Vui lòng xuất mã QR tại quầy vé để nhận vé giấy hoặc vào phòng chiếu.<br />
            Mọi thắc mắc vui lòng liên hệ Hotline: 1900 2224
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
