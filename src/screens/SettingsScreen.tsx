import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { SettingsScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { useEpisodeStore } from '../stores/episode-store';
import { useTreatmentStore } from '../stores/treatment-store';
import { useRiskStore } from '../stores/risk-store';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function SettingsScreen(_props: SettingsScreenProps) {
  const db = useDatabase();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleClearData = useCallback(async () => {
    setConfirmVisible(false);

    await db.runAsync('DELETE FROM triggers');
    await db.runAsync('DELETE FROM episodes');
    await db.runAsync('DELETE FROM treatments');

    useTriggerStore.setState({ triggers: [] });
    useEpisodeStore.setState({ episodes: [] });
    useTreatmentStore.setState({ treatments: [] });

    await useRiskStore.getState().recalculate(db);
  }, [db]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.appName}>MigraineLog</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            Track your migraine triggers, episodes, and treatments. All data is stored
            locally on your device.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => setConfirmVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Clear All Data"
        message="This will permanently delete all your triggers, episodes, and treatments. This action cannot be undone."
        onConfirm={handleClearData}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  version: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 12,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
