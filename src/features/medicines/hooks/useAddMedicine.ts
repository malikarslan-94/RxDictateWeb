import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useDebounce } from '@/hooks/useDebounce';

import { usePutDrugListItemMutation, useSearchDrugsQuery } from '../api';
import {
  ADD_SEARCH_LIMIT,
  DRUG_SEARCH_DEBOUNCE_MS,
  DRUG_SEARCH_MIN_LENGTH,
  DrugListOwner,
  DrugScope,
} from '../constants';
import { medicinesCopy } from '../copy';
import { medicineTitle } from '../utils';

const copy = medicinesCopy.add;

/**
 * Add medicine: search everything, whatever the caller's mode, and put one on
 * this list. It stays open, since a list is usually built several at a time.
 */
export function useAddMedicine(owner: DrugListOwner) {
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), DRUG_SEARCH_DEBOUNCE_MS);
  const isSearching = q.length >= DRUG_SEARCH_MIN_LENGTH;
  const search = useSearchDrugsQuery(
    isSearching ? { q, limit: ADD_SEARCH_LIMIT, everywhere: true } : skipToken,
  );
  const [putItem, adding] = usePutDrugListItemMutation();

  const found = isSearching ? (search.data ?? []) : [];
  // A doctor's typed medicine is theirs alone; it can't go on the clinic's list.
  const addable =
    owner === DrugListOwner.clinic
      ? found.filter((drug) => drug.scope !== DrugScope.doctor)
      : found;

  return {
    title: copy.title[owner],
    text,
    setText,
    /** What was typed, to start "Add it yourself" from. */
    typed: text.trim(),
    isLoading: search.isLoading,
    emptyText: isSearching ? copy.noMatch : copy.typeToSearch,
    results: addable.map((drug) => ({
      id: drug.id,
      title: medicineTitle(drug),
      detail: drug.generic,
      isOnList: owner === DrugListOwner.me ? drug.inMyList : drug.inClinicList,
      isAdding: adding.isLoading && adding.originalArgs?.drugId === drug.id,
      add: () => putItem({ owner, drugId: drug.id }),
    })),
  };
}
