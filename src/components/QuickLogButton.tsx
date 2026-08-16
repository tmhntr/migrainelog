import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EventType } from '../models/event';
import { useTheme } from '../theme';
import { Text } from './ui';

export interface QuickLogButtonProps {
  onPress: (type: EventType) => void;
}

interface ButtonConfig {
  type: EventType;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const BUTTONS: ButtonConfig[] = [
  { type: 'trigger', label: 'Trigger', icon: 'change-history' },
  { type: 'episode', label: 'Episode', icon: 'blur-on' },
  { type: 'treatment', label: 'Treatment', icon: 'medication' },
];

/**
 * The one control that has to work mid-attack: three large targets, tinted
 * with each event type's colour but filled softly rather than saturated.
 */
export function QuickLogButton({ onPress }: QuickLogButtonProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: theme.space.lg,
        gap: theme.space.md,
      }}
    >
      {BUTTONS.map((btn) => {
        const tone = theme.colors.event[btn.type];
        return (
          <Pressable
            key={btn.type}
            accessibilityRole="button"
            accessibilityLabel={`Log ${btn.label.toLowerCase()}`}
            onPress={() => onPress(btn.type)}
            style={({ pressed }) => [
              {
                flex: 1,
                minHeight: 76,
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.space.xs,
                paddingVertical: theme.space.md,
                borderRadius: theme.radius.md,
                backgroundColor: tone.soft,
                borderWidth: theme.border.hairline,
                borderColor: tone.base,
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <MaterialIcons name={btn.icon} size={24} color={tone.base} />
            <Text variant="label" color={tone.base}>
              {btn.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
