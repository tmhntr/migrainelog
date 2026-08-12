import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DatabaseProvider,
  useDatabaseReady,
  useDatabaseError,
} from './src/hooks/use-database';
import { ErrorBoundary } from './src/components/ErrorBoundary';
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
  const isReady = useDatabaseReady();
  const error = useDatabaseError();

  if (error) {
    return (
      <View style={styles.message}>
        <Text style={styles.messageTitle}>Unable to load your data</Text>
        <Text style={styles.messageBody}>
          MigraineLog could not open its local database. Please close the app and
          open it again.
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageBody: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
  },
});
