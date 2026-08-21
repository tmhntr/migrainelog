import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';

/**
 * Deliberately without the risk gauge. The gauge is the app's signature
 * reading and lands harder on its own frame if this is not where it is first
 * seen. The wordmark is the only use of `display` outside it — set light,
 * because at that size a heavy weight reads as alarm.
 */
export function WelcomeFrame(): React.JSX.Element {
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
      <View style={{ gap: theme.space.xs }}>
        <Text variant="caption" tone="faint" uppercase>
          Welcome to
        </Text>
        <Text variant="display">MigraineLog</Text>
      </View>

      <Text variant="body" tone="muted">
        A private place to record what happens before, during, and after a
        migraine — and to notice the patterns you can&rsquo;t hold in your head.
      </Text>

      <Text variant="label" tone="faint">
        Takes about a minute. Nothing to sign up for.
      </Text>
    </View>
  );
}
