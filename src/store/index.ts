import { configureStore, isPlain } from '@reduxjs/toolkit';

import { onboardingSlice } from '@/features/onboarding/slice';
import { baseApi } from '@/lib/api';
import { sessionSlice } from '@/lib/session';
import { toastSlice } from '@/lib/toast';

import { listeners } from './listeners';

/**
 * The one Redux store: the RTK Query cache plus app-state slices. Server data
 * lives in the cache only — slices never hold copies of API responses.
 */
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [sessionSlice.reducerPath]: sessionSlice.reducer,
    [onboardingSlice.reducerPath]: onboardingSlice.reducer,
    [toastSlice.reducerPath]: toastSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // The contract parses timestamps into Dates, which are safe to keep.
      serializableCheck: {
        isSerializable: (value: unknown) =>
          isPlain(value) || value instanceof Date,
      },
    })
      .prepend(listeners.middleware)
      .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
