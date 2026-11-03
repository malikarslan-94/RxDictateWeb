import {
  SETTINGS,
  drugListOwnerSchema,
  drugScopeSchema,
  drugStatusSchema,
} from '@/contract';
import type {
  DrugListOwner as ContractDrugListOwner,
  SettingValue,
} from '@/contract';

/** The setting that decides what a doctor is suggested. */
export const MEDICINE_SOURCE_KEY = 'medicines.source';

/** `MedicineSource.myList`, `.myListFirst`, `.all`. */
export const MedicineSource = SETTINGS[MEDICINE_SOURCE_KEY].schema.enum;
export type MedicineSource = SettingValue<typeof MEDICINE_SOURCE_KEY>;

/** The choices, narrowest first. */
export const MEDICINE_SOURCES: readonly MedicineSource[] = [
  MedicineSource.myList,
  MedicineSource.myListFirst,
  MedicineSource.all,
];

/** `DrugListOwner.me`: the doctor's own list; `.clinic`: the clinic's. */
export const DrugListOwner = drugListOwnerSchema.enum;
export type DrugListOwner = ContractDrugListOwner;

export const DrugScope = drugScopeSchema.enum;
export const DrugStatus = drugStatusSchema.enum;

/** Medicine search starts after this many letters, once typing pauses. */
export const DRUG_SEARCH_MIN_LENGTH = 2;
export const DRUG_SEARCH_DEBOUNCE_MS = 250;

/** How many results the Add medicine dialog shows. */
export const ADD_SEARCH_LIMIT = 20;
export const LIST_PAGE_SIZE = 20;

/** Ties the Save button in a dialog's footer to the form above it. */
export const MEDICINE_FORM_ID = 'medicine-form';
