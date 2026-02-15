import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { EpisodeListScreenProps } from '../navigation/types';
import type { Episode } from '../models/episode';
import { useEpisodeStore } from '../stores/episode-store';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';

export function EpisodeListScreen({
  navigation,
}: EpisodeListScreenProps): React.JSX.Element {
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
    <View style={styles.container}>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          episodes.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No Episodes"
            message="Record migraine episodes to track frequency and patterns."
            actionLabel="Add Episode"
            onAction={handleAddEpisode}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddEpisode}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
