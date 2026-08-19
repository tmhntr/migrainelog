import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  NavigationContainer,
  LinkingOptions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  DatabaseProvider,
  useDatabaseReady,
  useDatabaseError,
} from './src/hooks/use-database';
import {
  usePreferenceStore,
  needsDisclaimer,
  needsOnboarding,
} from './src/stores/preference-store';
import { ThemeProvider, useTheme } from './src/theme';
import { buildNavigationTheme } from './src/navigation/navigation-theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Text } from './src/components/ui';
import { TabNavigator } from './src/navigation/TabNavigator';
import {
  OnboardingPager,
  type OnboardingExit,
} from './src/screens/onboarding/OnboardingPager';
import type { RootTabParamList } from './src/navigation/types';

const navigationRef = createNavigationContainerRef<RootTabParamList>();

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

  return <ReadyApp />;
}

type OnboardingMode = 'full' | 'disclaimer';

/**
 * Mounted only once the database has hydrated, so it can read the persisted
 * onboarding state on its very first render. Deciding earlier would read the
 * store's pre-hydration defaults and show an established user a welcome
 * screen.
 *
 * The flow is mounted *above* the navigator rather than inside it: the
 * dashboard should never flash behind a first launch. It is also held in local
 * state rather than derived from the store, because the last frame records
 * completion on arrival — deriving would unmount the flow out from under
 * someone still reading it.
 */
function ReadyApp(): React.JSX.Element {
  const theme = useTheme();
  const onboardingVersion = usePreferenceStore((s) => s.onboardingVersion);
  const disclaimerVersion = usePreferenceStore((s) => s.disclaimerVersion);

  const [mode, setMode] = useState<OnboardingMode | null>(() => {
    if (needsOnboarding(onboardingVersion)) return 'full';
    if (needsDisclaimer(disclaimerVersion)) return 'disclaimer';
    return null;
  });
  const [pendingExit, setPendingExit] = useState<OnboardingExit | null>(null);

  // Settings → Replay introduction clears the completion mark; pick that up
  // here. `completeOnboarding` writes a version rather than null, so finishing
  // the flow cannot re-trigger this.
  useEffect(() => {
    if (mode === null && needsOnboarding(onboardingVersion)) {
      setMode('full');
    }
  }, [mode, onboardingVersion]);

  const handleDone = useCallback((exit: OnboardingExit) => {
    setPendingExit(exit);
    setMode(null);
  }, []);

  const handleNavigatorReady = useCallback(() => {
    if (pendingExit === 'log-trigger' && navigationRef.isReady()) {
      navigationRef.navigate('TriggersTab', { screen: 'TriggerForm', params: {} });
    }
    setPendingExit(null);
  }, [pendingExit]);

  if (mode !== null) {
    return <OnboardingPager mode={mode} onDone={handleDone} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={buildNavigationTheme(theme)}
      onReady={handleNavigatorReady}
    >
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
