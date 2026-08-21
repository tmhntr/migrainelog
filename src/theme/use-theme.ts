import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { buildTheme, type Theme } from './theme';
import type { ColorScheme } from './palette';

/**
 * `system` follows the OS. The explicit overrides exist because following the
 * OS is not good enough here: someone can need the dark presentation in a lit
 * room mid-attack without wanting their whole phone in dark mode.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = [
  'system',
  'light',
  'dark',
] as const;

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    value === 'system' || value === 'light' || value === 'dark'
  );
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Resolved from persisted settings; defaults to following the OS. */
  preference?: ThemePreference;
}

export function ThemeProvider({
  children,
  preference = 'system',
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const theme = useMemo(() => {
    const resolved: ColorScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return buildTheme(resolved);
  }, [preference, systemScheme]);

  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

type NamedStyles<T> = { [P in keyof T]: object };

/**
 * Builds a themed stylesheet, rebuilding only when the scheme changes.
 *
 * `factory` must be defined at module scope — it is intentionally excluded
 * from the memo dependencies, since an inline arrow would be a new identity on
 * every render and defeat the cache.
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T & NamedStyles<T>,
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
