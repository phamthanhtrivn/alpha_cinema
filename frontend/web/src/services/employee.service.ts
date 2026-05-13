import { apiClient } from "./api";
import type { EmployeeFilterParams } from "@/types/employee";

export const employeeService = {
  getAllEmployees: async (params: EmployeeFilterParams) => {
    const response = await apiClient.get(`/employees`, { params });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get(`/employees/profile`);
    return response.data;
  },
  createEmployee: async (data: any) => {
    const response = await apiClient.post(`/employees`, data);
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.post(`/employees/update-profile`, data);
    return response.data;
  },
  updateEmployee: async (id: string, data: any) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await apiClient.put(`/employees/change-password`, data);
    return response.data;
  },
  requestUpdateEmail: async (newEmail: string) => {
    const response = await apiClient.post(`/employees/email/request-update`, { newEmail });
    return response.data;
  },
  verifyUpdateEmail: async (data: { newEmail: string; otp: string }) => {
    const response = await apiClient.post(`/employees/email/verify-update`, data);
    return response.data;
  },
};
