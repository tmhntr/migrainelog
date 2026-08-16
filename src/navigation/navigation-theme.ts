import { DarkTheme, DefaultTheme, type Theme as NavTheme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import type { Theme } from '../theme';

/**
 * Bridges the design system into React Navigation, which owns the chrome we
 * do not render ourselves — headers, tab bar, and the flash of background
 * colour between screen transitions.
 */
export function buildNavigationTheme(theme: Theme): NavTheme {
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: theme.scheme === 'dark',
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.ink,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

/** Header styling shared by every stack. */
export function buildStackScreenOptions(theme: Theme): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.accent,
    headerTitleStyle: {
      ...theme.type.heading,
      color: theme.colors.ink,
    },
    // The header rule would otherwise be the only hard edge on the screen.
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };
}
