import React from 'react';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

export interface FabProps {
  onPress: () => void;
  /** Spoken by screen readers — the glyph alone says nothing. */
  accessibilityLabel: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

/**
 * Floating add action. Sized well past the touch-target floor and tinted with
 * the accent rather than a saturated fill, so it stays findable without
 * dominating a list that is mostly quiet.
 */
export function Fab({
  onPress,
  accessibilityLabel,
  icon = 'add',
}: FabProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: theme.space.lg,
          bottom: theme.space.lg,
          width: 60,
          height: 60,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.accent,
          borderWidth: theme.border.hairline,
          borderColor: theme.colors.accent,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <MaterialIcons name={icon} size={28} color={theme.colors.accentInk} />
    </Pressable>
  );
}
