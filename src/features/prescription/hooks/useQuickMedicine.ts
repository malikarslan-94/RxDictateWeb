import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { Action } from '@/constants/roles';
import type { DrugSuggestion, DrugView } from '@/contract';
import { useSetting } from '@/features/clinic';
import {
  DRUG_SEARCH_DEBOUNCE_MS,
  DRUG_SEARCH_MIN_LENGTH,
  DrugListOwner,
  MEDICINE_SOURCE_KEY,
  MedicineSource,
  medicinesCopy,
  useCreateDrugMutation,
  usePutDrugListItemMutation,
  useSearchDrugsQuery,
} from '@/features/medicines';
import { useCan } from '@/hooks/useCan';
import { useDebounce } from '@/hooks/useDebounce';

import {
  DEFAULT_DURATION_DAYS,
  DEFAULT_PATTERN,
  DRUG_SEARCH_LIMIT,
  QUICK_SUGGESTIONS,
} from '../constants';
import { rxCopy } from '../copy';
import { parseQuickMedicine } from '../utils';
import type { RxEditor } from './useRxEditor';

/** Drugs whose strength starts with what was typed come first. */
function rank(drugs: DrugSuggestion[], strength: string): DrugSuggestion[] {
  if (!strength) return drugs;
  const digits = strength.replace(/\D/g, '');
  return [...drugs].sort(
    (a, b) =>
      Number(b.strength.startsWith(digits)) -
      Number(a.strength.startsWith(digits)),
  );
}

/**
 * The quick medicine line: "amlo 5 1-0-0 30d" and Enter makes a full row.
 * The name searches what the doctor's mode allows; the server applies it.
 * Arrows pick a match or one of the actions after them, Esc clears.
 */
export function useQuickMedicine(editor: RxEditor) {
  const [text, setText] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  // "Search all medicines", for this line only: the setting stays as it is.
  const [isEverywhere, setIsEverywhere] = useState(false);
  const source = useSetting(MEDICINE_SOURCE_KEY);
  const canKeepOnList = useCan(Action['drugList.own.manage']);
  const [createDrug, creating] = useCreateDrugMutation();
  const [putItem] = usePutDrugListItemMutation();
  const parsed = parseQuickMedicine(text);
  const query = useDebounce(parsed.name, DRUG_SEARCH_DEBOUNCE_MS);
  const { data: drugs = [], isFetching } = useSearchDrugsQuery(
    query.length >= DRUG_SEARCH_MIN_LENGTH
      ? { q: query, limit: DRUG_SEARCH_LIMIT, everywhere: isEverywhere }
      : skipToken,
  );
  const matches =
    parsed.name.length >= DRUG_SEARCH_MIN_LENGTH
      ? rank(drugs, parsed.strength).slice(0, QUICK_SUGGESTIONS)
      : [];

  // The search for what's typed now has answered, and found this much.
  const hasSearched =
    parsed.name.length >= DRUG_SEARCH_MIN_LENGTH &&
    query === parsed.name &&
    !isFetching;

  const clear = () => {
    setText('');
    setHighlighted(0);
    setIsEverywhere(false);
  };

  const add = async (drug: DrugView | null) => {
    if (!parsed.name || isAdding) return;
    setIsAdding(true);
    const isOk = await editor.addMedicine({
      name: drug ? drug.brand || drug.generic : parsed.name,
      strength: drug?.strength ?? parsed.strength,
      form: drug?.form ?? 'tab',
      pattern: parsed.pattern ?? DEFAULT_PATTERN,
      durationDays: parsed.durationDays ?? DEFAULT_DURATION_DAYS,
      drugId: drug?.id ?? null,
    });
    setIsAdding(false);
    if (isOk) clear();
  };

  /** Not in the catalog, and worth keeping: on their list, and on this line. */
  const keepTyped = async () => {
    if (!parsed.name || creating.isLoading) return;
    const made = await createDrug({
      brand: parsed.name,
      strength: parsed.strength,
      for: DrugListOwner.me,
    });
    if (made.data) await add(made.data.drug);
  };

  const searchAll = () => {
    setIsEverywhere(true);
    setHighlighted(0);
  };

  // After the matches, in this order. Each only when it can do something.
  const actions = [
    ...(source.value === MedicineSource.myList && !isEverywhere
      ? [{ label: medicinesCopy.quick.searchAll, run: searchAll }]
      : []),
    { label: rxCopy.editor.noMatch(parsed.name), run: () => add(null) },
    ...(hasSearched && matches.length === 0 && canKeepOnList
      ? [
          {
            label: medicinesCopy.quick.keepTyped(parsed.name),
            run: keepTyped,
          },
        ]
      : []),
  ];

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) =>
        Math.min(index + 1, matches.length + actions.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (!parsed.name) return;
      const match = matches[highlighted];
      if (match) add(match);
      else actions[highlighted - matches.length]?.run();
    } else if (event.key === 'Escape') {
      // The line, not a dialog the editor sits in.
      event.stopPropagation();
      clear();
    }
  };

  return {
    text,
    setText: (next: string) => {
      setText(next);
      setHighlighted(0);
      if (!next.trim()) setIsEverywhere(false);
    },
    onKeyDown,
    matches,
    actions,
    highlighted,
    typedName: parsed.name,
    pick: (drug: DrugView) => add(drug),
    /** Who may keep a list gets "Add to my list" on what isn't on it yet. */
    canAddToList: (drug: DrugSuggestion) => canKeepOnList && !drug.inMyList,
    addToList: (drug: DrugSuggestion) =>
      putItem({ owner: DrugListOwner.me, drugId: drug.id }),
    isAdding: isAdding || creating.isLoading,
  };
}
