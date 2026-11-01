import { StateMessage } from '@/components';
import { Dialog, Icon } from '@/ui';

import { reportsCopy } from '../copy';
import { useReport } from '../hooks/useReport';

const copy = reportsCopy.viewer;

export type ReportDialogProps = {
  reportId: string;
  onClose: () => void;
};

/** One report: photos one under another, a PDF opened in a new tab. */
export function ReportDialog({ reportId, onClose }: ReportDialogProps) {
  const report = useReport(reportId);

  return (
    <Dialog
      title={report.title}
      description={report.line}
      width="large"
      onClose={onClose}
    >
      {report.pages.length === 0 ? (
        <StateMessage
          isLoading={report.isLoading}
          error={report.error}
          onRetry={report.retry}
        />
      ) : (
        <ol className="flex flex-col gap-6">
          {report.pages.map((page) => (
            <li key={page.key} className="flex flex-col gap-2">
              <p className="text-group text-ink-secondary uppercase">
                {page.label}
              </p>
              {page.isPdf ? (
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-card border border-border p-4 transition-colors hover:border-primary"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
                    <Icon name="file" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-bold">
                      {copy.openPdf}
                    </span>
                    <span className="block text-meta text-ink-secondary">
                      {copy.pdfNote}
                    </span>
                  </span>
                  <Icon
                    name="arrowUpRight"
                    className="size-4 text-ink-secondary"
                  />
                </a>
              ) : (
                <img
                  src={page.url}
                  alt={page.label}
                  onError={report.pageFailed}
                  className="w-full rounded-card border border-border bg-surface"
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </Dialog>
  );
}
