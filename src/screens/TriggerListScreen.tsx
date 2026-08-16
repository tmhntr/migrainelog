import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import type { TriggerListScreenProps } from '../navigation/types';
import type { Trigger } from '../models/trigger';
import { TRIGGER_CATEGORIES } from '../models/trigger';
import { useTriggerStore } from '../stores/trigger-store';
import { useTheme } from '../theme';
import { EventCard } from '../components/EventCard';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/ui';

export function TriggerListScreen({
  navigation,
}: TriggerListScreenProps): React.JSX.Element {
  const theme = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingVertical: theme.space.md }}>
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
          filteredTriggers.length === 0
            ? { flex: 1 }
            : { gap: theme.space.md, paddingBottom: 96 }
        }
        ListEmptyComponent={
          <EmptyState
            title={
              selectedCategories.length > 0
                ? 'Nothing matches these filters'
                : 'No triggers yet'
            }
            message={
              selectedCategories.length > 0
                ? 'Clear a filter to see the rest of your log.'
                : 'Log what you were exposed to — sleep, stress, food, weather — and patterns build up over time.'
            }
            actionLabel={selectedCategories.length > 0 ? undefined : 'Log a trigger'}
            onAction={selectedCategories.length > 0 ? undefined : handleAddTrigger}
          />
        }
      />

      <Fab onPress={handleAddTrigger} accessibilityLabel="Log a trigger" />
    </View>
  );
}
