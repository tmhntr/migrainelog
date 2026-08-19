import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import type { EpisodeFormScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useEpisodeStore } from '../stores/episode-store';
import { useTheme } from '../theme';
import { SeveritySlider } from '../components/SeveritySlider';
import { SymptomPicker } from '../components/SymptomPicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { Button, Field, Input, Screen, Surface, Text } from '../components/ui';
import { formatISO, parseISO } from '../utils/date-helpers';

export function EpisodeFormScreen({
  navigation,
  route,
}: EpisodeFormScreenProps): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const store = useEpisodeStore();
  const editId = route.params?.id;

  const existing = useMemo(() => {
    if (!editId) return null;
    return store.episodes.find((e) => e.id === editId) ?? null;
  }, [editId, store.episodes]);

  const [severity, setSeverity] = useState<number>(existing?.severity ?? 5);
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [aura, setAura] = useState<boolean>(existing?.aura ?? false);
  const [durationText, setDurationText] = useState<string>(
    existing?.durationMinutes != null ? String(existing.durationMinutes) : ''
  );
  const [timestamp, setTimestamp] = useState<Date>(
    existing ? parseISO(existing.timestamp) : new Date()
  );
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit episode' : 'New episode',
    });
  }, [navigation, editId]);

  const handleSubmit = async (): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const parsedDuration = durationText.trim()
        ? parseInt(durationText.trim(), 10)
        : null;

      const data = {
        severity,
        symptoms,
        aura,
        durationMinutes:
          parsedDuration !== null && !isNaN(parsedDuration)
            ? parsedDuration
            : null,
        timestamp: formatISO(timestamp),
        notes: notes.trim() || null,
      };

      if (editId) {
        await store.update(db, editId, data);
        navigation.goBack();
      } else {
        // A new entry opens onto its own detail screen. Replacing rather than
        // pushing keeps the back arrow pointing at the list, not a spent form.
        const created = await store.add(db, data);
        navigation.replace('EpisodeDetail', { id: created.id });
      }
    } catch (error) {
      Alert.alert('Could not save', 'The episode was not saved. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll gutter>
      <Field label="Severity" hint="1 is mild, 10 is the worst you have had.">
        <SeveritySlider value={severity} onChange={setSeverity} min={1} max={10} />
      </Field>

      <Field label="Symptoms">
        <SymptomPicker selected={symptoms} onChange={setSymptoms} />
      </Field>

      <Surface style={{ paddingVertical: theme.space.md }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong">Aura</Text>
            <Text variant="label" tone="faint">
              Visual or sensory changes before the pain
            </Text>
          </View>
          <Switch
            value={aura}
            onValueChange={setAura}
            accessibilityLabel="Aura"
            trackColor={{
              false: theme.colors.borderStrong,
              true: theme.colors.accent,
            }}
            thumbColor={theme.colors.surfaceRaised}
          />
        </View>
      </Surface>

      <Field label="Duration" hint="In minutes. Leave blank if it is still going.">
        <Input
          value={durationText}
          onChangeText={setDurationText}
          placeholder="60"
          keyboardType="numeric"
        />
      </Field>

      <Field label="When it started">
        <DateTimePicker value={timestamp} onChange={setTimestamp} />
      </Field>

      <Field label="Notes">
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything worth remembering later"
          multiline
        />
      </Field>

      <Button
        label={submitting ? 'Saving' : editId ? 'Save changes' : 'Save episode'}
        size="lg"
        onPress={handleSubmit}
        disabled={submitting}
      />
    </Screen>
  );
}
