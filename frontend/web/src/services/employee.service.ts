import { apiClient } from "./api";
import type { EmployeeFilterParams } from "@/types/employee";

export const employeeService = {
    getAllEmployees: async (params: EmployeeFilterParams) => {
        const response = await apiClient.get(`/employees`, { params });
        return response.data;
    },
};