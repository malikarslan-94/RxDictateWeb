import { FormCheckbox, FormPhoneInput } from '@/components';
import { Banner, Button } from '@/ui';

import { AuthLayout } from '../components/AuthLayout';
import { authCopy } from '../copy';
import { useSendCodeForm } from '../hooks/useSendCodeForm';

/** Sign in, or a new doctor setting up a clinic: the phone number step. */
export function SignInScreen() {
  const form = useSendCodeForm();

  return (
    <AuthLayout>
      <form onSubmit={form.submit} className="flex flex-col gap-6" noValidate>
        <div>
          <h1 className="text-screen-title">{form.copy.title}</h1>
          <p className="mt-2 text-lead text-ink-secondary">
            {form.copy.subtitle}
          </p>
        </div>
        {form.notice ? <Banner tone="warning">{form.notice}</Banner> : null}
        <FormPhoneInput
          control={form.control}
          name="phone"
          label={authCopy.phone.label}
          autoFocus
        />
        <FormCheckbox
          control={form.control}
          name="keepSignedIn"
          label={authCopy.phone.keepSignedIn}
          hint={authCopy.phone.keepSignedInHint}
        />
        <Button
          type="submit"
          label={authCopy.phone.sendCode}
          fullWidth
          loading={form.isSending}
        />
      </form>

      <div className="mt-8 border-t border-border pt-6">
        {form.isSignUp ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-body text-ink-secondary">
              {authCopy.signUp.haveAccount}
            </p>
            <Button
              label={authCopy.signUp.signIn}
              variant="secondary"
              size="small"
              onClick={form.switchMode}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-body text-ink-secondary">
                {authCopy.signIn.newDoctor}
              </p>
              <Button
                label={authCopy.signIn.setUpClinic}
                variant="secondary"
                size="small"
                onClick={form.switchMode}
              />
            </div>
            <p className="mt-4 text-meta text-ink-secondary">
              {authCopy.signIn.assistantNote}
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
