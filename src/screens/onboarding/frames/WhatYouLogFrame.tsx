import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { EventType } from '../../../models/event';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';
import { OnboardingFrame } from '../OnboardingFrame';

interface EventExplainer {
  type: EventType;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
}

/**
 * The same three glyphs and tints as `QuickLogButton`, so the dashboard
 * control is already familiar the first time it is seen: ochre is always a
 * trigger, rose always an episode, slate always a treatment.
 */
const EXPLAINERS: EventExplainer[] = [
  {
    type: 'trigger',
    name: 'Trigger',
    icon: 'change-history',
    description:
      'Something that might set one off — thin sleep, a stressful day, a skipped meal. Pick a category, rate it 1–5.',
  },
  {
    type: 'episode',
    name: 'Episode',
    icon: 'blur-on',
    description:
      'The migraine itself — severity 1–10, how long it lasted, symptoms, whether there was aura.',
  },
  {
    type: 'treatment',
    name: 'Treatment',
    icon: 'medication',
    description:
      'What you tried — a medication, rest, water, caffeine — and later, whether it actually helped.',
  },
];

export function WhatYouLogFrame(): React.JSX.Element {
  const theme = useTheme();

  return (
    <OnboardingFrame eyebrow="How it works" headline="Three things to log.">
      <View style={{ gap: theme.space.md }}>
        {EXPLAINERS.map((item) => {
          const tone = theme.colors.event[item.type];
          return (
            <View
              key={item.type}
              style={{
                flexDirection: 'row',
                gap: theme.space.md,
                padding: theme.space.md,
                borderRadius: theme.radius.md,
                backgroundColor: tone.soft,
                borderWidth: theme.border.hairline,
                borderColor: tone.base,
              }}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={tone.base}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, gap: theme.space.xs }}>
                <Text variant="label" color={tone.base}>
                  {item.name}
                </Text>
                <Text variant="body" tone="muted">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text variant="label" tone="muted">
        Each is two taps from the dashboard. Only the thing you came to record is
        required; notes and times can wait.
      </Text>
    </OnboardingFrame>
  );
}
