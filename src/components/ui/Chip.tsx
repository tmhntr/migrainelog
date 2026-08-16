import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Selected fill. Defaults to the accent; event views pass their own tone. */
  tint?: string;
  /** Content colour paired with `tint`. */
  tintInk?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * One pill, three former implementations. Category, filter, and symptom
 * pickers all rendered near-identical chips with slightly different padding
 * and radii; they now share this.
 *
 * Selection is carried by fill *and* border weight, so it survives being
 * viewed in greyscale or by someone who cannot separate the two hues.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  tint,
  tintInk,
  style,
}: ChipProps): React.JSX.Element {
  const theme = useTheme();

  const fill = tint ?? theme.colors.accent;
  const ink = tintInk ?? theme.colors.accentInk;

  const content = (
    <Text variant="label" color={selected ? ink : theme.colors.inkMuted}>
      {label}
    </Text>
  );

  const box: StyleProp<ViewStyle> = [
    {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.sm,
      borderRadius: theme.radius.pill,
      borderWidth: selected ? theme.border.thick : theme.border.hairline,
      borderColor: selected ? fill : theme.colors.border,
      backgroundColor: selected ? fill : theme.colors.surface,
    },
    disabled && { opacity: 0.6 },
    style,
  ];

  if (onPress === undefined || disabled) {
    return <View style={box}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [box, pressed && { opacity: 0.75 }]}
    >
      {content}
    </Pressable>
  );
}
