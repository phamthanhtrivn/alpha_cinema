/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UserRole } from '@/types/user';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const getStoredToken = () => localStorage.getItem('accessToken');

interface AuthState {
  user: any | null;
  accessToken: string | null;
  role: UserRole;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: getStoredToken(),
  role: "GUEST",
  isAuthenticated: true,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload }: PayloadAction<{ user: any; accessToken: string; role: UserRole }>
    ) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.role = payload.role;
      state.isAuthenticated = true;

    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = 'GUEST';
      state.isAuthenticated = false;
  
    },
  },
  
});

export const { setCredentials, logout } = authSlice.actions;

/* selectors */
export const selectAuth = (state: any) => state.auth;
export const selectRole = (state: any) => state.auth.role;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;

export default authSlice.reducer;