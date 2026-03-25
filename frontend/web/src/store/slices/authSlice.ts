import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'GUEST' | 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';

interface AuthState {
  user: any | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: 'GUEST',
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token, role } }: PayloadAction<{ user: any; token: string; role: UserRole }>
    ) => {
      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = 'GUEST';
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
