import type { HTMLAttributes, ReactNode, TdHTMLAttributes } from 'react';

import { cx } from '@/utils/classes';

/** A card-shaped table: the queue, the patients list, the team. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

export function Th({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cx(
        'px-5 py-4 text-group text-ink-secondary uppercase',
        className,
      )}
    >
      {children}
    </th>
  );
}

export type TrProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
};

/** A row; clickable rows show a hover and a focus ring. */
export function Tr({ selected = false, className, onClick, ...rest }: TrProps) {
  return (
    <tr
      onClick={onClick}
      className={cx(
        'border-b border-border last:border-b-0',
        onClick && 'cursor-pointer hover:bg-primary-tint',
        selected && 'bg-primary-tint',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx('px-5 py-3.5 text-body', className)} {...rest} />;
}
