import { apiClient } from "./api";

export const notificationService = {
    getNotifications: async (page: number = 0) => {
        const response = await apiClient.get(`/notifications/customer?page=${page}`);
        return response.data;
    },
    markAsRead: async (notificationId: string) => {
        const response = await apiClient.put(`/notifications/${notificationId}/read`);
        return response.data;
    },
    deleteNotification: async (notificationId: string) => {
        const response = await apiClient.delete(`/notifications/${notificationId}`);
        return response.data;
    },
};
