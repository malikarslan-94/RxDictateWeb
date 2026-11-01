import { APP_VERSION } from '@/constants/app';
import type { DeviceInfo } from '@/contract';
import { StorageKey, readItem, writeItem } from '@/lib/storage';

/** This browser's id, made once and kept through every sign-out. */
export function getDeviceId(): string {
  const stored = readItem(StorageKey.deviceId);
  if (stored) return stored;
  const id = crypto.randomUUID();
  writeItem(StorageKey.deviceId, id);
  return id;
}

/**
 * What sign-in tells the server about this computer.
 *
 * TODO(backend): the contract's platform is 'ios' | 'android' only; send
 * 'web' once it accepts it (docs/backend-requests/web-client.md).
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    deviceId: getDeviceId(),
    platform: 'android',
    appVersion: APP_VERSION,
  };
}

/** "Chrome on Windows", for Settings › Security. */
export function describeBrowser(userAgent: string = navigator.userAgent) {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Browser';
  const system = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X/.test(userAgent)
      ? 'Mac'
      : /Android/.test(userAgent)
        ? 'Android'
        : /Linux/.test(userAgent)
          ? 'Linux'
          : '';
  return system ? `${browser} on ${system}` : browser;
}
