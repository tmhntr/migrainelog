import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypeVariant } from '../../theme';

export type TextTone =
  | 'default'
  | 'muted'
  | 'faint'
  | 'accent'
  | 'danger'
  | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Tracks out and uppercases — pair with the `caption` variant. */
  uppercase?: boolean;
  /** Escape hatch for ramp colours that are not fixed roles (risk, severity). */
  color?: string;
}

/**
 * The only text component in the app. Every size, weight, and colour comes
 * from the scale, so there are no one-off `fontSize` values to drift.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  uppercase = false,
  color,
  style,
  children,
  ...rest
}: TextProps): React.JSX.Element {
  const theme = useTheme();

  const toneColor: Record<TextTone, string> = {
    default: theme.colors.ink,
    muted: theme.colors.inkMuted,
    faint: theme.colors.inkFaint,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    inverse: theme.colors.accentInk,
  };

  return (
    <RNText
      style={[
        theme.type[variant],
        { color: color ?? toneColor[tone] },
        uppercase && { textTransform: 'uppercase' },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
