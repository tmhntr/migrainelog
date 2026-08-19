import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';
import { FramePoints, OnboardingFrame } from '../OnboardingFrame';

export interface DisclaimerFrameProps {
  acknowledged: boolean;
  onToggle: () => void;
}

/**
 * The one frame that cannot be skipped. Its three claims match
 * `SettingsScreen`'s disclaimer in substance so the two cannot drift; the
 * emphasis falls on the two *nots*, which is where a skimming eye lands.
 */
export function DisclaimerFrame({
  acknowledged,
  onToggle,
}: DisclaimerFrameProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <OnboardingFrame
      eyebrow="Before you start"
      headline="This is a notebook, not a diagnosis."
    >
      <FramePoints>
        <Text variant="body" tone="muted">
          It does <Text variant="bodyStrong">not</Text> diagnose, treat, or
          prevent any medical condition.
        </Text>
        <Text variant="body" tone="muted">
          It does <Text variant="bodyStrong">not</Text> predict migraines. The
          risk number summarises what you have already logged.
        </Text>
        <Text variant="body" tone="muted">
          Nothing here replaces advice from a clinician. Bringing your log to one
          is exactly what it is for.
        </Text>
      </FramePoints>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acknowledged }}
        accessibilityLabel="I understand"
        onPress={onToggle}
        style={({ pressed }) => [
          {
            minHeight: theme.minTouchTarget,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.md,
            padding: theme.space.md,
            borderRadius: theme.radius.md,
            borderWidth: acknowledged ? theme.border.thick : theme.border.hairline,
            borderColor: acknowledged ? theme.colors.accent : theme.colors.borderStrong,
            backgroundColor: acknowledged
              ? theme.colors.accentSoft
              : theme.colors.surface,
          },
          pressed && { opacity: 0.75 },
        ]}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: theme.radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: theme.border.hairline,
            borderColor: acknowledged ? theme.colors.accent : theme.colors.borderStrong,
            backgroundColor: acknowledged ? theme.colors.accent : 'transparent',
          }}
        >
          {acknowledged && (
            <MaterialIcons name="check" size={16} color={theme.colors.accentInk} />
          )}
        </View>
        <Text
          variant="bodyStrong"
          color={acknowledged ? theme.colors.accent : theme.colors.inkMuted}
        >
          I understand
        </Text>
      </Pressable>
    </OnboardingFrame>
  );
}
