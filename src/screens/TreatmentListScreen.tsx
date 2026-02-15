import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { TreatmentListScreenProps } from '../navigation/types';
import type { Treatment } from '../models/treatment';
import { TREATMENT_TYPES } from '../models/treatment';
import { useTreatmentStore } from '../stores/treatment-store';
import { EventCard } from '../components/EventCard';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';

export function TreatmentListScreen({
  navigation,
}: TreatmentListScreenProps): React.JSX.Element {
  const { treatments } = useTreatmentStore();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredTreatments = useMemo(() => {
    if (selectedTypes.length === 0) return treatments;
    return treatments.filter((t) => selectedTypes.includes(t.type));
  }, [treatments, selectedTypes]);

  const handlePressTreatment = (id: string): void => {
    navigation.navigate('TreatmentDetail', { id });
  };

  const handleAddTreatment = (): void => {
    navigation.navigate('TreatmentForm', {});
  };

  const renderItem = ({ item }: { item: Treatment }): React.JSX.Element => (
    <EventCard
      event={item}
      type="treatment"
      onPress={() => handlePressTreatment(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <FilterChips
          options={[...TREATMENT_TYPES]}
          selected={selectedTypes}
          onChange={setSelectedTypes}
        />
      </View>

      <FlatList
        data={filteredTreatments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredTreatments.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No Treatments"
            message="Log treatments to track what helps manage your migraines."
            actionLabel="Add Treatment"
            onAction={handleAddTreatment}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTreatment}
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
