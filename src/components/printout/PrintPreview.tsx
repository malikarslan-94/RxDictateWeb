import { useLayoutEffect, useRef, useState } from 'react';

import type { PrintOptions, Printout } from '@/types/printout';

import { PrintPage } from './PrintPage';

/** Millimetres to CSS pixels at the browser's 96 dpi. */
const PX_PER_MM = 96 / 25.4;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export type PrintPreviewProps = {
  printout: Printout;
  options: PrintOptions;
};

/**
 * The page as it will print, scaled to fit the width it's given. The page
 * keeps its real A4 size inside, so the preview is exactly the paper.
 */
export function PrintPreview({ printout, options }: PrintPreviewProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const fit = () =>
      setScale(Math.min(1, element.clientWidth / (A4_WIDTH_MM * PX_PER_MM)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className="w-full overflow-hidden"
      style={{ height: A4_HEIGHT_MM * PX_PER_MM * scale }}
    >
      <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
        <PrintPage printout={printout} options={options} />
      </div>
    </div>
  );
}
