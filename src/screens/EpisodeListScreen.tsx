import React from 'react';
import { FlatList, View } from 'react-native';

import type { EpisodeListScreenProps } from '../navigation/types';
import type { Episode } from '../models/episode';
import { useEpisodeStore } from '../stores/episode-store';
import { useTheme } from '../theme';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/ui';

export function EpisodeListScreen({
  navigation,
}: EpisodeListScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { episodes } = useEpisodeStore();

  const handlePressEpisode = (id: string): void => {
    navigation.navigate('EpisodeDetail', { id });
  };

  const handleAddEpisode = (): void => {
    navigation.navigate('EpisodeForm', {});
  };

  const renderItem = ({ item }: { item: Episode }): React.JSX.Element => (
    <EventCard
      event={item}
      type="episode"
      onPress={() => handlePressEpisode(item.id)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          episodes.length === 0
            ? { flex: 1 }
            : { gap: theme.space.md, paddingTop: theme.space.lg, paddingBottom: 96 }
        }
        ListEmptyComponent={
          <EmptyState
            title="No episodes yet"
            message="Record an attack when it happens, or afterwards. Frequency and severity are what your neurologist will ask about."
            actionLabel="Log an episode"
            onAction={handleAddEpisode}
          />
        }
      />

      <Fab onPress={handleAddEpisode} accessibilityLabel="Log an episode" />
    </View>
  );
}
