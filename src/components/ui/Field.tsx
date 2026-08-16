import React from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme';
import { Text } from './Text';

export interface FieldProps {
  label: string;
  /** Guidance shown under the control. Not an error — see `error`. */
  hint?: string;
  error?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A labelled form row. Labels use the tracked-out caption voice so they read
 * as instrument markings and stay clearly subordinate to the values.
 */
export function Field({
  label,
  hint,
  error,
  children,
  style,
}: FieldProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.space.sm }, style]}>
      <Text variant="caption" tone="faint" uppercase>
        {label}
      </Text>
      {children}
      {error !== undefined ? (
        <Text variant="label" tone="danger">
          {error}
        </Text>
      ) : hint !== undefined ? (
        <Text variant="label" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export interface InputProps extends TextInputProps {
  /** Grows to a comfortable multi-line height for notes. */
  multiline?: boolean;
}

export function Input({
  multiline = false,
  style,
  ...rest
}: InputProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.colors.inkFaint}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        theme.type.body,
        {
          color: theme.colors.ink,
          backgroundColor: theme.colors.surface,
          borderWidth: theme.border.hairline,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.md,
          minHeight: multiline ? 96 : theme.minTouchTarget,
        },
        style,
      ]}
      {...rest}
    />
  );
}
