import { HotkeyLabel } from '@/constants/keys';
import { Avatar, Button, Card, Icon, Kbd } from '@/ui';

import { todayCopy } from '../copy';

const copy = todayCopy.next;

export type NextWaitingCardProps = {
  next: { name: string; line: string; start: () => void } | null;
};

/** Who's next, and the button that starts their prescription. */
export function NextWaitingCard({ next }: NextWaitingCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-group text-ink-secondary uppercase">{copy.title}</p>
      {next ? (
        <>
          <div className="flex items-start gap-3">
            <Avatar name={next.name} size="lg" />
            <div>
              <p className="text-section">{next.name}</p>
              <p className="text-meta text-ink-secondary">{next.line}</p>
            </div>
          </div>
          <Button
            label={copy.start}
            fullWidth
            icon={<Icon name="mic" className="size-4" />}
            onClick={next.start}
          />
          <p className="flex items-center justify-center gap-2 text-meta text-ink-secondary">
            {copy.dictateAnyTime} <Kbd keys={HotkeyLabel.dictate} />
          </p>
        </>
      ) : (
        <p className="text-body text-ink-secondary">{copy.noOne}</p>
      )}
    </Card>
  );
}
