/**
 * Recordings that haven't uploaded yet, held in this tab's memory: the web
 * stand-in for the phone's recordings folder. Sign-out counts them (to warn)
 * and clears them, so patient audio never outlives the session.
 */
const unsent = new Map<string, Blob>();

export function keepRecording(id: string, audio: Blob): void {
  unsent.set(id, audio);
}

export function forgetRecording(id: string): void {
  unsent.delete(id);
}

export function countRecordings(): number {
  return unsent.size;
}

export function clearRecordings(): void {
  unsent.clear();
}

/** A recording as the base64 the API takes, without the data: prefix. */
export function readAsBase64(audio: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve(url.slice(url.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(audio);
  });
}
