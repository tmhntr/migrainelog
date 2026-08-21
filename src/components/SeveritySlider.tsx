import React, { useCallback } from 'react';
import { View } from 'react-native';
import Slider from '@react-native-community/slider';

import { severityColors, useTheme } from '../theme';
import { Text } from './ui';

export interface SeveritySliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function SeveritySlider({
  value,
  onChange,
  min = 1,
  max = 5,
  label,
}: SeveritySliderProps): React.JSX.Element {
  const theme = useTheme();
  const tone = severityColors(theme.colors, value, min, max);

  const handleValueChange = useCallback(
    (val: number) => {
      onChange(Math.round(val));
    },
    [onChange],
  );

  return (
    <View style={{ gap: theme.space.sm }}>
      {label !== undefined && (
        <Text variant="caption" tone="faint" uppercase>
          {label}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
        {/* The current value reads as the primary figure; the slider is the control. */}
        <View
          style={{
            width: theme.minTouchTarget,
            height: theme.minTouchTarget,
            borderRadius: theme.radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tone.soft,
            borderWidth: theme.border.hairline,
            borderColor: tone.base,
          }}
        >
          <Text variant="metric" color={tone.base}>
            {value}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Slider
            style={{ height: theme.minTouchTarget }}
            value={value}
            onValueChange={handleValueChange}
            minimumValue={min}
            maximumValue={max}
            step={1}
            minimumTrackTintColor={tone.base}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={tone.base}
            accessibilityLabel={label ?? 'Severity'}
            accessibilityValue={{ min, max, now: value }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" tone="faint">
              {min}
            </Text>
            <Text variant="caption" tone="faint">
              {max}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
