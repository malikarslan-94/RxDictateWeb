import { PageHeader, StateMessage } from '@/components';
import {
  Avatar,
  Button,
  Icon,
  SearchInput,
  Segmented,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/ui';

import { RxStatusChip } from '../components/RxStatusChip';
import { rxCopy } from '../copy';
import { usePrescriptionLog } from '../hooks/usePrescriptionLog';

const copy = rxCopy.log;

/** The doctor's History log: every prescription here, newest first. */
export function PrescriptionLogScreen() {
  const log = usePrescriptionLog();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="history" meta={log.meta} title={copy.title} />
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={log.text}
          onChange={(event) => log.setText(event.target.value)}
          placeholder={copy.searchPlaceholder}
          aria-label={copy.searchPlaceholder}
          containerClassName="w-96"
        />
        <Segmented
          label={copy.filterLabel}
          options={log.filters}
          value={log.filter}
          onChange={log.setFilter}
        />
      </div>

      {log.rows.length > 0 ? (
        <Table>
          <TableHead>
            <Th>{copy.columns.patient}</Th>
            <Th>{copy.columns.prescription}</Th>
            <Th>{copy.columns.status}</Th>
            <Th>{copy.columns.date}</Th>
          </TableHead>
          <tbody>
            {log.rows.map((row) => (
              <Tr key={row.id} onClick={row.open}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={row.patientName} />
                    <div className="min-w-0">
                      <p className="font-bold">{row.patientName}</p>
                      <p className="text-meta text-ink-secondary">
                        {row.patientLine}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <p className="font-bold">{row.title}</p>
                  <p className="line-clamp-1 text-meta text-ink-secondary">
                    {row.summary}
                  </p>
                </Td>
                <Td>
                  <RxStatusChip status={row.status} label={row.statusLabel} />
                </Td>
                <Td className="text-meta whitespace-nowrap text-ink-secondary">
                  {row.date}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <StateMessage
          isLoading={log.isLoading}
          error={log.error}
          onRetry={log.retry}
          empty={log.emptyText}
        />
      )}

      {log.showing ? (
        <div className="flex items-center justify-between">
          <p className="text-meta text-ink-secondary">{log.showing}</p>
          <div className="flex gap-2">
            <Button
              label={copy.previous}
              variant="secondary"
              size="small"
              icon={<Icon name="chevronLeft" className="size-4" />}
              disabled={!log.canGoBack}
              onClick={log.previous}
            />
            <Button
              label={copy.next}
              variant="secondary"
              size="small"
              disabled={!log.canGoOn}
              onClick={log.next}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
