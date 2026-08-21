import { palettes, type ColorRoles, type ColorScheme } from './palette';
import { border, duration, minTouchTarget, radius, space, type } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorRoles;
  space: typeof space;
  radius: typeof radius;
  border: typeof border;
  duration: typeof duration;
  type: typeof type;
  minTouchTarget: number;
}

const cache: Partial<Record<ColorScheme, Theme>> = {};

/**
 * Themes are immutable per scheme, so they are built once and shared. Identity
 * stability matters: `useThemedStyles` memoises on the theme object.
 */
export function buildTheme(scheme: ColorScheme): Theme {
  const cached = cache[scheme];
  if (cached) return cached;

  const theme: Theme = {
    scheme,
    colors: palettes[scheme],
    space,
    radius,
    border,
    duration,
    type,
    minTouchTarget,
  };

  cache[scheme] = theme;
  return theme;
}
