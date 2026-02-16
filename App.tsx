import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider, useDatabaseReady } from './src/hooks/use-database';
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
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
