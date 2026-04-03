/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HolidayFilterParams } from "@/types/holiday";
import { apiClient } from "./api";

export const ticketService = {
    getAllHolidays: async (params: HolidayFilterParams) => {
        const response = await apiClient.get(`/holidays`, {
            params
        })
        return response.data
    },
    createHoliday: async (data: any) => {
        const response = await apiClient.post(`/holidays`, data)
        return response.data
    },
     updateHoliday: async (id: string, data: any) => {
        const response = await apiClient.put(`/holidays/${id}`, data)
        return response.data
    },
     deleteHoliday: async (id: string) => {
        const response = await apiClient.delete(`/holidays/${id}`)
        return response.data
    }
}