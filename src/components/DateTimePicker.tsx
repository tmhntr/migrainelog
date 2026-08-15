import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

export interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

type PickerMode = 'date' | 'time';

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

/** Combines the date parts of `date` with the time parts of `time`. */
function mergeDateAndTime(date: Date, time: Date): Date {
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged;
}

export function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps): React.JSX.Element {
  const isIOS = Platform.OS === 'ios';
  // Android shows one system dialog per mode, so the date step is followed by
  // a time step. iOS renders a single inline `datetime` picker in a modal.
  const [androidMode, setAndroidMode] = useState<PickerMode | null>(null);
  const [iosVisible, setIosVisible] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

  const handleSetNow = (): void => {
    onChange(new Date());
  };

  const handleOpen = (): void => {
    setDraft(value);
    if (isIOS) {
      setIosVisible(true);
    } else {
      setAndroidMode('date');
    }
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ): void => {
    const mode = androidMode;
    setAndroidMode(null);

    if (event.type === 'dismissed' || selected === undefined) {
      return;
    }

    if (mode === 'date') {
      // Keep the existing time, then ask for the time in a second dialog.
      const withDate = mergeDateAndTime(selected, draft);
      setDraft(withDate);
      setAndroidMode('time');
      return;
    }

    onChange(mergeDateAndTime(draft, selected));
  };

  const handleIOSChange = (
    _event: DateTimePickerEvent,
    selected?: Date,
  ): void => {
    if (selected !== undefined) {
      setDraft(selected);
    }
  };

  const handleIOSConfirm = (): void => {
    setIosVisible(false);
    onChange(draft);
  };

  const handleIOSCancel = (): void => {
    setIosVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.display}
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Date and time: ${formatReadableDate(value)}. Tap to change.`}
      >
        <Text style={styles.dateText}>{formatReadableDate(value)}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.nowButton}
        onPress={handleSetNow}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={styles.nowButtonText}>Now</Text>
      </TouchableOpacity>

      {!isIOS && androidMode !== null && (
        <RNDateTimePicker
          value={draft}
          mode={androidMode}
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {isIOS && (
        <Modal
          visible={iosVisible}
          transparent
          animationType="fade"
          onRequestClose={handleIOSCancel}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleIOSCancel}
          >
            <TouchableOpacity style={styles.sheet} activeOpacity={1}>
              <RNDateTimePicker
                value={draft}
                mode="datetime"
                display="spinner"
                onChange={handleIOSChange}
              />
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={handleIOSCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sheetButton, styles.confirmButton]}
                  onPress={handleIOSConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  sheetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
