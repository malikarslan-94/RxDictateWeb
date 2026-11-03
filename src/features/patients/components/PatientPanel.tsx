import type { PatientView } from '@/contract';
import { PatientAccessCard } from '@/features/portal';
import { Avatar, IconButton, StatusChip } from '@/ui';

import { patientsCopy } from '../copy';
import { usePatientPanel } from '../hooks/usePatientPanel';
import { AssistantPanelActions } from './AssistantPanelActions';
import { DoctorPanelActions } from './DoctorPanelActions';

const copy = patientsCopy.panel;

export type PatientPanelProps = {
  patient: PatientView;
  onClose: () => void;
};

/** One patient beside the table: details, and what this role can do. */
export function PatientPanel({ patient, onClose }: PatientPanelProps) {
  const panel = usePatientPanel(patient);
  return (
    <aside className="flex w-96 shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <Avatar name={panel.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-section">{panel.name}</h2>
          <p className="text-meta text-ink-secondary">{panel.line}</p>
        </div>
        <IconButton
          icon="close"
          label={copy.close}
          tone="plain"
          onClick={onClose}
        />
      </div>
      {panel.allergy ? (
        <StatusChip
          label={copy.allergy(panel.allergy)}
          tone="overdue"
          icon="alert"
        />
      ) : null}
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-meta text-ink-secondary">{copy.phone}</dt>
          <dd className="text-body font-bold">{panel.phone}</dd>
        </div>
        <div>
          <dt className="text-meta text-ink-secondary">{copy.lastVisit}</dt>
          <dd className="text-body font-bold">{panel.lastVisit}</dd>
        </div>
      </dl>
      {panel.isDoctor ? (
        <DoctorPanelActions panel={panel} />
      ) : (
        <AssistantPanelActions panel={panel} />
      )}
      <PatientAccessCard patientId={patient.id} />
    </aside>
  );
}
