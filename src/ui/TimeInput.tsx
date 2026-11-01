import { forwardRef } from 'react';

import { formatTimeLabel, timeSteps } from '@/utils/time';

import { Select } from './Select';
import type { SelectProps } from './Select';

/** Clinic hours and appointments fall on the quarter hour. */
const TIME_STEP_MINUTES = 15;

/** With nothing chosen yet, the list opens at the start of a working day. */
const TIME_START_AT = '09:00';

export type TimeInputProps = Omit<SelectProps, 'options' | 'startAt'>;

/**
 * A time of day, picked from a quarter-hourly list in the app's own look.
 * The value is the API's `HH:mm`; it reads as "5:00 pm".
 */
export const TimeInput = forwardRef<HTMLButtonElement, TimeInputProps>(
  function TimeInput({ value, ...rest }, ref) {
    const options = timeSteps(TIME_STEP_MINUTES, value).map((time) => ({
      value: time,
      label: formatTimeLabel(time),
    }));
    return (
      <Select
        ref={ref}
        value={value}
        options={options}
        startAt={TIME_START_AT}
        {...rest}
      />
    );
  },
);
