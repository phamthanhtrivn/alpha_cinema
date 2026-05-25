export type SeatLockStatus = "LOCKED" | "AVAILABLE" | "SOLD";

export interface SeatLockEvent {
  eventId: string;
  showScheduleId: string;
  seatIds: string[];
  status: SeatLockStatus;
  sessionId?: string;
  source?: string;
  expiresAt?: string;
  occurredAt?: string;
}

export const getSeatLockWebSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (!apiUrl) return "ws://localhost:8080/ws";

  let wsUrl = apiUrl.replace(/^http/, "ws");
  if (wsUrl.endsWith("/api")) {
    wsUrl = wsUrl.substring(0, wsUrl.length - 4);
  }

  return `${wsUrl}/ws`;
};
