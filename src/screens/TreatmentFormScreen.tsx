import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import type { TreatmentFormScreenProps } from '../navigation/types';
import type { TreatmentType } from '../models/treatment';
import { TREATMENT_TYPES } from '../models/treatment';
import { useDatabase } from '../hooks/use-database';
import { useTreatmentStore } from '../stores/treatment-store';
import { CategoryPicker } from '../components/CategoryPicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { formatISO, parseISO } from '../utils/date-helpers';

export function TreatmentFormScreen({
  navigation,
  route,
}: TreatmentFormScreenProps): React.JSX.Element {
  const db = useDatabase();
  const store = useTreatmentStore();
  const editId = route.params?.id;

  const existing = useMemo(() => {
    if (!editId) return null;
    return store.treatments.find((t) => t.id === editId) ?? null;
  }, [editId, store.treatments]);

  const [type, setType] = useState<TreatmentType>(
    existing?.type ?? 'medication'
  );
  const [name, setName] = useState<string>(existing?.name ?? '');
  const [timestamp, setTimestamp] = useState<Date>(
    existing ? parseISO(existing.timestamp) : new Date()
  );
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit Treatment' : 'New Treatment',
    });
  }, [navigation, editId]);

  const handleSubmit = async (): Promise<void> => {
    if (submitting) return;

    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a treatment name.');
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        type,
        name: name.trim(),
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
      Alert.alert('Error', 'Failed to save treatment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Type</Text>
      <CategoryPicker
        categories={TREATMENT_TYPES}
        value={type}
        onChange={(val) => setType(val as TreatmentType)}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.textInputSingle}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Ibuprofen 400mg"
        placeholderTextColor="#999999"
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
          {submitting
            ? 'Saving...'
            : editId
              ? 'Update Treatment'
              : 'Save Treatment'}
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
