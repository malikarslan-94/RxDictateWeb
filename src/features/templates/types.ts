import type { TemplateView } from '@/contract';

/** One template as a list shows it. */
export type TemplateItem = {
  id: string;
  name: string;
  /** "3 medicines · 2 labs · advice". */
  summary: string;
  /** "Amlodipine 5 mg · Losartan 50 mg". */
  medicineLine: string;
  /** "3 medicines · advice · used 12 times". */
  detail: string;
  template: TemplateView;
};

/** One page of templates, however many there are in all. */
export type TemplatePage = {
  templates: TemplateView[];
  total: number;
};
