import {
  formatISO,
  parseISO,
  hoursBetween,
  getWindowStart,
  formatRelativeTime,
} from '../date-helpers';

describe('formatISO', () => {
  it('returns an ISO-8601 string', () => {
    const date = new Date('2024-06-15T10:30:00.000Z');
    expect(formatISO(date)).toBe('2024-06-15T10:30:00.000Z');
  });

  it('handles epoch date', () => {
    const date = new Date(0);
    expect(formatISO(date)).toBe('1970-01-01T00:00:00.000Z');
  });
});

describe('parseISO', () => {
  it('parses a valid ISO-8601 string', () => {
    const iso = '2024-06-15T10:30:00.000Z';
    const date = parseISO(iso);
    expect(date.getTime()).toBe(new Date(iso).getTime());
  });

  it('throws on invalid string', () => {
    expect(() => parseISO('not-a-date')).toThrow('Invalid ISO-8601 string');
  });

  it('throws on empty string', () => {
    expect(() => parseISO('')).toThrow('Invalid ISO-8601 string');
  });
});

describe('hoursBetween', () => {
  it('calculates hours between two ISO strings', () => {
    const from = '2024-06-15T10:00:00.000Z';
    const to = '2024-06-15T13:00:00.000Z';
    expect(hoursBetween(from, to)).toBe(3);
  });

  it('returns absolute difference regardless of order', () => {
    const a = '2024-06-15T10:00:00.000Z';
    const b = '2024-06-15T13:00:00.000Z';
    expect(hoursBetween(a, b)).toBe(hoursBetween(b, a));
  });

  it('accepts Date objects', () => {
    const from = new Date('2024-06-15T10:00:00.000Z');
    const to = new Date('2024-06-15T16:00:00.000Z');
    expect(hoursBetween(from, to)).toBe(6);
  });

  it('accepts mixed string and Date', () => {
    const from = '2024-06-15T10:00:00.000Z';
    const to = new Date('2024-06-15T12:30:00.000Z');
    expect(hoursBetween(from, to)).toBe(2.5);
  });

  it('returns 0 for same date', () => {
    const iso = '2024-06-15T10:00:00.000Z';
    expect(hoursBetween(iso, iso)).toBe(0);
  });

  it('handles fractional hours', () => {
    const from = '2024-06-15T10:00:00.000Z';
    const to = '2024-06-15T10:30:00.000Z';
    expect(hoursBetween(from, to)).toBe(0.5);
  });
});

describe('getWindowStart', () => {
  it('returns an ISO string approximately hours ago', () => {
    const before = Date.now() - 24 * 60 * 60 * 1000;
    const result = parseISO(getWindowStart(24));
    const after = Date.now() - 24 * 60 * 60 * 1000;
    expect(result.getTime()).toBeGreaterThanOrEqual(before - 50);
    expect(result.getTime()).toBeLessThanOrEqual(after + 50);
  });

  it('returns current time for 0 hours', () => {
    const before = Date.now();
    const result = parseISO(getWindowStart(0));
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before - 50);
    expect(result.getTime()).toBeLessThanOrEqual(after + 50);
  });

  it('returns a valid ISO string', () => {
    const result = getWindowStart(48);
    expect(() => parseISO(result)).not.toThrow();
  });
});

describe('formatRelativeTime', () => {
  function isoAgo(ms: number): string {
    return new Date(Date.now() - ms).toISOString();
  }

  it('returns "just now" for timestamps less than 60 seconds ago', () => {
    expect(formatRelativeTime(isoAgo(10 * 1000))).toBe('just now');
  });

  it('returns "just now" for future timestamps', () => {
    const future = new Date(Date.now() + 60000).toISOString();
    expect(formatRelativeTime(future)).toBe('just now');
  });

  it('returns minutes ago', () => {
    expect(formatRelativeTime(isoAgo(5 * 60 * 1000))).toBe('5m ago');
  });

  it('returns hours ago', () => {
    expect(formatRelativeTime(isoAgo(2 * 60 * 60 * 1000))).toBe('2h ago');
  });

  it('returns days ago', () => {
    expect(formatRelativeTime(isoAgo(3 * 24 * 60 * 60 * 1000))).toBe('3d ago');
  });

  it('returns weeks ago', () => {
    expect(formatRelativeTime(isoAgo(14 * 24 * 60 * 60 * 1000))).toBe('2w ago');
  });

  it('returns months ago', () => {
    expect(formatRelativeTime(isoAgo(60 * 24 * 60 * 60 * 1000))).toBe('2mo ago');
  });

  it('returns years ago', () => {
    expect(formatRelativeTime(isoAgo(400 * 24 * 60 * 60 * 1000))).toBe('1y ago');
  });

  it('handles exactly 1 minute ago', () => {
    expect(formatRelativeTime(isoAgo(60 * 1000))).toBe('1m ago');
  });

  it('handles exactly 1 hour ago', () => {
    expect(formatRelativeTime(isoAgo(60 * 60 * 1000))).toBe('1h ago');
  });

  it('handles exactly 1 day ago', () => {
    expect(formatRelativeTime(isoAgo(24 * 60 * 60 * 1000))).toBe('1d ago');
  });
});
