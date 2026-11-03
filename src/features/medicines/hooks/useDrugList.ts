import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { messageFor, toApiError } from '@/lib/api';

import { useListDrugListQuery, useRemoveDrugListItemMutation } from '../api';
import { DRUG_SEARCH_DEBOUNCE_MS, LIST_PAGE_SIZE } from '../constants';
import type { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';
import type { DrugListRow, MedicineDialog } from '../types';
import { toListRow } from '../utils';

const copy = medicinesCopy.lists;

/** One medicine list: search it, page through it, add, correct, take off. */
export function useDrugList(owner: DrugListOwner) {
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<MedicineDialog | null>(null);
  const q = useDebounce(text.trim(), DRUG_SEARCH_DEBOUNCE_MS);
  const list = useListDrugListQuery({
    owner,
    q,
    page,
    limit: LIST_PAGE_SIZE,
  });
  const [removeItem] = useRemoveDrugListItemMutation();

  const rows = (list.data?.items ?? []).map(toListRow);
  const total = list.data?.total ?? 0;
  const start = (page - 1) * LIST_PAGE_SIZE;

  return {
    hint: copy.hint[owner],
    text,
    setText: (next: string) => {
      setText(next);
      setPage(1);
    },
    rows,
    isLoading: list.isLoading,
    error: list.error ? messageFor(toApiError(list.error)) : undefined,
    retry: list.refetch,
    emptyText: q ? copy.noMatch : copy.empty[owner],
    showing:
      total > 0
        ? copy.showing(
            start + 1,
            Math.min(start + LIST_PAGE_SIZE, total),
            total,
          )
        : '',
    canGoBack: page > 1,
    canGoOn: start + LIST_PAGE_SIZE < total,
    previous: () => setPage((current) => current - 1),
    next: () => setPage((current) => current + 1),
    remove: (row: DrugListRow) => {
      removeItem({ owner, drugId: row.id });
      // Taking off the last line of a page shouldn't leave an empty page.
      if (rows.length === 1 && page > 1) setPage(page - 1);
    },
    dialog,
    openAdd: () => setDialog({ kind: 'add' }),
    openOwn: (name: string) => setDialog({ kind: 'own', name }),
    openEdit: (row: DrugListRow) => setDialog({ kind: 'edit', drug: row.drug }),
    closeDialog: () => setDialog(null),
  };
}
