const FIRST_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/;
const SRC_DESCRIPTOR = /src\s*:[^;}]+;?/;
const QUOTES = /^['"]|['"]$/g;

/** Font files already read, by address: a second PDF doesn't fetch again. */
const fontData = new Map<string, Promise<string>>();

function rulesOf(sheet: CSSStyleSheet): CSSRule[] {
  let rules: CSSRule[];
  try {
    rules = Array.from(sheet.cssRules);
  } catch {
    // Another origin's stylesheet can't be read; the page uses none.
    return [];
  }
  return rules.flatMap((rule) =>
    rule instanceof CSSImportRule && rule.styleSheet
      ? rulesOf(rule.styleSheet)
      : [rule],
  );
}

function familyNames(fontFamily: string): string[] {
  return fontFamily.split(',').map((name) => name.trim().replace(QUOTES, ''));
}

/** Every font family the page or anything in it asks for. */
function familiesIn(page: HTMLElement): Set<string> {
  const elements = [page, ...Array.from(page.querySelectorAll('*'))];
  return new Set(
    elements.flatMap((element) =>
      familyNames(getComputedStyle(element).fontFamily),
    ),
  );
}

function readAsDataUrl(address: string): Promise<string> {
  const known = fontData.get(address);
  if (known) return known;
  const reading = fetch(address)
    .then((response) => {
      if (!response.ok) throw new Error(`font ${response.status}`);
      return response.blob();
    })
    .then(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    );
  // A failed read is tried again next time rather than remembered.
  reading.catch(() => fontData.delete(address));
  fontData.set(address, reading);
  return reading;
}

/** The face with its first file read in, since an image can't fetch one. */
async function embedded(face: CSSFontFaceRule): Promise<string> {
  const found = FIRST_URL.exec(face.style.getPropertyValue('src'));
  if (!found) return face.cssText;
  const base = face.parentStyleSheet?.href ?? document.baseURI;
  const data = await readAsDataUrl(new URL(found[2], base).href);
  return face.cssText.replace(SRC_DESCRIPTOR, `src: url("${data}");`);
}

/**
 * The app's CSS for drawing `page` outside the document: every rule it
 * loaded, and the fonts the page uses read in as data. Other fonts are left
 * out, so a page without Urdu doesn't carry the Urdu font.
 */
export async function pageCss(page: HTMLElement): Promise<string> {
  const rules = Array.from(document.styleSheets).flatMap(rulesOf);
  const families = familiesIn(page);
  const faces = rules.filter(
    (rule): rule is CSSFontFaceRule =>
      rule instanceof CSSFontFaceRule &&
      familyNames(rule.style.getPropertyValue('font-family')).some((name) =>
        families.has(name),
      ),
  );
  const fonts = await Promise.all(faces.map(embedded));
  const others = rules
    .filter((rule) => !(rule instanceof CSSFontFaceRule))
    .map((rule) => rule.cssText);
  return [...fonts, ...others].join('\n');
}
