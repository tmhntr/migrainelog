import React from 'react';
import { Text, View, useColorScheme } from 'react-native';

import { buildTheme } from '../theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * The fallback resolves its own theme from the OS rather than from
 * `ThemeProvider`. The boundary sits above every provider in the tree, so by
 * the time it renders there may be no context left to read — and a crash
 * screen that renders unstyled is barely better than the blank one.
 */
function ErrorFallback(): React.JSX.Element {
  const scheme = useColorScheme();
  const theme = buildTheme(scheme === 'dark' ? 'dark' : 'light');

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.space.xxxl,
        gap: theme.space.md,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={[theme.type.title, { color: theme.colors.ink, textAlign: 'center' }]}
      >
        Something went wrong
      </Text>
      <Text
        style={[theme.type.body, { color: theme.colors.inkMuted, textAlign: 'center' }]}
      >
        MigraineLog ran into an unexpected problem. Please close the app and open
        it again. Your saved data is safe.
      </Text>
    </View>
  );
}

/**
 * Catches render-time crashes anywhere in the tree and shows a friendly
 * fallback instead of a blank white screen. Required so a fresh install never
 * hangs or dies silently during App Review.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
