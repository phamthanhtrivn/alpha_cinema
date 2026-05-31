import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Film,
  Printer,
  ScanQrCode,
  Search,
  Ticket,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PointOfSaleComponent from "@/components/employee/PointOfSaleComponent";
import { orderService } from "@/services/order.service";
import { useSelector } from "react-redux";
import { cinemaService } from "@/services/cinema.service";

type SeatInfo = {
  id: string;
  room: string;
  seat: string;
  seatType: string;
  movie: string;
  showTime: string;
  price: number;
  checkedIn?: boolean;
  selected: boolean;
};

type FoodInfo = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type TicketLookup = {
  qrCode: string;
  bookingCode: string;
  showScheduleId: string;
  customer: string;
  movieTitle: string;
  showTime: string;
  room: string;
  poster?: string;
  seats: SeatInfo[];
  foods: FoodInfo[];
  status?: string;
};

type TicketDetailMovie = {
  nameMovie?: string;
  urlMovie?: string;
  startTime?: string;
  roomNumber?: number;
  showScheduleId?: string;
};

type TicketDetailSeat = {
  seatId?: string;
  seatNumber?: string;
  seatType?: string;
  price?: number;
  checkedIn?: string | boolean;
  showSeatType?: string;
};

type TicketDetailProduct = {
  nameProduct?: string;
  urlProduct?: string;
  quantity?: number;
  price?: number;
};

