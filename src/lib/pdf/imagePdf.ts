/** Millimetres to PDF points (1/72 inch). */
const PT_PER_MM = 72 / 25.4;

/** A comment of high bytes on line two tells tools the file is binary. */
const BINARY_MARK = new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]);

export type ImagePdfPage = {
  /** The JPEG's own bytes; a PDF reader decodes them as they are. */
  jpeg: Uint8Array<ArrayBuffer>;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
};

/**
 * A one-page PDF whose page is the JPEG, edge to edge. Hand-written because
 * the file is five objects: catalog, page list, page, image and the one line
 * that draws it.
 */
export function imagePdf(page: ImagePdfPage): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (part: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (parts: (string | Uint8Array<ArrayBuffer>)[]) => {
    offsets.push(length);
    push(`${offsets.length} 0 obj\n`);
    parts.forEach(push);
    push('\nendobj\n');
  };

  const width = (page.widthMm * PT_PER_MM).toFixed(2);
  const height = (page.heightMm * PT_PER_MM).toFixed(2);
  const draw = `q ${width} 0 0 ${height} 0 0 cm /Page Do Q`;

  push('%PDF-1.4\n');
  push(BINARY_MARK);
  object(['<< /Type /Catalog /Pages 2 0 R >>']);
  object(['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
  object([
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
      '/Resources << /XObject << /Page 4 0 R >> >> /Contents 5 0 R >>',
  ]);
  object([
    `<< /Type /XObject /Subtype /Image /Width ${page.widthPx} ` +
      `/Height ${page.heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 ` +
      `/Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
    page.jpeg,
    '\nendstream',
  ]);
  object([`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`]);

  // Each cross-reference line is exactly 20 bytes, as the format requires.
  const table = offsets
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  const tableAt = length;
  push(
    `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${table}` +
      `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${tableAt}\n%%EOF\n`,
  );

  return new Blob(chunks, { type: 'application/pdf' });
}
