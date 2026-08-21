import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import type { TreatmentDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTreatmentStore } from '../stores/treatment-store';
import { useTheme } from '../theme';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Button,
  ButtonRow,
  Chip,
  DetailRow,
  Divider,
  Screen,
  Surface,
  Text,
} from '../components/ui';
import { formatRelativeTime, parseISO } from '../utils/date-helpers';

/** `effective` is nullable by design — it is answered after the fact, not at log time. */
const EFFECTIVENESS_OPTIONS: { label: string; value: boolean | null }[] = [
  { label: 'It helped', value: true },
  { label: 'It did not', value: false },
  { label: 'Not sure yet', value: null },
];

export function TreatmentDetailScreen({
  navigation,
  route,
}: TreatmentDetailScreenProps): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const store = useTreatmentStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const treatment = useMemo(() => {
    return store.treatments.find((t) => t.id === id) ?? null;
  }, [id, store.treatments]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Treatment' });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('TreatmentForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not delete', 'The treatment was not deleted. Try again.');
    }
  };

  const handleSetEffective = async (value: boolean | null): Promise<void> => {
    try {
      await store.update(db, id, { effective: value });
    } catch (error) {
      Alert.alert('Could not save', 'That change was not saved. Try again.');
    }
  };

  if (!treatment) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" tone="faint">
            This treatment is no longer in your log.
          </Text>
        </View>
      </Screen>
    );
  }

  const date = parseISO(treatment.timestamp);
  const tone = theme.colors.event.treatment;

  return (
    <Screen scroll gutter>
      <Surface style={{ gap: theme.space.lg }}>
        <DetailRow label="Type">
          <Chip
            label={
              treatment.type.charAt(0).toUpperCase() + treatment.type.slice(1)
            }
            selected
            tint={tone.base}
            tintInk={tone.on}
          />
        </DetailRow>

        <DetailRow label="Name">
          <Text variant="bodyStrong">{treatment.name}</Text>
        </DetailRow>

        <DetailRow
          label="Taken"
          value={`${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`}
        />

        <DetailRow label="Logged" value={formatRelativeTime(treatment.timestamp)} />

        {treatment.notes ? (
          <>
            <Divider />
            <DetailRow label="Notes" stacked>
              <Text variant="body">{treatment.notes}</Text>
            </DetailRow>
          </>
        ) : null}
      </Surface>

      <Surface style={{ gap: theme.space.md }}>
        <Text variant="heading">Did this help?</Text>
        <Text variant="label" tone="faint">
          Answer once you know. This is what drives the effectiveness figure on
          your dashboard.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
          {EFFECTIVENESS_OPTIONS.map((option) => (
            <Chip
              key={String(option.value)}
              label={option.label}
              selected={treatment.effective === option.value}
              tint={option.value === false ? theme.colors.risk.high.base : tone.base}
              tintInk={option.value === false ? theme.colors.risk.high.on : tone.on}
              onPress={() => handleSetEffective(option.value)}
            />
          ))}
        </View>
      </Surface>

      <ButtonRow>
        <Button label="Edit" onPress={handleEdit} block />
        <Button
          label="Delete"
          variant="secondary"
          onPress={() => setShowDeleteDialog(true)}
          block
          tintInk={theme.colors.danger}
        />
      </ButtonRow>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete this treatment?"
        message="It will be removed from your log permanently, along with whether it helped."
        confirmLabel="Delete treatment"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Screen>
  );
}
