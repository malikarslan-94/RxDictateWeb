import { useState } from 'react';

import { Action } from '@/constants/roles';
import { useCan } from '@/hooks/useCan';

import { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';

const copy = medicinesCopy.lists;

/** Which list is on show: a doctor has their own and the clinic's. */
export function useMedicineLists() {
  const hasOwnList = useCan(Action['drugList.own.manage']);
  const [chosen, setChosen] = useState<DrugListOwner>(DrugListOwner.me);

  return {
    hasOwnList,
    label: copy.label,
    options: [
      { value: DrugListOwner.me, label: copy.me },
      { value: DrugListOwner.clinic, label: copy.clinic },
    ],
    owner: hasOwnList ? chosen : DrugListOwner.clinic,
    choose: setChosen,
  };
}
