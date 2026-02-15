import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RiskLabel } from '../models/event';

export interface RiskGaugeProps {
  score: number;
  label: RiskLabel;
}

const LABEL_COLORS: Record<RiskLabel, string> = {
  low: '#4CAF50',
  moderate: '#FFC107',
  high: '#FF9800',
  critical: '#F44336',
};

const LABEL_TEXT_COLORS: Record<RiskLabel, string> = {
  low: '#FFFFFF',
  moderate: '#333333',
  high: '#FFFFFF',
  critical: '#FFFFFF',
};

export function RiskGauge({ score, label }: RiskGaugeProps): React.JSX.Element {
  const backgroundColor = LABEL_COLORS[label];
  const textColor = LABEL_TEXT_COLORS[label];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.score, { color: textColor }]}>{Math.round(score)}</Text>
      <Text style={[styles.label, { color: textColor }]}>
        {label.charAt(0).toUpperCase() + label.slice(1)} Risk
      </Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${Math.min(score, 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 12,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
  },
});
