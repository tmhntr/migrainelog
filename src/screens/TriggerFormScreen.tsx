import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { TriggerFormScreenProps } from '../navigation/types';
import type { TriggerCategory } from '../models/trigger';
import { TRIGGER_CATEGORIES } from '../models/trigger';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { CategoryPicker } from '../components/CategoryPicker';
import { SeveritySlider } from '../components/SeveritySlider';
import { DateTimePicker } from '../components/DateTimePicker';
import { Button, Field, Input, Screen } from '../components/ui';
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
      title: editId ? 'Edit trigger' : 'New trigger',
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
      Alert.alert('Could not save', 'The trigger was not saved. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll gutter>
      <Field label="Category">
        <CategoryPicker
          categories={TRIGGER_CATEGORIES}
          value={category}
          onChange={(val) => setCategory(val as TriggerCategory)}
        />
      </Field>

      <Field label="Severity" hint="1 is barely noticeable, 5 is intense.">
        <SeveritySlider value={severity} onChange={setSeverity} min={1} max={5} />
      </Field>

      <Field label="When">
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
        label={submitting ? 'Saving' : editId ? 'Save changes' : 'Save trigger'}
        size="lg"
        onPress={handleSubmit}
        disabled={submitting}
      />
    </Screen>
  );
}
