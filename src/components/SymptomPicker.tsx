import React from 'react';
import { View } from 'react-native';

import { COMMON_SYMPTOMS } from '../models/episode';
import { useTheme } from '../theme';
import { Chip } from './ui';

export interface SymptomPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Detail screens reuse this to render the recorded set without editing. */
  readOnly?: boolean;
}

export function SymptomPicker({
  selected,
  onChange,
  readOnly = false,
}: SymptomPickerProps): React.JSX.Element {
  const theme = useTheme();
  const tone = theme.colors.event.episode;

  const handleToggle = (symptom: string): void => {
    if (selected.includes(symptom)) {
      onChange(selected.filter((s) => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  };

  // Read-only shows only what was recorded; the full checklist would bury it.
  const visible = readOnly
    ? COMMON_SYMPTOMS.filter((s) => selected.includes(s))
    : COMMON_SYMPTOMS;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
      {visible.map((symptom) => (
        <Chip
          key={symptom}
          label={symptom}
          selected={selected.includes(symptom)}
          tint={tone.base}
          tintInk={tone.on}
          disabled={readOnly}
          onPress={readOnly ? undefined : () => handleToggle(symptom)}
        />
      ))}
    </View>
  );
}
