import React from 'react';
import {
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme';
import { Text } from './Text';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wraps content in a ScrollView. Off for screens owning a FlatList. */
  scroll?: boolean;
  /** Applies the standard horizontal gutter to the content. */
  gutter?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

/** Owns the page ground so no screen sets a background colour itself. */
export function Screen({
  children,
  scroll = false,
  gutter = false,
  contentContainerStyle,
  style,
}: ScreenProps): React.JSX.Element {
  const theme = useTheme();

  const background: StyleProp<ViewStyle> = [
    { flex: 1, backgroundColor: theme.colors.background },
    style,
  ];

  const content: StyleProp<ViewStyle> = [
    {
      paddingVertical: theme.space.lg,
      gap: theme.space.xl,
    },
    gutter && { paddingHorizontal: theme.space.lg },
    contentContainerStyle,
  ];

  if (!scroll) {
    return <View style={[background, content]}>{children}</View>;
  }

  return (
    <ScrollView
      style={background}
      contentContainerStyle={content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
  /** Indents the heading to line up with gutter-inset content. */
  gutter?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Section({
  title,
  children,
  gutter = true,
  style,
}: SectionProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.space.md }, style]}>
      {title !== undefined && (
        <Text
          variant="caption"
          tone="faint"
          uppercase
          style={gutter ? { marginHorizontal: theme.space.lg } : undefined}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
