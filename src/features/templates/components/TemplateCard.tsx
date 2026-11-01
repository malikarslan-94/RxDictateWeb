import { Button, Card, Icon, IconButton } from '@/ui';

import { templatesCopy } from '../copy';
import type { TemplateItem } from '../types';

const copy = templatesCopy.card;

export type TemplateCardProps = {
  item: TemplateItem;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** One template: what's in it, how often it's used, and what to do with it. */
export function TemplateCard({
  item,
  onUse,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <Card padding="medium" className="flex items-start gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
        <Icon name="template" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-section">{item.name}</p>
        <p className="mt-1 text-meta text-ink-secondary">{item.detail}</p>
        {item.medicineLine ? (
          <p className="mt-2 line-clamp-2 text-body">{item.medicineLine}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <IconButton
          icon="pencil"
          label={copy.editLabel(item.name)}
          size="small"
          tone="plain"
          onClick={onEdit}
        />
        <IconButton
          icon="trash"
          label={copy.deleteLabel(item.name)}
          size="small"
          tone="danger"
          onClick={onDelete}
        />
        <Button label={copy.use} size="small" onClick={onUse} />
      </div>
    </Card>
  );
}
