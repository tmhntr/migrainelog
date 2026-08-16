import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { Button, Text } from './ui';

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** An empty screen is an invitation to act, so the action is the loudest thing here. */
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.space.xxxl,
        paddingVertical: theme.space.huge,
        gap: theme.space.md,
      }}
    >
      <Text variant="title" tone="muted" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="body" tone="faint" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined && (
        <Button
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: theme.space.sm }}
        />
      )}
    </View>
  );
}
