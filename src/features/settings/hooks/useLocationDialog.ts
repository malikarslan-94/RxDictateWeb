import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { locationStatusSchema } from '@/contract';
import type { LocationView } from '@/contract';
import {
  EMPTY_LOCATION,
  locationSchema,
  toLocationBody,
  toLocationForm,
  useArchiveLocationMutation,
  useCreateLocationMutation,
  useListLocationsQuery,
  useUpdateLocationMutation,
} from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';

import { settingsCopy } from '../copy';

/**
 * Add a location, or change one: its details and hours; make it the
 * default; archive it.
 */
export function useLocationDialog(
  location: LocationView | null,
  onDone: () => void,
) {
  const locations = useListLocationsQuery();
  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdateLocationMutation();
  const [archiveLocation, { isLoading: isArchiving }] =
    useArchiveLocationMutation();
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [actionError, setActionError] = useState<string>();

  const activeCount = (locations.data ?? []).filter(
    (item) => item.status === locationStatusSchema.enum.active,
  ).length;

  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: location ? toLocationForm(location) : EMPTY_LOCATION,
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (location) {
        await updateLocation({
          id: location.id,
          body: toLocationBody(values, location.letterhead),
        }).unwrap();
      } else {
        // The server makes it the default if it's the clinic's first.
        await createLocation({
          ...toLocationBody(values),
          isDefault: false,
        }).unwrap();
      }
      onDone();
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  const act = async (task: () => Promise<unknown>) => {
    setActionError(undefined);
    try {
      await task();
      return true;
    } catch (error) {
      setActionError(messageFor(toApiError(error)));
      return false;
    }
  };

  return {
    title: location
      ? settingsCopy.locations.editTitle
      : settingsCopy.locations.addTitle,
    control,
    submit,
    isSaving: isCreating || isUpdating,
    formError: formState.errors.root?.message ?? actionError,
    makeDefault:
      location && !location.isDefault
        ? () =>
            act(() =>
              updateLocation({
                id: location.id,
                body: { isDefault: true },
              }).unwrap(),
            )
        : undefined,
    // A clinic keeps at least one place to work; the server says so too.
    canArchive: !!location && activeCount > 1,
    isConfirmingArchive,
    archiveTitle: location
      ? settingsCopy.locations.archiveTitle(location.name)
      : '',
    askArchive: () => setIsConfirmingArchive(true),
    cancelArchive: () => setIsConfirmingArchive(false),
    archive: async () => {
      if (location && (await act(() => archiveLocation(location.id).unwrap())))
        onDone();
    },
    isArchiving,
  };
}
