import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  DatabaseProvider,
  useDatabaseReady,
  useDatabaseError,
} from './src/hooks/use-database';
import { usePreferenceStore } from './src/stores/preference-store';
import { ThemeProvider, useTheme } from './src/theme';
import { buildNavigationTheme } from './src/navigation/navigation-theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Text } from './src/components/ui';
import { TabNavigator } from './src/navigation/TabNavigator';
import type { RootTabParamList } from './src/navigation/types';

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['migrainelog://'],
  config: {
    screens: {
      DashboardTab: {
        screens: {
          Dashboard: 'dashboard',
        },
      },
      TriggersTab: {
        screens: {
          TriggerForm: 'add/trigger',
        },
      },
      EpisodesTab: {
        screens: {
          EpisodeForm: 'add/episode',
        },
      },
      TreatmentsTab: {
        screens: {
          TreatmentForm: 'add/treatment',
        },
      },
    },
  },
};

function AppContent() {
  const theme = useTheme();
  const isReady = useDatabaseReady();
  const error = useDatabaseError();

  if (error) {
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
        <Text variant="title" style={{ textAlign: 'center' }}>
          Unable to load your data
        </Text>
        <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
          MigraineLog could not open its local database. Please close the app and
          open it again.
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} theme={buildNavigationTheme(theme)}>
      <TabNavigator />
    </NavigationContainer>
  );
}

/**
 * Sits inside `DatabaseProvider` so it can read the persisted theme choice,
 * which hydrates alongside the event stores. Until that resolves the provider
 * falls back to following the OS.
 */
function ThemedApp() {
  const themePreference = usePreferenceStore((s) => s.themePreference);

  return (
    <ThemeProvider preference={themePreference}>
      <ThemedStatusBar />
      <AppContent />
    </ThemeProvider>
  );
}

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <DatabaseProvider>
          <ThemedApp />
        </DatabaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
