import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FoodSelection from "../../../components/employee/FoodSelection";
import PaymentSelection from "../../../components/employee/PaymentSelection";
import SeatPreviewMap, { type SeatItem } from "../../../components/employee/SeatPreviewMap";
import TicketSummaryPanel from "../../../components/employee/TicketSummaryPanel";
import { showScheduleService } from "@/services/show-schedule.service";
import { seatService } from "@/services/seat.service";
import { ticketService } from "@/services/ticket.service";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { toast } from "react-toastify";
import PointOfSaleComponent from "@/components/employee/PointOfSaleComponent";
import { cinemaService } from "@/services/cinema.service";
import { useSelector } from "react-redux";

type Step = "seat" | "food" | "payment" | "ticket";
type PaymentMethod = "cash" | "bank_qr";

interface ShowSchedule {
  id: string;
  projectionType: string;
  translationType: string;
  roomId: string;
  roomNumber: number;
  startTime: string;
  endTime: string;
  availableSeat: number;
  status: boolean;
}

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
  showSchedules: ShowSchedule[];
}

const STEP_CONFIG: Array<{ id: Step; label: string }> = [
  { id: "seat", label: "Chọn ghế" },
  { id: "food", label: "Chọn thức ăn" },
  { id: "payment", label: "Thanh toán" },
  { id: "ticket", label: "In vé" },
];

const normalizeProjectionType = (projectionType: string) => {
  if (projectionType === "2D") return "_2D";
  if (projectionType === "3D") return "_3D";
  return projectionType;
};

