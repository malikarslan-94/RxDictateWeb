import { PageHeader } from '@/components';
import { Banner, Button, Card } from '@/ui';

import { UploadReportFields } from '../components/UploadReportFields';
import { reportsCopy } from '../copy';
import { useUploadReport } from '../hooks/useUploadReport';

const copy = reportsCopy.upload;

/**
 * Upload reports, one after another: the assistant's page for what patients
 * bring in. Each upload clears the form for the next.
 */
export function UploadReportScreen() {
  const upload = useUploadReport({});

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="upload" meta={copy.pageMeta} title={copy.title} />
      <Card className="flex max-w-readable flex-col gap-5">
        {upload.uploadedNote ? (
          <Banner tone="success" icon="check">
            {upload.uploadedNote}
          </Banner>
        ) : null}
        <UploadReportFields upload={upload} />
        <Button
          label={upload.submitLabel}
          loading={upload.isSending}
          onClick={upload.submit}
          className="self-end"
        />
      </Card>
    </div>
  );
}
