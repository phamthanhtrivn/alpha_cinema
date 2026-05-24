import type { BookingLayoutDTO } from "@/types/booking";
import { apiClient } from "./api";
import type {
  CinemaShowtime,
  ShowScheduleSearchDTO,
} from "@/types/show-schedule";

export const showScheduleService = {
  searchSchedules: async (params?: ShowScheduleSearchDTO) => {
    const response = await apiClient.get(`/show-schedules/admin/search`, {
      params,
    });
    return response.data;
  },
  createSchedule: async (data: any) => {
    const response = await apiClient.post(`/show-schedules/admin`, data);
    return response.data;
  },
  updateSchedule: async (id: string, data: any) => {
    const response = await apiClient.put(`/show-schedules/admin/${id}`, data);
    return response.data;
  },
  searchManagerSchedules: async (params?: ShowScheduleSearchDTO) => {
    const response = await apiClient.get(`/show-schedules/manager/search`, {
      params,
    });
    return response.data;
  },
  createManagerSchedule: async (data: any) => {
    const response = await apiClient.post(`/show-schedules/manager`, data);
    return response.data;
  },
  updateManagerSchedule: async (id: string, data: any) => {
    const response = await apiClient.put(`/show-schedules/manager/${id}`, data);
    return response.data;
  },
  getMovieShowtimes: async (
    movieId: string,
    date: string,
  ): Promise<CinemaShowtime[]> => {
    const response = await apiClient.get(
      `/show-schedules/public/find-by-movie/${movieId}`,
      {
        params: { date },
      },
    );
    return response.data;
  },
  getBookingLayout: async (id: string): Promise<BookingLayoutDTO> => {
    const response = await apiClient.get(
      `/show-schedules/booking-layout/${id}`,
    );
    return response.data;
  },
  getMovieShowtimeOnDate: async (
    movieId: string,
    cinemaId: string,
    date: string,
  ): Promise<any> => {
    const response = await apiClient.get(
      `/show-schedules/public/get-show-time-on-date/${movieId}`,
      {
        params: { cinemaId, date },
      },
    );
    return response.data;
  },
  getAvailableDateOnMovie: async (movieId: string): Promise<Date[]> => {
    const response = await apiClient.get(
      `/show-schedules/public/get-available-dates/${movieId}`,
    );
    return response.data;
  },
  getMovies_and_schedules: async () => {
    const response = await apiClient.get(
      `/show-schedules/movies-and-schedules`,
    );
    return response.data;
  },
  getCinemaOptionByMovie: async (movieId: string) => {
    const response = await apiClient.get(
      `/show-schedules/public/cinema-option-by-movie/${movieId}`,
    );
    return response.data;
  },
  getActiveDateForMovieCinema: async (movieId: string, cinemaId: string) => {
    const response = await apiClient.get(
      `/show-schedules/public/active-date-for-movie-cinema`,
      {
        params: { movieId, cinemaId },
      },
    );
    return response.data;
  },
};