type TicketDetailResponse = {
  orderId?: string;
  customerName?: string;
  showScheduleId?: string;
  status?: string;
  movie?: TicketDetailMovie;
  seats?: TicketDetailSeat[];
  products?: TicketDetailProduct[];
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

// Map API response (user provided shape) to TicketLookup
const mapApiToTicket = (
  data: TicketDetailResponse | null | undefined,
): TicketLookup | null => {
  if (!data) return null;
  const movie = data.movie ?? {};
  const seats: SeatInfo[] = (data.seats ?? []).map((s, idx) => ({
    id: s.seatId ?? `seat-${idx}`,
    room: movie.roomNumber ? `Phong ${movie.roomNumber}` : "",
    seat: s.seatNumber ?? "",
    seatType: s.seatType ?? "",
    movie: movie.nameMovie ?? "",
    showTime: movie.startTime
      ? new Date(movie.startTime).toLocaleString("vi-VN")
      : "",
    price: s.price ?? 0,
    checkedIn: s.showSeatType === "CHECKED_IN" || s.checkedIn === "CHECKED_IN" || s.checkedIn === true,
    selected: s.showSeatType === "CHECKED_IN" ? false : true,
  }));

  const foods: FoodInfo[] = (data.products ?? []).map((p, idx) => ({
    id: `${p.nameProduct ?? "prod"}-${idx}`,
    name: p.nameProduct ?? "",
    price: p.price ?? 0,
    quantity: p.quantity ?? 0,
    image: p.urlProduct ?? "",
  }));

  return {
    qrCode: data.orderId ?? "",
    bookingCode: data.orderId ?? "",
    showScheduleId: data.showScheduleId ?? data.movie?.showScheduleId ?? "",
    customer: data.customerName ?? "Khách hàng",
    movieTitle: movie.nameMovie ?? "",
    showTime: movie.startTime
      ? new Date(movie.startTime).toLocaleString("vi-VN")
      : "",
    room: movie.roomNumber ? `Phong ${movie.roomNumber}` : "",
    poster: movie.urlMovie ?? "",
    seats,
    foods,
    status: data.status ?? "",
  };
};

const QR_SCANNER_REGION_ID = "qr-scanner-region";

const CheckTicket: React.FC = () => {
  const [qrValue, setQrValue] = useState("");
  const [printedTimes, setPrintedTimes] = useState(0);
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] =
    useState<React.ComponentProps<typeof PointOfSaleComponent>["ticketData"]>();
  const [cinema, setCianema] = useState<
    { address?: string; phone?: string } | undefined
  >(undefined);
  const cinemaId = useSelector(
    (state: { auth?: { cinemaId?: string } }) => state?.auth?.cinemaId,
  );

  // ── QR Camera Scanner state ──
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false);
  const scannedFromCameraRef = useRef(false);

  const hasData = Boolean(activeTicket);
  const selectedSeats = useMemo(() => seats.filter((s) => s.selected), [seats]);
  const showFoodSection = Boolean(
    activeTicket && activeTicket.foods.length > 0 && printedTimes === 0,
  );

  // ── Stop camera scanner ──
  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        // Only stop if currently scanning (state 2 = SCANNING)
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.warn("Error stopping QR scanner:", err);
    }
    setScanning(false);
  }, []);

  // ── Start camera scanner ──
  const startScanner = useCallback(async () => {
    // Reset the handled flag so a new scan can be processed
    scanHandledRef.current = false;

    // Clean up any previous instance
    if (scannerRef.current) {
      await stopScanner();
    }

    try {
      const html5Qr = new Html5Qrcode(QR_SCANNER_REGION_ID);
      scannerRef.current = html5Qr;
      setScanning(true);

      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Prevent handling the same scan multiple times
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;

          // Set the scanned orderId and flag it for auto-search
          scannedFromCameraRef.current = true;
          setQrValue(decodedText);

          // Stop the scanner after successful scan
          html5Qr
            .stop()
            .then(() => {
              html5Qr.clear();
              scannerRef.current = null;
              setScanning(false);
            })
            .catch(console.warn);
        },
        // Ignore scan failures (no QR in frame)
        undefined,
      );
    } catch (err) {
      console.error("Failed to start QR scanner:", err);
      setScanning(false);
    }
  }, [stopScanner]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const sc = scannerRef.current;
        try {
          const state = sc.getState();
          if (state === 2) {
            sc.stop()
              .then(() => sc.clear())
              .catch(console.warn);
          } else {
            sc.clear();
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Auto-trigger search when QR is scanned from camera
  useEffect(() => {
    if (scannedFromCameraRef.current && qrValue.trim()) {
      scannedFromCameraRef.current = false;
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrValue]);

  const fetchCinemaInfo = async () => {
    if (!cinemaId) return;
    try {
      const response = await cinemaService.getCinemaInfo(cinemaId);
      if (response?.data) {
        setCianema(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cinema info:", error);
    }
  };


  const handleSearch = async () => {
    const id = qrValue.trim();
    if (!id) {
      setActiveTicket(null);
      setSeats([]);
      return;
    }
    setLoading(true);
    try {
      const res = await orderService.getTicketDetailByOrderId(id);
      fetchCinemaInfo();
      // service may return { success, message, data } or raw data
      const payload = res?.data ?? res;
      const data = payload?.data ?? payload;
      if (!data && payload?.success === false) {
        setActiveTicket(null);
        setSeats([]);
      } else {
        const mapped = mapApiToTicket(data);
        setActiveTicket(mapped);
        setSeats(mapped?.seats ?? []);

        const isProductOnly = !(mapped?.seats && mapped.seats.length > 0);
        if (isProductOnly && mapped?.status === "CONFIRMED") {
          setPrintedTimes(1);
        } else {
          setPrintedTimes(0);
        }
      }
    } catch {
      setActiveTicket(null);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        // Prevent selecting already checked-in seats
        if (s.id === seatId && s.checkedIn) {
          return s;
        }
        return s.id === seatId ? { ...s, selected: !s.selected } : s;
      }),
    );
  };

  const hasCheckedInSeats = selectedSeats.some((s) => s.checkedIn);

  const handlePrintTicket = async () => {
    console.log("Attempting to check-in/handover with data:");
    if (!hasData || !activeTicket) return;

    const isProductOnly = !(activeTicket.seats && activeTicket.seats.length > 0);

    if (!isProductOnly) {
      if (selectedSeats.length === 0) {
        console.error("Cannot print: no seats selected");
        return;
      }
      if (hasCheckedInSeats) {
        console.error("Cannot print: some selected seats are already checked-in");
        return;
      }
      if (!activeTicket.showScheduleId) {
        console.error("Missing showScheduleId for check-in", activeTicket);
        return;
      }
    }

    setCheckingIn(true);
    try {
      if (isProductOnly) {
        await orderService.checkIn({
          orderId: activeTicket.qrCode,
          showScheduleId: "",
          seatIds: [],
        });

        setPrintedTimes((p) => p + 1);
      } else {
        await orderService.checkIn({
          orderId: activeTicket.qrCode,
          showScheduleId: activeTicket.showScheduleId,
          seatIds: selectedSeats.map((seat) => seat.id),
        });

        // Update seat statuses immediately
        const checkedInSeatIds = new Set(selectedSeats.map((s) => s.id));
        setSeats((prev) =>
          prev.map((seat) =>
            checkedInSeatIds.has(seat.id)
              ? { ...seat, checkedIn: true, selected: false }
              : seat
          )
        );

        setPrintedTimes((p) => p + 1);
        setReceiptData({
          movie: activeTicket.movieTitle,
          room: activeTicket.room,
          seat: selectedSeats.map((seat) => seat.seat).join(", "),
          time: activeTicket.showTime,
          price: currencyFormatter.format(
            selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0) +
            totalFood,
          ),
          cinemaAddress: cinema?.address || "123 Đường Tên Lửa, TP.HCM",
          cinemaName: "ALPHA CINEMA",
          cinemaPhone: cinema?.phone || "1900 1234",
          auditoriumName: activeTicket.room,
          snacks: activeTicket.foods.map((food) => ({
            name: food.name,
            qty: food.quantity,
            price: food.price,
          })),
          snackTotal: currencyFormatter.format(totalFood),
        });
        setReceiptOpen(true);
      }
    } catch (err) {
      console.error("Handover/Check-in failed:", err);
    } finally {
      setCheckingIn(false);
    }
  };

  const totalFood =
    activeTicket?.foods.reduce((sum, f) => sum + f.price * f.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium uppercase tracking-widest text-orange-600">
                <Ticket className="h-4 w-4" />
                Tra vé
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                Tra vé đặt online theo mã QR
              </h1>{" "}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
              <CardHeader className="space-y-2 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <ScanQrCode className="h-5 w-5 text-orange-500" />
                  Quét / Nhập mã
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="text-sm text-slate-700">Mã QR</label>
                  <div className="relative">
                    <ScanQrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      disabled={loading}
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      className="h-12 pl-10"
                    />
                  </div>

                  {/* ── Camera QR Scanner ── */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={scanning ? stopScanner : startScanner}
                    className={`w-full gap-2 ${scanning
                      ? "border-red-300 text-red-600 hover:bg-red-50"
                      : "border-orange-300 text-orange-600 hover:bg-orange-50"
                      }`}
                  >
                    {scanning ? (
                      <>
                        <CameraOff className="h-4 w-4" />
                        Tắt camera
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Quét QR bằng camera
                      </>
                    )}
                  </Button>

                  {/* Camera preview area */}
                  <div
                    id={QR_SCANNER_REGION_ID}
                    className={`overflow-hidden rounded-lg border border-slate-200 bg-black ${scanning ? "block" : "hidden"
                      }`}
                    style={{ minHeight: scanning ? 280 : 0 }}
                  />

                  <Button
                    disabled={loading}
                    onClick={handleSearch}
                    className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {loading ? "ĐANG TẢI..." : "Tìm kiếm"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  {activeTicket && activeTicket.seats && activeTicket.seats.length > 0 ? (
                    <>
                      <Printer className="h-5 w-5 text-orange-500" />
                      In vé
                    </>
                  ) : (
                    <>
                      <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                      Bàn giao đồ ăn
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    {activeTicket && activeTicket.seats && activeTicket.seats.length > 0 ? "Ghế được chọn" : "Sản phẩm chờ giao"}
                  </div>
                  <div className="font-semibold text-slate-900">
                    {activeTicket && activeTicket.seats && activeTicket.seats.length > 0 ? selectedSeats.length : activeTicket ? activeTicket.foods.length : 0}
                  </div>
                </div>
                <Button
                  onClick={handlePrintTicket}
                  disabled={
                    !hasData ||
                    checkingIn ||
                    (activeTicket && activeTicket.seats && activeTicket.seats.length > 0
                      ? (selectedSeats.length === 0 || hasCheckedInSeats)
                      : printedTimes > 0)
                  }
                  className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {checkingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : activeTicket && activeTicket.seats && activeTicket.seats.length > 0 ? (
                    <Printer className="h-4 w-4" />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4" />
                  )}
                  {checkingIn ? "ĐANG CHECK-IN..." : activeTicket && activeTicket.seats && activeTicket.seats.length > 0 ? "In vé" : "Xác nhận nhận đồ ăn"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {loading ? (
              <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                <CardContent className="flex items-center justify-center p-12">
                  <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
                </CardContent>
              </Card>
            ) : activeTicket ? (
              <>
                {activeTicket.seats && activeTicket.seats.length > 0 ? (
                  <>
                    <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                      <CardHeader className="border-b border-slate-200">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                              <Film className="h-5 w-5 text-orange-500" />
                              Thông tin vé
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500">
                              Mã booking {activeTicket.bookingCode} — khách{" "}
                              {activeTicket.customer}
                            </CardDescription>
                          </div>
                          <div>
                            {activeTicket.poster ? (
                              <img
                                src={activeTicket.poster}
                                alt={activeTicket.movieTitle}
                                className="h-20 w-16 rounded-md object-cover"
                              />
                            ) : null}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-xs text-slate-500">Phim</div>
                            <div className="mt-1 font-semibold text-slate-900">
                              {activeTicket.movieTitle}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Giờ chiếu</div>
                            <div className="mt-1 font-semibold text-slate-900">
                              {activeTicket.showTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Phòng</div>
                            <div className="mt-1 font-semibold text-slate-900">
                              {activeTicket.room}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Tổng ghế</div>
                            <div className="mt-1 font-semibold text-slate-900">
                              {selectedSeats.length}
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full table-auto">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                  Chọn
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                  Vị trí
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                  Loại ghế
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                  Trạng thái
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {seats.map((seat) => {
                                const isSelected = seat.selected;
                                const isCheckedIn = seat.checkedIn;
                                return (
                                  <tr
                                    key={seat.id}
                                    onClick={() => !isCheckedIn && toggleSeat(seat.id)}
                                    className={`${isCheckedIn ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isSelected ? "bg-orange-50" : "hover:bg-slate-50"}`}
                                  >
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => !isCheckedIn && toggleSeat(seat.id)}
                                        disabled={isCheckedIn}
                                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                      {seat.seat}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                      {seat.seatType}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {seat.checkedIn ? (
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                                          Đã check-in
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                          Chưa check-in
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                          <span className="text-sm text-slate-600">
                            Tổng tiền vé
                          </span>
                          <span className="font-semibold text-slate-900">
                            {currencyFormatter.format(
                              seats
                                .filter((s) => s.selected)
                                .reduce((sum, s) => sum + (s.price || 0), 0),
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {showFoodSection && (
                      <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                        <CardHeader className="border-b border-slate-200">
                          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                            <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                            Danh sách thức ăn (lần in đầu)
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Chỉ hiển thị ở lần in đầu tiên.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                    Hình
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                    Sản phẩm
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                                    Giá
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">
                                    Số lượng
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeTicket.foods.map((food) => (
                                  <tr
                                    key={food.id}
                                    className="border-b last:border-b-0"
                                  >
                                    <td className="px-4 py-3">
                                      <img
                                        src={food.image}
                                        alt={food.name}
                                        className="h-12 w-16 rounded-md object-cover"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                      {food.name}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                                      {currencyFormatter.format(food.price)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-slate-700">
                                      {food.quantity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-sm text-slate-600">
                              Tổng tiền đồ ăn
                            </span>
                            <span className="font-semibold text-slate-900">
                              {currencyFormatter.format(totalFood)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {printedTimes > 0 && (
                      <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-6 text-slate-700">
                          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                            <Printer className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              Đã in xong lần đầu
                            </p>
                            <p className="text-sm text-slate-600">
                              Thông tin thức ăn đã được lấy trong lần in trước đó và
                              sẽ không hiển thị ở các lần in sau.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <>
                    <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                      <CardHeader className="border-b border-slate-200">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                          <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                          Chi tiết hóa đơn bắp nước / đồ lưu niệm
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                          Mã booking {activeTicket.bookingCode} — Khách {activeTicket.customer}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {printedTimes > 0 ? (
                          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800">
                            <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="font-semibold">Đã bàn giao sản phẩm thành công</p>
                              <p className="text-xs text-emerald-700">Khách hàng đã nhận toàn bộ sản phẩm của hóa đơn này.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6 rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center gap-3 text-orange-800">
                            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-semibold">Đang chờ bàn giao sản phẩm</p>
                              <p className="text-xs text-orange-700">Vui lòng chuẩn bị các sản phẩm bên dưới và nhấn nút "Xác nhận nhận đồ ăn" ở cột bên trái.</p>
                            </div>
                          </div>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full table-auto">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Hình ảnh</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Sản phẩm</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Đơn giá</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Số lượng</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeTicket.foods.map((food) => (
                                <tr key={food.id} className="border-b last:border-b-0">
                                  <td className="px-4 py-3">
                                    <img src={food.image} alt={food.name} className="h-12 w-16 rounded-md object-cover" />
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{food.name}</td>
                                  <td className="px-4 py-3 text-right text-sm text-slate-700">{currencyFormatter.format(food.price)}</td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-700">{food.quantity}</td>
                                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{currencyFormatter.format(food.price * food.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                          <span className="text-sm font-medium text-slate-600">Tổng thanh toán</span>
                          <span className="text-xl font-bold text-slate-900">{currencyFormatter.format(totalFood)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            ) : (
              <Card className="border border-slate-200 bg-white text-slate-800 shadow-sm">
                <CardContent className="flex min-h-55 flex-col items-center justify-center gap-4 p-10 text-center">
                  <div className="rounded-full border border-orange-200 bg-orange-50 p-5 text-orange-600">
                    <Ticket className="h-8 w-8" />
                  </div>
                  <div className="max-w-lg space-y-2">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Chưa có kết quả tra vé
                    </h2>
                    <p className="text-sm text-slate-600">
                      Nhập mã QR hợp lệ ở khung bên trái để xem thông tin ghế,
                      phim, giờ chiếu và danh sách thức ăn (nếu có).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <PointOfSaleComponent
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        ticketData={receiptData}
      />
    </div>
  );
};

export default CheckTicket;
