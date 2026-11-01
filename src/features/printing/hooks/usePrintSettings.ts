import { useState } from 'react';

import { StorageKey, readJson, writeJson } from '@/lib/storage';
import type { PrintOptions } from '@/types/printout';

import {
  DEFAULT_PRINT_OPTIONS,
  MAX_COPIES,
  MAX_TOP_MARGIN_MM,
} from '../constants';
import { printOptionsSchema } from '../schemas';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

/**
 * How this computer prints: letterhead or the clinic's pre-printed pads, the
 * languages, the top margin and copies. Each computer keeps its own, since
 * each has its own printer and paper.
 */
export function usePrintSettings() {
  const [options, setOptions] = useState<PrintOptions>(
    () =>
      readJson(StorageKey.print, printOptionsSchema) ?? DEFAULT_PRINT_OPTIONS,
  );

  const change = (next: Partial<PrintOptions>) =>
    setOptions((current) => {
      const merged = { ...current, ...next };
      writeJson(StorageKey.print, merged);
      return merged;
    });

  return {
    options,
    setHeader: (header: PrintOptions['header']) => change({ header }),
    setLanguage: (language: PrintOptions['language']) => change({ language }),
    setTopMargin: (value: string) =>
      change({ topMarginMm: clamp(Number(value), 0, MAX_TOP_MARGIN_MM) }),
    setCopies: (value: string) =>
      change({ copies: clamp(Number(value), 1, MAX_COPIES) }),
  };
}

export type PrintSettings = ReturnType<typeof usePrintSettings>;
