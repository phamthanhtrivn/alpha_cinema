import { apiClient } from "./api";
import type { EmployeeFilterParams } from "@/types/employee";

export const employeeService = {
  getAllEmployees: async (params: EmployeeFilterParams) => {
    const response = await apiClient.get(`/employees`, { params });
    return response.data;
  },
  createEmployee: async (data: any) => {
    const response = await apiClient.post(`/employees`, data);
    return response.data;
  },
  updateEmployee: async (id: string, data: any) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },
};
