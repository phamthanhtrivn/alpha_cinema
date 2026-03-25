import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { alphaApi } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [alphaApi.reducerPath]: alphaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(alphaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
