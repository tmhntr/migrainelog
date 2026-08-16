import React, { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useTheme } from '../theme';
import { Button, Surface, Text } from './ui';

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
  const theme = useTheme();
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Date and time: ${formatReadableDate(value)}. Tap to change.`}
        style={({ pressed }) => [
          {
            flex: 1,
            justifyContent: 'center',
            minHeight: theme.minTouchTarget,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.sm,
            borderWidth: theme.border.hairline,
            borderColor: theme.colors.border,
            paddingHorizontal: theme.space.md,
          },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text variant="data">{formatReadableDate(value)}</Text>
      </Pressable>

      <Button label="Now" variant="secondary" onPress={handleSetNow} />

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
          <Pressable
            style={{
              flex: 1,
              backgroundColor: theme.colors.overlay,
              justifyContent: 'flex-end',
            }}
            onPress={handleIOSCancel}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Surface
                raised
                style={{
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopLeftRadius: theme.radius.lg,
                  borderTopRightRadius: theme.radius.lg,
                  paddingBottom: theme.space.xxxl,
                  gap: theme.space.md,
                }}
              >
                <RNDateTimePicker
                  value={draft}
                  mode="datetime"
                  display="spinner"
                  onChange={handleIOSChange}
                  themeVariant={theme.scheme}
                  textColor={theme.colors.ink}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: theme.space.md,
                  }}
                >
                  <Button label="Cancel" variant="secondary" onPress={handleIOSCancel} />
                  <Button label="Done" onPress={handleIOSConfirm} />
                </View>
              </Surface>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
