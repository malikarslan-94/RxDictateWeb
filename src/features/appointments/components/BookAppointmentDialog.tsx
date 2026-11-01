import {
  FormDateInput,
  FormInput,
  FormSegmented,
  FormTimeInput,
} from '@/components';
import { FormPatientField } from '@/features/patients';
import { Banner, Button, Dialog } from '@/ui';

import { appointmentsCopy } from '../copy';
import { useBookAppointment } from '../hooks/useBookAppointment';
import type { BookingPreset } from '../types';

const copy = appointmentsCopy.book;

export type BookAppointmentDialogProps = {
  /** A follow-up, a patient or a day to start from. */
  preset?: BookingPreset;
  /** Called on cancel and once it's booked. */
  onClose: () => void;
};

/** Who, what for, and when. */
export function BookAppointmentDialog({
  preset = {},
  onClose,
}: BookAppointmentDialogProps) {
  const book = useBookAppointment(preset, onClose);

  return (
    <Dialog
      title={copy.title}
      description={book.followUpNote}
      onClose={onClose}
      actions={
        <>
          <Button
            label={copy.cancel}
            variant="secondary"
            disabled={book.isSaving}
            onClick={onClose}
          />
          <Button
            label={copy.submit}
            loading={book.isSaving}
            onClick={book.submit}
          />
        </>
      }
    >
      <form onSubmit={book.submit} noValidate className="flex flex-col gap-5">
        <FormPatientField
          control={book.control}
          name="patientId"
          label={copy.patient}
          locked={book.isPatientLocked}
        />
        <FormSegmented
          control={book.control}
          name="kind"
          label={copy.kind}
          options={book.kindOptions}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormDateInput
            control={book.control}
            name="date"
            label={copy.date}
            min={book.earliestDate}
          />
          <FormTimeInput
            control={book.control}
            name="time"
            label={copy.time}
            placeholder={copy.timePlaceholder}
          />
        </div>
        <FormInput
          control={book.control}
          name="note"
          label={copy.note}
          placeholder={copy.notePlaceholder}
        />
        {book.formError ? (
          <Banner tone="danger">{book.formError}</Banner>
        ) : null}
      </form>
    </Dialog>
  );
}
