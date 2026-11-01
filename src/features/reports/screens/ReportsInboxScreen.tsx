import { PageHeader, StateMessage } from '@/components';
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Table,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/ui';

import { NewestReport } from '../components/NewestReport';
import { PatientReportsDialog } from '../components/PatientReportsDialog';
import { reportsCopy } from '../copy';
import { useReportsInbox } from '../hooks/useReportsInbox';

const copy = reportsCopy.inbox;

/**
 * The doctor's "Reports and labs": patients whose reports are waiting to be
 * seen. A row opens that patient's reports; opening one marks it seen.
 */
export function ReportsInboxScreen() {
  const inbox = useReportsInbox();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="flask" meta={inbox.meta} title={copy.title} />
      <p className="text-body text-ink-secondary">{copy.note}</p>

      {inbox.rows.length > 0 ? (
        <Table>
          <TableHead>
            <Th>{copy.columns.patient}</Th>
            <Th>{copy.columns.newest}</Th>
            <Th />
          </TableHead>
          <tbody>
            {inbox.rows.map((row) => (
              <Tr key={row.id} onClick={row.open}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={row.name} />
                    <div>
                      <p className="font-bold">{row.name}</p>
                      <p className="text-meta text-ink-secondary">
                        {row.details}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <NewestReport patientId={row.id} />
                </Td>
                <Td className="w-16 text-right">
                  <IconButton
                    icon="chevronRight"
                    label={row.openLabel}
                    size="small"
                    tone="plain"
                    onClick={(event) => {
                      event.stopPropagation();
                      row.open();
                    }}
                  />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <StateMessage
          isLoading={inbox.isLoading}
          error={inbox.error}
          onRetry={inbox.retry}
          empty={copy.empty}
        />
      )}

      {inbox.showing ? (
        <div className="flex items-center justify-between">
          <p className="text-meta text-ink-secondary">{inbox.showing}</p>
          <div className="flex gap-2">
            <Button
              label={copy.previous}
              variant="secondary"
              size="small"
              icon={<Icon name="chevronLeft" className="size-4" />}
              disabled={!inbox.canGoBack}
              onClick={inbox.previous}
            />
            <Button
              label={copy.next}
              variant="secondary"
              size="small"
              disabled={!inbox.canGoOn}
              onClick={inbox.next}
            />
          </div>
        </div>
      ) : null}

      {inbox.chosenId ? (
        <PatientReportsDialog
          patientId={inbox.chosenId}
          onClose={inbox.closeReports}
        />
      ) : null}
    </div>
  );
}
