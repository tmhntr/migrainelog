import React from 'react';
import { View } from 'react-native';

import { DashboardStats } from '../utils/statistics';
import { useTheme } from '../theme';
import { Surface, Text } from './ui';

export interface StatsSummaryProps {
  stats: DashboardStats;
}

interface StatCard {
  label: string;
  value: string;
  /** Shown beside the value — units belong with the number, not the label. */
  unit?: string;
}

function buildCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: 'Episodes',
      value: String(stats.episodeCount7d),
      unit: 'last 7 days',
    },
    {
      label: 'Episodes',
      value: String(stats.episodeCount30d),
      unit: 'last 30 days',
    },
    {
      label: 'Most logged trigger',
      value: stats.topTriggerCategory
        ? stats.topTriggerCategory.charAt(0).toUpperCase() +
          stats.topTriggerCategory.slice(1)
        : '—',
    },
    {
      label: 'Treatments that helped',
      value:
        stats.treatmentEffectivenessPercent !== null
          ? `${stats.treatmentEffectivenessPercent}%`
          : '—',
    },
  ];
}

export function StatsSummary({ stats }: StatsSummaryProps): React.JSX.Element {
  const theme = useTheme();
  const cards = buildCards(stats);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.space.lg,
        gap: theme.space.md,
      }}
    >
      {cards.map((card) => (
        <Surface
          key={`${card.label}-${card.unit ?? ''}`}
          style={{ flex: 1, minWidth: '45%', gap: theme.space.xs }}
        >
          <Text variant="metric">{card.value}</Text>
          <Text variant="label" tone="muted">
            {card.label}
          </Text>
          {card.unit !== undefined && (
            <Text variant="caption" tone="faint" uppercase>
              {card.unit}
            </Text>
          )}
        </Surface>
      ))}
    </View>
  );
}
