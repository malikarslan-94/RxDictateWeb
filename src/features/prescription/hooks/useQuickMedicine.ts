import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import type { DrugView } from '@/contract';
import { useDebounce } from '@/hooks/useDebounce';

import { useSearchDrugsQuery } from '../api';
import {
  DEFAULT_DURATION_DAYS,
  DEFAULT_PATTERN,
  DRUG_SEARCH_DEBOUNCE_MS,
  DRUG_SEARCH_MIN_LENGTH,
  QUICK_SUGGESTIONS,
} from '../constants';
import { parseQuickMedicine } from '../utils';
import type { RxEditor } from './useRxEditor';

/** Drugs whose strength starts with what was typed come first. */
function rank(drugs: DrugView[], strength: string): DrugView[] {
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
 * The name searches the drug list; arrows pick a match, Esc clears.
 */
export function useQuickMedicine(editor: RxEditor) {
  const [text, setText] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const parsed = parseQuickMedicine(text);
  const query = useDebounce(parsed.name, DRUG_SEARCH_DEBOUNCE_MS);
  const { data: drugs = [] } = useSearchDrugsQuery(
    query.length >= DRUG_SEARCH_MIN_LENGTH ? query : skipToken,
  );
  const matches =
    parsed.name.length >= DRUG_SEARCH_MIN_LENGTH
      ? rank(drugs, parsed.strength).slice(0, QUICK_SUGGESTIONS)
      : [];

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
    if (isOk) {
      setText('');
      setHighlighted(0);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, matches.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // The last row is "Add as typed", after the matches.
      add(matches[highlighted] ?? null);
    } else if (event.key === 'Escape') {
      // The line, not a dialog the editor sits in.
      event.stopPropagation();
      setText('');
      setHighlighted(0);
    }
  };

  return {
    text,
    setText: (next: string) => {
      setText(next);
      setHighlighted(0);
    },
    onKeyDown,
    matches,
    highlighted,
    typedName: parsed.name,
    pick: (drug: DrugView | null) => add(drug),
    isAdding,
  };
}
