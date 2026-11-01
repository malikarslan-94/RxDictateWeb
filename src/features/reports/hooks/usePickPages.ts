import { useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import { FILE_ACCEPT } from '../constants';

/**
 * Pages from the file picker or dropped on the form. Each batch goes to
 * `onFiles`, which decides what to keep.
 */
export function usePickPages(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);

  // A file dropped beside the form would open in the tab and lose it.
  useEffect(() => {
    const keep = (event: globalThis.DragEvent) => event.preventDefault();
    window.addEventListener('dragover', keep);
    window.addEventListener('drop', keep);
    return () => {
      window.removeEventListener('dragover', keep);
      window.removeEventListener('drop', keep);
    };
  }, []);

  return {
    accept: FILE_ACCEPT,
    onChosen: (event: ChangeEvent<HTMLInputElement>) => {
      onFiles(Array.from(event.target.files ?? []));
      // So choosing the same file again still counts as a change.
      event.target.value = '';
    },
    isDragging,
    dropTarget: {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(true);
      },
      onDragLeave: (event: DragEvent<HTMLElement>) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node && event.currentTarget.contains(next))) {
          setIsDragging(false);
        }
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      },
    },
  };
}
