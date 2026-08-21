import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../theme';
import { Text } from './Text';

export interface DetailRowProps {
  label: string;
  /** Rendered as data text when a string; pass a node for badges or pickers. */
  value?: string | null;
  children?: React.ReactNode;
  /** Stacks the value under the label — for notes and other long content. */
  stacked?: boolean;
}

/**
 * One labelled fact on a detail screen. Labels take the tracked-out caption
 * voice and values take tabular figures, so a column of readings lines up.
 */
export function DetailRow({
  label,
  value,
  children,
  stacked = false,
}: DetailRowProps): React.JSX.Element {
  const theme = useTheme();

  const body =
    children ??
    (value !== null && value !== undefined && value !== '' ? (
      <Text variant="data">{value}</Text>
    ) : (
      <Text variant="data" tone="faint">
        Not recorded
      </Text>
    ));

  if (stacked) {
    return (
      <View style={{ gap: theme.space.sm }}>
        <Text variant="caption" tone="faint" uppercase>
          {label}
        </Text>
        {body}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.space.lg,
      }}
    >
      <Text variant="caption" tone="faint" uppercase>
        {label}
      </Text>
      {body}
    </View>
  );
}
