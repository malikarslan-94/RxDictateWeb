import { StateMessage } from '@/components';
import { ProfileFields } from '@/features/clinic';
import { Banner, Button, Card, FloatingActions } from '@/ui';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';
import { useProfileSettings } from '../hooks/useProfileSettings';

const copy = settingsCopy.profile;

/** The doctor's name and credentials, and the signature they print with. */
export function ProfileSettingsScreen() {
  const profile = useProfileSettings();
  const { watchSaveRow } = profile;

  return (
    <SettingsLayout title={settingsCopy.sections.profile}>
      <p className="text-body text-ink-secondary">{copy.subtitle}</p>
      {profile.isLoading ? (
        <StateMessage isLoading />
      ) : (
        <form
          onSubmit={profile.submit}
          noValidate
          className="flex flex-col gap-5"
        >
          <Card className="flex flex-col gap-5">
            <ProfileFields control={profile.control} showClinicName />
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className="text-section">{copy.signature}</h2>
            <p className="border-b border-border pb-2 text-title italic">
              {profile.signature}
            </p>
            <p className="text-meta text-ink-secondary">{copy.signatureHint}</p>
          </Card>
          {profile.formError ? (
            <Banner tone="danger">{profile.formError}</Banner>
          ) : null}
          <div ref={watchSaveRow} className="flex justify-end">
            <Button
              type="submit"
              label={copy.save}
              loading={profile.isSaving}
            />
          </div>
          <FloatingActions
            visible={profile.isSaveFloating}
            message={copy.unsaved}
          >
            <Button
              type="submit"
              label={copy.save}
              size="medium"
              loading={profile.isSaving}
            />
          </FloatingActions>
        </form>
      )}
    </SettingsLayout>
  );
}
