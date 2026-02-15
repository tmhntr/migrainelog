import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { EpisodeDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useEpisodeStore } from '../stores/episode-store';
import { SymptomPicker } from '../components/SymptomPicker';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatRelativeTime, parseISO } from '../utils/date-helpers';

export function EpisodeDetailScreen({
  navigation,
  route,
}: EpisodeDetailScreenProps): React.JSX.Element {
  const db = useDatabase();
  const store = useEpisodeStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const episode = useMemo(() => {
    return store.episodes.find((e) => e.id === id) ?? null;
  }, [id, store.episodes]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Episode Details',
    });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('EpisodeForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete episode. Please try again.');
    }
  };

  if (!episode) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Episode not found.</Text>
      </View>
    );
  }

  const date = parseISO(episode.timestamp);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Severity</Text>
          <Text style={styles.fieldValue}>{episode.severity} / 10</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Aura</Text>
          <View
            style={[
              styles.auraBadge,
              episode.aura ? styles.auraBadgeYes : styles.auraBadgeNo,
            ]}
          >
            <Text
              style={[
                styles.auraBadgeText,
                episode.aura
                  ? styles.auraBadgeTextYes
                  : styles.auraBadgeTextNo,
              ]}
            >
              {episode.aura ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Duration</Text>
          <Text style={styles.fieldValue}>
            {episode.durationMinutes != null
              ? `${episode.durationMinutes} min`
              : 'Not recorded'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Logged</Text>
          <Text style={styles.fieldValue}>
            {formatRelativeTime(episode.timestamp)}
          </Text>
        </View>

        {episode.symptoms.length > 0 ? (
          <View style={styles.symptomsSection}>
            <Text style={styles.fieldLabel}>Symptoms</Text>
            <SymptomPicker
              selected={episode.symptoms}
              onChange={() => {}}
              readOnly
            />
          </View>
        ) : null}

        {episode.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={styles.notesText}>{episode.notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteDialog(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Episode"
        message="Are you sure you want to delete this episode? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
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
    padding: 16,
    gap: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#999999',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333333',
  },
  auraBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  auraBadgeYes: {
    backgroundColor: '#E3F2FD',
  },
  auraBadgeNo: {
    backgroundColor: '#F5F5F5',
  },
  auraBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  auraBadgeTextYes: {
    color: '#1976D2',
  },
  auraBadgeTextNo: {
    color: '#999999',
  },
  symptomsSection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  notesSection: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});
