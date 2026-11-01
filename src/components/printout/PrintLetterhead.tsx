import type { Printout } from '@/types/printout';

/** The doctor on the left, the clinic on the right, under the teal bar. */
export function PrintLetterhead({ printout }: { printout: Printout }) {
  const { doctor, clinic } = printout;
  return (
    <header className="flex justify-between gap-6 border-b-2 border-paper-accent pt-6 pb-3">
      <div>
        <p className="text-print-name text-paper-accent">{doctor.name}</p>
        {doctor.qualifications ? (
          <p className="text-print-strong">{doctor.qualifications}</p>
        ) : null}
        {doctor.speciality ? (
          <p className="text-print-small">{doctor.speciality}</p>
        ) : null}
        {doctor.pmdc ? (
          <p className="text-print-small text-paper-muted">{doctor.pmdc}</p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="text-print-strong">{clinic.name}</p>
        {clinic.address ? (
          <p className="text-print-small text-paper-muted">{clinic.address}</p>
        ) : null}
        {clinic.schedule ? (
          <p className="text-print-small text-paper-muted">{clinic.schedule}</p>
        ) : null}
        {clinic.phone ? (
          <p className="text-print-small text-paper-muted">{clinic.phone}</p>
        ) : null}
      </div>
    </header>
  );
}
