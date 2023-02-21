export function formatDateLong(date: Date): string {
  const month = date.toLocaleString('UTC', { month: 'long', timeZone: 'UTC' });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}
