import type { PrescriptionSections, TemplateView } from '@/contract';

import { templatesCopy } from './copy';
import type { TemplateItem } from './types';

/** "3 medicines · 2 labs · advice · follow-up in 14 days". */
export function templateSummary(sections: PrescriptionSections): string {
  const copy = templatesCopy.summary;
  const parts = [
    sections.medicines.length > 0
      ? copy.medicines(sections.medicines.length)
      : '',
    sections.labs.length > 0 ? copy.labs(sections.labs.length) : '',
    sections.dietAvoid.length + sections.dietEat.length > 0 ? copy.diet : '',
    sections.advice.length > 0 ? copy.advice : '',
    sections.followUp.inDays ? copy.followUp(sections.followUp.inDays) : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : copy.empty;
}

/** "Amlodipine 5 mg · Losartan 50 mg". */
export function medicineLine(sections: PrescriptionSections): string {
  return sections.medicines
    .map((medicine) =>
      [medicine.name, medicine.strength].filter(Boolean).join(' '),
    )
    .join(' · ');
}

export function toTemplateItem(template: TemplateView): TemplateItem {
  return {
    id: template.id,
    name: template.name,
    summary: templateSummary(template.sections),
    medicineLine: medicineLine(template.sections),
    detail: templatesCopy.detail(
      templateSummary(template.sections),
      templatesCopy.used(template.useCount),
    ),
    template,
  };
}
