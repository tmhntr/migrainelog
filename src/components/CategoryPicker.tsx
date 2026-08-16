import React from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '../theme';
import { Chip } from './ui';

export interface CategoryPickerProps {
  categories: readonly string[];
  value: string | null;
  onChange: (val: string) => void;
}

export function CategoryPicker({
  categories,
  value,
  onChange,
}: CategoryPickerProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.space.sm, paddingRight: theme.space.lg }}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          label={category.charAt(0).toUpperCase() + category.slice(1)}
          selected={category === value}
          onPress={() => onChange(category)}
        />
      ))}
    </ScrollView>
  );
}
