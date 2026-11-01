import { forwardRef } from 'react';

import { DIAL_CODE, PHONE_PLACEHOLDER } from '@/constants/phone';
import { localDigits } from '@/utils/phone';

import { Input } from './Input';
import type { InputProps } from './Input';

export type PhoneInputProps = Omit<InputProps, 'leading' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

/** A Pakistani mobile number: "+92" fixed, the rest typed. */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, placeholder, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={value}
        onChange={(event) => onChange(localDigits(event.target.value))}
        placeholder={placeholder ?? PHONE_PLACEHOLDER}
        leading={
          <span className="-ml-4 flex h-full items-center border-r border-border bg-primary-tint px-4 text-body font-bold">
            {DIAL_CODE}
          </span>
        }
        {...rest}
      />
    );
  },
);
