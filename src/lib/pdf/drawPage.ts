import { PX_PER_MM } from '@/constants/paper';

import { pageCss } from './pageCss';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type PageSizeMm = { width: number; height: number };

const DRAW_FAILED = 'The page could not be drawn.';

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(DRAW_FAILED));
    image.src = source;
  });
}

/** An image's bytes as a `data:` address. */
async function asDataUrl(source: string): Promise<string> {
  const response = await fetch(source, { credentials: 'omit' });
  if (!response.ok) throw new Error(DRAW_FAILED);
  const bytes = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(DRAW_FAILED));
    reader.readAsDataURL(bytes);
  });
}

/**
 * An SVG drawn as an image can't load anything, so each picture on the page
 * (the QR) goes into the copy as data first.
 */
async function withImagesInline(page: HTMLElement): Promise<HTMLElement> {
  const copy = page.cloneNode(true) as HTMLElement;
  await Promise.all(
    [...copy.querySelectorAll('img')]
      .filter((image) => !image.src.startsWith('data:'))
      .map(async (image) => {
        image.src = await asDataUrl(image.src);
      }),
  );
  return copy;
}

/**
 * The page drawn by the browser itself, `scale` times its size on screen.
 * A copy of it goes into an SVG with the app's CSS and fonts, and the SVG is
 * drawn onto a canvas, so the result is exactly what the preview shows.
 * The page may be hidden (the print-only copy): its size comes from `size`.
 */
export async function drawPage(
  page: HTMLElement,
  size: PageSizeMm,
  scale: number,
): Promise<HTMLCanvasElement> {
  const width = size.width * PX_PER_MM;
  const height = size.height * PX_PER_MM;
  const style = getComputedStyle(page);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  const css = document.createElementNS(SVG_NS, 'style');
  css.textContent = await pageCss(page);
  const frame = document.createElementNS(SVG_NS, 'foreignObject');
  frame.setAttribute('width', '100%');
  frame.setAttribute('height', '100%');
  // The page inherits its font from <html>, which the SVG doesn't have.
  const holder = document.createElement('div');
  holder.style.fontFamily = style.fontFamily;
  holder.append(await withImagesInline(page));
  frame.append(holder);
  svg.append(css, frame);

  const markup = new XMLSerializer().serializeToString(svg);
  const image = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`,
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser has no canvas.');
  // A JPEG has no transparency: the paper's own colour under everything.
  context.fillStyle = style.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, width * scale, height * scale);
  return canvas;
}
