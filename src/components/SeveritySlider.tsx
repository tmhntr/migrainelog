import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

export interface SeveritySliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

function severityColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min);
  if (ratio <= 0.3) return '#4CAF50'; // green
  if (ratio <= 0.6) return '#FFC107'; // amber
  if (ratio <= 0.8) return '#FF9800'; // orange
  return '#F44336'; // red
}

export function SeveritySlider({
  value,
  onChange,
  min = 1,
  max = 5,
  label,
}: SeveritySliderProps): React.JSX.Element {
  const color = severityColor(value, min, max);

  const handleValueChange = useCallback(
    (val: number) => {
      onChange(Math.round(val));
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderRow}>
        <Text style={styles.rangeLabel}>{min}</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            value={value}
            onValueChange={handleValueChange}
            minimumValue={min}
            maximumValue={max}
            step={1}
            minimumTrackTintColor={color}
            maximumTrackTintColor="#DDDDDD"
            thumbTintColor={color}
          />
        </View>
        <Text style={styles.rangeLabel}>{max}</Text>
      </View>
      <View style={styles.valueRow}>
        <View style={[styles.valueIndicator, { backgroundColor: color }]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    width: 20,
    textAlign: 'center',
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    height: 40,
  },
  valueRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  valueIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
