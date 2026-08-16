import React from 'react';
import { View } from 'react-native';

import { RiskLabel } from '../models/event';
import { useTheme } from '../theme';
import { Surface, Text } from './ui';

export interface RiskGaugeProps {
  score: number;
  label: RiskLabel;
}

const LABEL_TEXT: Record<RiskLabel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'Elevated',
  critical: 'High',
};

/**
 * Plain-language gloss under the number. The score is a heuristic, not a
 * prediction, and the copy says so rather than implying a forecast.
 */
const LABEL_GLOSS: Record<RiskLabel, string> = {
  low: 'Few recent triggers logged.',
  moderate: 'Some triggers building up.',
  high: 'Triggers well above your baseline.',
  critical: 'Triggers far above your baseline.',
};

const TICK_COUNT = 28;
const TICK_MIN_HEIGHT = 6;
const TICK_MAX_HEIGHT = 28;

/**
 * Tick heights ramp along the track, so the reading is carried by the *shape*
 * of the lit region as much as by its colour — it survives greyscale, and it
 * means a low score literally emits less light than a high one.
 */
function tickHeight(index: number): number {
  const t = index / (TICK_COUNT - 1);
  return TICK_MIN_HEIGHT + (TICK_MAX_HEIGHT - TICK_MIN_HEIGHT) * Math.pow(t, 1.7);
}

/**
 * The app's signature reading. Deliberately not a filled block of alert
 * colour: the ramp climbs warmer and darker rather than brighter, because the
 * moment this gauge reads high is the moment its reader can least tolerate a
 * bright screen.
 */
export function RiskGauge({ score, label }: RiskGaugeProps): React.JSX.Element {
  const theme = useTheme();
  const tone = theme.colors.risk[label];

  const clamped = Math.max(0, Math.min(100, score));
  const litTicks = Math.round((clamped / 100) * TICK_COUNT);

  return (
    <Surface
      inset
      style={{ gap: theme.space.lg }}
      accessibilityRole="progressbar"
      accessibilityLabel={`Current risk: ${LABEL_TEXT[label]}, ${Math.round(clamped)} out of 100`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View>
        <Text variant="caption" tone="faint" uppercase>
          Current risk
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: theme.space.md,
            marginTop: theme.space.sm,
          }}
        >
          <Text variant="display" color={tone.base}>
            {Math.round(clamped)}
          </Text>
          <Text variant="title" tone="muted">
            {LABEL_TEXT[label]}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: TICK_MAX_HEIGHT,
        }}
      >
        {Array.from({ length: TICK_COUNT }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              marginHorizontal: 1,
              height: tickHeight(i),
              borderRadius: 1,
              backgroundColor: i < litTicks ? tone.base : theme.colors.border,
            }}
          />
        ))}
      </View>

      <Text variant="label" tone="muted">
        {LABEL_GLOSS[label]}
      </Text>
    </Surface>
  );
}
