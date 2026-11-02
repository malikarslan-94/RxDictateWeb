import { drawPage } from './drawPage';
import type { PageSizeMm } from './drawPage';
import { imagePdf } from './imagePdf';

export type { PageSizeMm } from './drawPage';

/** About 290 dpi: print-sharp text, and a file of a few hundred KB. */
const RENDER_SCALE = 3;
const JPEG_QUALITY = 0.92;

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (file) =>
        file ? resolve(file) : reject(new Error('The page has no image.')),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

/**
 * `page` as a one-page PDF of `size`, drawn in the browser, so the file is
 * the page the user sees: its margins, its fonts, this computer's settings.
 * Fails if the browser won't draw it (an older Safari refuses).
 */
export async function pageToPdf(
  page: HTMLElement,
  size: PageSizeMm,
): Promise<Blob> {
  const canvas = await drawPage(page, size, RENDER_SCALE);
  const jpeg = new Uint8Array(await (await toJpeg(canvas)).arrayBuffer());
  return imagePdf({
    jpeg,
    widthPx: canvas.width,
    heightPx: canvas.height,
    widthMm: size.width,
    heightMm: size.height,
  });
}
