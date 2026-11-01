import { Banner, Button, Icon, StatusChip } from '@/ui';

import { patientsCopy } from '../copy';
import type { PatientPanelState } from '../hooks/usePatientPanel';

const copy = patientsCopy.panel;

/**
 * The assistant's part of the panel: today's list, reports and booking.
 * Nothing here starts, approves or dictates a prescription.
 */
export function AssistantPanelActions({ panel }: { panel: PatientPanelState }) {
  return (
    <>
      {panel.queueNote ? (
        <StatusChip label={panel.queueNote} tone="active" icon="check" />
      ) : null}
      {panel.addToList ? (
        <Button
          label={copy.addToList}
          fullWidth
          icon={<Icon name="plus" className="size-4" />}
          loading={panel.isAdding}
          onClick={panel.addToList}
        />
      ) : null}
      <Button
        label={copy.uploadReport}
        variant="secondary"
        fullWidth
        icon={<Icon name="upload" className="size-4" />}
        onClick={panel.uploadReport}
      />
      <Button
        label={copy.bookAppointment}
        variant="secondary"
        fullWidth
        icon={<Icon name="calendar" className="size-4" />}
        onClick={panel.bookAppointment}
      />
      <Button
        label={copy.reports}
        variant="secondary"
        fullWidth
        icon={<Icon name="flask" className="size-4" />}
        onClick={panel.openReports}
      />
      {panel.error ? <Banner tone="danger">{panel.error}</Banner> : null}
    </>
  );
}
