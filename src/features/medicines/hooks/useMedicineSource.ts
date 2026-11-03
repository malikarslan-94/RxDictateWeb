import { Action } from '@/constants/roles';
import { settingSourceSchema } from '@/contract';
import { useSetting } from '@/features/clinic';
import { useCan } from '@/hooks/useCan';

import { MEDICINE_SOURCES, MEDICINE_SOURCE_KEY } from '../constants';
import type { MedicineSource } from '../constants';
import { medicinesCopy } from '../copy';

const copy = medicinesCopy.source;
const SettingSource = settingSourceSchema.enum;

/**
 * Where suggestions come from. A doctor chooses for themselves, unless a lock
 * decided it, and may lift their own clinic's lock. A medicine manager has no
 * prescriptions of their own, so what they choose is the clinic's.
 */
export function useMedicineSource() {
  const setting = useSetting(MEDICINE_SOURCE_KEY);
  const isPersonal = useCan(Action['drugList.own.manage']);
  const isFixedByPlatform =
    setting.isLocked && setting.source === SettingSource.platform;
  const isFixedByClinic =
    setting.isLocked && setting.source === SettingSource.organisation;
  const isFixed = isFixedByPlatform || (isPersonal && isFixedByClinic);

  return {
    title: isPersonal ? copy.yours : copy.forClinic,
    hint: isPersonal ? copy.yoursHint : copy.forClinicHint,
    label: copy.label,
    options: MEDICINE_SOURCES.map((source) => ({
      value: source,
      label: copy.options[source],
      disabled: isFixed,
    })),
    value: setting.value,
    description: copy.descriptions[setting.value],
    choose: (source: MedicineSource) => {
      if (isPersonal) setting.setMine(source);
      else setting.setForClinic(source);
    },
    /** Why it can't change, or that the clinic's choice is what applies. */
    note: isFixedByPlatform
      ? copy.fixedByPlatform
      : isPersonal && isFixedByClinic
        ? copy.fixedByClinic
        : isPersonal && setting.source === SettingSource.organisation
          ? copy.fromClinic
          : null,
    canUnlock: isPersonal && isFixedByClinic && setting.canSetForClinic,
    unlockLabel: copy.unlock,
    unlock: () => setting.setForClinic(setting.value, false),
    canLock: !isPersonal && !isFixedByPlatform && setting.canSetForClinic,
    lockLabel: copy.lock,
    isLocked: isFixedByClinic,
    setLocked: (locked: boolean) => setting.setForClinic(setting.value, locked),
    isSaving: setting.isSaving,
  };
}
