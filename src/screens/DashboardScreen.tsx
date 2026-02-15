import React, { useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DashboardScreenProps } from '../navigation/types';
import type { EventType, BaseEvent } from '../models/event';
import { useRiskStore } from '../stores/risk-store';
import { useTriggerStore } from '../stores/trigger-store';
import { useEpisodeStore } from '../stores/episode-store';
import { useTreatmentStore } from '../stores/treatment-store';
import { useDatabase } from '../hooks/use-database';
import { useInterval } from '../hooks/use-interval';
import { computeDashboardStats } from '../utils/statistics';
import { RiskGauge } from '../components/RiskGauge';
import { QuickLogButton } from '../components/QuickLogButton';
import { StatsSummary } from '../components/StatsSummary';
import { EventCard } from '../components/EventCard';

const RISK_RECALC_INTERVAL = 15 * 60 * 1000;
const RECENT_EVENTS_LIMIT = 10;

interface MergedEvent {
  event: BaseEvent;
  type: EventType;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const db = useDatabase();
  const { score, label, recalculate } = useRiskStore();
  const { triggers } = useTriggerStore();
  const { episodes } = useEpisodeStore();
  const { treatments } = useTreatmentStore();

  useInterval(
    useCallback(() => {
      recalculate(db);
    }, [db, recalculate]),
    RISK_RECALC_INTERVAL,
  );

  const stats = useMemo(
    () => computeDashboardStats({ episodes, triggers, treatments }),
    [episodes, triggers, treatments],
  );

  const recentEvents = useMemo<MergedEvent[]>(() => {
    const all: MergedEvent[] = [
      ...triggers.map((t) => ({ event: t as BaseEvent, type: 'trigger' as const })),
      ...episodes.map((e) => ({ event: e as BaseEvent, type: 'episode' as const })),
      ...treatments.map((t) => ({ event: t as BaseEvent, type: 'treatment' as const })),
    ];
    all.sort(
      (a, b) =>
        new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime(),
    );
    return all.slice(0, RECENT_EVENTS_LIMIT);
  }, [triggers, episodes, treatments]);

  const handleQuickLog = useCallback(
    (type: EventType) => {
      const parent = navigation.getParent();
      switch (type) {
        case 'trigger':
          parent?.navigate('TriggersTab', { screen: 'TriggerForm', params: {} });
          break;
        case 'episode':
          parent?.navigate('EpisodesTab', { screen: 'EpisodeForm', params: {} });
          break;
        case 'treatment':
          parent?.navigate('TreatmentsTab', { screen: 'TreatmentForm', params: {} });
          break;
      }
    },
    [navigation],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RiskGauge score={score} label={label} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <QuickLogButton onPress={handleQuickLog} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <StatsSummary stats={stats} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {recentEvents.length === 0 ? (
          <Text style={styles.emptyText}>No events logged yet.</Text>
        ) : (
          recentEvents.map((item) => (
            <EventCard
              key={`${item.type}-${item.event.id}`}
              event={item.event}
              type={item.type}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingVertical: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
