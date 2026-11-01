export const vitalsCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    saved: 'Vitals saved',
  },
  addTitle: 'Add vitals',
  editTitle: 'Edit vitals',
  subtitle: "Leave out anything you didn't measure.",
  withUnit: (label: string, unit: string) => `${label} (${unit})`,
  fields: {
    systolic: 'BP systolic',
    diastolic: 'BP diastolic',
    pulse: 'Pulse',
    tempF: 'Temperature',
    weightKg: 'Weight',
    spo2: 'SpO₂',
  },
  placeholders: {
    systolic: '120',
    diastolic: '80',
    pulse: '72',
    tempF: '98.6',
    weightKg: '70',
    spo2: '98',
  },
  /** The short names a row of readings uses. */
  readings: {
    bp: 'BP',
    pulse: 'Pulse',
    temp: 'Temp',
    weight: 'Weight',
    spo2: 'SpO₂',
  },
  reading: (label: string, value: string) => `${label} ${value}`,
  /** A reading outside the normal range, said as it's typed. */
  flag: {
    high: (normal: string) => `Above normal · ${normal}`,
    low: (normal: string) => `Below normal · ${normal}`,
  },
  normal: {
    between: (min: number, max: number, unit: string) =>
      `${min}–${max} ${unit}`,
    atLeast: (min: number, unit: string) => `${min} ${unit} or more`,
    atMost: (max: number, unit: string) => `up to ${max} ${unit}`,
  },
  add: 'Add vitals',
  editReadings: (readings: string) => `Edit vitals: ${readings}`,
  save: 'Save vitals',
  cancel: 'Cancel',
  errors: {
    outOfRange: (min: number | null, max: number | null) =>
      min !== null && max !== null
        ? `Enter a number from ${min} to ${max}`
        : 'Enter a valid number',
    bpBoth: 'Enter both numbers',
    bpInvalid: 'Enter two or three digits',
    noReading: 'Enter at least one reading.',
  },
} as const;
