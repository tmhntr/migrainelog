import React from 'react';
import { Modal, View } from 'react-native';

import { useTheme } from '../theme';
import { Button, Surface, Text } from './ui';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  /** Names the actual action, e.g. "Delete episode" — never a bare "Confirm". */
  confirmLabel?: string;
  /**
   * Tints the confirm action as destructive. On by default because most
   * confirmations here guard a deletion; benign interruptions turn it off
   * rather than dressing an ordinary choice up as a danger.
   */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.space.xxxl,
        }}
      >
        <Surface
          raised
          style={{
            width: '100%',
            maxWidth: 360,
            padding: theme.space.xxl,
            gap: theme.space.md,
          }}
        >
          <Text variant="title">{title}</Text>
          <Text variant="body" tone="muted">
            {message}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: theme.space.md,
              marginTop: theme.space.sm,
            }}
          >
            <Button label="Cancel" variant="secondary" onPress={onCancel} />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
            />
          </View>
        </Surface>
      </View>
    </Modal>
  );
}
