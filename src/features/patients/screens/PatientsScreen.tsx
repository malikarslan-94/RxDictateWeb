import { Outlet } from 'react-router';

import { PageHeader, StateMessage } from '@/components';
import { HotkeyLabel } from '@/constants/keys';
import {
  Button,
  Icon,
  SearchInput,
  Segmented,
  Table,
  TableHead,
  Th,
} from '@/ui';

import { AddPatientDialog } from '../components/AddPatientDialog';
import { PatientPanel } from '../components/PatientPanel';
import { PatientRow } from '../components/PatientRow';
import { patientsCopy } from '../copy';
import { usePatientsPage } from '../hooks/usePatientsPage';

const copy = patientsCopy.list;

/**
 * Every patient: search, filter, page through, and open one beside the
 * table. Dialogs from other features open over it at their own address.
 */
export function PatientsScreen() {
  const page = usePatientsPage();

  return (
    <div className="flex min-h-screen">
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-8 py-8">
        <PageHeader
          icon="users"
          meta={page.meta}
          title={copy.title}
          actions={
            <Button
              label={copy.addPatient}
              variant="secondary"
              icon={<Icon name="plus" className="size-4" />}
              onClick={page.openAdd}
            />
          }
        />
        <div className="flex flex-wrap items-center gap-4">
          <SearchInput
            ref={page.searchRef}
            value={page.text}
            onChange={(event) => page.setText(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            shortcut={HotkeyLabel.focusSearch}
            containerClassName="w-80"
          />
          <Segmented
            label={copy.filterLabel}
            options={page.filters}
            value={page.filter}
            onChange={page.setFilter}
          />
        </div>

        {page.rows.length > 0 ? (
          <Table>
            <TableHead>
              <Th>{copy.columns.patient}</Th>
              <Th>{copy.columns.diagnosis}</Th>
              <Th>{copy.columns.phone}</Th>
              <Th>{copy.columns.lastVisit}</Th>
            </TableHead>
            <tbody>
              {page.rows.map((row) => (
                <PatientRow
                  key={row.id}
                  row={row}
                  selected={page.selected?.id === row.id}
                  onSelect={() => page.select(row.patient)}
                />
              ))}
            </tbody>
          </Table>
        ) : (
          <StateMessage
            isLoading={page.isLoading}
            error={page.error}
            onRetry={page.retry}
            empty={page.emptyText}
          />
        )}

        {page.showing ? (
          <div className="flex items-center justify-between">
            <p className="text-meta text-ink-secondary">{page.showing}</p>
            <div className="flex gap-2">
              <Button
                label={copy.previous}
                variant="secondary"
                size="small"
                icon={<Icon name="chevronLeft" className="size-4" />}
                disabled={!page.canGoBack}
                onClick={page.previous}
              />
              <Button
                label={copy.next}
                variant="secondary"
                size="small"
                disabled={!page.canGoOn}
                onClick={page.next}
              />
            </div>
          </div>
        ) : null}
      </div>

      {page.selected ? (
        <PatientPanel
          key={page.selected.id}
          patient={page.selected}
          onClose={page.closePanel}
        />
      ) : null}
      {page.isAdding ? <AddPatientDialog onClose={page.closeAdd} /> : null}
      {/* A patient's history, reports or booking, opened over this page. */}
      <Outlet />
    </div>
  );
}
