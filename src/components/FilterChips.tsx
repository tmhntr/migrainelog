import React from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '../theme';
import { Chip } from './ui';

export interface FilterChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function FilterChips({
  options,
  selected,
  onChange,
}: FilterChipsProps): React.JSX.Element {
  const theme = useTheme();

  const handleToggle = (option: string): void => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: theme.space.sm,
        paddingHorizontal: theme.space.lg,
      }}
    >
      {options.map((option) => (
        <Chip
          key={option}
          label={option.charAt(0).toUpperCase() + option.slice(1)}
          selected={selected.includes(option)}
          onPress={() => handleToggle(option)}
        />
      ))}
    </ScrollView>
  );
}
