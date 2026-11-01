import { MicrophoneSettings, voiceCopy } from '@/features/voice';
import { Banner, Card, Segmented } from '@/ui';

import { SettingsLayout } from '../components/SettingsLayout';
import { settingsCopy } from '../copy';
import { useVoiceSettings } from '../hooks/useVoiceSettings';

const copy = voiceCopy.settings;

/** This computer's microphone, and how long the clinic keeps dictation audio. */
export function VoiceSettingsScreen() {
  const voice = useVoiceSettings();

  return (
    <SettingsLayout title={settingsCopy.sections.voice}>
      <MicrophoneSettings />
      <Card className="flex flex-col gap-4">
        <h2 className="text-section">{copy.recordings}</h2>
        <div>
          <p className="mb-2 text-label">{copy.keepAudio}</p>
          <Segmented
            label={copy.keepAudio}
            options={voice.retentionOptions}
            value={voice.retention}
            onChange={voice.chooseRetention}
          />
        </div>
        <p className="text-meta text-ink-secondary">{copy.keepNote}</p>
        {voice.error ? <Banner tone="danger">{voice.error}</Banner> : null}
      </Card>
    </SettingsLayout>
  );
}
