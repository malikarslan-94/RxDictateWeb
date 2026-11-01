import { createSlice, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** What a passing message says happened. Each has one colour. */
export const ToastTone = { success: 'success', danger: 'danger' } as const;
export type ToastTone = (typeof ToastTone)[keyof typeof ToastTone];

export type ToastItem = {
  id: string;
  tone: ToastTone;
  /** One line each; successes of one action share a toast. */
  messages: string[];
  /** When it last changed, for joining successes that arrive together. */
  at: number;
};

export type ToastState = { items: ToastItem[] };
export type ToastRootState = { toasts: ToastState };

/** The most on screen at once; the oldest gives way. */
const MAX_TOASTS = 4;

/**
 * Successes this close together come from one action ("Patient added",
 * "Added to today's list", "Vitals saved") and read as one toast.
 */
const JOIN_WINDOW_MS = 1500;

const initialState: ToastState = { items: [] };

/**
 * Passing messages, top right: every finished action and every failure.
 * The same message again (a retry, several requests failing offline) shows
 * once, freshly timed, rather than piling up.
 */
export const toastSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    toastShown: {
      reducer(
        state,
        action: PayloadAction<
          Omit<ToastItem, 'messages'> & { message: string }
        >,
      ) {
        const { id, tone, message, at } = action.payload;
        const repeat = state.items.find(
          (item) => item.tone === tone && item.messages.includes(message),
        );
        const last = state.items.at(-1);
        const joinsLast =
          !repeat &&
          tone === ToastTone.success &&
          last?.tone === ToastTone.success &&
          at - last.at < JOIN_WINDOW_MS;
        const base = repeat ?? (joinsLast ? last : null);
        const next: ToastItem = base
          ? {
              id,
              tone,
              messages: repeat ? base.messages : [...base.messages, message],
              at,
            }
          : { id, tone, messages: [message], at };
        state.items = [
          ...state.items.filter((item) => item.id !== base?.id),
          next,
        ].slice(-MAX_TOASTS);
      },
      prepare: (toast: { tone: ToastTone; message: string }) => ({
        payload: { ...toast, id: nanoid(), at: Date.now() },
      }),
    },
    toastHidden(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  selectors: {
    selectToasts: (state) => state.items,
  },
});

export const { toastShown, toastHidden } = toastSlice.actions;
export const { selectToasts } = toastSlice.selectors;
