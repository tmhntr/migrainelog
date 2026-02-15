import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { EventType } from '../models/event';

export interface QuickLogButtonProps {
  onPress: (type: EventType) => void;
}

interface ButtonConfig {
  type: EventType;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const BUTTONS: ButtonConfig[] = [
  { type: 'trigger', label: 'Trigger', icon: 'warning', color: '#FF9800' },
  { type: 'episode', label: 'Episode', icon: 'flash-on', color: '#F44336' },
  { type: 'treatment', label: 'Treatment', icon: 'healing', color: '#2196F3' },
];

export function QuickLogButton({ onPress }: QuickLogButtonProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {BUTTONS.map((btn) => (
        <TouchableOpacity
          key={btn.type}
          style={[styles.button, { backgroundColor: btn.color }]}
          onPress={() => onPress(btn.type)}
          activeOpacity={0.7}
        >
          <MaterialIcons name={btn.icon} size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>{btn.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
