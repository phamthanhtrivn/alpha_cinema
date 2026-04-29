import { apiClient } from "./api";
import type { ShowScheduleSearchDTO } from "@/types/show-schedule";

export const showScheduleService = {
    searchSchedules: async (params?: ShowScheduleSearchDTO) => {
        const response = await apiClient.get(`/show-schedules/search`, { params });
        return response.data;
    },
    createSchedule: async (data: any) => {
        const response = await apiClient.post(`/show-schedules`, data);
        return response.data;
    },
    updateSchedule: async (id: string, data: any) => {
        const response = await apiClient.put(`/show-schedules/${id}`, data);
        return response.data;
    },
};
