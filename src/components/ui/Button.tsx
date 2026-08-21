import React from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Fills the width of its container — the default for form actions. */
  block?: boolean;
  /** Overrides the variant fill, for type-coloured actions. */
  tint?: string;
  /** Content colour paired with `tint`. */
  tintInk?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  tint,
  tintInk,
  disabled = false,
  style,
  ...rest
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();

  const fills: Record<ButtonVariant, { background: string; ink: string; border: string }> = {
    primary: {
      background: theme.colors.accent,
      ink: theme.colors.accentInk,
      border: theme.colors.accent,
    },
    secondary: {
      background: theme.colors.surface,
      ink: theme.colors.ink,
      border: theme.colors.borderStrong,
    },
    ghost: {
      background: 'transparent',
      ink: theme.colors.accent,
      border: 'transparent',
    },
    danger: {
      background: theme.colors.danger,
      ink: theme.colors.dangerInk,
      border: theme.colors.danger,
    },
  };

  const fill = fills[variant];
  const background = tint ?? fill.background;
  const ink = tintInk ?? (tint !== undefined ? theme.colors.accentInk : fill.ink);
  const borderColor = tint ?? fill.border;

  const height = size === 'lg' ? 56 : theme.minTouchTarget;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      disabled={disabled === true}
      style={({ pressed }) => [
        {
          minHeight: height,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.sm,
          paddingHorizontal: size === 'lg' ? theme.space.xxl : theme.space.xl,
          borderRadius: theme.radius.sm,
          borderWidth: theme.border.hairline,
          backgroundColor: background,
          borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        block && { flex: 1 },
        style,
      ]}
      {...rest}
    >
      {icon !== undefined && (
        <MaterialIcons name={icon} size={size === 'lg' ? 22 : 20} color={ink} />
      )}
      <Text variant={size === 'lg' ? 'heading' : 'bodyStrong'} color={ink}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Lays actions out in a row with the standard gap. */
export function ButtonRow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: theme.space.md }, style]}>{children}</View>
  );
}
