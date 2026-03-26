import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const alphaApi = createApi({
  reducerPath: 'alphaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_API_URL,
    prepareHeaders: (headers) => {
      // Typically we'd get the token from the store here
      // const token = (getState() as RootState).auth.token
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`)
      // }
      return headers;
    },
  }),
  tagTypes: ['Movies', 'Users', 'Tickets'],
  endpoints: (builder) => ({
    // Placeholder endpoints
    getMovies: builder.query<any[], void>({
      query: () => '/movies',
      providesTags: ['Movies'],
    }),
  }),
});

export const { useGetMoviesQuery } = alphaApi;
