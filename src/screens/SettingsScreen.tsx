import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

import type { SettingsScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { useEpisodeStore } from '../stores/episode-store';
import { useTreatmentStore } from '../stores/treatment-store';
import { useRiskStore } from '../stores/risk-store';
import { usePreferenceStore } from '../stores/preference-store';
import { THEME_PREFERENCES, useTheme, type ThemePreference } from '../theme';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Button, Chip, Screen, Section, Surface, Text } from '../components/ui';

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
};

export function SettingsScreen(_props: SettingsScreenProps) {
  const theme = useTheme();
  const db = useDatabase();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const themePreference = usePreferenceStore((s) => s.themePreference);
  const setThemePreference = usePreferenceStore((s) => s.setThemePreference);

  const handleClearData = useCallback(async () => {
    setConfirmVisible(false);

    await db.runAsync('DELETE FROM triggers');
    await db.runAsync('DELETE FROM episodes');
    await db.runAsync('DELETE FROM treatments');

    useTriggerStore.setState({ triggers: [] });
    useEpisodeStore.setState({ episodes: [] });
    useTreatmentStore.setState({ treatments: [] });

    await useRiskStore.getState().recalculate(db);
  }, [db]);

  return (
    <Screen scroll>
      <Section title="Appearance">
        <Surface inset style={{ gap: theme.space.md }}>
          <Text variant="label" tone="muted">
            Dark keeps the screen dim during an attack, even when the rest of
            your phone is in light mode.
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
      </Section>

      <Section title="About">
        <Surface inset style={{ gap: theme.space.xs }}>
          <Text variant="title">MigraineLog</Text>
          <Text variant="data" tone="faint">
            Version 1.0.0
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.space.sm }}>
            Track your migraine triggers, episodes, and treatments. All data is
            stored locally on your device.
          </Text>
        </Surface>
      </Section>

      <Section title="Data">
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <Button
            label="Clear all data"
            variant="secondary"
            tintInk={theme.colors.danger}
            onPress={() => setConfirmVisible(true)}
          />
        </View>
      </Section>

      <Section title="Medical Disclaimer">
        <Surface inset>
          <Text variant="label" tone="muted">
            MigraineLog is a personal tracking tool. It does not diagnose, treat, or
            prevent any medical condition, and it does not predict migraines. Consult a
            qualified healthcare provider for medical advice.
          </Text>
        </Surface>
      </Section>

      <ConfirmDialog
        visible={confirmVisible}
        title="Clear all data?"
        message="This permanently deletes every trigger, episode, and treatment you have logged. It cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={handleClearData}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
