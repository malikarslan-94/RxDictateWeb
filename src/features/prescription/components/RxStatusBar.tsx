import { HotkeyLabel } from '@/constants/keys';
import { Button, Icon, Kbd, StatusChip } from '@/ui';

export type RxStatusBarProps = {
  isDraft: boolean;
  /** "Draft" or "RX-2026-000418 · approved 21 Oct". */
  status: string;
  /** "Saved 4 s ago · 4 parts dictated, 1 typed". */
  detail: string;
  canPreview: boolean;
  onPreview: () => void;
  previewLabel: string;
  approveLabel: string;
  canApprove: boolean;
  onApprove: () => void;
  /** On an approved prescription: Revise, or open the open revision. */
  reviseLabel?: string;
  onRevise?: () => void;
};

/** Where the prescription stands, and what to do with it next. */
export function RxStatusBar({
  isDraft,
  status,
  detail,
  canPreview,
  onPreview,
  previewLabel,
  approveLabel,
  canApprove,
  onApprove,
  reviseLabel,
  onRevise,
}: RxStatusBarProps) {
  return (
    <div className="flex items-center gap-3">
      <StatusChip label={status} tone={isDraft ? 'active' : 'ready'} />
      <p className="min-w-0 flex-1 truncate text-meta text-ink-secondary">
        {detail}
      </p>
      <Button
        label={previewLabel}
        variant="secondary"
        size="medium"
        icon={<Icon name="printer" className="size-4" />}
        disabled={!canPreview}
        onClick={onPreview}
      />
      {isDraft ? (
        <>
          <Button
            label={approveLabel}
            size="medium"
            icon={<Icon name="check" className="size-4" />}
            disabled={!canApprove}
            onClick={onApprove}
          />
          <Kbd keys={HotkeyLabel.approve} />
        </>
      ) : onRevise && reviseLabel ? (
        <Button
          label={reviseLabel}
          size="medium"
          variant="tonal"
          icon={<Icon name="pencil" className="size-4" />}
          onClick={onRevise}
        />
      ) : null}
    </div>
  );
}
