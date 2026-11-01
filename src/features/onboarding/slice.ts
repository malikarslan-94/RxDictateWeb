import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { signedOut } from '@/lib/session';

import type { DoctorProfile } from './types';

type OnboardingState = {
  /** Step 1's answers, so steps 2 and 3 can show them back. */
  profile: DoctorProfile | null;
};

const initialState: OnboardingState = { profile: null };

export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    profileSaved(state, action: PayloadAction<DoctorProfile>) {
      state.profile = action.payload;
    },
    onboardingFinished: () => initialState,
  },
  // The sign-up draft belongs to the person who signed out.
  extraReducers: (builder) => {
    builder.addCase(signedOut, () => initialState);
  },
  selectors: {
    selectDoctorProfile: (state) => state.profile,
  },
});

export const { profileSaved, onboardingFinished } = onboardingSlice.actions;
export const { selectDoctorProfile } = onboardingSlice.selectors;
