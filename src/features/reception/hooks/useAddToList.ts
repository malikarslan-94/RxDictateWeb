import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';

import { Hotkeys } from '@/constants/keys';
import type { PatientView } from '@/contract';
import {
  patientLine,
  useCreatePatientMutation,
  useSearchPatientsQuery,
} from '@/features/patients';
import {
  toQueue,
  useCreateVisitMutation,
  useListTodayVisitsQuery,
} from '@/features/visits';
import { useHotkey } from '@/hooks/useHotkey';
import { messageFor, toApiError } from '@/lib/api';
import { formatShortDate, fromDateString } from '@/utils/date';
import { toE164 } from '@/utils/phone';
import { firstName } from '@/utils/text';

import { PHONE_MATCH_LIMIT } from '../constants';
import { receptionCopy } from '../copy';
import { newPatientSchema } from '../schemas';
import type { NewPatientInput } from '../schemas';

const copy = receptionCopy.add;

const BLANK: NewPatientInput = { name: '', age: '', sex: null, reason: '' };

/**
 * The always-open "Add patient" panel. The phone number comes first: the
 * patients already on it come up (a whole family can share one), else a new
 * patient is added. Either way they go on today's list with the next token.
 * N jumps to the number; Enter adds; Esc clears.
 */
export function useAddToList() {
  const phoneRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const e164 = toE164(phone);
  const matches = useSearchPatientsQuery(
    e164 ? { q: e164, limit: PHONE_MATCH_LIMIT } : skipToken,
  );
  const visits = useListTodayVisitsQuery();
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [createVisit, { isLoading: isAdding }] = useCreateVisitMutation();
  const form = useForm({
    resolver: zodResolver(newPatientSchema),
    defaultValues: BLANK,
  });
  useHotkey(Hotkeys.addPatient, () => phoneRef.current?.focus());

  const queue = toQueue(visits.data ?? []);
  const nextToken =
    queue.reduce((max, entry) => Math.max(max, entry.token), 0) + 1;
  const onList = new Map(queue.map((entry) => [entry.patientId, entry.token]));
  const found = e164 ? (matches.data?.patients ?? []) : [];
  const chosen =
    found.find((patient) => patient.id === chosenId) ?? found[0] ?? null;
  const isAddingNew =
    !!e164 && !matches.isFetching && (isNew || found.length === 0);

  const reset = (message?: string) => {
    setPhone('');
    setChosenId(null);
    setIsNew(false);
    setError(undefined);
    setNotice(message);
    form.reset(BLANK);
    phoneRef.current?.focus();
  };

  const addVisit = async (patient: PatientView, reason: string) => {
    const visit = await createVisit({ patientId: patient.id, reason }).unwrap();
    reset(copy.added(patient.name, visit.token));
  };

  const addChosen = async () => {
    if (!chosen || onList.has(chosen.id)) return;
    setError(undefined);
    try {
      await addVisit(chosen, '');
    } catch (caught) {
      setError(messageFor(toApiError(caught)));
    }
  };

  const addNew = form.handleSubmit(async (values) => {
    if (!e164) return;
    setError(undefined);
    try {
      const patient = await createPatient({
        name: values.name,
        phone: e164,
        age: values.age,
        sex: values.sex,
        allergies: [],
        noKnownAllergies: false,
        conditions: [],
      }).unwrap();
      await addVisit(patient, values.reason);
    } catch (caught) {
      setError(messageFor(toApiError(caught)));
    }
  });

  return {
    phoneRef,
    phone,
    setPhone: (next: string) => {
      setPhone(next);
      setChosenId(null);
      setIsNew(false);
      setNotice(undefined);
    },
    title: found.length > 0 && !isNew ? copy.titleExisting : copy.title,
    isSearching: !!e164 && matches.isFetching,
    matchesTitle:
      found.length > 0 && !isNew ? copy.sharing(found.length) : null,
    matches: isNew
      ? []
      : found.map((patient) => ({
          id: patient.id,
          name: patient.name,
          details: patient.lastVisitDate
            ? [
                patientLine(patient),
                copy.lastVisit(
                  formatShortDate(fromDateString(patient.lastVisitDate)),
                ),
              ].join(' · ')
            : patientLine(patient),
          isChosen: patient.id === chosen?.id,
          choose: () => setChosenId(patient.id),
        })),
    chosenOnList: chosen && !isNew ? (onList.get(chosen.id) ?? null) : null,
    addChosenLabel:
      chosen && !isNew ? copy.addNamed(firstName(chosen.name), nextToken) : '',
    addChosen,
    showSomeoneElse: found.length > 0 && !isNew,
    someoneElse: () => setIsNew(true),
    isAddingNew,
    noOneNote: found.length === 0 && isAddingNew ? copy.noOne : null,
    control: form.control,
    addNew,
    addNewLabel: copy.addToday(nextToken),
    isSaving: isCreating || isAdding,
    notice,
    error,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') reset();
    },
  };
}
