/**
 * Returns the string in title case: first letter of each word capital, rest lowercase.
 * Used for patient name, address, location so they are saved and displayed consistently.
 */
export function toTitleCase(s: string | undefined | null): string {
  if (s == null || typeof s !== 'string') return ''
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
