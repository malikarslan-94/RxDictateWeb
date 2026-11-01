import { useCallback, useEffect, useState } from 'react';

import { StorageKey, readItem, writeItem } from '@/lib/storage';

import { voiceCopy } from '../copy';

export type MicPermission = 'unknown' | 'granted' | 'denied' | 'unavailable';

/** The browser can record at all: a secure page with a microphone API. */
export function canRecordHere(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Which microphone this computer dictates with, the ones it has, and
 * whether the browser lets the page use them. The choice is kept per
 * computer: a headset at one desk, the laptop mic at another.
 */
export function useMicrophone() {
  const [deviceId, setDeviceId] = useState(
    () => readItem(StorageKey.microphone) ?? '',
  );
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permission, setPermission] = useState<MicPermission>(() =>
    canRecordHere() ? 'unknown' : 'unavailable',
  );

  const refresh = useCallback(async () => {
    if (!canRecordHere()) return;
    const all = await navigator.mediaDevices.enumerateDevices();
    setDevices(all.filter((device) => device.kind === 'audioinput'));
  }, []);

  useEffect(() => {
    if (!canRecordHere()) return;
    refresh();
    navigator.mediaDevices.addEventListener('devicechange', refresh);
    // Not every browser can say ahead of time; then it's known on first use.
    let status: PermissionStatus | null = null;
    const read = () =>
      setPermission(
        status?.state === 'granted'
          ? 'granted'
          : status?.state === 'denied'
            ? 'denied'
            : 'unknown',
      );
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((result) => {
        status = result;
        read();
        result.addEventListener('change', read);
      })
      .catch(() => undefined);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refresh);
      status?.removeEventListener('change', read);
    };
  }, [refresh]);

  const current = devices.find((device) => device.deviceId === deviceId);

  return {
    deviceId: current ? deviceId : '',
    /** "Logitech USB Headset"; names appear once the mic has been allowed. */
    label: current?.label || devices[0]?.label || voiceCopy.defaultMic,
    options: devices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || `${voiceCopy.defaultMic} ${index + 1}`,
    })),
    choose: (next: string) => {
      setDeviceId(next);
      writeItem(StorageKey.microphone, next);
    },
    permission,
    /** After a recording asked: the device names are readable now. */
    markGranted: () => {
      setPermission('granted');
      refresh();
    },
    markDenied: () => setPermission('denied'),
  };
}

export type Microphone = ReturnType<typeof useMicrophone>;
