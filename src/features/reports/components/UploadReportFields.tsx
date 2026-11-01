import { FormChoiceChips, FormDateInput, FormInput } from '@/components';
import { FormPatientField } from '@/features/patients';
import { Banner } from '@/ui';

import { reportsCopy } from '../copy';
import type { UploadReport } from '../hooks/useUploadReport';
import { PagePicker } from './PagePicker';

const copy = reportsCopy.upload;

/** What a report is, whose, when the test was done, and its pages. */
export function UploadReportFields({ upload }: { upload: UploadReport }) {
  return (
    <form onSubmit={upload.submit} noValidate className="flex flex-col gap-5">
      <FormPatientField
        control={upload.control}
        name="patientId"
        label={copy.patient}
        locked={!upload.canChoosePatient}
      />
      <FormChoiceChips
        control={upload.control}
        name="type"
        label={copy.type}
        options={upload.typeOptions}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={upload.control}
          name="testName"
          label={copy.testName}
          placeholder={copy.testNamePlaceholder}
        />
        <FormDateInput
          control={upload.control}
          name="testDate"
          label={copy.testDate}
          hint={copy.testDateHint}
          max={upload.latestTestDate}
        />
      </div>
      <PagePicker upload={upload} />
      {upload.formError ? (
        <Banner tone="danger">{upload.formError}</Banner>
      ) : null}
    </form>
  );
}
