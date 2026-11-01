import { cx } from '@/utils/classes';
import { Icon } from '@/ui';

import { onboardingCopy } from '../copy';

export type SetupStepperProps = {
  steps: {
    key: string;
    number: number;
    title: string;
    detail: string;
    isDone: boolean;
    isCurrent: boolean;
  }[];
};

/** The three setup steps down the left: done, here, still to come. */
export function SetupStepper({ steps }: SetupStepperProps) {
  return (
    <nav aria-label={onboardingCopy.stepperTitle}>
      <p className="mb-5 text-group text-ink-secondary uppercase">
        {onboardingCopy.stepperTitle}
      </p>
      <ol className="flex flex-col gap-6">
        {steps.map((step) => (
          <li
            key={step.key}
            aria-current={step.isCurrent ? 'step' : undefined}
            className="flex items-start gap-3"
          >
            <span
              className={cx(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-meta font-bold',
                step.isDone && 'bg-primary text-ink-on-primary',
                step.isCurrent && 'border-2 border-primary text-primary-strong',
                !step.isDone &&
                  !step.isCurrent &&
                  'border-2 border-border text-ink-secondary',
              )}
            >
              {step.isDone ? (
                <Icon name="check" className="size-4" />
              ) : (
                step.number
              )}
            </span>
            <div>
              <p
                className={cx(
                  'text-body font-bold',
                  !step.isDone && !step.isCurrent && 'text-ink-secondary',
                )}
              >
                {step.title}
              </p>
              <p className="text-meta text-ink-secondary">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
