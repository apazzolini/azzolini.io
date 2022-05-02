export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);

  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}
