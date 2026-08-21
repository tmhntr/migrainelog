import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme';
import { Text } from '../../components/ui';

export interface OnboardingFrameProps {
  /** Small tracked label above the headline. */
  eyebrow?: string;
  headline: string;
  /** Centres the whole frame vertically — used by the first and last. */
  center?: boolean;
  children?: React.ReactNode;
}

/**
 * The common shell for every onboarding frame: eyebrow, headline, body. The
 * pager owns the chrome above and below it, so a frame only describes its own
 * content and never its navigation.
 */
export function OnboardingFrame({
  eyebrow,
  headline,
  center = false,
  children,
}: OnboardingFrameProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: center ? 'center' : 'flex-start',
        paddingHorizontal: theme.space.lg,
        paddingTop: center ? 0 : theme.space.md,
        paddingBottom: center ? theme.space.xxl : 0,
        gap: theme.space.lg,
      }}
    >
      <View style={{ gap: theme.space.sm }}>
        {eyebrow !== undefined && (
          <Text variant="caption" tone="faint" uppercase>
            {eyebrow}
          </Text>
        )}
        <Text variant="title">{headline}</Text>
      </View>
      {children}
    </View>
  );
}

export interface FramePointsProps {
  children: React.ReactNode[];
}

/**
 * Hairline-separated points. A disclaimer set as one grey paragraph is a
 * disclaimer nobody reads, so the claims are broken apart and given room.
 */
export function FramePoints({ children }: FramePointsProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View>
      {React.Children.map(children, (child, index) => (
        <View
          style={{
            flexDirection: 'row',
            gap: theme.space.md,
            paddingVertical: theme.space.md,
            borderTopWidth: theme.border.hairline,
            borderTopColor: theme.colors.border,
          }}
        >
          <View
            style={{
              width: 5,
              height: 5,
              marginTop: 8,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.inkFaint,
            }}
            // The bullet is decoration; VoiceOver reads the sentence beside it.
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View style={{ flex: 1 }} key={index}>
            {child}
          </View>
        </View>
      ))}
    </View>
  );
}
