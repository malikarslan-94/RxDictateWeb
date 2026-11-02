import { Action } from '@/constants/roles';
import { definitionOf, settingSourceSchema } from '@/contract';
import type { SettingChange, SettingKey, SettingValue } from '@/contract';
import { useCan } from '@/hooks/useCan';

import {
  useGetSettingsQuery,
  useUpdateClinicSettingsMutation,
  useUpdateMySettingsMutation,
} from '../api';

/**
 * One setting from the registry as it applies to this person here, and the
 * ways to change it: their own value, or the clinic's for everyone, with a
 * lock. Which value wins is the server's answer, never worked out here.
 */
export function useSetting<K extends SettingKey>(key: K) {
  const settings = useGetSettingsQuery();
  const [updateMine, mine] = useUpdateMySettingsMutation();
  const [updateClinic, clinic] = useUpdateClinicSettingsMutation();
  const canSetForClinic = useCan(Action['settings.organisation.update']);
  const applied = settings.data?.[key];
  const change = (value: SettingValue<K> | null, locked?: boolean) =>
    ({ key, value, locked }) as SettingChange;

  return {
    value: (applied?.value ?? definitionOf(key).default) as SettingValue<K>,
    source: applied?.source ?? settingSourceSchema.enum.default,
    /** A clinic or RxDictate fixed it: the person's own choice can't change it. */
    isLocked: applied?.locked ?? false,
    canSetForClinic,
    isLoading: settings.isLoading,
    isSaving: mine.isLoading || clinic.isLoading,
    /** The person's own value; null goes back to what applies above. */
    setMine: (value: SettingValue<K> | null) =>
      updateMine({ values: [change(value)] }).unwrap(),
    /** The clinic's value for every member; `locked` stops them changing it. */
    setForClinic: (value: SettingValue<K> | null, locked?: boolean) =>
      updateClinic({ values: [change(value, locked)] }).unwrap(),
  };
}
