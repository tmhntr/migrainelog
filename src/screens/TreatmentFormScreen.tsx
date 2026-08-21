import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { TreatmentFormScreenProps } from '../navigation/types';
import type { TreatmentType } from '../models/treatment';
import { TREATMENT_TYPES } from '../models/treatment';
import { useDatabase } from '../hooks/use-database';
import { useTreatmentStore } from '../stores/treatment-store';
import { CategoryPicker } from '../components/CategoryPicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { Button, Field, Input, Screen } from '../components/ui';
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
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit treatment' : 'New treatment',
    });
  }, [navigation, editId]);

  const handleSubmit = async (): Promise<void> => {
    if (submitting) return;

    // Inline rather than an alert: the error belongs next to the field it is about.
    if (!name.trim()) {
      setNameError('Give the treatment a name so you can recognise it later.');
      return;
    }
    setNameError(undefined);

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
        navigation.goBack();
      } else {
        // A new entry opens onto its own detail screen. Replacing rather than
        // pushing keeps the back arrow pointing at the list, not a spent form.
        const created = await store.add(db, data);
        navigation.replace('TreatmentDetail', { id: created.id });
      }
    } catch (error) {
      Alert.alert('Could not save', 'The treatment was not saved. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll gutter>
      <Field label="Type">
        <CategoryPicker
          categories={TREATMENT_TYPES}
          value={type}
          onChange={(val) => setType(val as TreatmentType)}
        />
      </Field>

      <Field label="Name" error={nameError}>
        <Input
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError !== undefined) setNameError(undefined);
          }}
          placeholder="e.g. Ibuprofen 400mg"
        />
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
        label={submitting ? 'Saving' : editId ? 'Save changes' : 'Save treatment'}
        size="lg"
        onPress={handleSubmit}
        disabled={submitting}
      />
    </Screen>
  );
}
