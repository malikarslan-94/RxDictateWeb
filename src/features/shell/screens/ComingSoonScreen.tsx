import { commonCopy } from '@/constants/copy';
import { Button, Card, Icon } from '@/ui';

import { useComingSoon } from '../hooks/useComingSoon';

const copy = commonCopy.comingSoon;

/** Where a menu item that isn't built yet leads. */
export function ComingSoonScreen() {
  const page = useComingSoon();
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <Card className="flex max-w-readable flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
          <Icon name="clock" className="size-6" />
        </span>
        <p className="text-group text-ink-secondary uppercase">{copy.title}</p>
        <h1 className="text-title">{copy.heading}</h1>
        <p className="text-body text-ink-secondary">{page.body}</p>
        <Button
          label={page.backLabel}
          variant="secondary"
          onClick={page.back}
        />
      </Card>
    </div>
  );
}
