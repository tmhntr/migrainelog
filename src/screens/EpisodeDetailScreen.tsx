import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import type { EpisodeDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useEpisodeStore } from '../stores/episode-store';
import { severityColors, useTheme } from '../theme';
import { SymptomPicker } from '../components/SymptomPicker';
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

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function EpisodeDetailScreen({
  navigation,
  route,
}: EpisodeDetailScreenProps): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const store = useEpisodeStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const episode = useMemo(() => {
    return store.episodes.find((e) => e.id === id) ?? null;
  }, [id, store.episodes]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Episode' });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('EpisodeForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not delete', 'The episode was not deleted. Try again.');
    }
  };

  if (!episode) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" tone="faint">
            This episode is no longer in your log.
          </Text>
        </View>
      </Screen>
    );
  }

  const date = parseISO(episode.timestamp);
  const tone = severityColors(theme.colors, episode.severity, 1, 10);

  return (
    <Screen scroll gutter>
      <Surface style={{ gap: theme.space.lg }}>
        <DetailRow label="Severity">
          <Text variant="metric" color={tone.base}>
            {episode.severity}
            <Text variant="label" tone="faint">
              {' '}
              of 10
            </Text>
          </Text>
        </DetailRow>

        <DetailRow label="Aura">
          {episode.aura ? (
            <Chip
              label="Yes"
              selected
              tint={theme.colors.event.episode.base}
              tintInk={theme.colors.event.episode.on}
            />
          ) : (
            <Text variant="data" tone="faint">
              No
            </Text>
          )}
        </DetailRow>

        <DetailRow
          label="Duration"
          value={
            episode.durationMinutes != null
              ? formatDuration(episode.durationMinutes)
              : null
          }
        />

        <DetailRow
          label="Started"
          value={`${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`}
        />

        <DetailRow label="Logged" value={formatRelativeTime(episode.timestamp)} />

        <Divider />

        <DetailRow label="Symptoms" stacked>
          {episode.symptoms.length > 0 ? (
            <SymptomPicker selected={episode.symptoms} onChange={() => {}} readOnly />
          ) : (
            <Text variant="data" tone="faint">
              Not recorded
            </Text>
          )}
        </DetailRow>

        {episode.notes ? (
          <>
            <Divider />
            <DetailRow label="Notes" stacked>
              <Text variant="body">{episode.notes}</Text>
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
        title="Delete this episode?"
        message="It will be removed from your log permanently, and your patterns will be recalculated without it."
        confirmLabel="Delete episode"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Screen>
  );
}
