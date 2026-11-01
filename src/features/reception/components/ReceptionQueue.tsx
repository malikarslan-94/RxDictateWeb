import { VisitVitals } from '@/features/vitals';
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  StatusChip,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/ui';
import { cx } from '@/utils/classes';

import { ReceptionStage } from '../constants';
import { receptionCopy } from '../copy';
import type { useReception } from '../hooks/useReception';

const copy = receptionCopy.queue;

type Row = ReturnType<typeof useReception>['rows'][number];

function StageChip({ row }: { row: Row }) {
  if (row.stage === ReceptionStage.ready) {
    return <StatusChip label={row.status} tone="active" icon="printer" solid />;
  }
  if (row.stage === ReceptionStage.printed) {
    return <StatusChip label={row.status} tone="ready" icon="check" />;
  }
  if (row.stage === ReceptionStage.with_doctor) {
    return <StatusChip label={row.status} tone="active" />;
  }
  return <StatusChip label={row.status} tone="waiting" icon="clock" />;
}

/**
 * Today's queue at reception: who's waiting, who's in, what to print. A
 * waiting row is dragged by its handle to change
 * who goes in next; its token stays.
 */
export function ReceptionQueue({ rows }: { rows: Row[] }) {
  return (
    <Table>
      <TableHead>
        <Th className="w-24">{copy.columns.token}</Th>
        <Th>{copy.columns.patient}</Th>
        <Th>{copy.columns.vitals}</Th>
        <Th>{copy.columns.status}</Th>
        <Th />
      </TableHead>
      <tbody>
        {rows.map((row) => (
          <Tr
            key={row.id}
            {...row.move?.drag}
            className={cx(
              row.move?.isDragging && 'opacity-50',
              row.move?.dropEdge === 'above' && 'drop-above',
              row.move?.dropEdge === 'below' && 'drop-below',
            )}
          >
            <Td>
              <div className="flex items-center gap-2">
                {row.move ? (
                  <span className="cursor-grab text-ink-secondary active:cursor-grabbing">
                    <Icon
                      name="grip"
                      label={copy.dragHandle}
                      className="size-4"
                    />
                  </span>
                ) : (
                  <span className="size-4" />
                )}
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-body font-bold text-primary-strong">
                  {row.token}
                </span>
              </div>
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
            <Td>
              {row.canTakeVitals ? (
                <VisitVitals
                  visitId={row.id}
                  recordedAt={row.vitalsRecordedAt}
                />
              ) : (
                <span className="text-ink-secondary">{copy.none}</span>
              )}
            </Td>
            <Td>
              <StageChip row={row} />
            </Td>
            <Td className="text-right">
              <div className="flex items-center justify-end gap-2">
                {row.print ? (
                  <Button
                    label={copy.print}
                    size="small"
                    icon={<Icon name="printer" className="size-4" />}
                    onClick={row.print}
                  />
                ) : row.reprint ? (
                  <Button
                    label={copy.reprint}
                    variant="text"
                    size="small"
                    onClick={row.reprint}
                  />
                ) : null}
                <IconButton
                  icon="upload"
                  label={row.uploadLabel}
                  size="small"
                  tone="plain"
                  onClick={row.upload}
                />
                <IconButton
                  icon="calendar"
                  label={row.bookLabel}
                  size="small"
                  tone="plain"
                  onClick={row.book}
                />
              </div>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
