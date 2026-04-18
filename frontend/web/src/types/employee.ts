import type { Gender } from "./customer";

export const EmployeeRole = {
    MANAGER: "MANAGER",
    STAFF: "STAFF",
} as const;

export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole];

export interface EmployeeFilterParams {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: Gender;
    status?: boolean;
    role?: EmployeeRole;
    cinemaId?: string;
}