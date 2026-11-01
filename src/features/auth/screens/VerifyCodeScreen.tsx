import { Navigate } from 'react-router';

import { Routes } from '@/constants/routes';
import { Button, CodeInput, Icon, TextLink } from '@/ui';

import { AuthLayout } from '../components/AuthLayout';
import { OTP_LENGTH } from '../constants';
import { authCopy } from '../copy';
import { useVerifyCode } from '../hooks/useVerifyCode';

const copy = authCopy.verify;

/** The six-digit code. Pasting fills every box; the last digit verifies. */
export function VerifyCodeScreen() {
  const form = useVerifyCode();
  if (form.isMissing) return <Navigate to={Routes.signIn} replace />;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={form.changeNumber}
          className="flex items-center gap-1 self-start text-body font-bold text-primary-strong"
        >
          <Icon name="chevronLeft" className="size-4" />
          {copy.changeNumber}
        </button>
        <div>
          <h1 className="text-screen-title">{copy.title}</h1>
          <p className="mt-2 text-body text-ink-secondary">{form.sentTo}</p>
        </div>
        <CodeInput
          label={copy.codeLabel}
          length={OTP_LENGTH}
          value={form.code}
          onChange={form.changeCode}
          onComplete={form.verify}
          hasError={!!form.error}
          autoFocus
        />
        {form.error ? (
          <p role="alert" className="text-body text-danger">
            {form.error}
          </p>
        ) : null}
        <p className="text-body text-ink-secondary">
          {form.canResend ? (
            <>
              {copy.didntGetIt}{' '}
              <TextLink label={copy.resend} onClick={form.resend} />
            </>
          ) : (
            copy.resendIn(form.resendIn)
          )}
        </p>
        <Button
          label={copy.verify}
          fullWidth
          loading={form.isVerifying}
          onClick={() => form.verify()}
        />
      </div>
    </AuthLayout>
  );
}
