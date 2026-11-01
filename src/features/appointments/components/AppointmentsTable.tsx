import {
  Avatar,
  StatusChip,
  Table,
  TableHead,
  Td,
  TextLink,
  Th,
  Tr,
} from '@/ui';

import { appointmentsCopy } from '../copy';
import type { useSchedule } from '../hooks/useSchedule';

const copy = appointmentsCopy.schedule;

type Row = ReturnType<typeof useSchedule>['appointments'][number];

/** The chosen day's appointments, earliest first. */
export function AppointmentsTable({ rows }: { rows: Row[] }) {
  return (
    <Table>
      <TableHead>
        <Th className="w-28">{copy.columns.time}</Th>
        <Th>{copy.columns.patient}</Th>
        <Th>{copy.columns.kind}</Th>
        <Th>{copy.columns.note}</Th>
        <Th />
      </TableHead>
      <tbody>
        {rows.map((row) => (
          <Tr key={row.id}>
            <Td className="font-bold">{row.time}</Td>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={row.name} />
                <div>
                  <p className="font-bold">{row.name}</p>
                  <p className="text-meta text-ink-secondary">{row.details}</p>
                </div>
              </div>
            </Td>
            <Td>{row.kind}</Td>
            <Td className="text-ink-secondary">{row.note}</Td>
            <Td className="text-right">
              {row.hasArrived ? (
                <StatusChip label={copy.arrived} tone="ready" icon="check" />
              ) : (
                <TextLink
                  label={copy.cancel}
                  tone="danger"
                  aria-label={row.cancelLabel}
                  onClick={row.askCancel}
                />
              )}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
