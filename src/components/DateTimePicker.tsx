import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

function formatReadableDate(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`;
}

export function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps): React.JSX.Element {
  const handleSetNow = (): void => {
    onChange(new Date());
  };

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.dateText}>{formatReadableDate(value)}</Text>
      </View>
      <TouchableOpacity
        style={styles.nowButton}
        onPress={handleSetNow}
        activeOpacity={0.7}
      >
        <Text style={styles.nowButtonText}>Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
  },
  display: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    color: '#333333',
  },
  nowButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
