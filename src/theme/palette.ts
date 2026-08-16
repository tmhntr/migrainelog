import type { EventType, RiskLabel } from '../models/event';

/**
 * Colour roles, defined twice — once per scheme. Components consume role names
 * (`ink`, `surface`, `accent`) and never literal hex, so a scheme swap is total.
 *
 * Two constraints shape every value here, both driven by who uses this app and
 * when: someone photophobic, often mid-attack, often in a dark room.
 *
 *  1. No pure white and no pure black. Light grounds on warm paper rather than
 *     #FFFFFF, which is the single brightest thing a phone can emit. Dark
 *     grounds on #0F1013 rather than #000, which smears on OLED while
 *     scrolling and pushes contrast past comfortable.
 *  2. Nothing is fully saturated. The risk ramp in particular gets *warmer and
 *     darker* as it climbs, never brighter — the usual "danger is a bright red
 *     alert" convention aims maximum glare at the reader at precisely the
 *     moment they can least tolerate it.
 */

export type ColorScheme = 'light' | 'dark';

export interface RiskColors {
  /** Fill for the gauge band and severity indicators. */
  base: string;
  /** Text/iconography sitting on top of `base`. */
  on: string;
  /** Low-emphasis tinted background carrying the same meaning. */
  soft: string;
}

export interface ColorRoles {
  /** Page ground. */
  background: string;
  /** Cards, panels, list rows. */
  surface: string;
  /** Surfaces that sit above other surfaces — dialogs, sheets. */
  surfaceRaised: string;
  /** Pressed/hover wash over a surface. */
  surfaceSunken: string;

  border: string;
  borderStrong: string;

  /** Primary reading colour. */
  ink: string;
  /** Secondary copy, supporting values. */
  inkMuted: string;
  /** Timestamps, placeholders, disabled text. */
  inkFaint: string;

  accent: string;
  /** Text/icons on top of `accent`. */
  accentInk: string;
  /** Tinted accent background for selected states. */
  accentSoft: string;

  /** Destructive actions. Muted; this app deletes health records, not files. */
  danger: string;
  dangerInk: string;
  dangerSoft: string;

  /** Modal scrim. */
  overlay: string;

  risk: Record<RiskLabel, RiskColors>;
  event: Record<EventType, RiskColors>;
}

const lightRisk: Record<RiskLabel, RiskColors> = {
  low: { base: '#5B7A6E', on: '#F4F6F4', soft: '#E3EAE6' },
  moderate: { base: '#8A8352', on: '#F7F6F1', soft: '#EDEBDF' },
  high: { base: '#A6714E', on: '#FAF5F1', soft: '#F1E5DC' },
  critical: { base: '#9E5259', on: '#FAF3F3', soft: '#F0DFE0' },
};

const darkRisk: Record<RiskLabel, RiskColors> = {
  low: { base: '#7FA394', on: '#101714', soft: '#1B2723' },
  moderate: { base: '#B3AA73', on: '#17160F', soft: '#272517' },
  high: { base: '#C89470', on: '#1A120C', soft: '#2B1F16' },
  critical: { base: '#C4787F', on: '#180F10', soft: '#2B1B1D' },
};

/**
 * Event types borrow from the risk ramp so the two languages agree: a trigger
 * always reads ochre, an episode always rose, a treatment always slate.
 */
const lightEvent: Record<EventType, RiskColors> = {
  trigger: lightRisk.moderate,
  episode: lightRisk.critical,
  treatment: { base: '#4A5A7A', on: '#F3F5F9', soft: '#E2E7EF' },
};

const darkEvent: Record<EventType, RiskColors> = {
  trigger: darkRisk.moderate,
  episode: darkRisk.critical,
  treatment: { base: '#8FA3C8', on: '#111419', soft: '#1E2430' },
};

const light: ColorRoles = {
  background: '#F2F0EC',
  surface: '#FAF8F5',
  surfaceRaised: '#FDFCFA',
  surfaceSunken: '#E8E5DF',

  border: '#DFDBD3',
  borderStrong: '#C6C1B7',

  ink: '#232227',
  inkMuted: '#605D68',
  inkFaint: '#8B8794',

  accent: '#4A5A7A',
  accentInk: '#F3F5F9',
  accentSoft: '#E2E7EF',

  danger: '#9E5259',
  dangerInk: '#FAF3F3',
  dangerSoft: '#F0DFE0',

  overlay: 'rgba(28, 26, 32, 0.42)',

  risk: lightRisk,
  event: lightEvent,
};

const dark: ColorRoles = {
  background: '#0F1013',
  surface: '#191A1F',
  surfaceRaised: '#212229',
  surfaceSunken: '#101115',

  border: '#2C2D35',
  borderStrong: '#3E3F49',

  ink: '#E4E2E6',
  inkMuted: '#9C99A5',
  inkFaint: '#6E6B78',

  accent: '#8FA3C8',
  accentInk: '#111419',
  accentSoft: '#1E2430',

  danger: '#C4787F',
  dangerInk: '#180F10',
  dangerSoft: '#2B1B1D',

  overlay: 'rgba(0, 0, 0, 0.62)',

  risk: darkRisk,
  event: darkEvent,
};

export const palettes: Record<ColorScheme, ColorRoles> = { light, dark };

/** Maps a 0–1 severity ratio onto the shared four-step ramp. */
export function ratioToRiskLabel(ratio: number): RiskLabel {
  if (ratio <= 0.3) return 'low';
  if (ratio <= 0.6) return 'moderate';
  if (ratio <= 0.8) return 'high';
  return 'critical';
}

/**
 * Severity scales differ per event type (triggers 1–5, episodes 1–10), so
 * callers normalise before asking for a colour.
 */
export function severityColors(
  colors: ColorRoles,
  value: number,
  min: number,
  max: number,
): RiskColors {
  const span = max - min;
  const ratio = span === 0 ? 0 : (value - min) / span;
  return colors.risk[ratioToRiskLabel(ratio)];
}
