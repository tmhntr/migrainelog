import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { TriggerFormScreenProps } from '../navigation/types';
import type { TriggerCategory } from '../models/trigger';
import { TRIGGER_CATEGORIES } from '../models/trigger';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { CategoryPicker } from '../components/CategoryPicker';
import { SeveritySlider } from '../components/SeveritySlider';
import { DateTimePicker } from '../components/DateTimePicker';
import { formatISO, parseISO } from '../utils/date-helpers';

export function TriggerFormScreen({
  navigation,
  route,
}: TriggerFormScreenProps): React.JSX.Element {
  const db = useDatabase();
  const store = useTriggerStore();
  const editId = route.params?.id;

  const existing = useMemo(() => {
    if (!editId) return null;
    return store.triggers.find((t) => t.id === editId) ?? null;
  }, [editId, store.triggers]);

  const [category, setCategory] = useState<TriggerCategory>(
    existing?.category ?? 'stress'
  );
  const [severity, setSeverity] = useState<number>(existing?.severity ?? 3);
  const [timestamp, setTimestamp] = useState<Date>(
    existing ? parseISO(existing.timestamp) : new Date()
  );
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit Trigger' : 'New Trigger',
    });
  }, [navigation, editId]);

  const handleSubmit = async (): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const data = {
        category,
        severity,
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
      Alert.alert('Error', 'Failed to save trigger. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Category</Text>
      <CategoryPicker
        categories={TRIGGER_CATEGORIES}
        value={category}
        onChange={(val) => setCategory(val as TriggerCategory)}
      />

      <Text style={styles.label}>Severity</Text>
      <SeveritySlider value={severity} onChange={setSeverity} min={1} max={5} />

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
          {submitting ? 'Saving...' : editId ? 'Update Trigger' : 'Save Trigger'}
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
