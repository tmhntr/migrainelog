import type { TextStyle } from 'react-native';

/**
 * Raw, scheme-independent scales. Nothing here knows about light or dark —
 * see `palette.ts` for anything that varies by color scheme.
 */

/** 4pt base grid. Every margin, padding, and gap in the app comes from here. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/**
 * Minimum tappable edge. Larger than the 44pt platform floor: the app is used
 * one-handed mid-attack, when aim is poor.
 */
export const minTouchTarget = 48;

/** Border widths. The system leans on hairlines instead of drop shadows. */
export const border = {
  hairline: 1,
  thick: 2,
  /** Left rail on event cards — the type indicator. */
  rail: 3,
} as const;

export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

/**
 * Numeric styles use tabular figures so digits occupy a fixed advance width:
 * severity columns line up, and the risk score does not jitter when it
 * recalculates on an interval.
 */
const tabular: Pick<TextStyle, 'fontVariant'> = { fontVariant: ['tabular-nums'] };

export type TypeVariant =
  | 'display'
  | 'metric'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'data'
  | 'caption';

/**
 * A deliberately short scale — nine roles, no ad hoc sizes. `display` is set
 * light rather than bold: at 44pt a heavy weight reads as alarm, and the risk
 * readout should not shout at someone who is already in pain.
 */
export const type: Record<TypeVariant, TextStyle> = {
  display: { fontSize: 44, lineHeight: 48, fontWeight: '300', letterSpacing: -1, ...tabular },
  metric: { fontSize: 26, lineHeight: 30, fontWeight: '600', letterSpacing: -0.4, ...tabular },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  data: { fontSize: 13, lineHeight: 18, fontWeight: '500', ...tabular },
  /** The instrument-label voice: small, tracked out, uppercased at the call site. */
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.8 },
};
