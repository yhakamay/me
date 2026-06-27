/**
 * Format an ISO date string for display. Returns an empty string for
 * unparseable input so callers can render it without guarding themselves.
 */
export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" }
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", options);
}
