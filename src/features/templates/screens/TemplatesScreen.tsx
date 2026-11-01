import { Outlet } from 'react-router';

import { PageHeader, StateMessage } from '@/components';
import { Button, Icon, SearchInput } from '@/ui';

import { DeleteTemplateDialog } from '../components/DeleteTemplateDialog';
import { TemplateCard } from '../components/TemplateCard';
import { UseTemplateDialog } from '../components/UseTemplateDialog';
import { templatesCopy } from '../copy';
import { useTemplatesPage } from '../hooks/useTemplatesPage';

const copy = templatesCopy.page;

/**
 * The doctor's Rx templates: search, use one for a patient, make, change or
 * delete one. The editor opens over this page at its own address.
 */
export function TemplatesScreen() {
  const page = useTemplatesPage();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader
        icon="template"
        meta={page.meta}
        title={copy.title}
        actions={
          <Button
            label={copy.new}
            icon={<Icon name="plus" className="size-4" />}
            onClick={page.newTemplate}
          />
        }
      />
      <SearchInput
        value={page.text}
        onChange={(event) => page.setText(event.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchPlaceholder}
        containerClassName="w-80"
      />
      {page.cards.length > 0 ? (
        <ul className="flex max-w-readable flex-col gap-3 xl:max-w-none">
          {page.cards.map((card) => (
            <li key={card.id}>
              <TemplateCard
                item={card}
                onUse={card.use}
                onEdit={card.edit}
                onDelete={card.remove}
              />
            </li>
          ))}
        </ul>
      ) : (
        <StateMessage
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.retry}
          empty={page.emptyText}
        />
      )}
      {page.using ? (
        <UseTemplateDialog template={page.using} onClose={page.closeUse} />
      ) : null}
      {page.deleting ? (
        <DeleteTemplateDialog
          template={page.deleting}
          onClose={page.closeDelete}
        />
      ) : null}
      {/* New and Edit: the editor, over this page. */}
      <Outlet />
    </div>
  );
}
