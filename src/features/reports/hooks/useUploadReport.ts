import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';

import { reportTypeSchema } from '@/contract';
import type { ReportView } from '@/contract';
import { useGetPatientQuery } from '@/features/patients';
import { useListTodayVisitsQuery } from '@/features/visits';
import { useNow } from '@/hooks/useNow';
import { messageFor, toApiError } from '@/lib/api';
import { putFile } from '@/lib/files';
import { registerSignOutTask } from '@/lib/session';
import { toDateString } from '@/utils/date';

import { useCreateReportMutation, useCreateUploadMutation } from '../api';
import {
  BYTES_PER_MB,
  MAX_PAGE_BYTES,
  MAX_PAGES,
  ReportContentType,
  TODAY_TICK_MS,
} from '../constants';
import { reportsCopy } from '../copy';
import { uploadReportSchema } from '../schemas';
import type { UploadReportInput } from '../schemas';
import type { PickedPage } from '../types';
import { pageProblem, toContentType } from '../utils';
import { usePickPages } from './usePickPages';

const copy = reportsCopy.upload;
const errors = reportsCopy.errors;

const forget = (page: PickedPage) => {
  if (page.previewUrl) URL.revokeObjectURL(page.previewUrl);
};

export type UseUploadReportOptions = {
  /** Opened for one patient: theirs, and not changed. */
  patientId?: string;
  /** A dialog closes; the page stays for the next report. */
  onUploaded?: (report: ReportView) => void;
};

/**
 * Upload a report for a patient: what it is, when the test was done, and its
 * pages. Each page goes straight to storage, one at a time, then the report
 * is made from their keys. Pages live in memory only; closing the form or
 * signing out stops an upload under way.
 */
export function useUploadReport({
  patientId,
  onUploaded,
}: UseUploadReportOptions) {
  const today = toDateString(useNow(TODAY_TICK_MS));
  const visits = useListTodayVisitsQuery();
  const [createUpload] = useCreateUploadMutation();
  const [createReport] = useCreateReportMutation();
  const [sending, setSending] = useState<{ page: number; total: number }>();
  const [refusals, setRefusals] = useState<string[]>([]);
  const [uploadedFor, setUploadedFor] = useState<string | null>(null);
  const upload = useRef<AbortController | null>(null);

  const blank = (): UploadReportInput => ({
    patientId: patientId ?? '',
    type: null,
    testName: '',
    testDate: today,
    pages: [],
  });
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState,
    reset,
  } = useForm({
    resolver: zodResolver(uploadReportSchema),
    defaultValues: blank(),
  });
  const pages = useWatch({ control, name: 'pages' });
  const chosenId = useWatch({ control, name: 'patientId' });
  const patient = useGetPatientQuery(chosenId || skipToken);

  useEffect(
    () => () => {
      upload.current?.abort();
      getValues('pages').forEach(forget);
    },
    [getValues],
  );
  useEffect(() => registerSignOutTask(() => upload.current?.abort()), []);

  const setPages = (next: PickedPage[]) =>
    setValue('pages', next, { shouldValidate: formState.isSubmitted });

  /** Keep what can be sent; say why anything else can't. */
  const addFiles = (files: File[]) => {
    if (sending) return;
    const kept = getValues('pages');
    const added: PickedPage[] = [];
    const refused: string[] = [];
    files.forEach((file) => {
      const contentType = toContentType(file);
      const problem = pageProblem(file, kept.length + added.length);
      if (problem !== null || contentType === null) {
        refused.push(errors.refused(file.name, problem ?? errors.wrongType));
        return;
      }
      added.push({
        id: crypto.randomUUID(),
        file,
        contentType,
        previewUrl:
          contentType === ReportContentType['application/pdf']
            ? null
            : URL.createObjectURL(file),
      });
    });
    setRefusals(refused);
    setUploadedFor(null);
    setPages([...kept, ...added]);
  };

  const picker = usePickPages(addFiles);

  const submit = handleSubmit(async (report) => {
    const controller = new AbortController();
    upload.current = controller;
    setUploadedFor(null);
    try {
      const pageKeys: string[] = [];
      // One at a time: the progress line, and a slow line copes better.
      for (const [index, page] of report.pages.entries()) {
        setSending({ page: index + 1, total: report.pages.length });
        const ticket = await createUpload({
          contentType: page.contentType,
          size: page.file.size,
        }).unwrap();
        await putFile(
          ticket.uploadUrl,
          page.file,
          page.contentType,
          controller.signal,
        );
        pageKeys.push(ticket.fileKey);
      }
      // A report brought in today belongs to today's visit.
      const visit = visits.data?.find(
        (item) => item.patientId === report.patientId,
      );
      const created = await createReport({
        patientId: report.patientId,
        body: {
          type: report.type,
          testName: report.testName,
          testDate: report.testDate,
          pageKeys,
          visitId: visit?.id ?? null,
        },
      }).unwrap();
      report.pages.forEach(forget);
      setRefusals([]);
      setUploadedFor(patient.data?.name ?? '');
      reset(blank());
      onUploaded?.(created);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError('root', { message: messageFor(toApiError(error)) });
      }
    } finally {
      setSending(undefined);
      upload.current = null;
    }
  });

  return {
    control,
    canChoosePatient: !patientId,
    latestTestDate: today,
    typeOptions: reportTypeSchema.options.map((value) => ({
      label: reportsCopy.types[value],
      value,
    })),
    pages: pages.map((page, index) => ({
      key: page.id,
      name: page.file.name,
      previewUrl: page.previewUrl,
      label: copy.pageLabel(index + 1),
      removeLabel: copy.removePage(index + 1),
      remove: () => {
        forget(page);
        setPages(getValues('pages').filter((item) => item.id !== page.id));
      },
    })),
    canAddPages: pages.length < MAX_PAGES,
    pagesHint: copy.pagesHint(MAX_PAGES, MAX_PAGE_BYTES / BYTES_PER_MB),
    pagesError: formState.errors.pages?.message,
    refusals,
    picker,
    submit,
    isSending: sending !== undefined,
    submitLabel: sending
      ? copy.sending(sending.page, sending.total)
      : copy.submit,
    formError: formState.errors.root?.message,
    /** After a page-level upload: who it was for, until the next one starts. */
    uploadedNote: uploadedFor !== null ? copy.uploaded(uploadedFor) : null,
  };
}

export type UploadReport = ReturnType<typeof useUploadReport>;
