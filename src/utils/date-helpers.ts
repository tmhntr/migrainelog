export function formatISO(date: Date): string {
  return date.toISOString();
}

export function parseISO(iso: string): Date {
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO-8601 string: ${iso}`);
  }
  return date;
}

export function hoursBetween(from: string | Date, to: string | Date): number {
  const fromDate = typeof from === 'string' ? parseISO(from) : from;
  const toDate = typeof to === 'string' ? parseISO(to) : to;
  const diffMs = Math.abs(toDate.getTime() - fromDate.getTime());
  return diffMs / (1000 * 60 * 60);
}

export function getWindowStart(hours: number): string {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return formatISO(start);
}

export function formatRelativeTime(iso: string): string {
  const date = parseISO(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffWeeks < 5) {
    return `${diffWeeks}w ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }
  return `${diffYears}y ago`;
}
