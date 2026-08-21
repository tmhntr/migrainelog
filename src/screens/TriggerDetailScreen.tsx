import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import type { TriggerDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { severityColors, useTheme } from '../theme';
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

export function TriggerDetailScreen({
  navigation,
  route,
}: TriggerDetailScreenProps): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const store = useTriggerStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const trigger = useMemo(() => {
    return store.triggers.find((t) => t.id === id) ?? null;
  }, [id, store.triggers]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Trigger' });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('TriggerForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not delete', 'The trigger was not deleted. Try again.');
    }
  };

  if (!trigger) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" tone="faint">
            This trigger is no longer in your log.
          </Text>
        </View>
      </Screen>
    );
  }

  const date = parseISO(trigger.timestamp);
  const tone = severityColors(theme.colors, trigger.severity, 1, 5);

  return (
    <Screen scroll gutter>
      <Surface style={{ gap: theme.space.lg }}>
        <DetailRow label="Category">
          <Chip
            label={
              trigger.category.charAt(0).toUpperCase() + trigger.category.slice(1)
            }
            selected
            tint={theme.colors.event.trigger.base}
            tintInk={theme.colors.event.trigger.on}
          />
        </DetailRow>

        <DetailRow label="Severity">
          <Text variant="metric" color={tone.base}>
            {trigger.severity}
            <Text variant="label" tone="faint">
              {' '}
              of 5
            </Text>
          </Text>
        </DetailRow>

        <DetailRow
          label="When"
          value={`${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`}
        />

        <DetailRow label="Logged" value={formatRelativeTime(trigger.timestamp)} />

        {trigger.notes ? (
          <>
            <Divider />
            <DetailRow label="Notes" stacked>
              <Text variant="body">{trigger.notes}</Text>
            </DetailRow>
          </>
        ) : null}
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
        title="Delete this trigger?"
        message="It will be removed from your log permanently, and your risk score will be recalculated without it."
        confirmLabel="Delete trigger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Screen>
  );
}
