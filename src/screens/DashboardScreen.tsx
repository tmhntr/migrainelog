import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';

import type { DashboardScreenProps } from '../navigation/types';
import type { EventType, BaseEvent } from '../models/event';
import { useRiskStore } from '../stores/risk-store';
import { useTriggerStore } from '../stores/trigger-store';
import { useEpisodeStore } from '../stores/episode-store';
import { useTreatmentStore } from '../stores/treatment-store';
import { useDatabase } from '../hooks/use-database';
import { useInterval } from '../hooks/use-interval';
import { useTheme } from '../theme';
import { computeDashboardStats } from '../utils/statistics';
import { RiskGauge } from '../components/RiskGauge';
import { QuickLogButton } from '../components/QuickLogButton';
import { StatsSummary } from '../components/StatsSummary';
import { EventCard } from '../components/EventCard';
import { Screen, Section, Text } from '../components/ui';

const RISK_RECALC_INTERVAL = 15 * 60 * 1000;
const RECENT_EVENTS_LIMIT = 10;

interface MergedEvent {
  event: BaseEvent;
  type: EventType;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const theme = useTheme();
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
    <Screen scroll contentContainerStyle={{ paddingBottom: theme.space.xxxl }}>
      <RiskGauge score={score} label={label} />

      <Section title="Log something">
        <QuickLogButton onPress={handleQuickLog} />
      </Section>

      <Section title="Your patterns">
        <StatsSummary stats={stats} />
      </Section>

      <Section title="Recent">
        {recentEvents.length === 0 ? (
          <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.xl }}>
            <Text variant="body" tone="faint" style={{ textAlign: 'center' }}>
              Nothing logged yet. Anything you record shows up here.
            </Text>
          </View>
        ) : (
          <View style={{ gap: theme.space.md }}>
            {recentEvents.map((item) => (
              <EventCard
                key={`${item.type}-${item.event.id}`}
                event={item.event}
                type={item.type}
              />
            ))}
          </View>
        )}
      </Section>
    </Screen>
  );
}
