import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { TriggerListScreenProps } from '../navigation/types';
import type { Trigger } from '../models/trigger';
import { TRIGGER_CATEGORIES } from '../models/trigger';
import { useTriggerStore } from '../stores/trigger-store';
import { EventCard } from '../components/EventCard';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';

export function TriggerListScreen({
  navigation,
}: TriggerListScreenProps): React.JSX.Element {
  const { triggers } = useTriggerStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredTriggers = useMemo(() => {
    if (selectedCategories.length === 0) return triggers;
    return triggers.filter((t) => selectedCategories.includes(t.category));
  }, [triggers, selectedCategories]);

  const handlePressTrigger = (id: string): void => {
    navigation.navigate('TriggerDetail', { id });
  };

  const handleAddTrigger = (): void => {
    navigation.navigate('TriggerForm', {});
  };

  const renderItem = ({ item }: { item: Trigger }): React.JSX.Element => (
    <EventCard
      event={item}
      type="trigger"
      onPress={() => handlePressTrigger(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <FilterChips
          options={[...TRIGGER_CATEGORIES]}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </View>

      <FlatList
        data={filteredTriggers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredTriggers.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No Triggers"
            message="Start tracking your migraine triggers to identify patterns."
            actionLabel="Add Trigger"
            onAction={handleAddTrigger}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTrigger}
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
  filterRow: {
    paddingVertical: 12,
  },
  list: {
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