const toLocalDateTimeParam = (value: string) => {
  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const SellTickets: React.FC = () => {
  const [step, setStep] = useState<Step>("seat");
  const [isLoading, setIsLoading] = useState(true);
  const [moviesWithSchedules, setMoviesWithSchedules] = useState<
    MovieWithSchedules[]
  >([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [seatItems, setSeatItems] = useState<SeatItem[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketPriceDataBySeatCode, setTicketPriceDataBySeatCode] = useState<
    Record<string, { price: number; ticketPriceId: string }>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    "cash",
  );
  const ticketPriceDataCacheRef = useRef<
    Record<string, { price: number; ticketPriceId: string }>
  >({});
  const [posOpen, setPosOpen] = useState(false);
  const [cinema, setCianema] = useState<{ address?: string; phone?: string } | undefined>(undefined);

  const cinemaId  = useSelector((state : any) => state?.auth.cinemaId);

  const fetchMovies = async () => {
    try {
      const response = await showScheduleService.getMovies_and_schedules();

      const movies = response?.data ?? [];

      if (Array.isArray(movies) && movies.length > 0) {
        setMoviesWithSchedules(movies);
        setSelectedMovieId(movies[0].movie.id);
        setSelectedScheduleId(movies[0].showSchedules[0]?.id ?? "");
      }
      return movies;
    } catch (error) {
      console.error("Failed to fetch movies and schedules:", error);
      return [];
    }
  };

  const fetchCinemaInfo = async () => {
    try {
      const response = await cinemaService.getCinemaInfo(cinemaId);
      if (response?.data) {
        setCianema(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cinema info:", error);
    }
  };

  console.log(cinema);

  useEffect(() => {
    fetchMovies();
    fetchCinemaInfo();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProductsWithoutPagination();
        const productsData = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        setProducts(productsData.filter((p: Product) => p.status === true));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const selectedMovieData = useMemo(
    () => moviesWithSchedules.find((item) => item.movie.id === selectedMovieId),
    [selectedMovieId, moviesWithSchedules],
  );

  const selectedSchedule = useMemo(
    () =>
      selectedMovieData?.showSchedules.find(
        (sch) => sch.id === selectedScheduleId,
      ),
    [selectedScheduleId, selectedMovieData],
  );

  useEffect(() => {
    if (!selectedMovieData?.showSchedules.length) {
      return;
    }

    const scheduleExists = selectedMovieData.showSchedules.some(
      (schedule) => schedule.id === selectedScheduleId,
    );
    if (!scheduleExists) {
      setSelectedScheduleId(selectedMovieData.showSchedules[0].id);
    }
  }, [selectedMovieData, selectedScheduleId]);

  const fetchSeats = useCallback(async () => {
    if (!selectedScheduleId || !selectedSchedule?.roomId) {
      setSeatItems([]);
      return;
    }

    try {
      setSeatLoading(true);
      const response = await seatService.getAllSeatsByShowSchedule(
        selectedScheduleId,
        selectedSchedule.roomId,
      );
      const seats = response.data ?? [];
      setSeatItems(Array.isArray(seats) ? seats : []);
      setSelectedSeats([]);
    } catch (error) {
      console.error("Failed to fetch seats:", error);
      setSeatItems([]);
    } finally {
      setSeatLoading(false);
    }
  }, [selectedScheduleId, selectedSchedule?.roomId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  const seatMap = useMemo(() => {
    const map = new Map<string, SeatItem>();
    seatItems.forEach((seat) => {
      map.set(`${seat.rowName}${seat.columnName}`, seat);
    });
    return map;
  }, [seatItems]);

  const { rowsObj, uniqueSeatTypes } = useMemo(() => {
    const grouped: Record<string, SeatItem[]> = {};
    const typesMap = new Map<string, string>();

    seatItems.forEach((seat) => {
      if (!grouped[seat.rowName]) {
        grouped[seat.rowName] = [];
      }

      grouped[seat.rowName].push(seat);

      if (!typesMap.has(seat.seatTypeName)) {
        typesMap.set(seat.seatTypeName, seat.seatTypeName);
      }
    });

    return {
      rowsObj: grouped,
      uniqueSeatTypes: Array.from(typesMap.values()),
    };
  }, [seatItems]);

  const selectedSeatDetails = useMemo(() => {
    return selectedSeats
      .map((seatCode) => seatMap.get(seatCode))
      .filter((seat): seat is SeatItem => Boolean(seat));
  }, [seatMap, selectedSeats]);

  useEffect(() => {
    const calculateTicketPrices = async () => {
      if (
        !selectedSchedule?.projectionType ||
        !selectedSchedule?.startTime ||
        selectedSeatDetails.length === 0
      ) {
        setTicketPriceDataBySeatCode({});
        return;
      }

      const projectionType = normalizeProjectionType(
        selectedSchedule.projectionType,
      );
      const showTime = toLocalDateTimeParam(selectedSchedule.startTime);

      const seatPriceEntries = await Promise.all(
        selectedSeatDetails.map(async (seat) => {
          const seatCode = `${seat.rowName}${seat.columnName}`;
          const seatTypeId = seat.seatTypeId;

          if (!seatTypeId) {
            return [seatCode, { price: 0, ticketPriceId: "" }] as const;
          }

          const cacheKey = `${seatTypeId}|${projectionType}|${showTime}`;
          const cachedData = ticketPriceDataCacheRef.current[cacheKey];
          if (cachedData) {
            return [seatCode, cachedData] as const;
          }

          try {
            const ticketPrices = await ticketService.determineTicketPrice({
              seatTypeId,
              projectionType,
              showTime,
            });

            if (Array.isArray(ticketPrices) && ticketPrices.length > 0) {
              const tp = ticketPrices[0];
              const price = Number(tp.price);
              if (Number.isFinite(price)) {
                const data = { price, ticketPriceId: tp.id || "" };
                ticketPriceDataCacheRef.current[cacheKey] = data;
                return [seatCode, data] as const;
              }
            }
          } catch (error) {
            console.error(
              `Failed to determine ticket price for seat ${seatCode}:`,
              error,
            );
          }

          return [seatCode, { price: 0, ticketPriceId: "" }] as const;
        }),
      );

      setTicketPriceDataBySeatCode(Object.fromEntries(seatPriceEntries));
    };

    void calculateTicketPrices();
  }, [
    selectedSeatDetails,
    selectedSchedule?.projectionType,
    selectedSchedule?.startTime,
  ]);

  const ticketTotal = useMemo(() => {
    return selectedSeatDetails.reduce((sum, seat) => {
      const seatCode = `${seat.rowName}${seat.columnName}`;
      return sum + (ticketPriceDataBySeatCode[seatCode]?.price ?? 0);
    }, 0);
  }, [selectedSeatDetails, ticketPriceDataBySeatCode]);

  const snackTotal = useMemo(() => {
    let total = 0;
    products.forEach((product) => {
      const qty = quantities[product.id] ?? 0;
      total += product.unitPrice * qty;
    });
    return total;
  }, [quantities, products]);

  const total = ticketTotal + snackTotal;

  const resetSellingFlow = async () => {
    setStep("seat");
    setSelectedSeats([]);
    setTicketPriceDataBySeatCode({});
    setQuantities({});
    setPaymentMethod("cash");
    fetchSeats();
  };

  const nextStep = async () => {
    if (step === "seat") {
      // Ensure user selected at least one seat before locking
      if (selectedSeatDetails.length === 0) {
        toast.error("Vui lòng chọn ghế");
        return;
      }

      // Lock seats khi chuyển từ Chọn ghế sang Chọn thức ăn
      try {
        setIsLoading(true);
        const seatIds = selectedSeatDetails.map((seat) => seat.id);
        await orderService.lockSeats({
          showScheduleId: selectedScheduleId,
          seatIds: seatIds,
        });
        setStep("food");
      } catch (error) {
        console.error("Failed to lock seats:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === "food") {
      setStep("payment");
    }
  };

  const previousStep = async () => {
    if (step === "payment") {
      setStep("food");
      return;
    }

    if (step === "food") {
      // Unlock seats khi quay lại từ Chọn thức ăn về Chọn ghế
      try {
        setIsLoading(true);
        const seatIds = selectedSeatDetails.map((seat) => seat.id);

        await orderService.unlockSeats({
          showScheduleId: selectedScheduleId,
          seatIds: seatIds,
        });
        setStep("seat");
      } catch (error) {
        console.error("Failed to unlock seats:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        totalPayment: total,
        showScheduleId: selectedScheduleId,
        seats: selectedSeatDetails.map((seat) => {
          const seatCode = `${seat.rowName}${seat.columnName}`;
          const priceData = ticketPriceDataBySeatCode[seatCode];
          return {
            seatId: seat.id,
            finalPrice: priceData?.price ?? 0,
            ticketPriceId: priceData?.ticketPriceId ?? "",
          };
        }),
        products: products
          .filter((p) => (quantities[p.id] ?? 0) > 0)
          .map((p) => ({
            productId: p.id,
            quantity: quantities[p.id],
            price: p.unitPrice,
          })),
      };
      const req = await orderService.checkoutEmployee(payload);
      if (req.success) {
        toast.success("Thanh toán thành công");
        setStep("ticket");
      } else {
        toast.error("Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const toggleSeat = (seatCode: string) => {
    const seat = seatMap.get(seatCode);
    if (!seat || seat.status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        return prev.filter((seat) => seat !== seatCode);
      }

      return [...prev, seatCode];
    });
  };

  const selectedScheduleTime = selectedSchedule
    ? new Date(selectedSchedule.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const selectedScheduleDate = selectedSchedule
    ? new Date(selectedSchedule.startTime).toLocaleDateString("vi-VN")
    : "";

  const posTicketData = {
    movie: selectedMovieData?.movie.title ?? "",
    room: String(
      selectedSchedule?.roomNumber ?? selectedSchedule?.roomId ?? "",
    ),
    seat: selectedSeats.length > 0 ? selectedSeats.join(", ") : "",
    time: `${selectedScheduleTime} - ${selectedScheduleDate}`,
    price: `${total.toLocaleString("vi-VN")} VND`,
    cinemaName: "ALPHA CINEMA",
    cinemaPhone: cinema?.phone || "",
    cinemaAddress: cinema?.address || "123 Đường Tên Lửa, TP.HCM",
    auditoriumName: selectedSchedule?.roomNumber
      ? `Phòng ${selectedSchedule.roomNumber}`
      : String(selectedSchedule?.roomId ?? ""),
    snacks: products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({
        name: p.name,
        qty: quantities[p.id],
        price: p.unitPrice,
      })),
    snackTotal: `${snackTotal.toLocaleString("vi-VN")} VND`,
  };

  return (
    <div className="space-y-6 pb-6">
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500"></div>
            <p className="text-sm font-semibold text-slate-500">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-3 shadow-sm sm:rounded-2xl sm:p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {STEP_CONFIG.map((item, index) => {
                const currentIndex = STEP_CONFIG.findIndex(
                  (stepItem) => stepItem.id === step,
                );
                const isActive = item.id === step;
                const isDone = index < currentIndex;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-3 ${
                      isActive
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black sm:h-8 sm:w-8 sm:text-xs ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {step === "seat" && (
                <div className="space-y-6">
                  {seatLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-orange-500"></div>
                        <p className="text-xs font-semibold text-slate-600">
                          Đang tải ghế...
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                      Đổi phim
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-500"
                      value={selectedMovieId}
                      onChange={(event) => {
                        setSelectedMovieId(event.target.value);
                        const newMovieData = moviesWithSchedules.find(
                          (item) => item.movie.id === event.target.value,
                        );
                        if (
                          newMovieData &&
                          newMovieData.showSchedules.length > 0
                        ) {
                          setSelectedScheduleId(
                            newMovieData.showSchedules[0].id,
                          );
                          setSelectedSeats([]);
                        }
                      }}
                    >
                      {moviesWithSchedules.map((item) => (
                        <option key={item.movie.id} value={item.movie.id}>
                          {item.movie.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                      Đổi suất chiếu
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovieData?.showSchedules.map((schedule) => {
                        const startTime = new Date(schedule.startTime);
                        const timeString = startTime.toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        );
                        return (
                          <button
                            key={schedule.id}
                            type="button"
                            onClick={() => {
                              setSelectedScheduleId(schedule.id);
                              setSelectedSeats([]);
                            }}
                            className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                              selectedScheduleId === schedule.id
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                            }`}
                          >
                            {timeString}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <SeatPreviewMap
                    rowsObj={rowsObj}
                    uniqueSeatTypes={uniqueSeatTypes}
                    selectedSeats={selectedSeats}
                    onToggleSeat={toggleSeat}
                    seatLoading={seatLoading}
                  />
                </div>
              )}

              {step === "food" && (
                <FoodSelection
                  products={products}
                  quantities={quantities}
                  onUpdateQuantity={updateQuantity}
                />
              )}

              {step === "payment" && (
                <PaymentSelection
                  paymentMethod={paymentMethod}
                  onSelectPaymentMethod={setPaymentMethod}
                />
              )}

              {step === "ticket" && (
                <div className="space-y-6 text-center py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Thanh toán thành công!
                    </h2>
                    <p className="mt-2 text-slate-500">
                      Vé đã được đặt và lưu vào hệ thống.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPosOpen(true)}
                      className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 shadow-sm"
                    >
                      In vé
                    </button>
                    <button
                      type="button"
                      onClick={resetSellingFlow}
                      className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:border-orange-500"
                    >
                      Bán vé mới
                    </button>
                  </div>
                </div>
              )}
            </div>

            <TicketSummaryPanel
              selectedMovieData={selectedMovieData}
              selectedSchedule={selectedSchedule}
              selectedScheduleTime={selectedScheduleTime}
              selectedScheduleDate={selectedScheduleDate}
              selectedSeatDetails={selectedSeatDetails}
              selectedSeats={selectedSeats}
              ticketTotal={ticketTotal}
              snackTotal={snackTotal}
              total={total}
              step={step}
              onPreviousStep={previousStep}
              onNextStep={nextStep}
              onComplete={handleComplete}
              canComplete={step !== "payment" || Boolean(paymentMethod)}
            />
          </div>
        </>
      )}
      <PointOfSaleComponent
        open={posOpen}
        onOpenChange={setPosOpen}
        ticketData={posTicketData}
      />
    </div>
  );
};

export default SellTickets;
