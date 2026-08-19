import React from 'react';
import { View } from 'react-native';

import { useDatabase } from '../../../hooks/use-database';
import { usePreferenceStore } from '../../../stores/preference-store';
import { THEME_PREFERENCES, useTheme, type ThemePreference } from '../../../theme';
import { Chip, Surface, Text } from '../../../components/ui';
import { OnboardingFrame } from '../OnboardingFrame';

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
};

/**
 * The only setting worth interrupting for. Forcing dark independently of the
 * OS is an accessibility need here, not a cosmetic toggle — and the moment a
 * photophobic user most needs it is the moment they are least able to go
 * hunting for it in Settings.
 *
 * Choosing writes through immediately, so the whole app repaints underneath
 * the frame: the choice is previewed rather than promised.
 */
export function ComfortFrame(): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const themePreference = usePreferenceStore((s) => s.themePreference);
  const setThemePreference = usePreferenceStore((s) => s.setThemePreference);

  return (
    <OnboardingFrame
      eyebrow="One setting"
      headline="Set the brightness now, not mid-attack."
    >
      <Surface style={{ gap: theme.space.md }}>
        <Text variant="caption" tone="faint" uppercase>
          Appearance
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
          {THEME_PREFERENCES.map((option) => (
            <Chip
              key={option}
              label={THEME_LABELS[option]}
              selected={themePreference === option}
              onPress={() => {
                void setThemePreference(db, option);
              }}
            />
          ))}
        </View>
      </Surface>

      <Text variant="body" tone="muted">
        Dark keeps the screen dim during an attack even when the rest of your
        phone is in light mode. Tap one to see it — the whole app changes with it.
      </Text>

      <Text variant="label" tone="faint">
        Changeable any time in Settings &rarr; Appearance.
      </Text>
    </OnboardingFrame>
  );
}
