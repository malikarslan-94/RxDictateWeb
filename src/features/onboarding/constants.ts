import { Routes } from '@/constants/routes';

export const SetupStep = {
  AboutYou: 'aboutYou',
  Location: 'location',
  Assistant: 'assistant',
} as const;
export type SetupStep = (typeof SetupStep)[keyof typeof SetupStep];

/** The steps in order, with where each one lives. */
export const SETUP_STEPS: readonly { step: SetupStep; path: string }[] = [
  { step: SetupStep.AboutYou, path: Routes.setupAboutYou },
  { step: SetupStep.Location, path: Routes.setupLocation },
  { step: SetupStep.Assistant, path: Routes.setupAssistant },
];
