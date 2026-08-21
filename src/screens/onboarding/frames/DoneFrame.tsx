import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';

/**
 * Ends on a doing, not a dismissal — the pager's primary action here starts a
 * first entry rather than dropping the user on an empty dashboard, because the
 * risk reading stays meaningless until something is in it.
 */
export function DoneFrame(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.space.lg,
        paddingBottom: theme.space.xxl,
        gap: theme.space.lg,
      }}
    >
      <View style={{ gap: theme.space.sm }}>
        <Text variant="caption" tone="faint" uppercase>
          That&rsquo;s everything
        </Text>
        <Text variant="title">You&rsquo;re set.</Text>
      </View>

      <Text variant="body" tone="muted">
        The dashboard is the whole app: your reading at the top, the three log
        buttons under it, and everything you&rsquo;ve recorded below that.
      </Text>

      <Text variant="label" tone="faint">
        The first entry is the hard one. After that it&rsquo;s a few taps.
      </Text>
    </View>
  );
}
