import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { messageFor, toApiError } from '@/lib/api';

import { useListTemplatesQuery } from '../api';
import { TEMPLATE_LIST_LIMIT, TEMPLATE_SEARCH_DEBOUNCE_MS } from '../constants';
import { toTemplateItem } from '../utils';

/** The doctor's templates, most used first, searched by name. */
export function useTemplateList() {
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), TEMPLATE_SEARCH_DEBOUNCE_MS);
  const list = useListTemplatesQuery({
    q: q || undefined,
    limit: TEMPLATE_LIST_LIMIT,
  });

  return {
    text,
    setText,
    isSearching: q !== '',
    items: (list.data?.templates ?? []).map(toTemplateItem),
    total: list.data?.total ?? 0,
    isLoading: list.isLoading,
    error: list.error ? messageFor(toApiError(list.error)) : undefined,
    retry: list.refetch,
  };
}
