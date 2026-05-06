import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

type BookingCountdownProps = {
  expiresAt?: string | null;
  label?: string;
  className?: string;
};

const formatRemainingTime = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export const useBookingCountdown = (expiresAt?: string | null) => {
  const deadline = useMemo(() => {
    if (!expiresAt) return null;
    const parsed = new Date(expiresAt).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }, [expiresAt]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (deadline === null) return;

    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  const remainingMs = deadline === null ? null : deadline - now;

  return {
    remainingMs,
    isExpired: remainingMs !== null ? remainingMs <= 0 : false,
  };
};

export const BookingCountdown = ({
  expiresAt,
  label = "Thời gian còn lại",
  className = "",
}: BookingCountdownProps) => {
  const { remainingMs, isExpired } = useBookingCountdown(expiresAt);

  if (!expiresAt || remainingMs === null) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
        isExpired
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-amber-200 bg-amber-50 text-amber-700"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <Clock3 size={16} />
        <span>{label}</span>
      </div>
      <span className="font-black tabular-nums">
        {isExpired ? "00:00" : formatRemainingTime(remainingMs)}
      </span>
    </div>
  );
};