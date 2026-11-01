import { Banner, Button, Card, Icon, LevelMeter, Select } from '@/ui';

import { voiceCopy } from '../copy';
import { useMicTest } from '../hooks/useMicTest';

const copy = voiceCopy.settings;

/** Pick the microphone, see that it hears, and record a short test. */
export function MicrophoneSettings() {
  const mic = useMicTest();

  return (
    <>
      <Card className="flex flex-col gap-4">
        <h2 className="text-section">{copy.microphone}</h2>
        {mic.isUnavailable ? (
          <Banner tone="warning">{voiceCopy.unavailable}</Banner>
        ) : (
          <>
            <Select
              label={copy.inputDevice}
              options={mic.microphone.options}
              value={mic.microphone.deviceId}
              onChange={mic.microphone.choose}
            />
            <div className="flex flex-col gap-2">
              <p className="text-label">{copy.level}</p>
              <LevelMeter level={mic.level} label={copy.level} />
              <p
                className={
                  mic.isQuiet
                    ? 'flex items-center gap-2 text-meta text-warning-strong'
                    : 'flex items-center gap-2 text-meta text-primary-strong'
                }
              >
                <Icon
                  name={mic.isQuiet ? 'alert' : 'check'}
                  className="size-4"
                />
                {mic.isQuiet ? copy.quiet : copy.goodLevel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                label={mic.isTesting ? copy.testing : copy.test}
                variant="secondary"
                size="small"
                icon={<Icon name="mic" className="size-4" />}
                loading={mic.isTesting}
                onClick={mic.test}
              />
              <Button
                label={copy.playBack}
                variant="text"
                size="small"
                icon={<Icon name="volume" className="size-4" />}
                disabled={!mic.canPlayBack}
                onClick={mic.playBack}
              />
            </div>
          </>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-section">{copy.allowTitle}</h2>
        <Banner tone="warning">
          <strong>{voiceCopy.blocked.title}</strong> {voiceCopy.blocked.body}
        </Banner>
      </Card>
    </>
  );
}
