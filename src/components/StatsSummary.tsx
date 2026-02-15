import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DashboardStats } from '../utils/statistics';

export interface StatsSummaryProps {
  stats: DashboardStats;
}

interface StatCard {
  label: string;
  value: string;
}

function buildCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: 'Episodes (7d)',
      value: String(stats.episodeCount7d),
    },
    {
      label: 'Episodes (30d)',
      value: String(stats.episodeCount30d),
    },
    {
      label: 'Top Trigger',
      value: stats.topTriggerCategory
        ? stats.topTriggerCategory.charAt(0).toUpperCase() +
          stats.topTriggerCategory.slice(1)
        : 'N/A',
    },
    {
      label: 'Effectiveness',
      value:
        stats.treatmentEffectivenessPercent !== null
          ? `${stats.treatmentEffectivenessPercent}%`
          : 'N/A',
    },
  ];
}

export function StatsSummary({ stats }: StatsSummaryProps): React.JSX.Element {
  const cards = buildCards(stats);

  return (
    <View style={styles.container}>
      {cards.map((card) => (
        <View key={card.label} style={styles.card}>
          <Text style={styles.cardValue}>{card.value}</Text>
          <Text style={styles.cardLabel}>{card.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  cardLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    textAlign: 'center',
  },
});
