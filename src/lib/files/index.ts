import type { ApiError } from '@/lib/api';
import { ClientErrorCode } from '@/constants/errorCodes';

/**
 * PUT a file's bytes to a signed storage URL. This is the one request that
 * doesn't go through the API client: the URL itself is the credential, so
 * it carries no Authorization header, and large files never pass through the
 * server. Fails with an ApiError, or rethrows the abort when `signal` fires.
 */
export async function putFile(
  url: string,
  file: File,
  contentType: string,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    const failure: ApiError = {
      code: ClientErrorCode.NETWORK_ERROR,
      message: '',
      status: 0,
    };
    throw failure;
  }
  if (!response.ok) {
    const failure: ApiError = {
      code: ClientErrorCode.UPLOAD_FAILED,
      message: '',
      status: response.status,
    };
    throw failure;
  }
}

/** Long enough for the browser to start the download before the URL goes. */
const SAVE_URL_LIFETIME_MS = 10_000;

/**
 * Save `file` to the computer as `name`, where the browser keeps downloads
 * (or asks where, if the user set it to). Nothing is opened in a tab.
 */
export function saveFile(file: Blob, name: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), SAVE_URL_LIFETIME_MS);
}
