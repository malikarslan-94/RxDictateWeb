import { Button, Icon, TextLink } from '@/ui';

import { patientsCopy } from '../copy';
import type { PatientPanelState } from '../hooks/usePatientPanel';

const copy = patientsCopy.panel;

/** The doctor's part of the panel: a new prescription and earlier ones. */
export function DoctorPanelActions({ panel }: { panel: PatientPanelState }) {
  return (
    <>
      <Button
        label={copy.newPrescription}
        fullWidth
        icon={<Icon name="mic" className="size-4" />}
        onClick={panel.newPrescription}
      />
      <Button
        label={copy.reports}
        variant="secondary"
        fullWidth
        icon={<Icon name="flask" className="size-4" />}
        onClick={panel.openReports}
      />
      <h3 className="text-section">{panel.prescriptionsTitle}</h3>
      {panel.items.length === 0 && !panel.isLoading ? (
        <p className="text-body text-ink-secondary">{copy.noPrescriptions}</p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {panel.items.map((item) => (
          <li key={item.id} className="rounded-card border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-body font-bold">{item.date}</p>
              <TextLink
                label={copy.open}
                underline
                onClick={() => panel.open(item.href)}
              />
            </div>
            <p className="mt-1 text-body text-ink-secondary">{item.summary}</p>
            <p className="mt-1 text-meta text-ink-secondary">{item.line}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={panel.openTimeline}
        className="flex items-center justify-between rounded-card border border-border px-4 py-3 text-left text-body font-bold transition-colors hover:border-primary hover:text-primary-strong"
      >
        <span className="flex items-center gap-3">
          <Icon name="history" className="size-4" />
          {copy.fullHistory}
        </span>
        <Icon name="chevronRight" className="size-4 text-ink-secondary" />
      </button>
    </>
  );
}
