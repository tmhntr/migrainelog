import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BaseEvent, EventType } from '../models/event';
import { Trigger } from '../models/trigger';
import { Episode } from '../models/episode';
import { Treatment } from '../models/treatment';
import { formatRelativeTime } from '../utils/date-helpers';

export interface EventCardProps {
  event: BaseEvent;
  type: EventType;
  onPress?: () => void;
}

const TYPE_COLORS: Record<EventType, string> = {
  trigger: '#FF9800',
  episode: '#F44336',
  treatment: '#2196F3',
};

const TYPE_LABELS: Record<EventType, string> = {
  trigger: 'Trigger',
  episode: 'Episode',
  treatment: 'Treatment',
};

function getSeverity(event: BaseEvent, type: EventType): number | null {
  if (type === 'trigger') {
    return (event as Trigger).severity;
  }
  if (type === 'episode') {
    return (event as Episode).severity;
  }
  return null;
}

function getSubtitle(event: BaseEvent, type: EventType): string | null {
  if (type === 'trigger') {
    return (event as Trigger).category;
  }
  if (type === 'treatment') {
    const t = event as Treatment;
    return t.name || t.type;
  }
  return null;
}

export function EventCard({ event, type, onPress }: EventCardProps): React.JSX.Element {
  const borderColor = TYPE_COLORS[type];
  const severity = getSeverity(event, type);
  const subtitle = getSubtitle(event, type);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.typeBadgeText}>{TYPE_LABELS[type]}</Text>
        </View>
        <Text style={styles.timestamp}>{formatRelativeTime(event.timestamp)}</Text>
      </View>
      <View style={styles.body}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {severity !== null && (
          <Text style={styles.severity}>Severity: {severity}</Text>
        )}
        {event.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {event.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
  },
  body: {
    gap: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textTransform: 'capitalize',
  },
  severity: {
    fontSize: 13,
    color: '#666666',
  },
  notes: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
});
