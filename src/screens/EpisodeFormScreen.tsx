import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { EpisodeFormScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useEpisodeStore } from '../stores/episode-store';
import { SeveritySlider } from '../components/SeveritySlider';
import { SymptomPicker } from '../components/SymptomPicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { formatISO, parseISO } from '../utils/date-helpers';

export function EpisodeFormScreen({
  navigation,
  route,
}: EpisodeFormScreenProps): React.JSX.Element {
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
      title: editId ? 'Edit Episode' : 'New Episode',
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
      } else {
        await store.add(db, data);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save episode. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Severity</Text>
      <SeveritySlider
        value={severity}
        onChange={setSeverity}
        min={1}
        max={10}
      />

      <Text style={styles.label}>Symptoms</Text>
      <SymptomPicker selected={symptoms} onChange={setSymptoms} />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Aura</Text>
        <Switch value={aura} onValueChange={setAura} />
      </View>

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        style={styles.textInputSingle}
        value={durationText}
        onChangeText={setDurationText}
        placeholder="e.g. 60"
        placeholderTextColor="#999999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Date & Time</Text>
      <DateTimePicker value={timestamp} onChange={setTimestamp} />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={styles.textInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes..."
        placeholderTextColor="#999999"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Saving...' : editId ? 'Update Episode' : 'Save Episode'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textInputSingle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333333',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333333',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
