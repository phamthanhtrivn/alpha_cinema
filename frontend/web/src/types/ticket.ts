export const ProjectionType = {
  _2D: "_2D",
  _3D: "_3D",
  IMAX: "IMAX",
} as const;

export type ProjectionType =
  (typeof ProjectionType)[keyof typeof ProjectionType];

export const DayType = {
  WEEKDAY: "WEEKDAY",
  WEEKEND_BEFORE_17: "WEEKEND_BEFORE_17",
  WEEKEND_AFTER_17: "WEEKEND_AFTER_17",
  HOLIDAY: "HOLIDAY",
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export interface TicketFilterParams {
  id?: string;
  seatTypeId?: string;
  projectionType?: ProjectionType;
  dayType?: DayType;
  minPrice?: number;
  maxPrice?: number;
  status?: boolean;
}
