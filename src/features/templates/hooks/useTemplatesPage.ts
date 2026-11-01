import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Routes, templateEditPath } from '@/constants/routes';
import type { TemplateView } from '@/contract';

import { templatesCopy } from '../copy';
import { useTemplateList } from './useTemplateList';

const copy = templatesCopy.page;

/**
 * The Templates page: search, and each template's Use, Edit and Delete.
 * New and Edit open the editor over the page at its own address.
 */
export function useTemplatesPage() {
  const navigate = useNavigate();
  const list = useTemplateList();
  const [using, setUsing] = useState<TemplateView | null>(null);
  const [deleting, setDeleting] = useState<TemplateView | null>(null);

  return {
    ...list,
    meta: list.isLoading || list.isSearching ? '' : copy.meta(list.total),
    emptyText: list.isSearching ? copy.noMatch : copy.empty,
    cards: list.items.map((item) => ({
      ...item,
      use: () => setUsing(item.template),
      edit: () => navigate(templateEditPath(item.id)),
      remove: () => setDeleting(item.template),
    })),
    newTemplate: () => navigate(Routes.templateNew),
    using,
    closeUse: () => setUsing(null),
    deleting,
    closeDelete: () => setDeleting(null),
  };
}
