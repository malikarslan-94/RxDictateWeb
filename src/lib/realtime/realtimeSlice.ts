import { createSlice } from '@reduxjs/toolkit';

export type RealtimeState = {
  /** Live updates have been down for more than a moment. */
  isInterrupted: boolean;
};

export type RealtimeRootState = { realtime: RealtimeState };

const initialState: RealtimeState = { isInterrupted: false };

/**
 * Whether the lists on screen are live. Only a lasting gap counts: a quick
 * reconnect isn't worth telling anyone about.
 */
export const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    liveInterrupted(state) {
      state.isInterrupted = true;
    },
    liveRestored(state) {
      state.isInterrupted = false;
    },
  },
  selectors: {
    selectIsLiveInterrupted: (state) => state.isInterrupted,
  },
});

export const { liveInterrupted, liveRestored } = realtimeSlice.actions;
export const { selectIsLiveInterrupted } = realtimeSlice.selectors;
