import { apiClient } from "./api";
import type { CinemaShowtime, ShowScheduleSearchDTO } from "@/types/show-schedule";

export const showScheduleService = {
    searchSchedules: async (params?: ShowScheduleSearchDTO) => {
        const response = await apiClient.get(`/show-schedules/admin/search`, { params });
        return response.data;
    },
    createSchedule: async (data: any) => {
        const response = await apiClient.post(`/show-schedules/admin`, data);
        return response.data;
    },
    updateSchedule: async (id: string, data: any) => {
        const response = await apiClient.put(`/admin/show-schedules/${id}`, data);
        return response.data;
    },
    getMovieShowtimes: async (movieId: string, date: string): Promise<CinemaShowtime[]> => {
        const response = await apiClient.get(
            `/show-schedules/public/find-by-movie/${movieId}`,
            {
                params: { date }
            }
        );
        return response.data;
    },
};
