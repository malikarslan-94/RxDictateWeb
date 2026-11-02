/** An A4 sheet in millimetres: the printed page, its preview and its PDF. */
export const A4_MM = { width: 210, height: 297 } as const;

/** Millimetres to CSS pixels at the browser's 96 dpi. */
export const PX_PER_MM = 96 / 25.4;
