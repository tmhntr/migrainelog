import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COMMON_SYMPTOMS } from '../models/episode';

export interface SymptomPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  readOnly?: boolean;
}

export function SymptomPicker({
  selected,
  onChange,
  readOnly = false,
}: SymptomPickerProps): React.JSX.Element {
  const handleToggle = (symptom: string): void => {
    if (readOnly) return;
    if (selected.includes(symptom)) {
      onChange(selected.filter((s) => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  };

  return (
    <View style={styles.container}>
      {COMMON_SYMPTOMS.map((symptom) => {
        const isSelected = selected.includes(symptom);
        return (
          <TouchableOpacity
            key={symptom}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              readOnly && styles.chipReadOnly,
            ]}
            onPress={() => handleToggle(symptom)}
            activeOpacity={readOnly ? 1 : 0.7}
            disabled={readOnly}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextSelected]}
            >
              {symptom}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  chipReadOnly: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 13,
    color: '#666666',
  },
  chipTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
});
