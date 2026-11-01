/** "Imran Qureshi" -> "IQ". */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** "Dr. Ayesha Siddiqui" -> "Ayesha". Empty when there is no name. */
export function firstName(fullName: string): string {
  return (
    fullName
      .replace(/^Dr\.?\s*/i, '')
      .trim()
      .split(/\s+/)[0] ?? ''
  );
}

/** "MBBS, FCPS (Medicine)" -> ["MBBS", "FCPS (Medicine)"]. */
export function splitList(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "Dr. Ayesha Siddiqui" -> "A. Siddiqui", the typed signature on a printout. */
export function signatureName(fullName: string): string {
  const parts = fullName
    .replace(/^Dr\.?\s*/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

/** Adds "Dr." unless the name already has it. */
export function doctorTitle(fullName: string): string {
  const name = fullName.trim();
  return !name || /^Dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}
