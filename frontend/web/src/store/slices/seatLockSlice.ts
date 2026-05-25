import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
  SeatLockEvent,
  SeatLockStatus,
} from "@/services/seat-lock-websocket.service";

export type SeatLockSeatState = {
  status: SeatLockStatus;
  eventId?: string;
  sessionId?: string;
  source?: string;
  expiresAt?: string;
  occurredAt?: string;
};

type SeatLockState = {
  watchedShowScheduleIds: string[];
  seatsByShowScheduleId: Record<string, Record<string, SeatLockSeatState>>;
};

type ReleaseSeatLocksForSessionPayload = {
  showScheduleId: string;
  sessionId: string;
  seatIds?: string[];
};

const initialState: SeatLockState = {
  watchedShowScheduleIds: [],
  seatsByShowScheduleId: {},
};

const seatLockSlice = createSlice({
  name: "seatLocks",
  initialState,
  reducers: {
    watchSeatLocks: (state, { payload }: PayloadAction<string>) => {
      if (!payload || state.watchedShowScheduleIds.includes(payload)) {
        return;
      }
      state.watchedShowScheduleIds.push(payload);
    },
    unwatchSeatLocks: (state, { payload }: PayloadAction<string>) => {
      state.watchedShowScheduleIds = state.watchedShowScheduleIds.filter(
        (showScheduleId) => showScheduleId !== payload,
      );
    },
    applySeatLockEvent: (state, { payload }: PayloadAction<SeatLockEvent>) => {
      if (
        !payload.showScheduleId ||
        !Array.isArray(payload.seatIds) ||
        payload.seatIds.length === 0
      ) {
        return;
      }

      const seats =
        state.seatsByShowScheduleId[payload.showScheduleId] ?? {};

      payload.seatIds.forEach((seatId) => {
        seats[seatId] = {
          status: payload.status,
          eventId: payload.eventId,
          sessionId: payload.sessionId,
          source: payload.source,
          expiresAt: payload.expiresAt,
          occurredAt: payload.occurredAt,
        };
      });

      state.seatsByShowScheduleId[payload.showScheduleId] = seats;
    },
    releaseSeatLocksForSession: (
      state,
      { payload }: PayloadAction<ReleaseSeatLocksForSessionPayload>,
    ) => {
      if (!payload.showScheduleId || !payload.sessionId) {
        return;
      }

      const seats =
        state.seatsByShowScheduleId[payload.showScheduleId] ?? {};
      const seatIds = payload.seatIds?.length
        ? payload.seatIds
        : Object.entries(seats)
            .filter(([, seat]) => seat.sessionId === payload.sessionId)
            .map(([seatId]) => seatId);

      seatIds.forEach((seatId) => {
        const currentSeat = seats[seatId];
        if (
          currentSeat?.sessionId &&
          currentSeat.sessionId !== payload.sessionId
        ) {
          return;
        }

        seats[seatId] = {
          ...currentSeat,
          status: "AVAILABLE",
          sessionId: payload.sessionId,
        };
      });

      state.seatsByShowScheduleId[payload.showScheduleId] = seats;
    },
    clearSeatLocks: (state, { payload }: PayloadAction<string | undefined>) => {
      if (payload) {
        delete state.seatsByShowScheduleId[payload];
        state.watchedShowScheduleIds = state.watchedShowScheduleIds.filter(
          (showScheduleId) => showScheduleId !== payload,
        );
        return;
      }

      state.watchedShowScheduleIds = [];
      state.seatsByShowScheduleId = {};
    },
  },
});

export const {
  watchSeatLocks,
  unwatchSeatLocks,
  applySeatLockEvent,
  releaseSeatLocksForSession,
  clearSeatLocks,
} = seatLockSlice.actions;

export const selectWatchedSeatLockShowScheduleIds = (state: RootState) =>
  state.seatLocks.watchedShowScheduleIds;

export const selectSeatLocksByShowScheduleId =
  (showScheduleId?: string) => (state: RootState) =>
    showScheduleId
      ? state.seatLocks.seatsByShowScheduleId[showScheduleId] ?? {}
      : {};

export default seatLockSlice.reducer;
