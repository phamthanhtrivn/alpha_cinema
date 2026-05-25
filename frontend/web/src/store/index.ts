import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import seatLockReducer from './slices/seatLockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seatLocks: seatLockReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
