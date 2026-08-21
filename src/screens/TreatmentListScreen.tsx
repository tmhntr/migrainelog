import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import type { TreatmentListScreenProps } from '../navigation/types';
import type { Treatment } from '../models/treatment';
import { TREATMENT_TYPES } from '../models/treatment';
import { useTreatmentStore } from '../stores/treatment-store';
import { useTheme } from '../theme';
import { EventCard } from '../components/EventCard';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/ui';

export function TreatmentListScreen({
  navigation,
}: TreatmentListScreenProps): React.JSX.Element {
  const theme = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingVertical: theme.space.md }}>
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
          filteredTreatments.length === 0
            ? { flex: 1 }
            : { gap: theme.space.md, paddingBottom: 96 }
        }
        ListEmptyComponent={
          <EmptyState
            title={
              selectedTypes.length > 0
                ? 'Nothing matches these filters'
                : 'No treatments yet'
            }
            message={
              selectedTypes.length > 0
                ? 'Clear a filter to see the rest of your log.'
                : 'Log what you tried and whether it helped. Marking effectiveness afterwards is what makes this useful.'
            }
            actionLabel={selectedTypes.length > 0 ? undefined : 'Log a treatment'}
            onAction={selectedTypes.length > 0 ? undefined : handleAddTreatment}
          />
        }
      />

      <Fab onPress={handleAddTreatment} accessibilityLabel="Log a treatment" />
    </View>
  );
}
