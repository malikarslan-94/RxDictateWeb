import {
  Avatar,
  Button,
  Icon,
  StatusChip,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/ui';
import { cx } from '@/utils/classes';

import { todayCopy } from '../copy';
import type { TodayRow } from '../types';

const copy = todayCopy.list;

/** Today's list: token, patient, when added, where they stand, and the next step. */
export function TodayTable({ rows }: { rows: TodayRow[] }) {
  return (
    <Table>
      <TableHead>
        <Th className="w-16">{copy.columns.token}</Th>
        <Th>{copy.columns.patient}</Th>
        <Th>{copy.columns.added}</Th>
        <Th>{copy.columns.status}</Th>
        <Th />
      </TableHead>
      <tbody>
        {rows.map((row) => (
          <Tr key={row.id} selected={row.isCurrent}>
            <Td>
              <span
                className={cx(
                  'flex size-10 items-center justify-center rounded-full text-body font-bold',
                  row.isCurrent
                    ? 'bg-primary text-ink-on-primary'
                    : 'bg-primary-tint text-primary-strong',
                )}
              >
                {row.token}
              </span>
            </Td>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={row.name} />
                <div>
                  <p className="font-bold">{row.name}</p>
                  <p className="text-meta text-ink-secondary">{row.details}</p>
                </div>
              </div>
            </Td>
            <Td className="text-ink-secondary">{row.added}</Td>
            <Td>
              <StatusChip
                label={row.status.label}
                tone={row.status.tone}
                icon={row.status.icon}
              />
            </Td>
            <Td className="text-right">
              {row.action.kind === 'view' ? (
                <Button
                  label={row.action.label}
                  variant="text"
                  size="small"
                  onClick={row.action.open}
                />
              ) : row.action.kind === 'continue' ? (
                <Button
                  label={row.action.label}
                  size="small"
                  onClick={row.action.open}
                />
              ) : (
                <Button
                  label={row.action.label}
                  variant="tonal"
                  size="small"
                  icon={<Icon name="mic" className="size-4" />}
                  onClick={row.action.open}
                />
              )}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
