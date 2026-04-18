import { apiClient } from "./api";
import type RegisterRequest from "@/types/registerRequest";
import type LoginRequest from "@/types/loginRequest";

export const userService = {
  clientRegister: async (request: RegisterRequest) => {
    const response = await apiClient.post(`/users/register`, request);
    return response.data;
  },
  login: async (request: LoginRequest) => {
    const response = await apiClient.post(`/users/login`, request, {
      withCredentials: true,
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get(`/users/profile`);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post(
      `/users/logout`,
      {},
      { withCredentials: true },
    );
    return response.data;
  },
  forget_password: async (email: string) => {
    const response = await apiClient.post(`/users/forgot-password`, { email });
    return response.data;
  },
  forget_password_otp: async (email: string, otp: string) => {
    const response = await apiClient.post(`/users/forgot-password/otp`, {
      email,
      otp,
    });
    return response.data;
  },

  reset_password: async (
    email: string,
    password: string,
    passwordConfirm: string,
    token: string,
  ) => {
    const response = await apiClient.post(
      `/forgot-password/reset-password`,
      {
        email,
        password,
        passwordConfirm,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
  google_login: async (token: string) => {
    const response = await apiClient.post(
      "/users/google-login",
      { token: token },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
};
