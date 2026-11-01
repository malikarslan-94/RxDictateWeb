import { skipToken } from '@reduxjs/toolkit/query';

import { useDebounce } from '@/hooks/useDebounce';

import { useSearchPatientsQuery } from '../api';
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_LENGTH,
  SEARCH_RESULT_LIMIT,
} from '../constants';
import { searchQuery } from '../utils';

/** Every patient of the clinic matching what's typed, once typing pauses. */
export function usePatientSearch(text: string) {
  const settled = useDebounce(text.trim(), SEARCH_DEBOUNCE_MS);
  const isActive = settled.length >= SEARCH_MIN_LENGTH;

  const { data, isFetching } = useSearchPatientsQuery(
    isActive
      ? { q: searchQuery(settled), limit: SEARCH_RESULT_LIMIT }
      : skipToken,
  );

  return {
    isActive,
    isSearching: isActive && isFetching,
    results: isActive ? (data?.patients ?? []) : [],
  };
}
