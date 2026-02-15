import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { TriggerDetailScreenProps } from '../navigation/types';
import { useDatabase } from '../hooks/use-database';
import { useTriggerStore } from '../stores/trigger-store';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatRelativeTime, parseISO } from '../utils/date-helpers';

export function TriggerDetailScreen({
  navigation,
  route,
}: TriggerDetailScreenProps): React.JSX.Element {
  const db = useDatabase();
  const store = useTriggerStore();
  const { id } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const trigger = useMemo(() => {
    return store.triggers.find((t) => t.id === id) ?? null;
  }, [id, store.triggers]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Trigger Details',
    });
  }, [navigation]);

  const handleEdit = (): void => {
    navigation.navigate('TriggerForm', { id });
  };

  const handleDelete = async (): Promise<void> => {
    setShowDeleteDialog(false);
    try {
      await store.remove(db, id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete trigger. Please try again.');
    }
  };

  if (!trigger) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trigger not found.</Text>
      </View>
    );
  }

  const date = parseISO(trigger.timestamp);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {trigger.category.charAt(0).toUpperCase() +
                trigger.category.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Severity</Text>
          <Text style={styles.fieldValue}>{trigger.severity} / 5</Text>
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
            {formatRelativeTime(trigger.timestamp)}
          </Text>
        </View>

        {trigger.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={styles.notesText}>{trigger.notes}</Text>
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
        title="Delete Trigger"
        message="Are you sure you want to delete this trigger? This action cannot be undone."
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
  badge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
