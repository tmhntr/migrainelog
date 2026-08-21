import React from 'react';
import { Pressable, View } from 'react-native';

import { BaseEvent, EventType } from '../models/event';
import { Trigger } from '../models/trigger';
import { Episode } from '../models/episode';
import { Treatment } from '../models/treatment';
import { formatRelativeTime } from '../utils/date-helpers';
import { severityColors, useTheme } from '../theme';
import { Surface, Text } from './ui';

export interface EventCardProps {
  event: BaseEvent;
  type: EventType;
  onPress?: () => void;
}

const TYPE_LABELS: Record<EventType, string> = {
  trigger: 'Trigger',
  episode: 'Episode',
  treatment: 'Treatment',
};

/** Severity scales differ per type, so the ramp needs the bounds too. */
const SEVERITY_RANGE: Partial<Record<EventType, { min: number; max: number }>> = {
  trigger: { min: 1, max: 5 },
  episode: { min: 1, max: 10 },
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
  const theme = useTheme();
  const tone = theme.colors.event[type];
  const severity = getSeverity(event, type);
  const subtitle = getSubtitle(event, type);
  const range = SEVERITY_RANGE[type];

  const severityTone =
    severity !== null && range !== undefined
      ? severityColors(theme.colors, severity, range.min, range.max)
      : null;

  const card = (
    <Surface inset railColor={tone.base} style={{ gap: theme.space.sm }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="caption" uppercase color={tone.base}>
          {TYPE_LABELS[type]}
        </Text>
        <Text variant="data" tone="faint">
          {formatRelativeTime(event.timestamp)}
        </Text>
      </View>

      {subtitle !== null && (
        <Text variant="heading" style={{ textTransform: 'capitalize' }}>
          {subtitle}
        </Text>
      )}

      {severity !== null && severityTone !== null && range !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: theme.radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: severityTone.soft,
              borderWidth: theme.border.hairline,
              borderColor: severityTone.base,
            }}
          >
            <Text variant="data" color={severityTone.base}>
              {severity}
            </Text>
          </View>
          <Text variant="label" tone="faint">
            of {range.max}
          </Text>
        </View>
      )}

      {event.notes !== null && event.notes !== '' && (
        <Text variant="body" tone="muted" numberOfLines={2}>
          {event.notes}
        </Text>
      )}
    </Surface>
  );

  if (onPress === undefined) {
    return card;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.72 } : undefined)}
    >
      {card}
    </Pressable>
  );
}
